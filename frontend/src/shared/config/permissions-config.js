/**
 * Mapa estático de permisos por label de Appwrite.
 *
 * Fuente de verdad para el sistema de permisos.
 * Los labels owner y root tienen bypass total — no aparecen aquí.
 * Para agregar un nuevo perfil: añadir entrada en PERMISSIONS_BY_LABEL.
 */

export const PERMISSIONS_BY_LABEL = {
    admin: [
        // Usuarios
        'users.view', 'users.create', 'users.update', 'users.disable',
        // Roles
        'roles.view', 'roles.update', 'permissions.assign',
        // Catálogos
        'categories.view', 'categories.create', 'categories.update', 'categories.disable',
        'materials.view', 'materials.create', 'materials.update', 'materials.disable', 'materials.export',
        'clients.view', 'clients.create', 'clients.update', 'clients.disable',
        'drivers.view', 'drivers.create', 'drivers.update', 'drivers.disable',
        'trucks.view', 'trucks.create', 'trucks.update', 'trucks.disable',
        'plants.view', 'plants.create', 'plants.update', 'plants.disable',
        // Operativo
        'vouchers.view', 'vouchers.create',
        'tickets.view', 'tickets.print', 'tickets.reprint', 'tickets.cancel',
        'bascula.view', 'bascula.register_weight', 'bascula.close',
        'counter.view', 'counter.create',
        'exit.view', 'exit.validate', 'exit.reject',
        // Reportes y auditoría
        'reports.view', 'reports.export',
        'audit.view',
        'config.view', 'config.update',
    ],

    operador: [
        // Solo lectura de catálogos
        'categories.view',
        'materials.view',
        'clients.view',
        'drivers.view',
        'trucks.view',
        'plants.view',
        // Operativo
        'vouchers.view', 'vouchers.create',
        'tickets.view', 'tickets.print', 'tickets.reprint',
        'bascula.view', 'bascula.register_weight', 'bascula.close',
        'counter.view', 'counter.create',
        'exit.view', 'exit.validate', 'exit.reject',
    ],

    capturista: [
        // Catálogos (lectura + captura)
        'categories.view', 'categories.create', 'categories.update',
        'materials.view', 'materials.create', 'materials.update',
        'clients.view', 'clients.create', 'clients.update',
        'drivers.view', 'drivers.create', 'drivers.update',
        'trucks.view', 'trucks.create', 'trucks.update',
        'plants.view', 'plants.create', 'plants.update',
        // Tickets básicos
        'vouchers.view', 'vouchers.create',
        'tickets.view', 'tickets.print',
        'reports.view',
    ],
};

export const MODULE_LABELS = {
    users:      'Usuarios',
    roles:      'Perfiles',
    permissions: 'Permisos',
    categories: 'Categorías',
    materials:  'Materiales',
    clients:    'Clientes',
    drivers:    'Choferes',
    trucks:     'Camiones',
    plants:     'Plantas',
    vouchers:   'Vouchers',
    tickets:    'Tickets',
    bascula:    'Báscula',
    counter:    'Mostrador',
    exit:       'Validación salida',
    reports:    'Reportes',
    audit:      'Auditoría',
    config:     'Configuración',
};

export const SYSTEM_LABELS = [
    { label: 'admin',      title: 'Administrador', color: 'blue' },
    { label: 'operador',   title: 'Operador',      color: 'teal' },
    { label: 'capturista', title: 'Capturista',    color: 'slate' },
];
