import { useState, useEffect, useMemo } from "react";
import { Loader2, Check, Search, Shield, X } from "lucide-react";
import SideModal from "../../../shared/components/SideModal";

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

export default function PermisosMatrix({
  open,
  onOpenChange,
  role,
  catalog,
  currentPerms,
  loading,
  onSave,
}) {
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      setSelected(new Set(currentPerms || []));
      setSearchTerm("");
    }
  }, [open, currentPerms]);

  // Agrupar permisos por módulo
  const grouped = useMemo(() => {
    const map = {};
    for (const perm of catalog) {
      if (!map[perm.module]) map[perm.module] = [];
      map[perm.module].push(perm);
    }
    // Ordenar acciones dentro de cada módulo
    for (const mod of Object.keys(map)) {
      map[mod].sort((a, b) => a.action.localeCompare(b.action));
    }
    return map;
  }, [catalog]);

  // Filtrado por búsqueda
  const filteredModules = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return Object.keys(grouped).sort();
    return Object.keys(grouped)
      .filter((mod) => {
        const label = (MODULE_LABELS[mod] || mod).toLowerCase();
        if (label.includes(q)) return true;
        return grouped[mod].some(
          (p) =>
            p.code.toLowerCase().includes(q) ||
            (p.description || "").toLowerCase().includes(q),
        );
      })
      .sort();
  }, [grouped, searchTerm]);

  const toggle = (code) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleModule = (mod) => {
    const codes = grouped[mod].map((p) => p.code);
    const allSelected = codes.every((c) => selected.has(c));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const code of codes) {
        if (allSelected) next.delete(code);
        else next.add(code);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(catalog.map((p) => p.code)));
  };

  const clearAll = () => {
    setSelected(new Set());
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(role.$id, [...selected]);
      onOpenChange(false);
    } catch (err) {
      console.error("Error guardando permisos:", err);
    } finally {
      setSaving(false);
    }
  };

  const changesCount = useMemo(() => {
    const prev = new Set(currentPerms || []);
    let added = 0,
      removed = 0;
    for (const c of selected) {
      if (!prev.has(c)) added++;
    }
    for (const c of prev) {
      if (!selected.has(c)) removed++;
    }
    return { added, removed, hasChanges: added > 0 || removed > 0 };
  }, [selected, currentPerms]);

  return (
    <SideModal open={open} onOpenChange={onOpenChange} size="2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Permisos del rol
          </h2>
          {role && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {role.name}{" "}
              <span className="font-mono text-xs text-slate-400">
                ({role.code})
              </span>
            </p>
          )}
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar permiso..."
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={selectAll}
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Marcar todos
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <button
            onClick={clearAll}
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Desmarcar todos
          </button>
          <span className="text-slate-400 ml-2">
            {selected.size} / {catalog.length}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield
              size={32}
              className="text-slate-300 dark:text-slate-700 mb-3"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {searchTerm
                ? "Sin resultados para la búsqueda."
                : "No hay permisos en el catálogo."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredModules.map((mod) => {
              const perms = grouped[mod];
              const allChecked = perms.every((p) => selected.has(p.code));
              const someChecked = perms.some((p) => selected.has(p.code));

              return (
                <div
                  key={mod}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  {/* Module header */}
                  <button
                    type="button"
                    onClick={() => toggleModule(mod)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                  >
                    <div
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        allChecked
                          ? "bg-primary-600 border-primary-600"
                          : someChecked
                            ? "bg-primary-200 border-primary-400 dark:bg-primary-900/40 dark:border-primary-600"
                            : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {allChecked && <Check size={12} className="text-white" />}
                      {someChecked && !allChecked && (
                        <div className="h-2 w-2 rounded-sm bg-primary-600" />
                      )}
                    </div>
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      {MODULE_LABELS[mod] || mod}
                    </span>
                    <span className="text-xs text-slate-400 ml-auto">
                      {perms.filter((p) => selected.has(p.code)).length}/
                      {perms.length}
                    </span>
                  </button>

                  {/* Permissions list */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {perms.map((perm) => (
                      <label
                        key={perm.code}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(perm.code)}
                          onChange={() => toggle(perm.code)}
                          className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-slate-900 dark:text-slate-100 font-mono">
                            {perm.code}
                          </span>
                          {perm.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              {perm.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {changesCount.hasChanges ? (
            <>
              {changesCount.added > 0 && (
                <span className="text-green-600 dark:text-green-400">
                  +{changesCount.added}{" "}
                </span>
              )}
              {changesCount.removed > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  -{changesCount.removed}{" "}
                </span>
              )}
              cambios pendientes
            </>
          ) : (
            "Sin cambios"
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !changesCount.hasChanges}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Guardar permisos
          </button>
        </div>
      </div>
    </SideModal>
  );
}
