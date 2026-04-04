/**
 * reset-system.mjs
 *
 * Resets MinaFlow to virgin state:
 * 1. Deletes system_config/singleton document
 * 2. Deletes ALL users_profile documents
 * 3. Warns about Auth users needing manual deletion
 *
 * Usage:  node reset-system.mjs
 * Prereq: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY env vars
 *         (or .env.local in project root)
 */
import { Client, Databases, Query } from "node-appwrite";
import { readFileSync, existsSync } from "fs";

// ── Load env from .env.local if present ──
function loadEnv() {
  const envFile = ".env.local";
  if (!existsSync(envFile)) return;
  const lines = readFileSync(envFile, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const ENDPOINT =
  process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID =
  process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID =
  process.env.APPWRITE_DATABASE_ID ||
  process.env.VITE_APPWRITE_DATABASE_ID ||
  "mina_db";

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error(
    "❌ Faltan variables de entorno: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY",
  );
  console.error(
    "   Puedes definirlas en .env.local o como variables de entorno del shell.",
  );
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function resetSystem() {
  console.log("🔄 Reseteando MinaFlow a estado virgen...\n");

  // 1. Delete system_config/singleton
  console.log("1. Eliminando system_config/singleton...");
  try {
    await databases.deleteDocument(DATABASE_ID, "system_config", "singleton");
    console.log("   ✅ Documento singleton eliminado.");
  } catch (err) {
    if (err.code === 404) {
      console.log("   ⚠️  Documento singleton no existe (ya estaba limpio).");
    } else {
      console.error("   ❌ Error:", err.message);
    }
  }

  // 2. Delete all users_profile documents
  console.log("\n2. Eliminando documentos de users_profile...");
  let deleted = 0;
  let hasMore = true;
  while (hasMore) {
    try {
      const res = await databases.listDocuments(DATABASE_ID, "users_profile", [
        Query.limit(100),
      ]);
      if (res.documents.length === 0) {
        hasMore = false;
        break;
      }
      for (const doc of res.documents) {
        await databases.deleteDocument(DATABASE_ID, "users_profile", doc.$id);
        deleted++;
      }
    } catch (err) {
      console.error("   ❌ Error listando/eliminando profiles:", err.message);
      hasMore = false;
    }
  }
  console.log(`   ✅ ${deleted} documento(s) de users_profile eliminado(s).`);

  // 3. Warning about Auth users
  console.log(
    "\n⚠️  IMPORTANTE: Los usuarios de Appwrite Auth NO se eliminaron.",
  );
  console.log("   Debes eliminarlos manualmente desde la consola de Appwrite:");
  console.log(
    `   ${ENDPOINT.replace("/v1", "")}/console/project-${PROJECT_ID}/auth`,
  );

  console.log(
    "\n✅ Reset completado. Al abrir la app debería mostrar el formulario de Setup.",
  );
}

resetSystem().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
