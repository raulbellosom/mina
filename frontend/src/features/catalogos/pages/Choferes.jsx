import { useState } from "react";
import {
  UserSquare2,
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
  Phone,
  Mail,
  IdCard,
  Building2,
  StickyNote,
} from "lucide-react";
import SearchableSelect from "../../../shared/components/SearchableSelect";
import { Link } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { useChoferes } from "../hooks/useChoferes";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import ChoferForm from "../components/ChoferForm";
import SideModal from "../../../shared/components/SideModal";

const STATUS_BADGE = {
  true: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  false: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function Choferes() {
  const { can } = usePermissions();
  const {
    items,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    clients,
    create,
    update,
    toggleActive,
  } = useChoferes();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [confirmDisable, setConfirmDisable] = useState(null);

  /* Permission guard */
  if (!can("drivers.view")) {
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
  const openEdit = (d) => {
    setEditing(d);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    if (editing) {
      await update(editing.$id, data);
    } else {
      await create(data);
    }
  };

  const handleToggle = async (d) => {
    if (d.active) {
      setConfirmDisable(d);
    } else {
      await toggleActive(d.$id, d.active);
    }
  };

  const confirmToggleDisable = async () => {
    if (!confirmDisable) return;
    await toggleActive(confirmDisable.$id, confirmDisable.active);
    setConfirmDisable(null);
  };

  const clientName = (clientId) => {
    if (!clientId) return null;
    const c = clients.find((cl) => cl.$id === clientId);
    return c ? c.tradeName || c.name : null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header + breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <header>
          <div className="flex items-center space-x-2 text-sm text-slate-500 mb-2">
            <Link to="/catalogos" className="hover:text-primary-600">
              Catálogos
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100">Choferes</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Choferes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
            Catálogo de operadores / conductores de la operación.
          </p>
        </header>
        {can("drivers.create") && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 h-10 px-4 text-sm font-medium transition-colors shrink-0"
          >
            <Plus size={16} /> Nuevo chofer
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
            placeholder="Buscar por nombre, licencia, teléfono..."
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
                <th className="px-4 sm:px-6 py-3 font-semibold">Chofer</th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden md:table-cell">
                  Licencia
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden md:table-cell">
                  Teléfono
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden lg:table-cell">
                  Cliente asociado
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
                    Cargando choferes...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    <UserSquare2 className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    {search
                      ? "Sin resultados para la búsqueda."
                      : "No hay choferes registrados."}
                  </td>
                </tr>
              ) : (
                items.map((d) => {
                  const client = clientName(d.clientId);
                  return (
                    <tr
                      key={d.$id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      {/* Nombre */}
                      <td className="px-4 sm:px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            <UserSquare2
                              size={16}
                              className="text-amber-600 dark:text-amber-400"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {d.fullName || d.firstName}
                            </div>
                            {/* Licencia en mobile */}
                            {d.licenseNumber && (
                              <div className="text-xs text-slate-400 mt-0.5 md:hidden font-mono">
                                {d.licenseNumber}
                              </div>
                            )}
                            {/* Cliente en mobile */}
                            {client && (
                              <div className="text-xs text-slate-400 mt-0.5 lg:hidden">
                                {client}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Licencia */}
                      <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                          {d.licenseNumber || "—"}
                        </span>
                      </td>
                      {/* Teléfono */}
                      <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {d.phone || "—"}
                        </span>
                      </td>
                      {/* Cliente asociado */}
                      <td className="px-4 sm:px-6 py-3 hidden lg:table-cell">
                        {client ? (
                          <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Building2 size={12} className="text-slate-400" />
                            {client}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      {/* Estado */}
                      <td className="px-4 sm:px-6 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[d.active]}`}
                        >
                          {d.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      {/* Acciones */}
                      <td className="px-4 sm:px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailItem(d)}
                            title="Ver detalle"
                            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Eye size={16} />
                          </button>
                          {can("drivers.update") && (
                            <button
                              onClick={() => openEdit(d)}
                              title="Editar"
                              className="p-1.5 rounded text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {can("drivers.disable") && (
                            <button
                              onClick={() => handleToggle(d)}
                              title={d.active ? "Desactivar" : "Reactivar"}
                              className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
                                d.active
                                  ? "text-red-400 hover:text-red-600"
                                  : "text-green-500 hover:text-green-700"
                              }`}
                            >
                              {d.active ? (
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

      {/* Formulario crear / editar */}
      <ChoferForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        clients={clients}
        onSubmit={handleSubmit}
      />

      {/* Panel de detalle */}
      <ChoferDetalle
        item={detailItem}
        open={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        onEdit={
          can("drivers.update")
            ? (d) => {
                setDetailItem(null);
                openEdit(d);
              }
            : null
        }
        clientName={clientName}
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
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6"
          >
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Desactivar chofer
            </Dialog.Title>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              ¿Confirmas que deseas desactivar a{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {confirmDisable?.fullName}
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

/* ─── Panel de detalle de chofer ─── */
function ChoferDetalle({ item: d, open, onClose, onEdit, clientName }) {
  if (!d) return null;

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

  const client = clientName(d.clientId);

  return (
    <SideModal
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Detalle de chofer
        </h2>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(d)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100"
            >
              <Pencil size={13} /> Editar
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Icono + nombre */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <UserSquare2
              size={22}
              className="text-amber-600 dark:text-amber-400"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white text-base">
              {d.fullName}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {d.firstName} {d.lastName}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              d.active
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {d.active ? "Activo" : "Inactivo"}
          </span>
          {d.licenseNumber && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Lic: {d.licenseNumber}
            </span>
          )}
        </div>

        {/* Datos de contacto */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Datos de contacto
          </h3>

          {d.phone && (
            <div className="flex items-start gap-3">
              <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Teléfono</p>
                <p className="text-sm text-slate-900 dark:text-slate-100">
                  {d.phone}
                </p>
              </div>
            </div>
          )}

          {d.email && (
            <div className="flex items-start gap-3">
              <Mail size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Correo electrónico</p>
                <p className="text-sm text-slate-900 dark:text-slate-100">
                  {d.email}
                </p>
              </div>
            </div>
          )}

          {d.licenseNumber && (
            <div className="flex items-start gap-3">
              <IdCard size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">No. de licencia</p>
                <p className="text-sm text-slate-900 dark:text-slate-100 font-mono">
                  {d.licenseNumber}
                </p>
              </div>
            </div>
          )}

          {!d.phone && !d.email && !d.licenseNumber && (
            <p className="text-sm text-slate-400 italic">
              Sin datos de contacto registrados.
            </p>
          )}
        </div>

        {/* Cliente asociado */}
        {client && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Cliente asociado
            </h3>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-slate-400" />
              <p className="text-sm text-slate-900 dark:text-slate-100">
                {client}
              </p>
            </div>
          </div>
        )}

        {/* Observaciones */}
        {d.notes && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Observaciones
            </h3>
            <div className="flex items-start gap-2">
              <StickyNote
                size={16}
                className="text-slate-400 mt-0.5 shrink-0"
              />
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {d.notes}
              </p>
            </div>
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
                {formatDate(d.$createdAt)}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Última modificación</p>
              <p className="text-slate-700 dark:text-slate-300">
                {formatDate(d.$updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SideModal>
  );
}
