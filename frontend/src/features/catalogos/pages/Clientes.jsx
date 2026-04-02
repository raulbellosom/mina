import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Pencil,
  PowerOff,
  Power,
  ChevronRight,
  Loader2,
  ShieldAlert,
  Eye,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { useClientes } from "../hooks/useClientes";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import ClienteForm from "../components/ClienteForm";

const STATUS_BADGE = {
  true: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  false: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const TYPE_BADGE = {
  person: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  company:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const TYPE_LABEL = {
  person: "Persona",
  company: "Empresa",
};

export default function Clientes() {
  const { can } = usePermissions();
  const {
    items,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    create,
    update,
    toggleActive,
  } = useClientes();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [confirmDisable, setConfirmDisable] = useState(null);

  /* Permission guard */
  if (!can("clients.view")) {
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
  const openEdit = (c) => {
    setEditing(c);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    if (editing) {
      await update(editing.$id, data);
    } else {
      await create(data);
    }
  };

  const handleToggle = async (c) => {
    if (c.active) {
      setConfirmDisable(c);
    } else {
      await toggleActive(c.$id, c.active);
    }
  };

  const confirmToggleDisable = async () => {
    if (!confirmDisable) return;
    await toggleActive(confirmDisable.$id, confirmDisable.active);
    setConfirmDisable(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header + breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <header>
          <div className="flex items-center space-x-2 text-sm text-slate-500 mb-2">
            <Link to="/catalogos" className="hover:text-blue-600">
              Catálogos
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100">Clientes</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Clientes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
            Catálogo de clientes: personas físicas y empresas.
          </p>
        </header>
        {can("clients.create") && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 text-sm font-medium transition-colors shrink-0"
          >
            <Plus size={16} /> Nuevo cliente
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
            placeholder="Buscar por nombre, RFC, email, teléfono..."
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
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
          >
            <option value="all">Todos los tipos</option>
            <option value="person">Persona física</option>
            <option value="company">Empresa</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-semibold">Cliente</th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden md:table-cell">
                  Tipo
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden md:table-cell">
                  RFC
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden lg:table-cell">
                  Contacto
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
                    colSpan="6"
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                    Cargando clientes...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    <Users className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    {search
                      ? "Sin resultados para la búsqueda."
                      : "No hay clientes registrados."}
                  </td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr
                    key={c.$id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    {/* Nombre */}
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            c.type === "company"
                              ? "bg-purple-100 dark:bg-purple-900/30"
                              : "bg-sky-100 dark:bg-sky-900/30"
                          }`}
                        >
                          {c.type === "company" ? (
                            <Building2
                              size={16}
                              className="text-purple-600 dark:text-purple-400"
                            />
                          ) : (
                            <User
                              size={16}
                              className="text-sky-600 dark:text-sky-400"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {c.name}
                          </div>
                          {c.tradeName && (
                            <div className="text-xs text-slate-400 mt-0.5 truncate">
                              {c.tradeName}
                            </div>
                          )}
                          {/* Tipo badge en mobile */}
                          <div className="md:hidden mt-0.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${TYPE_BADGE[c.type] || TYPE_BADGE.person}`}
                            >
                              {TYPE_LABEL[c.type] || c.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Tipo */}
                    <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_BADGE[c.type] || TYPE_BADGE.person}`}
                      >
                        {TYPE_LABEL[c.type] || c.type}
                      </span>
                    </td>
                    {/* RFC */}
                    <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                        {c.rfc || "—"}
                      </span>
                    </td>
                    {/* Contacto */}
                    <td className="px-4 sm:px-6 py-3 hidden lg:table-cell">
                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                        {c.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={12} className="text-slate-400" />
                            {c.phone}
                          </div>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-1">
                            <Mail size={12} className="text-slate-400" />
                            {c.email}
                          </div>
                        )}
                        {!c.phone && !c.email && "—"}
                      </div>
                    </td>
                    {/* Estado */}
                    <td className="px-4 sm:px-6 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[c.active]}`}
                      >
                        {c.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    {/* Acciones */}
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailItem(c)}
                          title="Ver detalle"
                          className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye size={16} />
                        </button>
                        {can("clients.update") && (
                          <button
                            onClick={() => openEdit(c)}
                            title="Editar"
                            className="p-1.5 rounded text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        {can("clients.disable") && (
                          <button
                            onClick={() => handleToggle(c)}
                            title={c.active ? "Desactivar" : "Reactivar"}
                            className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
                              c.active
                                ? "text-red-400 hover:text-red-600"
                                : "text-green-500 hover:text-green-700"
                            }`}
                          >
                            {c.active ? (
                              <PowerOff size={16} />
                            ) : (
                              <Power size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulario crear / editar */}
      <ClienteForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={handleSubmit}
      />

      {/* Panel de detalle */}
      <ClienteDetalle
        item={detailItem}
        open={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        onEdit={
          can("clients.update")
            ? (c) => {
                setDetailItem(null);
                openEdit(c);
              }
            : null
        }
      />

      {/* Confirmación de desactivación */}
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
              Desactivar cliente
            </Dialog.Title>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              ¿Confirmas que deseas desactivar a{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {confirmDisable?.name}
              </strong>
              ? No podrá seleccionarse en nuevas operaciones hasta ser
              reactivado.
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
                Sí, desactivar
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

/* ─── Panel de detalle de cliente ─── */
function ClienteDetalle({ item: c, open, onClose, onEdit }) {
  if (!c) return null;

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
              Detalle de cliente
            </Dialog.Title>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(c)}
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
            {/* Icono + nombre */}
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  c.type === "company"
                    ? "bg-purple-100 dark:bg-purple-900/30"
                    : "bg-sky-100 dark:bg-sky-900/30"
                }`}
              >
                {c.type === "company" ? (
                  <Building2
                    size={22}
                    className="text-purple-600 dark:text-purple-400"
                  />
                ) : (
                  <User size={22} className="text-sky-600 dark:text-sky-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white text-base">
                  {c.name}
                </p>
                {c.tradeName && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {c.tradeName}
                  </p>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  c.active
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {c.active ? "Activo" : "Inactivo"}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_BADGE[c.type] || TYPE_BADGE.person}`}
              >
                {TYPE_LABEL[c.type] || c.type}
              </span>
            </div>

            {/* Datos de contacto */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Datos de contacto
              </h3>

              {c.contactName && (
                <div className="flex items-start gap-3">
                  <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">
                      Persona de contacto
                    </p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      {c.contactName}
                    </p>
                  </div>
                </div>
              )}

              {c.rfc && (
                <div className="flex items-start gap-3">
                  <FileText
                    size={16}
                    className="text-slate-400 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs text-slate-400">RFC</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100 font-mono">
                      {c.rfc}
                    </p>
                  </div>
                </div>
              )}

              {c.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Teléfono</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      {c.phone}
                    </p>
                  </div>
                </div>
              )}

              {c.email && (
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Correo electrónico</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      {c.email}
                    </p>
                  </div>
                </div>
              )}

              {c.address && (
                <div className="flex items-start gap-3">
                  <MapPin
                    size={16}
                    className="text-slate-400 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs text-slate-400">Dirección</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      {c.address}
                    </p>
                  </div>
                </div>
              )}

              {!c.rfc &&
                !c.phone &&
                !c.email &&
                !c.address &&
                !c.contactName && (
                  <p className="text-sm text-slate-400 italic">
                    Sin datos de contacto registrados.
                  </p>
                )}
            </div>

            {/* Observaciones */}
            {c.notes && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Observaciones
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {c.notes}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Información del registro
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400">Creado</p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {formatDate(c.$createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Última modificación</p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {formatDate(c.$updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
