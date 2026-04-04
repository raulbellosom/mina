import { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2, Upload, Trash2, ImageIcon } from "lucide-react";
import { friendlyError } from "../../../shared/lib/catalogCache";
import SearchableSelect from "../../../shared/components/SearchableSelect";

const EMPTY_FORM = {
  name: "",
  code: "",
  categoryId: "",
  description: "",
  defaultCommercialUnit: "viaje",
  sortOrder: "0",
};

const COMMERCIAL_UNITS = [
  { value: "viaje", label: "Viaje" },
  { value: "tonelada", label: "Tonelada" },
  { value: "m3", label: "Metro cúbico (m³)" },
  { value: "kg", label: "Kilogramo (kg)" },
  { value: "pieza", label: "Pieza" },
];

export default function MaterialForm({
  open,
  onOpenChange,
  editing,
  categories,
  onSubmit,
  getImageUrl,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const isEditing = Boolean(editing);

  useEffect(() => {
    if (open) {
      setError(null);
      setImageFile(null);
      setRemoveImage(false);

      if (editing) {
        setForm({
          name: editing.name || "",
          code: editing.code || "",
          categoryId: editing.categoryId || "",
          description: editing.description || "",
          defaultCommercialUnit: editing.defaultCommercialUnit || "viaje",
          sortOrder: String(editing.sortOrder ?? 0),
        });
        // Set existing image preview
        if (editing.referenceImageFileId && getImageUrl) {
          setImagePreview(getImageUrl(editing.referenceImageFileId));
        } else {
          setImagePreview(null);
        }
      } else {
        setForm(EMPTY_FORM);
        setImagePreview(null);
      }
    }
  }, [open, editing, getImageUrl]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

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

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Solo se permiten imágenes JPG, PNG o WebP.");
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5 MB.");
      return;
    }

    setImageFile(file);
    setRemoveImage(false);
    setError(null);

    // Generate local preview
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    if (!form.categoryId) {
      setError("Debes seleccionar una categoría");
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        ...form,
        _oldImageFileId: editing?.referenceImageFileId || "",
        _removeImage: removeImage,
      };
      await onSubmit(submitData, imageFile);
      onOpenChange(false);
    } catch (err) {
      const msg = friendlyError(err);
      if (
        msg.includes("Document with the requested ID already exists") ||
        msg.includes("unique")
      ) {
        setError(
          "Ya existe un material con ese código. Usa un código diferente.",
        );
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? "Editar material" : "Nuevo material"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={handleNameChange}
                required
                placeholder="Ej: Grava 3/4, Arena fina, Base hidráulica"
                className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            {/* Código */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Código único <span className="text-red-500">*</span>
              </label>
              <input
                value={form.code}
                onChange={set("code")}
                required
                placeholder="grava_3_4"
                className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white font-mono"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Categoría <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                value={form.categoryId}
                onChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
                required
                options={categories.map((cat) => ({
                  value: cat.$id,
                  label: cat.name,
                }))}
                placeholder="Seleccionar categoría..."
                className="mt-1"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={2}
                placeholder="Descripción breve del material..."
                className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white resize-none"
              />
            </div>

            {/* Unidad comercial + Orden */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Unidad comercial
                </label>
                <SearchableSelect
                  value={form.defaultCommercialUnit}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, defaultCommercialUnit: v }))
                  }
                  options={COMMERCIAL_UNITS}
                  placeholder="Unidad"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Orden
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={set("sortOrder")}
                  min="0"
                  className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Imagen de referencia */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Imagen de referencia
              </label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-sm"
                    title="Quitar imagen"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 w-full p-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <ImageIcon size={24} className="shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      Subir imagen de referencia
                    </p>
                    <p className="text-xs">JPG, PNG o WebP · máx. 5 MB</p>
                  </div>
                </button>
              )}
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <Upload size={12} /> Cambiar imagen
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
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
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {isEditing ? "Guardar cambios" : "Crear material"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
