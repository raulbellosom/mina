import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

/**
 * Modal centrado reutilizable con header fijo, body scrolleable y footer fijo.
 *
 * Props:
 *   open           {boolean}
 *   onOpenChange   {fn(bool)}
 *   title          {string}
 *   subtitle       {string}       — opcional
 *   icon           {ReactNode}    — icono a la izquierda del título
 *   badge          {ReactNode}    — badge después del título
 *   size           {"sm"|"md"|"lg"|"xl"|"2xl"} — default "lg"
 *   onSubmit       {fn(event)}    — si se pasa, body+footer se envuelven en <form>
 *   children       {ReactNode}    — contenido del body (scrolleable)
 *   footer         {ReactNode}    — contenido del footer (fijo)
 *   zOverlay       {string}       — z-index overlay (default "z-40")
 *   zContent       {string}       — z-index contenido (default "z-50")
 */
export default function CenterModal({
  open,
  onOpenChange,
  title,
  subtitle,
  icon,
  badge,
  size = "lg",
  onSubmit,
  children,
  footer,
  zOverlay = "z-40",
  zContent = "z-50",
}) {
  const header = (
    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {icon && <div className="shrink-0">{icon}</div>}
        <div className="min-w-0">
          <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </Dialog.Title>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {badge && <div className="shrink-0 ml-2">{badge}</div>}
      </div>
      <Dialog.Close asChild>
        <button className="shrink-0 ml-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <X size={20} />
        </button>
      </Dialog.Close>
    </div>
  );

  const body = (
    <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">{children}</div>
  );

  const foot = footer ? (
    <div className="px-6 pt-4 pb-5 border-t border-slate-200 dark:border-slate-800 shrink-0">
      {footer}
    </div>
  ) : null;

  const inner = onSubmit ? (
    <form onSubmit={onSubmit} className="flex flex-col min-h-0 flex-1">
      {body}
      {foot}
    </form>
  ) : (
    <>
      {body}
      {foot}
    </>
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={`dialog-overlay fixed inset-0 bg-black/50 ${zOverlay}`}
        />
        <Dialog.Content
          aria-describedby={undefined}
          className={`center-modal fixed inset-x-4 top-1/2 -translate-y-1/2 mx-auto ${zContent} ${SIZES[size] || SIZES.lg} bg-white dark:bg-slate-900 rounded-xl shadow-xl flex flex-col max-h-[85vh]`}
        >
          {header}
          {inner}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
