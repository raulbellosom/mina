const { Client, Users, Databases, ID } = require("node-appwrite");

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
 *   firstName   {string}  Nombre de pila (requerido)
 *   lastName    {string}  Apellidos (requerido)
 *   email       {string}  Email (requerido)
 *   password    {string}  Contraseña temporal (requerido)
 *   label       {string}  "user" | "admin"  (requerido)
 *   roleId      {string}  ID del rol funcional (opcional)
 *   phone       {string}  (opcional)
 *   employeeCode {string} (opcional)
 *   notes       {string}  (opcional)
 *   createdBy   {string}  userId del admin que crea (requerido)
 */
module.exports = async ({ req, res, log, error }) => {
  const getRequiredEnv = (key) => {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required env: ${key}`);
    return value;
  };

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers["x-appwrite-key"]);

  const users = new Users(client);
  const databases = new Databases(client);
  let DATABASE_ID;
  let USERS_PROFILE_COLLECTION;
  let AUDIT_COLLECTION;
  try {
    DATABASE_ID = getRequiredEnv("APPWRITE_DATABASE_ID");
    USERS_PROFILE_COLLECTION = getRequiredEnv(
      "APPWRITE_COLLECTION_USERS_PROFILE",
    );
    AUDIT_COLLECTION = getRequiredEnv("APPWRITE_COLLECTION_AUDIT_LOGS");
  } catch (err) {
    error(err.message);
    return res.json({ success: false, error: err.message }, 500);
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.json({ success: false, error: "Invalid JSON body" }, 400);
  }

  const {
    firstName,
    lastName,
    email,
    password,
    label,
    roleId,
    phone,
    employeeCode,
    notes,
    createdBy,
  } = body || {};
  const name = `${firstName || ""} ${lastName || ""}`.trim();

  // Validaciones mínimas
  if (!firstName || !lastName || !email || !password || !label || !createdBy) {
    return res.json(
      {
        success: false,
        error:
          "Faltan campos requeridos: firstName, lastName, email, password, label, createdBy",
      },
      400,
    );
  }

  const ALLOWED_LABELS = ["root", "admin", "operador", "capturista"];
  if (!ALLOWED_LABELS.includes(label)) {
    return res.json(
      {
        success: false,
        error: `Label inválida. Valores permitidos: ${ALLOWED_LABELS.join(", ")}`,
      },
      400,
    );
  }

  // Solo un usuario con label 'owner' puede crear usuarios 'root'
  if (label === "root") {
    try {
      const creator = await users.get(createdBy);
      if (!creator.labels || !creator.labels.includes("owner")) {
        return res.json(
          {
            success: false,
            error: "Solo un usuario owner puede crear usuarios root",
          },
          403,
        );
      }
    } catch (err) {
      return res.json(
        { success: false, error: "No se pudo verificar al creador" },
        500,
      );
    }
  }

  let newUserId;

  try {
    // 1. Crear usuario en Appwrite Auth
    const newUser = await users.create(
      ID.unique(),
      email,
      undefined,
      password,
      name,
    );
    newUserId = newUser.$id;
    log(`Usuario Auth creado: ${newUserId}`);

    // 2. Asignar label de acceso
    await users.updateLabels(newUserId, [label]);
    log(`Label '${label}' asignada a: ${newUserId}`);

    // 3. Crear documento users_profile
    const profileData = {
      userId: newUserId,
      firstName: firstName,
      lastName: lastName,
      name: name,
      email: email,
      role: label,
      active: true,
      status: "active",
      createdBy: createdBy,
    };
    if (phone) profileData.phone = phone;
    if (employeeCode) profileData.employeeCode = employeeCode;
    if (notes) profileData.notes = notes;
    if (roleId) profileData.roleId = roleId;

    await databases.createDocument(
      DATABASE_ID,
      USERS_PROFILE_COLLECTION,
      newUserId,
      profileData,
    );
    log(`Perfil creado para: ${newUserId}`);

    // 4. Registrar auditoría
    await databases.createDocument(DATABASE_ID, AUDIT_COLLECTION, ID.unique(), {
      action: "user.create",
      collection: USERS_PROFILE_COLLECTION,
      docId: newUserId,
      userId: createdBy,
      details: JSON.stringify({
        name,
        email,
        label,
        employeeCode: employeeCode || null,
        createdBy,
      }),
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
