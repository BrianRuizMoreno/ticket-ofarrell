require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ----------------------------------------------------
// SEGURIDAD: Rate Limiting & CORS
// ----------------------------------------------------
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 300, // Máximo 300 peticiones por IP cada 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente en 15 minutos.' }
});
app.use(limiter);

const defaultAllowedOrigins = [
    'https://autoscaner.pro',
    'https://portal.autoscaner.pro',
    'https://api.autoscaner.pro',
    'http://localhost:4200',
    'http://localhost:4201',
    'http://localhost:3000'
];

const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envOrigins])];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir solicitudes sin origen (como curl o apps móviles) o si está en la lista blanca
        if (!origin || allowedOrigins.includes(origin) || !IS_PROD) {
            callback(null, true);
        } else {
            callback(new Error(`Origen ${origin} no permitido por política CORS.`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middlewares estándar
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Servir archivos estáticos de comprobantes (/uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----------------------------------------------------
// CONFIGURACIÓN DE IA (Google Gemini Cascada)
// ----------------------------------------------------
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn('[WARN] GEMINI_API_KEY no esta configurada en .env. El OCR respondera con error hasta que se configure.');
}
const genAI = new GoogleGenerativeAI(apiKey || 'DISABLED');

const PRIMARY_MODEL = process.env.GEMINI_PRIMARY_MODEL || 'gemini-2.5-flash-lite';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

const OCR_RESPONSE_SCHEMA = {
    type: 'OBJECT',
    properties: {
        razon_social: { type: 'STRING' },
        cuit: { type: 'STRING' },
        n_operacion: { type: 'STRING' },
        tipo_gasto: {
            type: 'STRING',
            enum: ['COMBUSTIBLE', 'COMIDA', 'TRANSPORTE', 'PERSONAL', 'PEAJES', 'ALOJAMIENTOS', 'SERVICIOS', 'LIBRERIA', 'OTROS']
        },
        metodo_pago: {
            type: 'STRING',
            enum: ['Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Transferencia']
        },
        fecha: { type: 'STRING' },
        monto: { type: 'NUMBER' },
        iva: { type: 'NUMBER' },
        total: { type: 'NUMBER' },
        vendor: { type: 'STRING' },
        items: {
            type: 'ARRAY',
            items: { type: 'STRING' }
        }
    },
    required: ['total']
};

const OCR_PROMPT = `Actúa como un asistente contable y fiscal experto en extracción de comprobantes de Argentina (facturas A/B/C/M, tickets fiscales, recibos de combustible, peajes, gastos de viaje).
Analiza minuciosamente el comprobante adjunto y extrae:
- razon_social: Nombre o razón social del emisor/proveedor.
- cuit: CUIT del emisor (11 dígitos, con o sin guiones).
- n_operacion: Número de comprobante o factura (ej: 0001-00012345).
- tipo_gasto: Clasificar en COMBUSTIBLE, COMIDA, TRANSPORTE, PERSONAL, PEAJES, ALOJAMIENTOS, SERVICIOS, LIBRERIA u OTROS.
- metodo_pago: Efectivo, Tarjeta de Crédito, Tarjeta de Débito o Transferencia.
- fecha: Fecha de emisión en formato YYYY-MM-DD.
- monto: Subtotal o importe neto gravado.
- iva: Importe del IVA (si no discrimina, colocar 0).
- total: Importe final total del comprobante.
- items: Lista de productos o conceptos adquiridos.`;

async function executeGeminiCascade(imagePart) {
    if (!apiKey) {
        throw new Error('Servicio OCR no disponible: Clave GEMINI_API_KEY no configurada en el servidor.');
    }

    const models = [PRIMARY_MODEL, FALLBACK_MODEL];
    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`[INFO] [OCR Backend] Invocando modelo: ${modelName}`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: OCR_RESPONSE_SCHEMA
                }
            });

            const result = await model.generateContent([OCR_PROMPT, imagePart]);
            const response = await result.response;
            const text = response.text();

            if (text) {
                const parsed = JSON.parse(text);
                console.log(`[INFO] [OCR Backend] Exito con modelo ${modelName}`);
                return parsed;
            }
        } catch (err) {
            console.warn(`[WARN] [OCR Backend] Fallo en modelo ${modelName}:`, err.message || err);
            lastError = err;
        }
    }

    throw lastError || new Error('No se pudo procesar el comprobante tras agotar los modelos de IA.');
}

// ----------------------------------------------------
// ENDPOINTS
// ----------------------------------------------------

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        postgres: db.isUsingPostgres(),
        timestamp: new Date().toISOString()
    });
});

/**
 * ENDPOINT: Analizar Ticket con IA
 */
app.post('/api/ai/analizar-ticket', upload.single('imagen'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ninguna imagen de comprobante.' });
        }

        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype || 'image/jpeg'
            }
        };

        const result = await executeGeminiCascade(imagePart);
        res.json(result);
    } catch (error) {
        console.error('[ERROR] En /api/ai/analizar-ticket:', error.message || error);
        res.status(500).json({
            error: 'Error al procesar el comprobante con IA',
            details: IS_PROD ? undefined : (error.message || 'Error de procesamiento')
        });
    }
});

/**
 * ENDPOINT: Recibir rendiciones desde Scanner
 */
app.post('/api/rendiciones/recibir', async (req, res) => {
    try {
        const data = req.body;
        if (!data || !data.tickets || !Array.isArray(data.tickets)) {
            return res.status(400).json({ error: 'Payload de rendición inválido: se requiere arreglo de tickets.' });
        }

        const nuevaRendicion = {
            id: data.id || `R-${Date.now()}`,
            usuario: data.usuario || data.session?.encargado || 'Desconocido',
            empresa: data.empresa || data.session?.lugar || 'Empresa No Def.',
            empresa_especifica: data.session?.lugar_especifico || '',
            fecha_recepcion: new Date().toISOString(),
            estado: 'pendiente',
            total: Number(data.total || data.totales?.monto || 0),
            cantidad_tickets: data.tickets.length,
            observaciones: data.observaciones || '',
            totales: data.totales || { monto: Number(data.total || 0), iva: 0 },
            tickets: data.tickets
        };

        const saved = await db.saveRendicion(nuevaRendicion);
        console.log(`[INFO] [Rendicion Recibida] ID: ${saved.id} - ${saved.tickets.length} tickets - Total: $${saved.total}`);

        res.json({ success: true, id: saved.id });
    } catch (error) {
        console.error('[ERROR] Recibiendo rendicion:', error);
        res.status(500).json({
            error: 'Error al procesar la rendición',
            details: IS_PROD ? undefined : error.message
        });
    }
});

/**
 * ENDPOINT: Listar rendiciones activas
 */
app.get('/api/rendiciones', async (req, res) => {
    try {
        const rendiciones = await db.getRendiciones();
        res.json(rendiciones);
    } catch (error) {
        console.error('[ERROR] Listando rendiciones:', error);
        res.status(500).json({ error: 'Error al obtener rendiciones' });
    }
});

/**
 * IMPORTANTE: /api/rendiciones/clear DEBE estar ANTES de /:id para que Express no lo capture como parámetro :id
 */
app.delete('/api/rendiciones/clear', async (req, res) => {
    try {
        await db.clearRendiciones();
        res.json({ success: true, message: 'Todas las rendiciones han sido eliminadas' });
    } catch (error) {
        console.error('[ERROR] Vaciando rendiciones:', error);
        res.status(500).json({ error: 'Error al eliminar rendiciones' });
    }
});

/**
 * ENDPOINT: Obtener rendición por ID
 */
app.get('/api/rendiciones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const rendicion = await db.getRendicionById(id);
        if (rendicion) {
            res.json(rendicion);
        } else {
            res.status(404).json({ success: false, message: 'Rendición no encontrada' });
        }
    } catch (error) {
        console.error('[ERROR] Obteniendo rendicion:', error);
        res.status(500).json({ error: 'Error al obtener la rendición' });
    }
});

/**
 * ENDPOINT: Actualizar estado y observaciones de rendición
 */
app.patch('/api/rendiciones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, observaciones } = req.body;

        const estadosValidos = ['pendiente', 'aprobada', 'rechazada', 'eliminada'];
        if (estado && !estadosValidos.includes(estado)) {
            return res.status(400).json({
                error: `Estado inválido: "${estado}". Estados permitidos: ${estadosValidos.join(', ')}`
            });
        }

        const updated = await db.updateRendicion(id, { estado, observaciones });
        if (updated) {
            res.json({ success: true, rendicion: updated });
        } else {
            res.status(404).json({ success: false, message: 'Rendición no encontrada' });
        }
    } catch (error) {
        console.error('[ERROR] Actualizando rendicion:', error);
        res.status(500).json({ error: 'Error al actualizar rendición' });
    }
});

/**
 * ENDPOINT: Eliminación lógica de rendición
 */
app.delete('/api/rendiciones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const success = await db.deleteRendicion(id);
        if (success) {
            res.json({ success: true, message: 'Rendición eliminada lógicamente' });
        } else {
            res.status(404).json({ success: false, message: 'Rendición no encontrada' });
        }
    } catch (error) {
        console.error('[ERROR] Eliminando rendicion:', error);
        res.status(500).json({ error: 'Error al eliminar rendición' });
    }
});

// Inicializar base de datos y arrancar servidor
(async () => {
    try {
        await db.initDb();
        app.listen(PORT, () => {
            console.log(`[INFO] Backend de ScannerValidator activo en puerto ${PORT}`);
            console.log(`[INFO] Modo de almacenamiento: ${db.isUsingPostgres() ? 'PostgreSQL' : 'JSON local'}`);
            console.log(`[INFO] Origenes CORS autorizados: ${allowedOrigins.join(', ')}`);
        });
    } catch (err) {
        console.error('[FATAL] Error iniciando el servidor:', err);
        process.exit(1);
    }
})();
