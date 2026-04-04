/**
 * reset-system.mjs
 *
 * Resets MinaFlow to virgin state:
 * 1. Deletes system_config/singleton document
 * 2. Deletes ALL users_profile documents
 * 3. Warns about Auth users needing manual deletion
 *
 * Usage: node reset-system.mjs
 */
import { Client, Databases, Query } from "node-appwrite";
import { readFileSync, existsSync } from "fs";

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
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID;
const SYSTEM_CONFIG_COLLECTION =
  process.env.APPWRITE_COLLECTION_SYSTEM_CONFIG ||
  process.env.VITE_APPWRITE_COLLECTION_SYSTEM_CONFIG;
const USERS_PROFILE_COLLECTION =
  process.env.APPWRITE_COLLECTION_USERS_PROFILE ||
  process.env.VITE_APPWRITE_COLLECTION_USERS_PROFILE;
const SYSTEM_CONFIG_SINGLETON_DOC =
  process.env.APPWRITE_DOC_SYSTEM_CONFIG_SINGLETON ||
  process.env.VITE_APPWRITE_DOC_SYSTEM_CONFIG_SINGLETON;

if (
  !ENDPOINT ||
  !PROJECT_ID ||
  !API_KEY ||
  !DATABASE_ID ||
  !SYSTEM_CONFIG_COLLECTION ||
  !USERS_PROFILE_COLLECTION ||
  !SYSTEM_CONFIG_SINGLETON_DOC
) {
  console.error("Missing required env vars for reset-system.mjs");
  console.error(
    "Required: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_SYSTEM_CONFIG, APPWRITE_COLLECTION_USERS_PROFILE, APPWRITE_DOC_SYSTEM_CONFIG_SINGLETON",
  );
  process.exit(1);
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);

async function resetSystem() {
  console.log("Resetting MinaFlow to virgin state...\n");

  console.log("1. Deleting system_config singleton...");
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      SYSTEM_CONFIG_COLLECTION,
      SYSTEM_CONFIG_SINGLETON_DOC,
    );
    console.log("   Done: singleton deleted.");
  } catch (err) {
    if (err.code === 404) {
      console.log("   Notice: singleton did not exist.");
    } else {
      console.error("   Error:", err.message);
    }
  }

  console.log("\n2. Deleting users_profile documents...");
  let deleted = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const res = await databases.listDocuments(DATABASE_ID, USERS_PROFILE_COLLECTION, [
        Query.limit(100),
      ]);
      if (res.documents.length === 0) {
        hasMore = false;
        break;
      }
      for (const doc of res.documents) {
        await databases.deleteDocument(DATABASE_ID, USERS_PROFILE_COLLECTION, doc.$id);
        deleted++;
      }
    } catch (err) {
      console.error("   Error deleting profiles:", err.message);
      hasMore = false;
    }
  }

  console.log(`   Done: ${deleted} users_profile document(s) deleted.`);

  console.log("\nImportant: Appwrite Auth users were NOT deleted.");
  console.log("Delete them manually in Appwrite Console > Auth users.");
  console.log(`Console URL: ${ENDPOINT.replace("/v1", "")}/console/project-${PROJECT_ID}/auth`);

  console.log("\nReset finished.");
}

resetSystem().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
