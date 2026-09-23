require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Google Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn('⚠️ AVISO: GEMINI_API_KEY no está definida en .env');
}
const genAI = new GoogleGenerativeAI(apiKey || '');

// Cascada oficial 2026: Primario 2.5 Flash-Lite, Respaldo 2.5 Flash
const PRIMARY_MODEL = process.env.GEMINI_PRIMARY_MODEL || 'gemini-2.5-flash-lite';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash';

// Configuración de Multer para recibir imágenes de tickets
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 } // Límite de 25MB por comprobante
});

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Persistencia en disco local como respaldo contra reinicios (Pre-PostgreSQL)
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'rendiciones.json');

function initDataStorage() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
    }
}

function loadRendiciones() {
    try {
        initDataStorage();
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        console.error('Error cargando rendiciones desde disco:', e);
        return [];
    }
}

function persistRendiciones(data) {
    try {
        initDataStorage();
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.error('Error guardando rendiciones en disco:', e);
    }
}

let rendiciones = loadRendiciones();

/**
 * Esquema estructurado estricto para respuesta de Gemini (Structured Outputs)
 */
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

/**
 * Ejecuta la llamada a Gemini con cascada (primario -> fallback) y Structured Outputs
 */
async function executeGeminiCascade(imagePart) {
    const models = [PRIMARY_MODEL, FALLBACK_MODEL];
    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`[OCR Backend] Intentando con modelo: ${modelName}`);
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
                console.log(`[OCR Backend] ✅ Éxito con modelo ${modelName}`);
                return parsed;
            }
        } catch (err) {
            console.warn(`[OCR Backend] Falla con ${modelName}:`, err.message || err);
            lastError = err;
        }
    }

    throw lastError || new Error('No se pudo procesar el comprobante tras agotar la cascada de IA.');
}

/**
 * ENDPOINT: Analizar Ticket con IA (Gemini Cascada en Servidor)
 * Recibe FormData con campo 'imagen'
 */
app.post('/api/ai/analizar-ticket', upload.single('imagen'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ninguna imagen de comprobante' });
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
        console.error('❌ Error analizando comprobante:', error.message || error);
        res.status(500).json({
            error: 'Error al procesar el comprobante con IA',
            details: error.message || 'Fallo de inferencia'
        });
    }
});

/**
 * ENDPOINT: Recibir rendiciones completas desde Scanner
 */
app.post('/api/rendiciones/recibir', (req, res) => {
    const data = req.body;

    if (!data || !data.tickets) {
        return res.status(400).json({ error: 'Payload de rendición inválido' });
    }

    const nuevaRendicion = {
        id: data.id || `R-${Date.now()}`,
        usuario: data.usuario || data.session?.encargado || 'Desconocido',
        empresa: data.empresa || data.session?.lugar || 'Empresa No Def.',
        empresa_especifica: data.session?.lugar_especifico || '',
        fecha_recepcion: new Date().toISOString(),
        estado: 'pendiente',
        total: Number(data.total || data.totales?.monto || 0),
        tickets: (data.tickets || []).map(t => ({
            ...t,
            modificado: {
                ...t.modificado,
                tipo_gasto_especifico: t.modificado?.tipo_gasto_especifico || ''
            },
            imagen_base64: t.imagen_base64 || null
        }))
    };

    const index = rendiciones.findIndex(r => r.id === nuevaRendicion.id);
    if (index !== -1) {
        rendiciones[index] = nuevaRendicion;
    } else {
        rendiciones.unshift(nuevaRendicion);
    }

    persistRendiciones(rendiciones);
    console.log(`[Rendición Recibida] ID: ${nuevaRendicion.id} - ${nuevaRendicion.tickets.length} tickets - Total: $${nuevaRendicion.total}`);

    res.json({ success: true, id: nuevaRendicion.id });
});

/**
 * ENDPOINTS: Gestión de Rendiciones (Validator Dashboard)
 */
app.get('/api/rendiciones', (req, res) => {
    const activas = rendiciones.filter(r => r.estado !== 'eliminada');
    res.json(activas);
});

app.get('/api/rendiciones/:id', (req, res) => {
    const { id } = req.params;
    const rendicion = rendiciones.find(r => r.id === id && r.estado !== 'eliminada');
    if (rendicion) {
        res.json(rendicion);
    } else {
        res.status(404).json({ success: false, message: 'Rendición no encontrada' });
    }
});

app.patch('/api/rendiciones/:id', (req, res) => {
    const { id } = req.params;
    const { estado, observaciones } = req.body;

    const rendicion = rendiciones.find(r => r.id === id);
    if (rendicion) {
        if (estado) rendicion.estado = estado;
        if (observaciones !== undefined) rendicion.observaciones = observaciones;
        persistRendiciones(rendiciones);
        res.json({ success: true, rendicion });
    } else {
        res.status(404).json({ success: false, message: 'Rendición no encontrada' });
    }
});

app.delete('/api/rendiciones/:id', (req, res) => {
    const { id } = req.params;
    const rendicion = rendiciones.find(r => r.id === id);

    if (rendicion) {
        rendicion.estado = 'eliminada';
        persistRendiciones(rendiciones);
        res.json({ success: true, message: 'Rendición eliminada lógicamente' });
    } else {
        res.status(404).json({ success: false, message: 'Rendición no encontrada' });
    }
});

app.delete('/api/rendiciones/clear', (req, res) => {
    rendiciones = [];
    persistRendiciones(rendiciones);
    res.json({ success: true, message: 'Todas las rendiciones han sido eliminadas' });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend de ScannerValidator corriendo en http://localhost:${PORT}`);
    console.log(`🤖 Modelos Gemini configurados: Primario=${PRIMARY_MODEL}, Respaldo=${FALLBACK_MODEL}`);
});
