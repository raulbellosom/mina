import * as Dialog from "@radix-ui/react-dialog";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

/**
 * Panel lateral derecho reutilizable.
 * El contenido interno (header, body, footer) lo maneja el caller.
 *
 * Props:
 *   open           {boolean}
 *   onOpenChange   {fn(bool)}
 *   size           {"sm"|"md"|"lg"|"xl"|"2xl"} — default "md"
 *   children       {ReactNode} — contenido completo del panel
 *   zOverlay       {string}    — z-index overlay (default "z-40")
 *   zContent       {string}    — z-index contenido (default "z-50")
 */
export default function SideModal({
  open,
  onOpenChange,
  size = "md",
  children,
  zOverlay = "z-40",
  zContent = "z-50",
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={`dialog-overlay fixed inset-0 bg-black/50 ${zOverlay}`}
        />
        <Dialog.Content
          aria-describedby={undefined}
          className={`side-modal fixed right-0 top-0 h-full ${zContent} w-full ${SIZES[size] || SIZES.md} bg-white dark:bg-slate-900 shadow-xl flex flex-col`}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
