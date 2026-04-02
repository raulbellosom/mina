/**
 * assign-owner.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Script de setup inicial (se ejecuta UNA VEZ desde local).
 *
 * Asigna la label "owner" al primer usuario registrado en el sistema.
 * Las labels de Appwrite Auth son la fuente de verdad para el RBAC de la app.
 * Sin label, el usuario tiene rol "pending" y no puede acceder al sistema.
 *
 * Prerrequisitos:
 *   1. Crear un API Key en Appwrite Console con scope: users.write
 *   2. Agregar al .env.local: APPWRITE_API_KEY=tu_api_key
 *   3. Conocer el userId del primer usuario (lo ves en Appwrite Console > Auth)
 *
 * Uso:
 *   node assign-owner.mjs <userId>
 *
 * Ejemplo:
 *   node assign-owner.mjs 69cc99f700067395e9ec
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Leer .env.local manualmente (sin dependencias externas) ──────────────────
function loadEnv(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const env = {};
        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx === -1) continue;
            const key = trimmed.slice(0, eqIdx).trim();
            const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            env[key] = value;
        }
        return env;
    } catch {
        return {};
    }
}

const env = {
    ...loadEnv(resolve(__dirname, '.env.local')),
    ...process.env
};

const ENDPOINT    = env.APPWRITE_ENDPOINT    || 'https://appwrite.racoondevs.com/v1';
const PROJECT_ID  = env.APPWRITE_PROJECT_ID  || '69cc2966001e99b0aa94';
const API_KEY     = env.APPWRITE_API_KEY;

if (!API_KEY) {
    console.error('\n❌ APPWRITE_API_KEY no encontrada en .env.local');
    console.error('   Agrega: APPWRITE_API_KEY=tu_api_key_con_scope_users.write\n');
    process.exit(1);
}

const userId = process.argv[2];
if (!userId) {
    console.error('\n❌ Debes pasar el userId como argumento.');
    console.error('   Uso: node assign-owner.mjs <userId>\n');
    process.exit(1);
}

// ── Asignar labels via Appwrite REST API directamente ────────────────────────
async function assignOwnerLabel(userId) {
    console.log(`\n📋 Consultando usuario ${userId}...`);

    // 1. Obtener labels actuales del usuario
    const getResp = await fetch(`${ENDPOINT}/users/${userId}`, {
        headers: {
            'Content-Type':    'application/json',
            'X-Appwrite-Project': PROJECT_ID,
            'X-Appwrite-Key':     API_KEY
        }
    });

    if (!getResp.ok) {
        const err = await getResp.json().catch(() => ({ message: getResp.statusText }));
        console.error('❌ Error al obtener usuario:', err.message);
        process.exit(1);
    }

    const user = await getResp.json();
    const currentLabels = user.labels || [];
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Email:  ${user.email}`);
    console.log(`   Labels actuales: [${currentLabels.join(', ') || 'ninguna'}]`);

    if (currentLabels.includes('owner')) {
        console.log('\n✅ El usuario ya tiene la label "owner". No es necesario hacer nada.\n');
        return;
    }

    // 2. Actualizar labels \u2014 PATCH /users/{userId}/labels
    const newLabels = [...new Set([...currentLabels, 'owner'])];
    console.log(`\n🔑 Asignando labels: [${newLabels.join(', ')}]...`);

    const patchResp = await fetch(`${ENDPOINT}/users/${userId}/labels`, {
        method: 'PATCH',
        headers: {
            'Content-Type':       'application/json',
            'X-Appwrite-Project': PROJECT_ID,
            'X-Appwrite-Key':     API_KEY
        },
        body: JSON.stringify({ labels: newLabels })
    });

    if (!patchResp.ok) {
        const err = await patchResp.json().catch(() => ({ message: patchResp.statusText }));
        console.error('❌ Error al actualizar labels:', err.message);
        process.exit(1);
    }

    const updated = await patchResp.json();
    console.log(`\n✅ Labels actualizadas exitosamente: [${updated.labels.join(', ')}]`);
    console.log(`\n🎉 El usuario "${updated.name}" ahora es OWNER del sistema.`);
    console.log('   Puede iniciar sesión y tendrá acceso completo.\n');
}

assignOwnerLabel(userId).catch((err) => {
    console.error('❌ Error inesperado:', err.message);
    process.exit(1);
});
