import { useState, useMemo } from "react";
import {
  KeyRound,
  Plus,
  Search,
  Filter,
  Pencil,
  PowerOff,
  Power,
  Shield,
  ChevronRight,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Eye,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRoles } from "../hooks/useRoles";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import RolForm from "../components/RolForm";
import PermisosMatrix from "../components/PermisosMatrix";

const STATUS_BADGE = {
  true: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  false: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const MODULE_LABELS = {
  users: "Usuarios",
  roles: "Roles",
  permissions: "Permisos",
  materials: "Materiales",
  categories: "Categorías",
  clients: "Clientes",
  drivers: "Choferes",
  trucks: "Camiones",
  plants: "Plantas",
  vouchers: "Vouchers",
  tickets: "Tickets",
  weights: "Báscula",
  counter: "Mostrador",
  exit: "Validación salida",
  reports: "Reportes",
  audit: "Auditoría",
  config: "Configuración",
};

export default function Roles() {
  const { can } = usePermissions();
  const {
    roles,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    createRole,
    updateRole,
    toggleEnabled,
    permissionsCatalog,
    loadingCatalog,
    rolePermissions,
    loadingRolePerms,
    fetchRolePermissions,
    saveRolePermissions,
    permCounts,
  } = useRoles();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailRole, setDetailRole] = useState(null);
  const [permRole, setPermRole] = useState(null); // rol para editar permisos
  const [confirmDisable, setConfirmDisable] = useState(null);

  // ─── Permission guard ───────────────────────────────────────────
  if (!can("roles.view")) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldAlert
          size={36}
          className="text-slate-300 dark:text-slate-700 mb-3"
        />
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          No tienes permiso para ver este módulo.
        </p>
      </div>
    );
  }

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    setFormOpen(true);
  };

  const openPermisos = async (role) => {
    setPermRole(role);
    await fetchRolePermissions(role.$id);
  };

  const handleSubmit = async (data) => {
    if (editing) {
      await updateRole(editing.$id, data);
    } else {
      await createRole(data);
    }
  };

  const handleToggle = async (r) => {
    if (r.enabled) {
      setConfirmDisable(r);
    } else {
      await toggleEnabled(r.$id, r.enabled);
    }
  };

  const confirmToggle = async () => {
    if (!confirmDisable) return;
    await toggleEnabled(confirmDisable.$id, confirmDisable.enabled);
    setConfirmDisable(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Roles y Permisos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
            Definición de roles funcionales y asignación de permisos por módulo.
          </p>
        </header>
        {can("roles.create") && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 text-sm font-medium transition-colors shrink-0"
          >
            <Plus size={16} /> Nuevo rol
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
          >
            <option value="all">Todos</option>
            <option value="enabled">Habilitados</option>
            <option value="disabled">Deshabilitados</option>
          </select>
        </div>
      </div>

      {/* Tabla de roles */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-semibold">Rol</th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden md:table-cell">
                  Código
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden lg:table-cell">
                  Permisos
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold">Estado</th>
                <th className="px-4 sm:px-6 py-3 font-semibold text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                    Cargando roles...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    <KeyRound className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    {search
                      ? "Sin resultados para la búsqueda."
                      : "No hay roles registrados."}
                  </td>
                </tr>
              ) : (
                roles.map((role) => {
                  const pc = permCounts[role.$id] || 0;
                  return (
                    <tr
                      key={role.$id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      {/* Nombre + descripción */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {role.name}
                          {role.isSystem && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                              SISTEMA
                            </span>
                          )}
                        </div>
                        {role.description && (
                          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                            {role.description}
                          </div>
                        )}
                        <div className="text-xs text-slate-400 mt-0.5 md:hidden font-mono">
                          {role.code}
                        </div>
                      </td>
                      {/* Código */}
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                          {role.code}
                        </span>
                      </td>
                      {/* Permisos count */}
                      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                          <Shield size={12} />
                          {pc} permiso{pc !== 1 ? "s" : ""}
                        </span>
                      </td>
                      {/* Estado */}
                      <td className="px-4 sm:px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[role.enabled]}`}
                        >
                          {role.enabled ? "Habilitado" : "Deshabilitado"}
                        </span>
                      </td>
                      {/* Acciones */}
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Detalle */}
                          <button
                            onClick={() => setDetailRole(role)}
                            title="Ver detalle"
                            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Eye size={16} />
                          </button>
                          {/* Permisos */}
                          {can("permissions.assign") && (
                            <button
                              onClick={() => openPermisos(role)}
                              title="Gestionar permisos"
                              className="p-1.5 rounded text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            >
                              <ShieldCheck size={16} />
                            </button>
                          )}
                          {/* Editar */}
                          {can("roles.update") && (
                            <button
                              onClick={() => openEdit(role)}
                              title="Editar"
                              className="p-1.5 rounded text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {/* Habilitar / Deshabilitar */}
                          {can("roles.disable") && !role.isSystem && (
                            <button
                              onClick={() => handleToggle(role)}
                              title={
                                role.enabled ? "Deshabilitar" : "Reactivar"
                              }
                              className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
                                role.enabled
                                  ? "text-red-400 hover:text-red-600"
                                  : "text-green-500 hover:text-green-700"
                              }`}
                            >
                              {role.enabled ? (
                                <PowerOff size={16} />
                              ) : (
                                <Power size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulario crear/editar rol */}
      <RolForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={handleSubmit}
      />

      {/* Panel de permisos */}
      <PermisosMatrix
        open={Boolean(permRole)}
        onOpenChange={(v) => {
          if (!v) setPermRole(null);
        }}
        role={permRole}
        catalog={permissionsCatalog}
        currentPerms={rolePermissions}
        loading={loadingRolePerms || loadingCatalog}
        onSave={saveRolePermissions}
      />

      {/* Detalle de rol */}
      <RolDetalle
        role={detailRole}
        open={Boolean(detailRole)}
        onClose={() => setDetailRole(null)}
        onEdit={
          can("roles.update")
            ? (r) => {
                setDetailRole(null);
                openEdit(r);
              }
            : null
        }
        onPermisos={
          can("permissions.assign")
            ? (r) => {
                setDetailRole(null);
                openPermisos(r);
              }
            : null
        }
        permCounts={permCounts}
        permissionsCatalog={permissionsCatalog}
        fetchRolePermissions={fetchRolePermissions}
      />

      {/* Confirmación de deshabilitación */}
      <Dialog.Root
        open={Boolean(confirmDisable)}
        onOpenChange={(v) => {
          if (!v) setConfirmDisable(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Deshabilitar rol
            </Dialog.Title>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              ¿Confirmas que deseas deshabilitar el rol{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {confirmDisable?.name}
              </strong>
              ? Los usuarios con este rol conservarán su asignación, pero el rol
              no podrá asignarse a nuevos usuarios.
            </p>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={confirmToggle}
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Sí, deshabilitar
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

/* ─── Panel lateral de detalle de rol ─── */
function RolDetalle({
  role: r,
  open,
  onClose,
  onEdit,
  onPermisos,
  permCounts,
  permissionsCatalog,
  fetchRolePermissions,
}) {
  const [perms, setPerms] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(false);

  // Cargar permisos cuando se abre el detalle
  const loadPerms = async () => {
    if (!r) return;
    setLoadingPerms(true);
    try {
      const codes = await fetchRolePermissions(r.$id);
      setPerms(codes);
    } finally {
      setLoadingPerms(false);
    }
  };

  // Agrupar permisos por módulo para visualización
  const groupedPerms = useMemo(() => {
    const map = {};
    for (const code of perms) {
      const mod = code.split(".")[0];
      if (!map[mod]) map[mod] = [];
      map[mod].push(code);
    }
    return map;
  }, [perms]);

  if (!r) return null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl flex flex-col"
          onOpenAutoFocus={() => {
            loadPerms();
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
              Detalle del rol
            </Dialog.Title>
            <div className="flex items-center gap-2">
              {onPermisos && (
                <button
                  onClick={() => onPermisos(r)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                >
                  <ShieldCheck size={13} /> Permisos
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(r)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
                >
                  <Pencil size={13} /> Editar
                </button>
              )}
              <Dialog.Close asChild>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                  <ChevronRight size={20} className="rotate-180" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Info */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <KeyRound size={24} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-base">
                  {r.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                  {r.code}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[r.enabled]}`}
              >
                {r.enabled ? "Habilitado" : "Deshabilitado"}
              </span>
              {r.isSystem && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  Rol de sistema
                </span>
              )}
            </div>

            {/* Datos generales */}
            <DetailSection title="Información general">
              <DetailRow label="Nombre" value={r.name} />
              <DetailRow label="Código" value={r.code} mono />
              <DetailRow label="Descripción" value={r.description} />
              <DetailRow
                label="Tipo"
                value={r.isSystem ? "Sistema" : "Personalizado"}
              />
            </DetailSection>

            {/* Permisos asignados */}
            <DetailSection title={`Permisos asignados (${perms.length})`}>
              {loadingPerms ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 size={14} className="animate-spin" /> Cargando...
                </div>
              ) : perms.length === 0 ? (
                <p className="text-sm text-slate-400 italic">
                  Sin permisos asignados
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.keys(groupedPerms)
                    .sort()
                    .map((mod) => (
                      <div key={mod}>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          {MODULE_LABELS[mod] || mod}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {groupedPerms[mod].map((code) => (
                            <span
                              key={code}
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            >
                              {code.split(".")[1]}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </DetailSection>

            <DetailSection title="Sistema">
              <DetailRow
                label="Creado el"
                value={
                  r.$createdAt
                    ? new Date(r.$createdAt).toLocaleDateString("es-MX", {
                        dateStyle: "medium",
                      })
                    : null
                }
              />
              <DetailRow label="Creado por" value={r.createdBy} mono />
            </DetailSection>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DetailSection({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
        {label}
      </span>
      <span
        className={`text-sm text-slate-900 dark:text-slate-100 text-right ${mono ? "font-mono text-xs" : ""}`}
      >
        {value || <span className="text-slate-400">—</span>}
      </span>
    </div>
  );
}
