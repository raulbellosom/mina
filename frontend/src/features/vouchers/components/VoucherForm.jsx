import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { friendlyError } from "../../../shared/lib/catalogCache";
import SearchableSelect from "../../../shared/components/SearchableSelect";
import CenterModal from "../../../shared/components/CenterModal";

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
      setError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed";
  const labelCls = "text-sm font-medium text-slate-700 dark:text-slate-300";
  const selectCls = `${inputCls} appearance-none`;

  return (
    <CenterModal
      open={open}
      onOpenChange={onOpenChange}
      title={
        readOnly
          ? "Detalle de voucher"
          : isEditing
            ? "Editar voucher"
            : "Nuevo voucher"
      }
      size="2xl"
      onSubmit={readOnly ? undefined : handleSubmit}
      footer={
        readOnly ? undefined : (
          <>
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2 mb-3">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium disabled:opacity-50"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {isEditing ? "Guardar cambios" : "Crear voucher"}
              </button>
            </div>
          </>
        )
      }
    >
      <div className="space-y-4">
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
            <SearchableSelect
              value={form.clientId}
              onChange={(v) => setForm((f) => ({ ...f, clientId: v }))}
              disabled={readOnly}
              required
              options={clients.map((c) => ({
                value: c.$id,
                label: c.name + (c.tradeName ? ` (${c.tradeName})` : ""),
              }))}
              placeholder="— Seleccionar cliente —"
              className="mt-1"
            />
          </div>
          <div>
            <label className={labelCls}>
              Material <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              value={form.materialId}
              onChange={(v) => setForm((f) => ({ ...f, materialId: v }))}
              disabled={readOnly}
              required
              options={materials.map((m) => ({
                value: m.$id,
                label: m.name,
              }))}
              placeholder="— Seleccionar material —"
              className="mt-1"
            />
          </div>
        </div>

        {/* Planta */}
        <div>
          <label className={labelCls}>
            Planta / Origen <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            value={form.plantId}
            onChange={(v) => setForm((f) => ({ ...f, plantId: v }))}
            disabled={readOnly}
            required
            options={plants.map((p) => ({
              value: p.$id,
              label: p.name + (p.code ? ` (${p.code})` : ""),
            }))}
            placeholder="— Seleccionar planta —"
            className="mt-1"
          />
        </div>

        {/* Chofer + Camión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Chofer</label>
            <SearchableSelect
              value={form.driverId}
              onChange={(v) => setForm((f) => ({ ...f, driverId: v }))}
              disabled={readOnly}
              options={drivers.map((d) => ({
                value: d.$id,
                label: d.fullName,
              }))}
              placeholder="— Sin chofer asignado —"
              className="mt-1"
            />
          </div>
          <div>
            <label className={labelCls}>Camión</label>
            <SearchableSelect
              value={form.truckId}
              onChange={(v) => setForm((f) => ({ ...f, truckId: v }))}
              disabled={readOnly}
              options={trucks.map((t) => ({
                value: t.$id,
                label:
                  t.plateNumber +
                  (t.economicNumber ? ` — ${t.economicNumber}` : ""),
              }))}
              placeholder="— Sin camión asignado —"
              className="mt-1"
            />
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
            <SearchableSelect
              value={form.commercialUnit}
              onChange={(v) => setForm((f) => ({ ...f, commercialUnit: v }))}
              disabled={readOnly}
              options={COMMERCIAL_UNITS}
              placeholder="Unidad"
              className="mt-1"
            />
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
      </div>
    </CenterModal>
  );
}
