import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";

const EMPTY_FORM = {
  plateNumber: "",
  secondaryPlateNumber: "",
  economicNumber: "",
  truckType: "",
  brand: "",
  model: "",
  year: "",
  color: "",
  axleType: "",
  referenceCapacity: "",
  clientId: "",
  habitualDriverId: "",
  notes: "",
};

const TRUCK_TYPES = [
  "Volteo",
  "Góndola",
  "Torton",
  "Tráiler",
  "Rabón",
  "Doble remolque",
  "Otro",
];

const AXLE_TYPES = ["Sencillo", "Doble", "Triple", "Otro"];

export default function CamionForm({
  open,
  onOpenChange,
  editing,
  clients,
  drivers,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = Boolean(editing);

  useEffect(() => {
    if (open) {
      setError(null);
      if (editing) {
        setForm({
          plateNumber: editing.plateNumber || "",
          secondaryPlateNumber: editing.secondaryPlateNumber || "",
          economicNumber: editing.economicNumber || "",
          truckType: editing.truckType || "",
          brand: editing.brand || "",
          model: editing.model || "",
          year: editing.year ? String(editing.year) : "",
          color: editing.color || "",
          axleType: editing.axleType || "",
          referenceCapacity: editing.referenceCapacity
            ? String(editing.referenceCapacity)
            : "",
          clientId: editing.clientId || "",
          habitualDriverId: editing.habitualDriverId || "",
          notes: editing.notes || "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, editing]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.plateNumber.trim()) {
      setError("La placa principal es obligatoria");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      const msg = err.message || "Error al guardar";
      if (
        msg.includes("Document with the requested ID already exists") ||
        msg.includes("unique")
      ) {
        setError("Ya existe un camión con esa placa");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white";
  const labelCls = "text-sm font-medium text-slate-700 dark:text-slate-300";
  const selectCls =
    "mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? "Editar camión" : "Nuevo camión"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ─── Identificación vehicular ─── */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Identificación
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>
                  Placa principal <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.plateNumber}
                  onChange={set("plateNumber")}
                  required
                  placeholder="Ej: ABC-1234"
                  className={`${inputCls} font-mono uppercase`}
                />
              </div>
              <div>
                <label className={labelCls}>Placa secundaria</label>
                <input
                  value={form.secondaryPlateNumber}
                  onChange={set("secondaryPlateNumber")}
                  placeholder="Remolque, etc."
                  className={`${inputCls} font-mono uppercase`}
                />
              </div>
              <div>
                <label className={labelCls}>No. económico</label>
                <input
                  value={form.economicNumber}
                  onChange={set("economicNumber")}
                  placeholder="Ej: U-042"
                  className={`${inputCls} font-mono uppercase`}
                />
              </div>
            </div>

            {/* ─── Datos del vehículo ─── */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">
              Vehículo
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Tipo de camión</label>
                <select
                  value={form.truckType}
                  onChange={set("truckType")}
                  className={selectCls}
                >
                  <option value="">Seleccionar...</option>
                  {TRUCK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Marca</label>
                <input
                  value={form.brand}
                  onChange={set("brand")}
                  placeholder="Ej: Kenworth"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Modelo</label>
                <input
                  value={form.model}
                  onChange={set("model")}
                  placeholder="Ej: T800"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Año</label>
                <input
                  type="number"
                  min="1980"
                  max="2099"
                  value={form.year}
                  onChange={set("year")}
                  placeholder="Ej: 2020"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Color</label>
                <input
                  value={form.color}
                  onChange={set("color")}
                  placeholder="Ej: Blanco"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Tipo de eje</label>
                <select
                  value={form.axleType}
                  onChange={set("axleType")}
                  className={selectCls}
                >
                  <option value="">Seleccionar...</option>
                  {AXLE_TYPES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Capacidad ref. (t)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.referenceCapacity}
                  onChange={set("referenceCapacity")}
                  placeholder="Toneladas"
                  className={inputCls}
                />
              </div>
            </div>

            {/* ─── Relaciones opcionales ─── */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">
              Relaciones
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Cliente / Empresa</label>
                <select
                  value={form.clientId}
                  onChange={set("clientId")}
                  className={selectCls}
                >
                  <option value="">Sin asociar</option>
                  {(clients || []).map((c) => (
                    <option key={c.$id} value={c.$id}>
                      {c.name}
                      {c.tradeName ? ` (${c.tradeName})` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Opcional. Vincula el camión con un cliente.
                </p>
              </div>
              <div>
                <label className={labelCls}>Chofer habitual</label>
                <select
                  value={form.habitualDriverId}
                  onChange={set("habitualDriverId")}
                  className={selectCls}
                >
                  <option value="">Sin asignar</option>
                  {(drivers || []).map((d) => (
                    <option key={d.$id} value={d.$id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Opcional. Chofer principal que opera esta unidad.
                </p>
              </div>
            </div>

            {/* ─── Observaciones ─── */}
            <div>
              <label className={labelCls}>Observaciones</label>
              <textarea
                value={form.notes}
                onChange={set("notes")}
                rows={3}
                placeholder="Notas internas sobre el camión..."
                className={`${inputCls} resize-none`}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {isEditing ? "Guardar cambios" : "Crear camión"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
