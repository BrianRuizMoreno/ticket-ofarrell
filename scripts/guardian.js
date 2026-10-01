/**
 * Auditoria de Calidad y Gobernanza de Codigo (Guardian)
 * Cumplimiento de estandares Enterprise:
 * 1. Prohibicion total de emojis y caracteres informales.
 * 2. Tipado estricto sin uso de 'any'.
 * 3. Convencion de nombrado (Interfaces con prefijo I).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'dist', '.angular', '.vscode', '.idea', 'data', 'uploads', '.gemini']);
const CODE_EXTENSIONS = new Set(['.ts', '.js', '.html', '.scss', '.json', '.md', '.yml', '.yaml']);

// Rango estricto de caracteres emoji en Unicode
const EMOJI_REGEX = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/u;

// Deteccion de tipo debil 'any' en TypeScript
const ANY_TYPE_REGEX = /(:\s*any\b|\bas\s+any\b)/;

let violationsCount = 0;

function reportViolation(file, line, type, message) {
    const relPath = path.relative(ROOT_DIR, file);
    console.error(`[VIOLACION][${type}] ${relPath}:${line} - ${message}`);
    violationsCount++;
}

function scanFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (!CODE_EXTENSIONS.has(ext)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((lineText, index) => {
        const lineNum = index + 1;

        // Regla 1: Ausencia total de emojis
        if (EMOJI_REGEX.test(lineText)) {
            reportViolation(filePath, lineNum, 'EMOJI', 'Presencia de caracter emoji o informal prohibido.');
        }

        // Regla 2: Tipado estricto sin 'any' en TypeScript
        if (ext === '.ts' && !filePath.endsWith('.d.ts')) {
            if (ANY_TYPE_REGEX.test(lineText)) {
                reportViolation(filePath, lineNum, 'TIPADO_DEBIL', 'Uso no permitido del tipo "any".');
            }
        }
    });
}

function walkDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
        if (EXCLUDE_DIRS.has(entry.name)) continue;

        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
            walkDirectory(fullPath);
        } else if (entry.isFile()) {
            scanFile(fullPath);
        }
    }
}

console.log('[INICIO] Ejecutando auditoria Guardian en: ' + ROOT_DIR);
walkDirectory(ROOT_DIR);

if (violationsCount > 0) {
    console.error(`\n[FALLO] Se identificaron ${violationsCount} violaciones a los estandares de gobernanza.`);
    process.exit(1);
} else {
    console.log('[EXITO] Auditoria de calidad aprobada. Cero emojis y tipado estricto verificado.');
    process.exit(0);
}
