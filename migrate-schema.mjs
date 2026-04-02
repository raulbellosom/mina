import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const config = JSON.parse(fs.readFileSync('./appwrite.json', 'utf8'));

async function runCommand(cmd) {
    console.log(`Executing: ${cmd}`);
    try {
        const { stdout } = await execAsync(cmd);
        return stdout;
    } catch (err) {
        if (!err.stdout.includes('already exists')) {
            console.error(`Error: ${err.message}`);
        } else {
             console.log(`(Already exists - skipping)`);
        }
        return err.stdout || null;
    }
}

async function waitForAttribute(dbId, collId, key) {
    let available = false;
    let attempts = 0;
    while (!available && attempts < 15) {
        try {
            const stdout = await runCommand(`appwrite databases get-attribute --database-id ${dbId} --collection-id ${collId} --key ${key}`);
            if (stdout && stdout.includes('available')) {
                available = true;
                break;
            }
        } catch (e) {
            // Ignore temporary errors
        }
        attempts++;
        await sleep(2000); // 2 seconds between checks
    }
}

async function migrate() {
    for (const db of config.databases) {
        for (const coll of config.collections) {
            console.log(`\n\n=== Processing Collection: ${coll.name} ===`);
            
            // Revisa si existe o crea la coleccion
            try {
                let permsCmd = '';
                if (coll.$permissions && coll.$permissions.length > 0) {
                   permsCmd = `--permissions ` + coll.$permissions.map(p => `"${p.replace(/"/g, '\\"')}"`).join(' ');
                }
                const cmd = `appwrite databases create-collection --database-id ${db.$id} --collection-id ${coll.$id} --name "${coll.name}" --document-security ${coll.documentSecurity} ${permsCmd}`;
                await runCommand(cmd);
            } catch(e) { }
            
            // Create attributes
            if (coll.attributes && coll.attributes.length > 0) {
                 for (const attr of coll.attributes) {
                    let type = attr.type === 'double' ? 'float' : attr.type; // Appwrite CLI maps double to float
                    let cmd = `appwrite databases create-${type}-attribute --database-id ${db.$id} --collection-id ${coll.$id} --key ${attr.key} --required ${attr.required}`;
                    
                    if (attr.size && type === 'string') cmd += ` --size ${attr.size}`;
                    if (attr.array !== undefined) cmd += ` --array ${attr.array}`;
                    
                    await runCommand(cmd);
                    console.log(`Waiting for ${attr.key} to be available...`);
                    await waitForAttribute(db.$id, coll.$id, attr.key);
                }
            }
            
            // Create indexes
            if (coll.indexes && coll.indexes.length > 0) {
                console.log(`\n--- Indexes for ${coll.name} ---`);
                for (const idx of coll.indexes) {
                    let cmd = `appwrite databases create-index --database-id ${db.$id} --collection-id ${coll.$id} --key ${idx.key} --type ${idx.type} --attributes ${idx.attributes.join(' ')}`;
                    if (idx.orders && idx.orders.length > 0) cmd += ` --orders ${idx.orders.join(' ')}`;
                    await runCommand(cmd);
                }
            }
        }
    }
    console.log("\n\n✅ Atributos e Índices creados completamente!");
}

migrate().catch(console.error);
