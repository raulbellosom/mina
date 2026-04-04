import { useState } from "react";
import {
  Users2,
  Plus,
  Search,
  Filter,
  Pencil,
  PowerOff,
  Power,
  ChevronRight,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useUsuarios } from "../hooks/useUsuarios";
import SearchableSelect from "../../../shared/components/SearchableSelect";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import UsuarioForm from "../components/UsuarioForm";

const LABEL_BADGE = {
  owner: {
    label: "Owner",
    classes:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  root: {
    label: "Root",
    classes: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  },
  admin: {
    label: "Admin",
    classes:
      "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400",
  },
  operador: {
    label: "Operador",
    classes: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  },
  capturista: {
    label: "Capturista",
    classes:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  pending: {
    label: "Pendiente",
    classes:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
};

const STATUS_BADGE = {
  active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  suspended:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export default function Usuarios() {
  const { can, role } = usePermissions();
  const { user: authUser } = useAuth();
  const {
    users,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    createUser,
    updateUser,
    toggleActive,
  } = useUsuarios();

  const isOwner = authUser?.labels?.includes("owner") || false;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [confirmDisable, setConfirmDisable] = useState(null); // usuario a deshabilitar

  if (!can("users.view")) {
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

  const openEdit = (u) => {
    setEditing(u);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    if (editing) {
      await updateUser(editing.$id, data);
    } else {
      await createUser(data);
    }
  };

  const handleToggle = async (u) => {
    if (u.active) {
      setConfirmDisable(u);
    } else {
      await toggleActive(u.$id, u.active);
    }
  };

  const confirmToggleDisable = async () => {
    if (!confirmDisable) return;
    await toggleActive(confirmDisable.$id, confirmDisable.active);
    setConfirmDisable(null);
  };

  const displayName = (u) => {
    if (u.firstName || u.lastName)
      return `${u.firstName || ""} ${u.lastName || ""}`.trim();
    return u.name || "—";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <header>
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <span>Administración</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-slate-100">Usuarios</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Usuarios del Sistema
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
            Gestión de personal, accesos y roles.
          </p>
        </header>
        {can("users.create") && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 h-10 px-4 text-sm font-medium transition-colors shrink-0"
          >
            <Plus size={16} /> Nuevo usuario
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
            placeholder="Buscar por nombre, email o código..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={16} className="text-slate-400" />
          <SearchableSelect
            value={filterStatus}
            onChange={(v) => setFilterStatus(v)}
            options={[
              { value: "all", label: "Todos" },
              { value: "active", label: "Activos" },
              { value: "inactive", label: "Inactivos" },
            ]}
            placeholder="Estado"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-semibold">Usuario</th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden md:table-cell">
                  Email
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden sm:table-cell">
                  Perfil
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
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    <Users2 className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    {search
                      ? "Sin resultados para la búsqueda."
                      : "No hay usuarios registrados."}
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const badge = LABEL_BADGE[u.role] || LABEL_BADGE.pending;
                  const statusClass =
                    STATUS_BADGE[u.status] || STATUS_BADGE.inactive;
                  return (
                    <tr
                      key={u.$id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      {/* Nombre */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {displayName(u)}
                        </div>
                        {u.employeeCode && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            {u.employeeCode}
                          </div>
                        )}
                        {/* email visible en mobile */}
                        <div className="text-xs text-slate-400 mt-0.5 md:hidden">
                          {u.email || "—"}
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell text-slate-600 dark:text-slate-400">
                        {u.email || "—"}
                      </td>
                      {/* Perfil / Label */}
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.classes}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-4 sm:px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}`}
                        >
                          {u.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      {/* Acciones */}
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Detalle */}
                          <button
                            onClick={() => setDetailUser(u)}
                            title="Ver detalle"
                            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <ChevronRight size={16} />
                          </button>
                          {/* Editar */}
                          {can("users.update") && (
                            <button
                              onClick={() => openEdit(u)}
                              title="Editar"
                              className="p-1.5 rounded text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {/* Activar / Desactivar */}
                          {can("users.disable") && (
                            <button
                              onClick={() => handleToggle(u)}
                              title={u.active ? "Deshabilitar" : "Reactivar"}
                              className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
                                u.active
                                  ? "text-red-400 hover:text-red-600"
                                  : "text-green-500 hover:text-green-700"
                              }`}
                            >
                              {u.active ? (
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

      {/* Formulario creación / edición */}
      <UsuarioForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        isOwner={isOwner}
        onSubmit={handleSubmit}
      />

      {/* Panel de detalle */}
      <UsuarioDetalle
        user={detailUser}
        open={Boolean(detailUser)}
        onClose={() => setDetailUser(null)}
        onEdit={
          can("users.update")
            ? (u) => {
                setDetailUser(null);
                openEdit(u);
              }
            : null
        }
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
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6"
          >
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Deshabilitar usuario
            </Dialog.Title>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              ¿Confirmas que deseas deshabilitar a{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {confirmDisable ? displayName(confirmDisable) : ""}
              </strong>
              ? El usuario no podrá operar en el sistema hasta ser reactivado.
            </p>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={confirmToggleDisable}
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

/* ─── Panel de detalle de usuario ─── */
function UsuarioDetalle({ user: u, open, onClose, onEdit }) {
  if (!u) return null;

  const badge = LABEL_BADGE[u.role] || LABEL_BADGE.pending;

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
          aria-describedby={undefined}
          className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
              Detalle de usuario
            </Dialog.Title>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(u)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100"
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
            {/* Avatar + nombre */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xl font-bold shrink-0">
                {(u.name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-base">
                  {u.firstName || u.lastName
                    ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                    : u.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {u.email || "—"}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.classes}`}
              >
                {badge.label}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  u.active
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {u.active ? "Activo" : "Inactivo"}
              </span>
            </div>

            {/* Datos */}
            <DetailSection title="Información de acceso">
              <DetailRow label="Nombre en sistema" value={u.name} />
              <DetailRow label="Email" value={u.email} />
              <DetailRow label="Perfil de acceso" value={badge.label} />
            </DetailSection>

            <DetailSection title="Datos operativos">
              <DetailRow label="Código de empleado" value={u.employeeCode} />
              <DetailRow label="Teléfono" value={u.phone} />
            </DetailSection>

            {u.notes && (
              <DetailSection title="Notas internas">
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {u.notes}
                </p>
              </DetailSection>
            )}

            <DetailSection title="Sistema">
              <DetailRow label="ID de usuario" value={u.userId} mono />
              <DetailRow
                label="Creado el"
                value={
                  u.$createdAt
                    ? new Date(u.$createdAt).toLocaleDateString("es-MX", {
                        dateStyle: "medium",
                      })
                    : null
                }
              />
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
