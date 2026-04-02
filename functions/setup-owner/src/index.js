const { Client, Users, Databases } = require('node-appwrite');

/**
 * Appwrite Function: setup-owner
 *
 * Asigna los labels ['owner', 'admin'] al primer usuario del sistema.
 * Solo ejecuta si el sistema aún no está inicializado (system_config/singleton no existe).
 *
 * Se llama una sola vez durante el flujo de setup inicial desde registerAdmin().
 * Si el sistema ya está inicializado, devuelve error 403.
 *
 * Execute: ["any"] — el setup ocurre antes de que exista un admin con sesión.
 * Seguridad: el guard es la ausencia de system_config/singleton.
 *
 * Body esperado (JSON):
 *   userId {string} — ID del usuario al que se le asignarán los labels
 */
module.exports = async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

    const users = new Users(client);
    const databases = new Databases(client);
    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'mina_db';

    let body;
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
        return res.json({ success: false, error: 'Invalid JSON body' }, 400);
    }

    const { userId } = body || {};

    if (!userId) {
        return res.json({ success: false, error: 'Falta userId' }, 400);
    }

    // Guard: solo ejecutar si el sistema NO está inicializado aún
    try {
        await databases.getDocument(DATABASE_ID, 'system_config', 'singleton');
        // Si llega aquí, el sistema ya fue inicializado — rechazar
        return res.json({ success: false, error: 'Sistema ya inicializado' }, 403);
    } catch (err) {
        if (err.code !== 404) {
            // Error inesperado al leer system_config
            error(`Error verificando system_config: ${err.message}`);
            return res.json({ success: false, error: 'Error interno' }, 500);
        }
        // 404 = sistema no inicializado, continuar
    }

    try {
        // Asignar labels owner + admin al usuario del setup
        await users.updateLabels(userId, ['owner', 'admin']);
        log(`Labels ['owner', 'admin'] asignadas a: ${userId}`);

        return res.json({ success: true, userId });
    } catch (err) {
        error(`Error asignando labels: ${err.message}`);
        return res.json({ success: false, error: err.message }, 500);
    }
};
