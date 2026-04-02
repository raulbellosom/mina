import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";

const EMPTY_FORM = {
  type: "person",
  name: "",
  tradeName: "",
  contactName: "",
  rfc: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

const TYPE_OPTIONS = [
  { value: "person", label: "Persona física" },
  { value: "company", label: "Empresa" },
];

export default function ClienteForm({ open, onOpenChange, editing, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = Boolean(editing);

  useEffect(() => {
    if (open) {
      setError(null);
      if (editing) {
        setForm({
          type: editing.type || "person",
          name: editing.name || "",
          tradeName: editing.tradeName || "",
          contactName: editing.contactName || "",
          rfc: editing.rfc || "",
          phone: editing.phone || "",
          email: editing.email || "",
          address: editing.address || "",
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

    if (!form.name.trim()) {
      setError(
        form.type === "company"
          ? "La razón social es obligatoria"
          : "El nombre es obligatorio",
      );
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

  const isCompany = form.type === "company";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? "Editar cliente" : "Nuevo cliente"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de cliente */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tipo de cliente <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex gap-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                    className={`flex-1 px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                      form.type === opt.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre / Razón social */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isCompany ? "Razón social" : "Nombre completo"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={set("name")}
                required
                placeholder={
                  isCompany
                    ? "Ej: Materiales del Norte S.A. de C.V."
                    : "Ej: Juan Pérez López"
                }
                className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            {/* Nombre comercial (solo empresa) */}
            {isCompany && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nombre comercial
                </label>
                <input
                  value={form.tradeName}
                  onChange={set("tradeName")}
                  placeholder="Nombre comercial o abreviado"
                  className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Persona de contacto (solo empresa) */}
            {isCompany && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Persona de contacto
                </label>
                <input
                  value={form.contactName}
                  onChange={set("contactName")}
                  placeholder="Nombre del contacto principal"
                  className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* RFC + Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  RFC
                </label>
                <input
                  value={form.rfc}
                  onChange={set("rfc")}
                  placeholder={isCompany ? "XXX000000XX0" : "XXXX000000XX0"}
                  maxLength={13}
                  className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>
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

            {/* Dirección */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Dirección
              </label>
              <textarea
                value={form.address}
                onChange={set("address")}
                rows={2}
                placeholder="Calle, número, colonia, ciudad..."
                className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white resize-none"
              />
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
                placeholder="Notas internas sobre el cliente..."
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
                {isEditing ? "Guardar cambios" : "Crear cliente"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
