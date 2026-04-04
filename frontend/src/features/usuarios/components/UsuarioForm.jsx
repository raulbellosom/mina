import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2, Eye, EyeOff } from "lucide-react";

const BASE_LABEL_OPTIONS = [
  { value: "admin", label: "Administrador" },
  { value: "operador", label: "Operador" },
  { value: "capturista", label: "Capturista" },
];

// Solo usuarios con label 'owner' pueden crear usuarios 'root'
const ROOT_OPTION = { value: "root", label: "Root (acceso total)" };

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  label: "admin",
  phone: "",
  employeeCode: "",
  notes: "",
};

/**
 * Modal de creación / edición de usuario interno.
 *
 * Props:
 *   open         {boolean}
 *   onOpenChange {fn}
 *   editing      {object|null}  — perfil existente para edición, null para creación
 *   isOwner      {boolean}      — true si el usuario autenticado tiene label 'owner' (puede crear root)
 *   onSubmit     {fn(data)}     — recibe los datos a guardar (puede ser async)
 */
export default function UsuarioForm({
  open,
  onOpenChange,
  editing,
  isOwner,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = Boolean(editing);
  const labelOptions = isOwner
    ? [ROOT_OPTION, ...BASE_LABEL_OPTIONS]
    : BASE_LABEL_OPTIONS;

  useEffect(() => {
    if (open) {
      setError(null);
      setShowPassword(false);
      if (editing) {
        setForm({
          firstName: editing.firstName || "",
          lastName: editing.lastName || "",
          email: editing.email || "",
          password: "",
          label: editing.role || "admin",
          phone: editing.phone || "",
          employeeCode: editing.employeeCode || "",
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

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Nombre y apellidos son obligatorios");
      return;
    }

    setSubmitting(true);
    try {
      // Compute name from firstName + lastName
      const submitData = {
        ...form,
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      };
      await onSubmit(submitData);
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Error al guardar");
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
              {isEditing ? "Editar usuario" : "Nuevo usuario"}
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
                  placeholder="Nombre de pila"
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
                  placeholder="Apellido(s)"
                  className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Email y contraseña — solo en creación */}
            {!isEditing && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    required
                    placeholder="usuario@empresa.com"
                    className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Contraseña temporal <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={set("password")}
                      required
                      minLength={8}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Nivel de acceso */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nivel de acceso <span className="text-red-500">*</span>
              </label>
              <select
                value={form.label}
                onChange={set("label")}
                required
                disabled={isEditing}
                className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white disabled:opacity-50"
              >
                {labelOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {isEditing && (
                <p className="text-xs text-slate-400 mt-1">
                  El nivel de acceso no se puede cambiar desde aquí.
                </p>
              )}
            </div>

            {/* Datos operativos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Teléfono
                </label>
                <input
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+52 555 000 0000"
                  className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Código de empleado
                </label>
                <input
                  value={form.employeeCode}
                  onChange={set("employeeCode")}
                  placeholder="EMP-001"
                  className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Notas internas
              </label>
              <textarea
                value={form.notes}
                onChange={set("notes")}
                rows={3}
                placeholder="Observaciones sobre este usuario..."
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
                  disabled={submitting}
                  className="px-4 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {isEditing ? "Guardar cambios" : "Crear usuario"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
