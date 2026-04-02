import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";

const EMPTY_FORM = {
  externalReference: "",
  clientId: "",
  driverId: "",
  truckId: "",
  materialId: "",
  plantId: "",
  commercialQty: "",
  commercialUnit: "viaje",
  notes: "",
};

const COMMERCIAL_UNITS = [
  { value: "viaje", label: "Viaje" },
  { value: "tonelada", label: "Tonelada" },
  { value: "m3", label: "Metro cúbico (m³)" },
  { value: "kg", label: "Kilogramo (kg)" },
  { value: "pieza", label: "Pieza" },
];

export default function VoucherForm({
  open,
  onOpenChange,
  editing,
  onSubmit,
  clients = [],
  drivers = [],
  trucks = [],
  materials = [],
  plants = [],
  readOnly = false,
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
          externalReference: editing.externalReference || "",
          clientId: editing.clientId || "",
          driverId: editing.driverId || "",
          truckId: editing.truckId || "",
          materialId: editing.materialId || "",
          plantId: editing.plantId || "",
          commercialQty:
            editing.commercialQty != null ? String(editing.commercialQty) : "",
          commercialUnit: editing.commercialUnit || "viaje",
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

    if (!form.clientId) {
      setError("El cliente es obligatorio");
      return;
    }
    if (!form.materialId) {
      setError("El material es obligatorio");
      return;
    }
    if (!form.plantId) {
      setError("La planta / origen es obligatoria");
      return;
    }
    const qty = parseFloat(form.commercialQty);
    if (!form.commercialQty || isNaN(qty) || qty <= 0) {
      setError("La cantidad comercial debe ser mayor a cero");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed";
  const labelCls = "text-sm font-medium text-slate-700 dark:text-slate-300";
  const selectCls = `${inputCls} appearance-none`;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
              {readOnly
                ? "Detalle de voucher"
                : isEditing
                  ? "Editar voucher"
                  : "Nuevo voucher"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Referencia externa */}
            <div>
              <label className={labelCls}>Referencia externa</label>
              <input
                value={form.externalReference}
                onChange={set("externalReference")}
                disabled={readOnly}
                placeholder="Folio de vale, referencia de pago, etc."
                maxLength={100}
                className={inputCls}
              />
            </div>

            {/* Cliente + Material */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.clientId}
                  onChange={set("clientId")}
                  disabled={readOnly}
                  className={selectCls}
                >
                  <option value="">— Seleccionar cliente —</option>
                  {clients.map((c) => (
                    <option key={c.$id} value={c.$id}>
                      {c.name} {c.tradeName ? `(${c.tradeName})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  Material <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.materialId}
                  onChange={set("materialId")}
                  disabled={readOnly}
                  className={selectCls}
                >
                  <option value="">— Seleccionar material —</option>
                  {materials.map((m) => (
                    <option key={m.$id} value={m.$id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Planta */}
            <div>
              <label className={labelCls}>
                Planta / Origen <span className="text-red-500">*</span>
              </label>
              <select
                value={form.plantId}
                onChange={set("plantId")}
                disabled={readOnly}
                className={selectCls}
              >
                <option value="">— Seleccionar planta —</option>
                {plants.map((p) => (
                  <option key={p.$id} value={p.$id}>
                    {p.name} {p.code ? `(${p.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Chofer + Camión */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Chofer</label>
                <select
                  value={form.driverId}
                  onChange={set("driverId")}
                  disabled={readOnly}
                  className={selectCls}
                >
                  <option value="">— Sin chofer asignado —</option>
                  {drivers.map((d) => (
                    <option key={d.$id} value={d.$id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Camión</label>
                <select
                  value={form.truckId}
                  onChange={set("truckId")}
                  disabled={readOnly}
                  className={selectCls}
                >
                  <option value="">— Sin camión asignado —</option>
                  {trucks.map((t) => (
                    <option key={t.$id} value={t.$id}>
                      {t.plates} {t.alias ? `— ${t.alias}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cantidad + Unidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Cantidad comercial <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.commercialQty}
                  onChange={set("commercialQty")}
                  disabled={readOnly}
                  placeholder="Ej: 1, 20, 3.5"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Unidad comercial <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.commercialUnit}
                  onChange={set("commercialUnit")}
                  disabled={readOnly}
                  className={selectCls}
                >
                  {COMMERCIAL_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className={labelCls}>Observaciones</label>
              <textarea
                value={form.notes}
                onChange={set("notes")}
                disabled={readOnly}
                rows={3}
                maxLength={1000}
                placeholder="Instrucciones especiales, notas del cliente…"
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            {/* Acciones */}
            {!readOnly && (
              <div className="flex justify-end gap-3 pt-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {isEditing ? "Guardar cambios" : "Crear voucher"}
                </button>
              </div>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
