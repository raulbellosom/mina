/**
 * update-permissions.mjs
 * Actualiza los permisos de las colecciones existentes en Appwrite
 * a la arquitectura de labels actual: owner, root, admin, operador, capturista.
 * El label 'user' fue reemplazado por 'operador' y 'capturista'.
 * Los atributos/índices ya existen, solo actualizamos las colecciones.
 */
import fs from "fs";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);
const config = JSON.parse(fs.readFileSync("./appwrite.json", "utf8"));

async function run(cmd) {
  console.log(`  → ${cmd.slice(0, 80)}...`);
  try {
    const { stdout } = await execAsync(cmd);
    return stdout;
  } catch (err) {
    const msg = err.stderr || err.message;
    console.error(`  ✗ Error: ${msg.slice(0, 120)}`);
    return null;
  }
}

async function updateCollectionPermissions() {
  for (const db of config.databases) {
    for (const coll of config.collections) {
      console.log(`\n📦 Updating: ${coll.name} (${coll.$id})`);

      const permsArgs = (coll.$permissions || [])
        .map((p) => `--permissions "${p.replace(/"/g, '\\"')}"`)
        .join(" ");

      const cmd = [
        `appwrite databases update-collection`,
        `--database-id ${db.$id}`,
        `--collection-id ${coll.$id}`,
        `--name "${coll.name}"`,
        `--document-security ${coll.documentSecurity}`,
        `--enabled true`,
        permsArgs,
      ].join(" ");

      await run(cmd);
    }
  }
  console.log("\n✅ Permisos actualizados en todas las colecciones!");

  // Update storage buckets
  if (config.buckets && config.buckets.length > 0) {
    for (const bucket of config.buckets) {
      console.log(`\n🪣 Updating bucket: ${bucket.name} (${bucket.$id})`);

      const permsArgs = (bucket.$permissions || [])
        .map((p) => `--permissions "${p.replace(/"/g, '\\"')}"`)
        .join(" ");

      const extensions = (bucket.allowedFileExtensions || [])
        .map((e) => `--allowed-file-extensions ${e}`)
        .join(" ");

      const cmd = [
        `appwrite storage update-bucket`,
        `--bucket-id ${bucket.$id}`,
        `--name "${bucket.name}"`,
        `--file-security ${bucket.fileSecurity}`,
        `--enabled true`,
        `--maximum-file-size ${bucket.maximumFileSize}`,
        `--compression ${bucket.compression}`,
        `--encryption ${bucket.encryption}`,
        extensions,
        permsArgs,
      ].join(" ");

      await run(cmd);
    }
    console.log("\n✅ Permisos actualizados en todos los buckets!");
  }
}

updateCollectionPermissions().catch(console.error);
