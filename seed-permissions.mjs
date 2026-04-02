/**
 * seed-permissions.mjs
 *
 * Siembra el catálogo de permisos del sistema en la colección `permissions_catalog`.
 * Solo inserta permisos que no existan (por campo `code` único).
 *
 * Usa Appwrite CLI (debe estar autenticado con `appwrite login`).
 *
 * Uso:
 *   node seed-permissions.mjs
 */

import { exec } from "child_process";
import util from "util";
import { readFileSync } from "fs";

const execAsync = util.promisify(exec);

// ─── Cargar .env.local ──────────────────────────────────────────────
const envFile = readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const [key, ...rest] = trimmed.split("=");
  env[key.trim()] = rest.join("=").trim();
}

const DATABASE_ID = env.APPWRITE_DATABASE_ID || "mina_db";
const COLLECTION = "permissions_catalog";

// ─── Catálogo de permisos del sistema ───────────────────────────────
const PERMISSIONS = [
  // Usuarios
  {
    module: "users",
    action: "view",
    code: "users.view",
    description: "Ver listado de usuarios",
  },
  {
    module: "users",
    action: "create",
    code: "users.create",
    description: "Crear usuarios internos",
  },
  {
    module: "users",
    action: "update",
    code: "users.update",
    description: "Editar datos de usuarios",
  },
  {
    module: "users",
    action: "disable",
    code: "users.disable",
    description: "Deshabilitar/reactivar usuarios",
  },

  // Roles
  {
    module: "roles",
    action: "view",
    code: "roles.view",
    description: "Ver listado de roles",
  },
  {
    module: "roles",
    action: "create",
    code: "roles.create",
    description: "Crear roles funcionales",
  },
  {
    module: "roles",
    action: "update",
    code: "roles.update",
    description: "Editar roles funcionales",
  },
  {
    module: "roles",
    action: "disable",
    code: "roles.disable",
    description: "Deshabilitar/reactivar roles",
  },

  // Permisos
  {
    module: "permissions",
    action: "assign",
    code: "permissions.assign",
    description: "Asignar permisos a roles",
  },

  // Materiales
  {
    module: "materials",
    action: "view",
    code: "materials.view",
    description: "Ver catálogo de materiales",
  },
  {
    module: "materials",
    action: "create",
    code: "materials.create",
    description: "Crear materiales",
  },
  {
    module: "materials",
    action: "update",
    code: "materials.update",
    description: "Editar materiales",
  },
  {
    module: "materials",
    action: "disable",
    code: "materials.disable",
    description: "Deshabilitar materiales",
  },
  {
    module: "materials",
    action: "export",
    code: "materials.export",
    description: "Exportar catálogo de materiales",
  },

  // Categorías
  {
    module: "categories",
    action: "view",
    code: "categories.view",
    description: "Ver categorías de materiales",
  },
  {
    module: "categories",
    action: "create",
    code: "categories.create",
    description: "Crear categorías",
  },
  {
    module: "categories",
    action: "update",
    code: "categories.update",
    description: "Editar categorías",
  },
  {
    module: "categories",
    action: "disable",
    code: "categories.disable",
    description: "Deshabilitar categorías",
  },

  // Clientes
  {
    module: "clients",
    action: "view",
    code: "clients.view",
    description: "Ver catálogo de clientes",
  },
  {
    module: "clients",
    action: "create",
    code: "clients.create",
    description: "Crear clientes",
  },
  {
    module: "clients",
    action: "update",
    code: "clients.update",
    description: "Editar clientes",
  },
  {
    module: "clients",
    action: "disable",
    code: "clients.disable",
    description: "Deshabilitar clientes",
  },

  // Choferes
  {
    module: "drivers",
    action: "view",
    code: "drivers.view",
    description: "Ver catálogo de choferes",
  },
  {
    module: "drivers",
    action: "create",
    code: "drivers.create",
    description: "Crear choferes",
  },
  {
    module: "drivers",
    action: "update",
    code: "drivers.update",
    description: "Editar choferes",
  },
  {
    module: "drivers",
    action: "disable",
    code: "drivers.disable",
    description: "Deshabilitar choferes",
  },

  // Camiones
  {
    module: "trucks",
    action: "view",
    code: "trucks.view",
    description: "Ver catálogo de camiones",
  },
  {
    module: "trucks",
    action: "create",
    code: "trucks.create",
    description: "Crear camiones",
  },
  {
    module: "trucks",
    action: "update",
    code: "trucks.update",
    description: "Editar camiones",
  },
  {
    module: "trucks",
    action: "disable",
    code: "trucks.disable",
    description: "Deshabilitar camiones",
  },

  // Plantas
  {
    module: "plants",
    action: "view",
    code: "plants.view",
    description: "Ver catálogo de plantas",
  },
  {
    module: "plants",
    action: "create",
    code: "plants.create",
    description: "Crear plantas",
  },
  {
    module: "plants",
    action: "update",
    code: "plants.update",
    description: "Editar plantas",
  },
  {
    module: "plants",
    action: "disable",
    code: "plants.disable",
    description: "Deshabilitar plantas",
  },

  // Vouchers
  {
    module: "vouchers",
    action: "view",
    code: "vouchers.view",
    description: "Ver vouchers/vales",
  },
  {
    module: "vouchers",
    action: "create",
    code: "vouchers.create",
    description: "Crear vouchers",
  },
  {
    module: "vouchers",
    action: "update",
    code: "vouchers.update",
    description: "Editar vouchers",
  },
  {
    module: "vouchers",
    action: "cancel",
    code: "vouchers.cancel",
    description: "Cancelar vouchers",
  },

  // Tickets
  {
    module: "tickets",
    action: "view",
    code: "tickets.view",
    description: "Ver tickets",
  },
  {
    module: "tickets",
    action: "generate",
    code: "tickets.generate",
    description: "Generar tickets desde vouchers",
  },
  {
    module: "tickets",
    action: "print",
    code: "tickets.print",
    description: "Imprimir tickets",
  },
  {
    module: "tickets",
    action: "reprint",
    code: "tickets.reprint",
    description: "Reimprimir tickets (acción auditada)",
  },
  {
    module: "tickets",
    action: "cancel",
    code: "tickets.cancel",
    description: "Cancelar tickets",
  },

  // Báscula
  {
    module: "bascula",
    action: "view",
    code: "bascula.view",
    description: "Ver módulo de báscula",
  },
  {
    module: "bascula",
    action: "register_weight",
    code: "bascula.register_weight",
    description: "Registrar pesos en báscula",
  },
  {
    module: "bascula",
    action: "close",
    code: "bascula.close",
    description: "Cerrar operación de báscula",
  },

  // Mostrador
  {
    module: "counter",
    action: "view",
    code: "counter.view",
    description: "Ver ventas de mostrador",
  },
  {
    module: "counter",
    action: "create",
    code: "counter.create",
    description: "Registrar ventas en mostrador",
  },

  // Validación de salida
  {
    module: "exit",
    action: "view",
    code: "exit.view",
    description: "Ver módulo de validación de salida",
  },
  {
    module: "exit",
    action: "validate",
    code: "exit.validate",
    description: "Validar salida de camiones",
  },
  {
    module: "exit",
    action: "reject",
    code: "exit.reject",
    description: "Rechazar salida de camiones",
  },

  // Reportes
  {
    module: "reports",
    action: "view",
    code: "reports.view",
    description: "Ver reportes",
  },
  {
    module: "reports",
    action: "export",
    code: "reports.export",
    description: "Exportar reportes",
  },

  // Auditoría
  {
    module: "audit",
    action: "view",
    code: "audit.view",
    description: "Ver bitácora de auditoría",
  },
  {
    module: "audit",
    action: "export",
    code: "audit.export",
    description: "Exportar registros de auditoría",
  },

  // Configuración
  {
    module: "config",
    action: "view",
    code: "config.view",
    description: "Ver configuración del sistema",
  },
  {
    module: "config",
    action: "update",
    code: "config.update",
    description: "Modificar configuración del sistema",
  },
];

// ─── Helpers ────────────────────────────────────────────────────────
async function runCmd(cmd) {
  try {
    const { stdout } = await execAsync(cmd, { maxBuffer: 1024 * 1024 });
    return stdout.trim();
  } catch (err) {
    return err.stdout?.trim() || "";
  }
}

async function listExistingCodes() {
  const codes = new Set();
  let offset = 0;
  const limit = 100;
  while (true) {
    const raw = await runCmd(
      `appwrite databases list-documents --database-id ${DATABASE_ID} --collection-id ${COLLECTION} --queries "limit(${limit})" --queries "offset(${offset})"`,
    );
    try {
      const data = JSON.parse(raw);
      if (!data.documents || data.documents.length === 0) break;
      for (const doc of data.documents) {
        codes.add(doc.code);
      }
      if (data.documents.length < limit) break;
      offset += limit;
    } catch {
      break;
    }
  }
  return codes;
}

async function createPermission(perm) {
  const data = JSON.stringify({
    module: perm.module,
    action: perm.action,
    code: perm.code,
    description: perm.description,
    enabled: true,
  });
  // Escape for CLI
  const escaped = data.replace(/"/g, '\\"');
  await runCmd(
    `appwrite databases create-document --database-id ${DATABASE_ID} --collection-id ${COLLECTION} --document-id unique() --data "${escaped}"`,
  );
}

// ─── Ejecutar semilla ───────────────────────────────────────────────
async function seed() {
  console.log("Cargando permisos existentes...");

  const existingCodes = await listExistingCodes();
  console.log(`Permisos existentes: ${existingCodes.size}`);

  let created = 0;
  let skipped = 0;

  for (const perm of PERMISSIONS) {
    if (existingCodes.has(perm.code)) {
      skipped++;
      continue;
    }

    await createPermission(perm);
    created++;
    console.log(`  + ${perm.code}`);
  }

  console.log(`\nResultado: ${created} creados, ${skipped} ya existían.`);
  console.log(`Total permisos en catálogo: ${existingCodes.size + created}`);
}

seed().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
