/**
 * seed-roles.mjs
 *
 * Siembra los 3 roles de sistema en la colección `roles`.
 * Usa IDs personalizados iguales al código del rol (admin, operador, capturista),
 * de modo que usePermissions puede cargar permisos con Query.equal('roleId', label)
 * directamente sin lookup adicional.
 *
 * Solo crea los roles si no existen (idempotente).
 *
 * Usa Appwrite CLI (debe estar autenticado con `appwrite login`).
 *
 * Uso:
 *   node seed-roles.mjs
 */

import { exec } from 'child_process';
import util from 'util';
import { readFileSync } from 'fs';

const execAsync = util.promisify(exec);

// ─── Cargar .env.local ───────────────────────────────────────────────
const envFile = readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
}

const DATABASE_ID = env.APPWRITE_DATABASE_ID;
const COLLECTION = env.APPWRITE_COLLECTION_ROLES;

if (!DATABASE_ID || !COLLECTION) {
    console.error('Faltan variables: APPWRITE_DATABASE_ID y APPWRITE_COLLECTION_ROLES');
    process.exit(1);
}

// ─── Roles de sistema ────────────────────────────────────────────────
const SYSTEM_ROLES = [
    {
        $id: 'admin',
        name: 'Administrador',
        code: 'admin',
        description: 'Acceso administrativo al sistema. Permisos configurables.',
        enabled: true,
        isSystem: true,
    },
    {
        $id: 'operador',
        name: 'Operador',
        code: 'operador',
        description: 'Operaciones de báscula, mostrador y validación de salida.',
        enabled: true,
        isSystem: true,
    },
    {
        $id: 'capturista',
        name: 'Capturista',
        code: 'capturista',
        description: 'Captura de datos: materiales, clientes, choferes y tickets.',
        enabled: true,
        isSystem: true,
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────
async function runCmd(cmd) {
    try {
        const { stdout } = await execAsync(cmd, { maxBuffer: 1024 * 1024 });
        return stdout.trim();
    } catch (err) {
        return err.stdout?.trim() || '';
    }
}

async function roleExists(id) {
    const raw = await runCmd(
        `appwrite databases get-document --database-id ${DATABASE_ID} --collection-id ${COLLECTION} --document-id ${id}`
    );
    try {
        const doc = JSON.parse(raw);
        return Boolean(doc.$id);
    } catch {
        return false;
    }
}

async function createRole(role) {
    const data = JSON.stringify({
        name: role.name,
        code: role.code,
        description: role.description,
        enabled: role.enabled,
        isSystem: role.isSystem,
    });
    const escaped = data.replace(/"/g, '\\"');
    await runCmd(
        `appwrite databases create-document --database-id ${DATABASE_ID} --collection-id ${COLLECTION} --document-id ${role.$id} --data "${escaped}"`
    );
}

// ─── Ejecutar semilla ────────────────────────────────────────────────
async function seed() {
    console.log('Sembrando roles de sistema...\n');
    let created = 0;
    let skipped = 0;

    for (const role of SYSTEM_ROLES) {
        const exists = await roleExists(role.$id);
        if (exists) {
            console.log(`  ⏭  ${role.code} (ya existe)`);
            skipped++;
        } else {
            await createRole(role);
            console.log(`  ✅ ${role.code} (creado con $id="${role.$id}")`);
            created++;
        }
    }

    console.log(`\nResultado: ${created} creados, ${skipped} ya existían.`);
    console.log(`\nNota: Los roles de sistema usan $id = code para que usePermissions`);
    console.log(`      pueda cargar permisos con Query.equal('roleId', label) directamente.`);
}

seed().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
});
