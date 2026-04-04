import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { friendlyError } from "../../../shared/lib/catalogCache";
import SearchableSelect from "../../../shared/components/SearchableSelect";
import CenterModal from "../../../shared/components/CenterModal";

const PAYMENT_METHODS = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia bancaria" },
  { value: "card", label: "Tarjeta" },
  { value: "check", label: "Cheque" },
  { value: "other", label: "Otro" },
];

const UNITS = [
  { value: "viaje", label: "Viaje completo" },
  { value: "tonelada", label: "Tonelada (ton)" },
  { value: "m3", label: "Metro cúbico (m³)" },
  { value: "kg", label: "Kilogramo (kg)" },
  { value: "pieza", label: "Pieza" },
];

const EMPTY_FORM = {
  clientId: "",
  clientName: "",
  driverId: "",
  truckId: "",
  materialId: "",
  plantId: "",
  commercialQty: "",
  commercialUnit: "viaje",
  paymentMethod: "cash",
  paymentReference: "",
  notes: "",
};

/**
 * Modal para registrar una nueva venta en mostrador.
 *
 * Props:
 *   open         {boolean}
 *   onOpenChange {fn}
 *   clients      {array}
 *   drivers      {array}
 *   trucks       {array}
 *   materials    {array}
 *   plants       {array}
 *   onSubmit     {fn(data)} — async, recibe los datos del formulario
 */
export default function MostradorForm({
  open,
  onOpenChange,
  clients,
  drivers,
  trucks,
  materials,
  plants,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [useRegisteredClient, setUseRegisteredClient] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setUseRegisteredClient(true);
      setError(null);
    }
  }, [open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.materialId) {
      setError("Selecciona un material");
      return;
    }
    if (!form.plantId) {
      setError("Selecciona una planta/origen");
      return;
    }
    if (!form.commercialQty || parseFloat(form.commercialQty) <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        clientId: useRegisteredClient ? form.clientId : "",
        clientName: !useRegisteredClient ? form.clientName : "",
      });
      onOpenChange(false);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white";
  const selectCls =
    "mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white";
  const labelCls = "text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <CenterModal
      open={open}
      onOpenChange={onOpenChange}
      title="Nueva venta en mostrador"
      size="xl"
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
              disabled={submitting}
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Registrar venta
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-5">
        {/* ── Cliente ── */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Cliente
          </legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={useRegisteredClient}
                onChange={() => setUseRegisteredClient(true)}
                className="accent-primary-600"
              />
              Cliente registrado
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={!useRegisteredClient}
                onChange={() => setUseRegisteredClient(false)}
                className="accent-primary-600"
              />
              Cliente ocasional
            </label>
          </div>
          {useRegisteredClient ? (
            <div>
              <label className={labelCls}>Cliente</label>
              <SearchableSelect
                value={form.clientId}
                onChange={(v) => setForm((f) => ({ ...f, clientId: v }))}
                options={clients.map((c) => ({
                  value: c.$id,
                  label: c.name,
                }))}
                placeholder="Sin cliente específico"
                className="mt-1"
              />
            </div>
          ) : (
            <div>
              <label className={labelCls}>Nombre del cliente ocasional</label>
              <input
                value={form.clientName}
                onChange={set("clientName")}
                placeholder="Nombre o referencia del comprador"
                className={inputCls}
              />
            </div>
          )}
        </fieldset>

        {/* ── Chofer y Camión ── */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Transporte
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Chofer</label>
              <SearchableSelect
                value={form.driverId}
                onChange={(v) => setForm((f) => ({ ...f, driverId: v }))}
                options={drivers.map((d) => ({
                  value: d.$id,
                  label: d.fullName,
                }))}
                placeholder="Sin chofer registrado"
                className="mt-1"
              />
            </div>
            <div>
              <label className={labelCls}>Camión</label>
              <SearchableSelect
                value={form.truckId}
                onChange={(v) => setForm((f) => ({ ...f, truckId: v }))}
                options={trucks.map((t) => ({
                  value: t.$id,
                  label:
                    t.plateNumber +
                    (t.economicNumber ? ` — ${t.economicNumber}` : ""),
                }))}
                placeholder="Sin camión registrado"
                className="mt-1"
              />
            </div>
          </div>
        </fieldset>

        {/* ── Material y Planta ── */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Material
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Material <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                value={form.materialId}
                onChange={(v) => setForm((f) => ({ ...f, materialId: v }))}
                required
                options={materials.map((m) => ({
                  value: m.$id,
                  label: m.name,
                }))}
                placeholder="Seleccionar material"
                className="mt-1"
              />
            </div>
            <div>
              <label className={labelCls}>
                Planta / Origen <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                value={form.plantId}
                onChange={(v) => setForm((f) => ({ ...f, plantId: v }))}
                required
                options={plants.map((p) => ({
                  value: p.$id,
                  label: p.name,
                }))}
                placeholder="Seleccionar planta"
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Cantidad <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.commercialQty}
                onChange={set("commercialQty")}
                required
                min="0.01"
                step="0.01"
                placeholder="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Unidad</label>
              <SearchableSelect
                value={form.commercialUnit}
                onChange={(v) => setForm((f) => ({ ...f, commercialUnit: v }))}
                options={UNITS}
                placeholder="Unidad"
                className="mt-1"
              />
            </div>
          </div>
        </fieldset>

        {/* ── Pago ── */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Pago referencial
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Método de pago <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                value={form.paymentMethod}
                onChange={(v) => setForm((f) => ({ ...f, paymentMethod: v }))}
                required
                options={PAYMENT_METHODS}
                placeholder="Método de pago"
                className="mt-1"
              />
            </div>
            <div>
              <label className={labelCls}>Referencia de pago</label>
              <input
                value={form.paymentReference}
                onChange={set("paymentReference")}
                placeholder="Folio, número de transferencia, etc."
                className={inputCls}
              />
            </div>
          </div>
        </fieldset>

        {/* ── Notas ── */}
        <div>
          <label className={labelCls}>Observaciones</label>
          <textarea
            value={form.notes}
            onChange={set("notes")}
            rows={2}
            placeholder="Notas adicionales de la venta..."
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>
    </CenterModal>
  );
}
