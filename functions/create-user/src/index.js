const { Client, Users, Databases, ID } = require('node-appwrite');

/**
 * Appwrite Function: create-user
 *
 * Crea un usuario en Appwrite Auth, asigna su label de acceso,
 * genera el documento users_profile correspondiente y registra la acción
 * en audit_logs.
 *
 * Requiere scopes: users.read, users.write, databases.read, databases.write
 *
 * Body esperado (JSON):
 *   name        {string}  Nombre completo (requerido)
 *   email       {string}  Email (requerido)
 *   password    {string}  Contraseña temporal (requerido)
 *   label       {string}  "user" | "admin"  (requerido)
 *   roleId      {string}  ID del rol funcional (opcional)
 *   firstName   {string}  (opcional)
 *   lastName    {string}  (opcional)
 *   phone       {string}  (opcional)
 *   employeeCode {string} (opcional)
 *   notes       {string}  (opcional)
 *   createdBy   {string}  userId del admin que crea (requerido)
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

    const { name, email, password, label, roleId, firstName, lastName, phone, employeeCode, notes, createdBy } = body || {};

    // Validaciones mínimas
    if (!name || !email || !password || !label || !createdBy) {
        return res.json({ success: false, error: 'Faltan campos requeridos: name, email, password, label, createdBy' }, 400);
    }

    if (!['user', 'admin'].includes(label)) {
        return res.json({ success: false, error: 'Label inválida. Valores permitidos: user, admin' }, 400);
    }

    let newUserId;

    try {
        // 1. Crear usuario en Appwrite Auth
        const newUser = await users.create(ID.unique(), email, undefined, password, name);
        newUserId = newUser.$id;
        log(`Usuario Auth creado: ${newUserId}`);

        // 2. Asignar label de acceso
        await users.updateLabels(newUserId, [label]);
        log(`Label '${label}' asignada a: ${newUserId}`);

        // 3. Crear documento users_profile
        const profileData = {
            userId: newUserId,
            name: name,
            email: email,
            role: label,
            active: true,
            status: 'active',
            createdBy: createdBy,
        };
        if (firstName) profileData.firstName = firstName;
        if (lastName) profileData.lastName = lastName;
        if (phone) profileData.phone = phone;
        if (employeeCode) profileData.employeeCode = employeeCode;
        if (roleId) profileData.roleId = roleId;
        if (notes) profileData.notes = notes;

        await databases.createDocument(DATABASE_ID, 'users_profile', newUserId, profileData);
        log(`Perfil creado para: ${newUserId}`);

        // 4. Registrar auditoría
        await databases.createDocument(DATABASE_ID, 'audit_logs', ID.unique(), {
            action: 'user.create',
            collection: 'users_profile',
            docId: newUserId,
            userId: createdBy,
            details: JSON.stringify({ name, email, label, employeeCode: employeeCode || null })
        });

        return res.json({ success: true, userId: newUserId });

    } catch (err) {
        error(`Error creando usuario: ${err.message}`);

        // Rollback: si el usuario Auth se creó pero el perfil falló, eliminar el usuario
        if (newUserId) {
            try {
                await users.delete(newUserId);
                log(`Rollback: usuario Auth ${newUserId} eliminado`);
            } catch (rollbackErr) {
                error(`Rollback fallido: ${rollbackErr.message}`);
            }
        }

        return res.json({ success: false, error: err.message }, 500);
    }
};
