import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  licenseNumber: "",
  clientId: "",
  notes: "",
};

export default function ChoferForm({
  open,
  onOpenChange,
  editing,
  clients,
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
          firstName: editing.firstName || "",
          lastName: editing.lastName || "",
          phone: editing.phone || "",
          email: editing.email || "",
          licenseNumber: editing.licenseNumber || "",
          clientId: editing.clientId || "",
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

    if (!form.firstName.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!form.lastName.trim()) {
      setError("Los apellidos son obligatorios");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      const msg = err.message || "Error al guardar";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? "Editar chofer" : "Nuevo chofer"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre y Apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nombre(s) <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.firstName}
                  onChange={set("firstName")}
                  required
                  placeholder="Ej: Juan Carlos"
                  className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Apellidos <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.lastName}
                  onChange={set("lastName")}
                  required
                  placeholder="Ej: Pérez López"
                  className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Teléfono y Licencia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Teléfono
                </label>
                <input
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="Ej: 614 123 4567"
                  className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No. de licencia
                </label>
                <input
                  value={form.licenseNumber}
                  onChange={set("licenseNumber")}
                  placeholder="Licencia de conducir"
                  className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Correo electrónico
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="correo@ejemplo.com"
                className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            {/* Cliente/Empresa asociado */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Cliente / Empresa asociada
              </label>
              <select
                value={form.clientId}
                onChange={set("clientId")}
                className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
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
                Opcional. Vincula al chofer con un cliente o empresa.
              </p>
            </div>

            {/* Notas */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Observaciones
              </label>
              <textarea
                value={form.notes}
                onChange={set("notes")}
                rows={3}
                placeholder="Notas internas sobre el chofer..."
                className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white resize-none"
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
                {isEditing ? "Guardar cambios" : "Crear chofer"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
