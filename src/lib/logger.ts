import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'error.log');

export async function logError(error: any, context?: string) {
    try {
        if (!fs.existsSync(LOG_DIR)) {
            fs.mkdirSync(LOG_DIR, { recursive: true });
        }

        const timestamp = new Date().toISOString();
        const errorMessage = error instanceof Error ? error.message : String(error);
        const stackTrace = error instanceof Error ? error.stack : 'No stack trace';

        const logEntry = `
[${timestamp}] ${context ? `[CONTEXT: ${context}] ` : ''}
ERROR: ${errorMessage}
STACK: ${stackTrace}
--------------------------------------------------------------------------------
`;

        fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
        console.error(`[Logger] Error logged: ${errorMessage}`);
    } catch (loggingError) {
        console.error('[Logger] Critical failure in logging system:', loggingError);
    }
}

export async function getLogs() {
    try {
        if (!fs.existsSync(LOG_FILE)) {
            return 'No logs found.';
        }
        return fs.readFileSync(LOG_FILE, 'utf8');
    } catch (error) {
        console.error('[Logger] Failed to read logs:', error);
        return 'Error reading log file.';
    }
}

export async function clearLogs() {
    try {
        if (fs.existsSync(LOG_FILE)) {
            fs.writeFileSync(LOG_FILE, '', 'utf8');
        }
    } catch (error) {
        console.error('[Logger] Failed to clear logs:', error);
    }
}
