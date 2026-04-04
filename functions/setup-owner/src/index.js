const { Client, Users, Databases } = require("node-appwrite");

/**
 * Appwrite Function: setup-owner
 *
 * Assigns labels ['owner', 'admin'] to the first user in the system.
 * Runs only while system setup is not sealed.
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
  let SYSTEM_CONFIG_COLLECTION;
  let SYSTEM_CONFIG_SINGLETON_DOC;
  try {
    DATABASE_ID = getRequiredEnv("APPWRITE_DATABASE_ID");
    SYSTEM_CONFIG_COLLECTION = getRequiredEnv(
      "APPWRITE_COLLECTION_SYSTEM_CONFIG",
    );
    SYSTEM_CONFIG_SINGLETON_DOC = getRequiredEnv(
      "APPWRITE_DOC_SYSTEM_CONFIG_SINGLETON",
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

  const { userId } = body || {};

  if (!userId) {
    return res.json({ success: false, error: "Falta userId" }, 400);
  }

  // Guard: only execute while setup is not sealed yet
  try {
    await databases.getDocument(
      DATABASE_ID,
      SYSTEM_CONFIG_COLLECTION,
      SYSTEM_CONFIG_SINGLETON_DOC,
    );
    return res.json({ success: false, error: "Sistema ya inicializado" }, 403);
  } catch (err) {
    if (err.code !== 404) {
      error(`Error verificando system_config: ${err.message}`);
      return res.json({ success: false, error: "Error interno" }, 500);
    }
  }

  try {
    await users.updateLabels(userId, ["owner", "admin"]);
    log(`Labels ['owner', 'admin'] asignadas a: ${userId}`);

    return res.json({ success: true, userId });
  } catch (err) {
    error(`Error asignando labels: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
