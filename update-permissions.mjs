/**
 * update-permissions.mjs
 * Actualiza los permisos de las colecciones existentes en Appwrite
 * a la nueva arquitectura basada en Labels (owner, admin, user).
 * Los atributos/índices ya existen, solo actualizamos las colecciones.
 */
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const config = JSON.parse(fs.readFileSync('./appwrite.json', 'utf8'));

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
                .map(p => `--permissions "${p.replace(/"/g, '\\"')}"`)
                .join(' ');

            const cmd = [
                `appwrite databases update-collection`,
                `--database-id ${db.$id}`,
                `--collection-id ${coll.$id}`,
                `--name "${coll.name}"`,
                `--document-security ${coll.documentSecurity}`,
                `--enabled true`,
                permsArgs
            ].join(' ');

            await run(cmd);
        }
    }
    console.log('\n✅ Permisos actualizados en todas las colecciones!');
}

updateCollectionPermissions().catch(console.error);
