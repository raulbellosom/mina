import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { friendlyError } from "../../../shared/lib/catalogCache";
import SearchableSelect from "../../../shared/components/SearchableSelect";
import CenterModal from "../../../shared/components/CenterModal";

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
      const msg = friendlyError(err);
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
    "mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white";
  const labelCls = "text-sm font-medium text-slate-700 dark:text-slate-300";
  const selectCls =
    "mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white";

  return (
    <CenterModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar camión" : "Nuevo camión"}
      size="2xl"
      onSubmit={handleSubmit}
      footer={
        <>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-3">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear camión"}
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-4">
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
            <SearchableSelect
              value={form.truckType}
              onChange={(v) => setForm((f) => ({ ...f, truckType: v }))}
              options={TRUCK_TYPES.map((t) => ({ value: t, label: t }))}
              placeholder="Seleccionar..."
              className="mt-1"
            />
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
            <SearchableSelect
              value={form.axleType}
              onChange={(v) => setForm((f) => ({ ...f, axleType: v }))}
              options={AXLE_TYPES.map((a) => ({ value: a, label: a }))}
              placeholder="Seleccionar..."
              className="mt-1"
            />
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
            <SearchableSelect
              value={form.clientId}
              onChange={(v) => setForm((f) => ({ ...f, clientId: v }))}
              options={(clients || []).map((c) => ({
                value: c.$id,
                label: c.name + (c.tradeName ? ` (${c.tradeName})` : ""),
              }))}
              placeholder="Sin asociar"
              className="mt-1"
            />
            <p className="text-xs text-slate-400 mt-1">
              Opcional. Vincula el camión con un cliente.
            </p>
          </div>
          <div>
            <label className={labelCls}>Chofer habitual</label>
            <SearchableSelect
              value={form.habitualDriverId}
              onChange={(v) => setForm((f) => ({ ...f, habitualDriverId: v }))}
              options={(drivers || []).map((d) => ({
                value: d.$id,
                label: d.fullName,
              }))}
              placeholder="Sin asignar"
              className="mt-1"
            />
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
      </div>
    </CenterModal>
  );
}
