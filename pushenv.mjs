import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

const envLines = fs.readFileSync('.env.local', 'utf-8').split('\n');
const projectId = '69cc2966001e99b0aa94'; // Puedes extraerlo dinámicamente si prefieres

async function push() {
    console.log("🌍 Sincronizando variables globales hacia Appwrite...");
    for (const line of envLines) {
        if (!line || !line.includes('=')) continue;
        // Ignorar comentarios
        if (line.trim().startsWith('#')) continue;

        const [key, ...rest] = line.split('=');
        const value = rest.join('=');
        
        if (!key || !value) continue;
        
        console.log(`-> Enviando ${key.trim()}...`);
        try {
            await execAsync(`appwrite project create-variable --variable-id ${key.trim()} --key ${key.trim()} --value ${value.trim()}`);
        } catch (e) {
            if (e.stderr && e.stderr.includes('already exists')) {
                console.log(`   (Actualizando existente)`);
                try {
                     await execAsync(`appwrite project update-variable --variable-id ${key.trim()} --key ${key.trim()} --value ${value.trim()}`);
                } catch(updateErr) {
                     console.error(`   Error de actualización: ${updateErr.stderr || updateErr.message}`);
                }
            } else {
                console.error(`   Error con ${key.trim()}: ${e.stderr || e.message}`);
            }
        }
    }
    console.log("✅ ¡Variables inyectadas globalmente!");
}

push().catch(console.error);
