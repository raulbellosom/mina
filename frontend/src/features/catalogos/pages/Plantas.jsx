import { useState } from "react";
import {
  Mountain,
  Plus,
  Loader2,
  Search,
  X,
  Pencil,
  Power,
  ChevronRight,
  Eye,
  AlertTriangle,
  Hash,
  MapPin,
  Phone,
  User,
  StickyNote,
  FileText,
  ArrowUpDown,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "react-router-dom";
import { usePlantas } from "../hooks/usePlantas";
import PlantaForm from "../components/PlantaForm";
import { usePermissions } from "../../../shared/hooks/usePermissions";

/* ─── Detail drawer ─── */
function PlantaDetalle({ item, onClose }) {
  if (!item) return null;

  const Row = ({ icon: Icon, label, value, mono }) => (
    <div className="flex items-start gap-3 py-2.5">
      <Icon size={16} className="mt-0.5 text-slate-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p
          className={`text-sm text-slate-900 dark:text-white ${mono ? "font-mono" : ""}`}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl z-30 overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
          Detalle de planta / origen
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-1">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Mountain
              size={24}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900 dark:text-white text-lg truncate">
              {item.name}
            </p>
            {item.code && (
              <p className="text-sm text-slate-500 font-mono">{item.code}</p>
            )}
          </div>
          <span
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${item.active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
          >
            {item.active ? "Activo" : "Inactivo"}
          </span>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* Identificación */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-3 pb-1">
          Identificación
        </p>
        <Row icon={Mountain} label="Nombre" value={item.name} />
        <Row icon={Hash} label="Código / Clave" value={item.code} mono />
        <Row icon={FileText} label="Tipo de origen" value={item.type} />
        <Row
          icon={ArrowUpDown}
          label="Orden de aparición"
          value={item.sortOrder != null ? String(item.sortOrder) : ""}
        />

        <hr className="border-slate-200 dark:border-slate-800 my-2" />

        {/* Ubicación */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-3 pb-1">
          Ubicación
        </p>
        <Row
          icon={MapPin}
          label="Referencia de ubicación"
          value={item.locationReference}
        />

        {item.description && (
          <Row icon={FileText} label="Descripción" value={item.description} />
        )}

        {/* Contacto */}
        {(item.contactName || item.contactPhone) && (
          <>
            <hr className="border-slate-200 dark:border-slate-800 my-2" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-3 pb-1">
              Contacto
            </p>
            <Row
              icon={User}
              label="Nombre de contacto"
              value={item.contactName}
            />
            <Row
              icon={Phone}
              label="Teléfono de contacto"
              value={item.contactPhone}
            />
          </>
        )}

        {item.notes && (
          <>
            <hr className="border-slate-200 dark:border-slate-800 my-2" />
            <Row icon={StickyNote} label="Observaciones" value={item.notes} />
          </>
        )}

        <hr className="border-slate-200 dark:border-slate-800 my-2" />

        {/* Metadata */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-3 pb-1">
          Metadata
        </p>
        <div className="text-xs text-slate-400 space-y-1">
          <p>
            Creado:{" "}
            {new Date(item.$createdAt).toLocaleString("es-MX", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <p>
            Actualizado:{" "}
            {new Date(item.$updatedAt).toLocaleString("es-MX", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <p className="font-mono text-[10px] opacity-60">ID: {item.$id}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Plantas — main page
   ═══════════════════════════════════════════ */
export default function Plantas() {
  const {
    items,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    create,
    update,
    toggleActive,
  } = usePlantas();

  const { can } = usePermissions();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [confirmDisable, setConfirmDisable] = useState(null);

  /* ─── Permission guard ─── */
  if (!can("plants.view")) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
        <AlertTriangle size={40} />
        <p className="text-lg font-medium">Sin acceso</p>
        <p className="text-sm">
          No tienes permisos para ver plantas / orígenes.
        </p>
      </div>
    );
  }

  /* ─── Helpers ─── */
  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };
  const handleSubmit = async (data) => {
    if (editing) {
      await update(editing.$id, data);
    } else {
      await create(data);
    }
  };

  const filterTabs = [
    { key: "all", label: "Todos" },
    { key: "active", label: "Activos" },
    { key: "inactive", label: "Inactivos" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <header>
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <Link
              to="/catalogos"
              className="hover:text-primary-600 dark:hover:text-primary-400"
            >
              Catálogos
            </Link>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-slate-100">
              Plantas / Orígenes
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Plantas y Orígenes
          </h1>
        </header>

        {can("plants.create") && (
          <button
            onClick={openNew}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 h-10 px-4 shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo origen
          </button>
        )}
      </div>

      {/* ─── Search & Filters ─── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, código, tipo o ubicación..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden text-sm shrink-0">
          {filterTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterStatus(t.key)}
              className={`px-3 py-2 transition-colors ${filterStatus === t.key ? "bg-primary-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-semibold">
                  Planta / Origen
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden md:table-cell">
                  Tipo
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden lg:table-cell">
                  Ubicación
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
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary-500 mb-2" />
                    <p className="text-sm text-slate-500">
                      Cargando plantas...
                    </p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Mountain className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm text-slate-500">
                      {search
                        ? "Sin resultados para la búsqueda"
                        : "No hay plantas / orígenes registrados"}
                    </p>
                    {!search && can("plants.create") && (
                      <button
                        onClick={openNew}
                        className="mt-3 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                      >
                        + Registrar primer origen
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.$id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                    onClick={() => setDetailItem(item)}
                  >
                    {/* Planta */}
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                          <Mountain
                            size={18}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate font-mono">
                            {item.code || "Sin código"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="px-4 sm:px-6 py-3 hidden md:table-cell text-slate-600 dark:text-slate-300">
                      {item.type || "—"}
                    </td>

                    {/* Ubicación */}
                    <td className="px-4 sm:px-6 py-3 hidden lg:table-cell text-slate-600 dark:text-slate-300 truncate max-w-[220px]">
                      {item.locationReference || "—"}
                    </td>

                    {/* Estado */}
                    <td className="px-4 sm:px-6 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                      >
                        {item.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailItem(item);
                          }}
                          title="Ver detalle"
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        >
                          <Eye size={15} />
                        </button>
                        {can("plants.update") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(item);
                            }}
                            title="Editar"
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-primary-600 dark:text-primary-400"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {can("plants.disable") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDisable(item);
                            }}
                            title={item.active ? "Desactivar" : "Activar"}
                            className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${item.active ? "text-amber-600" : "text-green-600"}`}
                          >
                            <Power size={15} />
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
        {!loading && items.length > 0 && (
          <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            {items.length} origen{items.length !== 1 ? "es" : ""}
          </div>
        )}
      </div>

      {/* ─── Form modal ─── */}
      <PlantaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={handleSubmit}
      />

      {/* ─── Confirm disable dialog ─── */}
      <Dialog.Root
        open={!!confirmDisable}
        onOpenChange={(open) => !open && setConfirmDisable(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {confirmDisable?.active
                ? "Desactivar origen"
                : "Reactivar origen"}
            </Dialog.Title>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
              {confirmDisable?.active
                ? "El origen no podrá seleccionarse en nuevas operaciones."
                : "El origen volverá a estar disponible para operaciones."}
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-4">
              {confirmDisable?.name}
              {confirmDisable?.code && (
                <span className="text-slate-500 font-mono ml-1">
                  ({confirmDisable.code})
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={async () => {
                  await toggleActive(confirmDisable.$id, confirmDisable.active);
                  setConfirmDisable(null);
                }}
                className={`px-4 py-2 text-sm rounded-md text-white ${confirmDisable?.active ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}`}
              >
                {confirmDisable?.active ? "Desactivar" : "Reactivar"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ─── Detail panel ─── */}
      {detailItem && (
        <PlantaDetalle item={detailItem} onClose={() => setDetailItem(null)} />
      )}
    </div>
  );
}
