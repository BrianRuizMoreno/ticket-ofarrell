const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'rendiciones.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Asegurar que las carpetas requeridas existen
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

let pool = null;
let usePostgres = false;

/**
 * Guarda imágenes Base64 en disco para evitar saturar la memoria RAM y la base de datos
 */
function processAndSaveTicketImage(ticket) {
    if (!ticket || (!ticket.imagen_base64 && !ticket.preview)) {
        return ticket;
    }

    const base64Data = ticket.imagen_base64 || ticket.preview;
    if (typeof base64Data === 'string' && base64Data.startsWith('data:image')) {
        try {
            const matches = base64Data.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const ext = matches[1].replace('jpeg', 'jpg');
                const buffer = Buffer.from(matches[2], 'base64');
                const filename = `ticket_${ticket.id || Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
                const filepath = path.join(UPLOADS_DIR, filename);

                fs.writeFileSync(filepath, buffer);
                ticket.url_imagen = `/uploads/${filename}`;
                // Eliminamos la cadena base64 pesada de memoria
                delete ticket.imagen_base64;
                delete ticket.preview;
            }
        } catch (err) {
            console.warn('[Storage] Error guardando imagen en disco:', err.message);
        }
    }
    return ticket;
}

/**
 * Inicialización de la base de datos (PostgreSQL con fallback automático a JSON)
 */
async function initDb() {
    const connectionString = process.env.DATABASE_URL;

    if (connectionString || process.env.POSTGRES_HOST) {
        try {
            pool = new Pool({
                connectionString: connectionString || undefined,
                host: process.env.POSTGRES_HOST || 'localhost',
                port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
                user: process.env.POSTGRES_USER || 'physis_admin',
                password: process.env.POSTGRES_PASSWORD || 'physis_secure_password_2026',
                database: process.env.POSTGRES_DB || 'tickets_db',
                connectionTimeoutMillis: 3000
            });

            // Probar conexión
            const client = await pool.connect();
            console.log('[INFO] Conectado exitosamente a PostgreSQL.');

            // Crear esquema de tablas
            await client.query(`
                CREATE TABLE IF NOT EXISTS rendiciones (
                    id VARCHAR(100) PRIMARY KEY,
                    usuario VARCHAR(255) NOT NULL,
                    empresa VARCHAR(255),
                    empresa_especifica VARCHAR(255),
                    fecha_recepcion TIMESTAMPTZ DEFAULT NOW(),
                    estado VARCHAR(50) DEFAULT 'pendiente',
                    total NUMERIC(15, 2) DEFAULT 0,
                    cantidad_tickets INTEGER DEFAULT 0,
                    observaciones TEXT,
                    totales_monto NUMERIC(15, 2) DEFAULT 0,
                    totales_iva NUMERIC(15, 2) DEFAULT 0,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS tickets (
                    id VARCHAR(100) PRIMARY KEY,
                    rendicion_id VARCHAR(100) REFERENCES rendiciones(id) ON DELETE CASCADE,
                    archivo_nombre VARCHAR(255),
                    url_imagen TEXT,
                    tipo_gasto VARCHAR(100),
                    fecha VARCHAR(100),
                    monto NUMERIC(15, 2) DEFAULT 0,
                    iva NUMERIC(15, 2) DEFAULT 0,
                    razon_social VARCHAR(255),
                    cuit VARCHAR(50),
                    n_operacion VARCHAR(100),
                    metodo_pago VARCHAR(100),
                    ocr_original JSONB,
                    modificado JSONB,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
            `);

            client.release();
            usePostgres = true;
            console.log('[INFO] Tablas de PostgreSQL verificadas y listas.');
            return;
        } catch (err) {
            console.warn('[WARN] No se pudo conectar a PostgreSQL (' + err.message + '). Activando almacenamiento local JSON en disco.');
            usePostgres = false;
        }
    } else {
        console.log('[INFO] No hay DATABASE_URL configurada. Usando almacenamiento JSON local.');
        usePostgres = false;
    }

    // Inicializar archivo JSON si no existe
    if (!fs.existsSync(DATA_FILE)) {
        await fs.promises.writeFile(DATA_FILE, JSON.stringify([]), 'utf-8');
    }
}

// ----------------------------------------------------
// OPERACIONES JSON (Fallback)
// ----------------------------------------------------
async function getRendicionesJson() {
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        const raw = await fs.promises.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        console.error('[JSON Storage] Error al leer:', e);
        return [];
    }
}

async function saveRendicionesJson(data) {
    try {
        await fs.promises.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.error('[JSON Storage] Error al escribir:', e);
    }
}

// ----------------------------------------------------
// API PÚBLICA DE PERSISTENCIA
// ----------------------------------------------------

async function getRendiciones() {
    if (usePostgres) {
        try {
            const query = `
                SELECT 
                    r.id, r.usuario, r.empresa, r.empresa_especifica, 
                    r.fecha_recepcion, r.estado, r.total, r.cantidad_tickets, 
                    r.observaciones,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', t.id,
                                'url_imagen', t.url_imagen,
                                'archivo_nombre', t.archivo_nombre,
                                'ocr_original', t.ocr_original,
                                'modificado', t.modificado
                            )
                        ) FILTER (WHERE t.id IS NOT NULL),
                        '[]'
                    ) AS tickets
                FROM rendiciones r
                LEFT JOIN tickets t ON r.id = t.rendicion_id
                WHERE r.estado != 'eliminada'
                GROUP BY r.id
                ORDER BY r.created_at DESC;
            `;
            const result = await pool.query(query);
            return result.rows.map(row => ({
                ...row,
                total: parseFloat(row.total || 0),
                cantidad_tickets: parseInt(row.cantidad_tickets || 0, 10)
            }));
        } catch (err) {
            console.error('[PostgreSQL] Error en getRendiciones:', err);
            return getRendicionesJson();
        }
    }
    const all = await getRendicionesJson();
    return all.filter(r => r.estado !== 'eliminada');
}

async function getRendicionById(id) {
    if (usePostgres) {
        try {
            const query = `
                SELECT 
                    r.id, r.usuario, r.empresa, r.empresa_especifica, 
                    r.fecha_recepcion, r.estado, r.total, r.cantidad_tickets, 
                    r.observaciones,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', t.id,
                                'url_imagen', t.url_imagen,
                                'archivo_nombre', t.archivo_nombre,
                                'ocr_original', t.ocr_original,
                                'modificado', t.modificado
                            )
                        ) FILTER (WHERE t.id IS NOT NULL),
                        '[]'
                    ) AS tickets
                FROM rendiciones r
                LEFT JOIN tickets t ON r.id = t.rendicion_id
                WHERE r.id = $1
                GROUP BY r.id;
            `;
            const result = await pool.query(query, [id]);
            if (result.rows.length === 0) return null;
            const row = result.rows[0];
            return {
                ...row,
                total: parseFloat(row.total || 0),
                cantidad_tickets: parseInt(row.cantidad_tickets || 0, 10)
            };
        } catch (err) {
            console.error('[PostgreSQL] Error en getRendicionById:', err);
            const all = await getRendicionesJson();
            return all.find(r => r.id === id) || null;
        }
    }
    const all = await getRendicionesJson();
    return all.find(r => r.id === id) || null;
}

async function saveRendicion(data) {
    // Procesar imágenes a disco
    if (data.tickets && Array.isArray(data.tickets)) {
        data.tickets = data.tickets.map(processAndSaveTicketImage);
    }

    if (usePostgres) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const insertRendicionQuery = `
                INSERT INTO rendiciones (
                    id, usuario, empresa, empresa_especifica, fecha_recepcion,
                    estado, total, cantidad_tickets, observaciones, totales_monto, totales_iva
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (id) DO UPDATE SET
                    estado = EXCLUDED.estado,
                    observaciones = EXCLUDED.observaciones,
                    total = EXCLUDED.total,
                    updated_at = NOW();
            `;

            await client.query(insertRendicionQuery, [
                data.id,
                data.usuario || 'Desconocido',
                data.empresa || '',
                data.session?.lugar_especifico || data.empresa_especifica || '',
                data.fecha_recepcion || new Date().toISOString(),
                data.estado || 'pendiente',
                data.total || 0,
                data.tickets?.length || data.cantidad_tickets || 0,
                data.observaciones || '',
                data.totales?.monto || data.total || 0,
                data.totales?.iva || 0
            ]);

            // Eliminar tickets previos si es actualización
            await client.query('DELETE FROM tickets WHERE rendicion_id = $1', [data.id]);

            if (data.tickets && Array.isArray(data.tickets)) {
                for (const t of data.tickets) {
                    const insertTicketQuery = `
                        INSERT INTO tickets (
                            id, rendicion_id, archivo_nombre, url_imagen,
                            tipo_gasto, fecha, monto, iva, razon_social, cuit,
                            n_operacion, metodo_pago, ocr_original, modificado
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);
                    `;

                    await client.query(insertTicketQuery, [
                        t.id,
                        data.id,
                        t.archivo_nombre || null,
                        t.url_imagen || null,
                        t.modificado?.tipo_gasto || null,
                        t.modificado?.fecha || null,
                        t.modificado?.monto || 0,
                        t.modificado?.iva || 0,
                        t.modificado?.razon_social || null,
                        t.modificado?.cuit || null,
                        t.modificado?.n_operacion || null,
                        t.modificado?.metodo_pago || null,
                        JSON.stringify(t.ocr_original || {}),
                        JSON.stringify(t.modificado || {})
                    ]);
                }
            }

            await client.query('COMMIT');
            return data;
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('[PostgreSQL] Error guardando rendición:', err);
            // Fallback al guardado JSON
        } finally {
            client.release();
        }
    }

    // Guardado en archivo JSON
    const list = await getRendicionesJson();
    const index = list.findIndex(r => r.id === data.id);
    if (index >= 0) {
        list[index] = { ...list[index], ...data };
    } else {
        list.unshift(data);
    }
    await saveRendicionesJson(list);
    return data;
}

async function updateRendicion(id, { estado, observaciones }) {
    if (usePostgres) {
        try {
            const query = `
                UPDATE rendiciones
                SET estado = COALESCE($2, estado),
                    observaciones = COALESCE($3, observaciones),
                    updated_at = NOW()
                WHERE id = $1
                RETURNING *;
            `;
            const result = await pool.query(query, [id, estado || null, observaciones || null]);
            if (result.rows.length === 0) return null;
            return getRendicionById(id);
        } catch (err) {
            console.error('[PostgreSQL] Error actualizando rendición:', err);
        }
    }

    const list = await getRendicionesJson();
    const item = list.find(r => r.id === id);
    if (!item) return null;

    if (estado) item.estado = estado;
    if (observaciones !== undefined) item.observaciones = observaciones;
    await saveRendicionesJson(list);
    return item;
}

async function deleteRendicion(id) {
    if (usePostgres) {
        try {
            await pool.query("UPDATE rendiciones SET estado = 'eliminada', updated_at = NOW() WHERE id = $1", [id]);
            return true;
        } catch (err) {
            console.error('[PostgreSQL] Error eliminando rendición:', err);
        }
    }

    const list = await getRendicionesJson();
    const item = list.find(r => r.id === id);
    if (!item) return false;

    item.estado = 'eliminada';
    await saveRendicionesJson(list);
    return true;
}

async function clearRendiciones() {
    if (usePostgres) {
        try {
            await pool.query('TRUNCATE TABLE tickets, rendiciones CASCADE');
            return true;
        } catch (err) {
            console.error('[PostgreSQL] Error vaciando base de datos:', err);
        }
    }

    await saveRendicionesJson([]);
    return true;
}

module.exports = {
    initDb,
    getRendiciones,
    getRendicionById,
    saveRendicion,
    updateRendicion,
    deleteRendicion,
    clearRendiciones,
    isUsingPostgres: () => usePostgres
};
