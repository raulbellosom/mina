import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import CenterModal from "../../../shared/components/CenterModal";
import { friendlyError } from "../../../shared/lib/catalogCache";

const EMPTY_FORM = {
  name: "",
  code: "",
  description: "",
};

export default function RolForm({ open, onOpenChange, editing, onSubmit }) {
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
          description: editing.description || "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, editing]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Auto-generar código a partir del nombre (solo en creación)
  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((f) => ({
      ...f,
      name,
      ...(!isEditing
        ? {
            code: name
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "_")
              .replace(/^_|_$/g, ""),
          }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!form.code.trim()) {
      setError("El código es obligatorio");
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

  return (
    <CenterModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar rol" : "Nuevo rol"}
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
              {isEditing ? "Guardar cambios" : "Crear rol"}
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Nombre del rol <span className="text-red-500">*</span>
          </label>
          <input
            value={form.name}
            onChange={handleNameChange}
            required
            placeholder="Ej: Capturista de báscula"
            className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Código único <span className="text-red-500">*</span>
          </label>
          <input
            value={form.code}
            onChange={set("code")}
            required
            placeholder="capturista_bascula"
            disabled={isEditing && editing?.isSystem}
            className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white font-mono disabled:opacity-50"
          />
          {isEditing && editing?.isSystem && (
            <p className="text-xs text-slate-400 mt-1">
              El código de un rol de sistema no se puede cambiar.
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Descripción
          </label>
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={3}
            placeholder="Descripción breve del rol y sus responsabilidades..."
            className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white resize-none"
          />
        </div>
      </div>
    </CenterModal>
  );
}
