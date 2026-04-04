const { Client, Users, Databases } = require("node-appwrite");

/**
 * Appwrite Function: sync-user-name
 *
 * Sincroniza firstName + lastName entre users_profile y Appwrite Auth name.
 * Computa fullName = `${firstName} ${lastName}` y actualiza ambos lados.
 *
 * Execute: ["label:admin", "label:owner", "label:root"]
 *
 * Body esperado (JSON):
 *   userId    {string}  ID del usuario a sincronizar (requerido)
 *   firstName {string}  Nombre de pila (requerido)
 *   lastName  {string}  Apellidos (requerido)
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
  try {
    DATABASE_ID = getRequiredEnv("APPWRITE_DATABASE_ID");
    USERS_PROFILE_COLLECTION = getRequiredEnv(
      "APPWRITE_COLLECTION_USERS_PROFILE",
    );
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

  const { userId, firstName, lastName } = body || {};

  if (!userId || !firstName || !lastName) {
    return res.json(
      {
        success: false,
        error: "Faltan campos requeridos: userId, firstName, lastName",
      },
      400,
    );
  }

  const fullName = `${firstName} ${lastName}`.trim();

  try {
    // 1. Actualizar nombre en Appwrite Auth
    await users.updateName(userId, fullName);
    log(`Auth name actualizado para ${userId}: "${fullName}"`);

    // 2. Actualizar nombre en users_profile
    await databases.updateDocument(
      DATABASE_ID,
      USERS_PROFILE_COLLECTION,
      userId,
      {
        firstName: firstName,
        lastName: lastName,
        name: fullName,
      },
    );
    log(`Profile name actualizado para ${userId}: "${fullName}"`);

    return res.json({ success: true, userId, fullName });
  } catch (err) {
    error(`Error sincronizando nombre: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
