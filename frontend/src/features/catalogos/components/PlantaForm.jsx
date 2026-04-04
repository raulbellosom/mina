import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { friendlyError } from "../../../shared/lib/catalogCache";
import SearchableSelect from "../../../shared/components/SearchableSelect";
import CenterModal from "../../../shared/components/CenterModal";

const EMPTY_FORM = {
  name: "",
  code: "",
  type: "",
  locationReference: "",
  description: "",
  contactName: "",
  contactPhone: "",
  notes: "",
  sortOrder: "",
};

const PLANT_TYPES = [
  "Mina",
  "Banco de material",
  "Planta de trituración",
  "Centro de acopio",
  "Otro",
];

export default function PlantaForm({ open, onOpenChange, editing, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = Boolean(editing);

  useEffect(() => {
    if (open) {
      setError(null);
      if (editing) {
        setForm({
          name: editing.name || "",
          code: editing.code || "",
          type: editing.type || "",
          locationReference: editing.locationReference || "",
          description: editing.description || "",
          contactName: editing.contactName || "",
          contactPhone: editing.contactPhone || "",
          notes: editing.notes || "",
          sortOrder: editing.sortOrder ? String(editing.sortOrder) : "",
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

    if (!form.name.trim()) {
      setError("El nombre es obligatorio");
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
        setError("Ya existe una planta con ese nombre o código");
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
      title={isEditing ? "Editar planta / origen" : "Nueva planta / origen"}
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
              {isEditing ? "Guardar cambios" : "Crear origen"}
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        {/* Nombre y Código */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={set("name")}
              required
              placeholder="Ej: Mina El Cobre"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Código / Clave</label>
            <input
              value={form.code}
              onChange={set("code")}
              placeholder="Ej: MC-01"
              className={`${inputCls} font-mono uppercase`}
            />
          </div>
        </div>

        {/* Tipo y Orden */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>Tipo de origen</label>
            <SearchableSelect
              value={form.type}
              onChange={(v) => setForm((f) => ({ ...f, type: v }))}
              options={PLANT_TYPES.map((t) => ({ value: t, label: t }))}
              placeholder="Seleccionar..."
              className="mt-1"
            />
          </div>
          <div>
            <label className={labelCls}>Orden</label>
            <input
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={set("sortOrder")}
              placeholder="0"
              className={inputCls}
            />
            <p className="text-xs text-slate-400 mt-1">
              Orden de aparición en listados.
            </p>
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <label className={labelCls}>Ubicación / Referencia</label>
          <input
            value={form.locationReference}
            onChange={set("locationReference")}
            placeholder="Ej: Km 45 Carretera a Parral, Chihuahua"
            className={inputCls}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className={labelCls}>Descripción</label>
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={2}
            placeholder="Descripción breve de la planta o banco de material..."
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Contacto */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-1">
          Contacto (opcional)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nombre de contacto</label>
            <input
              value={form.contactName}
              onChange={set("contactName")}
              placeholder="Responsable en sitio"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Teléfono de contacto</label>
            <input
              value={form.contactPhone}
              onChange={set("contactPhone")}
              placeholder="Ej: 614 123 4567"
              className={inputCls}
            />
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className={labelCls}>Observaciones</label>
          <textarea
            value={form.notes}
            onChange={set("notes")}
            rows={2}
            placeholder="Notas internas..."
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>
    </CenterModal>
  );
}
