import { useState } from "react";
import {
  Tag,
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
} from "lucide-react";
import { Link } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { useCategorias } from "../hooks/useCategorias";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import CategoriaForm from "../components/CategoriaForm";

const STATUS_BADGE = {
  true: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  false: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function Categorias() {
  const { can } = usePermissions();
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
  } = useCategorias();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [confirmDisable, setConfirmDisable] = useState(null);

  /* Permission guard */
  if (!can("categories.view")) {
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
            <Link to="/catalogos" className="hover:text-primary-600">
              Catálogos
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100">
              Categorías
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Categorías de Materiales
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
            Clasificación y agrupación de materiales por tipo.
          </p>
        </header>
        {can("categories.create") && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 h-10 px-4 text-sm font-medium transition-colors shrink-0"
          >
            <Plus size={16} /> Nueva categoría
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
            placeholder="Buscar por nombre, código o descripción..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
          >
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-semibold">Categoría</th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden md:table-cell">
                  Código
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden lg:table-cell">
                  Descripción
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden sm:table-cell">
                  Orden
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
                    Cargando categorías...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    <Tag className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    {search
                      ? "Sin resultados para la búsqueda."
                      : "No hay categorías registradas."}
                  </td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr
                    key={c.$id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    {/* Nombre */}
                    <td className="px-4 sm:px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {c.name}
                      </div>
                      {/* código visible en mobile */}
                      <div className="text-xs text-slate-400 mt-0.5 md:hidden font-mono">
                        {c.code}
                      </div>
                    </td>
                    {/* Código */}
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                        {c.code}
                      </span>
                    </td>
                    {/* Descripción */}
                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate block max-w-xs">
                        {c.description || "—"}
                      </span>
                    </td>
                    {/* Orden */}
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell text-center">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {c.sortOrder ?? 0}
                      </span>
                    </td>
                    {/* Estado */}
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[c.active]}`}
                      >
                        {c.active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    {/* Acciones */}
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailItem(c)}
                          title="Ver detalle"
                          className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye size={16} />
                        </button>
                        {can("categories.update") && (
                          <button
                            onClick={() => openEdit(c)}
                            title="Editar"
                            className="p-1.5 rounded text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        {can("categories.disable") && (
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
      <CategoriaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={handleSubmit}
      />

      {/* Panel de detalle */}
      <CategoriaDetalle
        item={detailItem}
        open={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        onEdit={
          can("categories.update")
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
              Desactivar categoría
            </Dialog.Title>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              ¿Confirmas que deseas desactivar{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {confirmDisable?.name}
              </strong>
              ? No podrá seleccionarse para nuevos materiales hasta ser
              reactivada.
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

/* ─── Panel de detalle de categoría ─── */
function CategoriaDetalle({ item: c, open, onClose, onEdit }) {
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
              Detalle de categoría
            </Dialog.Title>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(c)}
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
            {/* Icono + nombre */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Tag size={24} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-base">
                  {c.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                  {c.code}
                </p>
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
                {c.active ? "Activa" : "Inactiva"}
              </span>
              {c.sortOrder > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Orden: {c.sortOrder}
                </span>
              )}
            </div>

            {/* Campos */}
            <div className="space-y-4">
              <DetailField
                label="Descripción"
                value={c.description || "Sin descripción"}
              />
              <DetailField
                label="Orden de presentación"
                value={String(c.sortOrder ?? 0)}
              />
              <DetailField
                label="Fecha de creación"
                value={formatDate(c.$createdAt)}
              />
              <DetailField
                label="Última actualización"
                value={formatDate(c.$updatedAt)}
              />
              {c.createdBy && (
                <DetailField label="Creado por" value={c.createdBy} mono />
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DetailField({ label, value, mono }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm text-slate-800 dark:text-slate-200 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
