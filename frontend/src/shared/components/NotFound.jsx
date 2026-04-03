import { FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <FileQuestion className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
      <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
        Página no encontrada
      </h1>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Ir al inicio
      </Link>
    </div>
  );
}
