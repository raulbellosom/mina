import { ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        {/* Logo */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700">
            <img
              src="/ore_logo.png"
              alt="MinaPRO"
              className="w-12 h-12 object-contain opacity-40 grayscale"
            />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center ring-1 ring-amber-200 dark:ring-amber-500/30">
            <Search size={14} className="text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* 404 number */}
        <p className="text-6xl font-extrabold text-slate-200 dark:text-slate-800 mb-2 tracking-tight select-none">
          404
        </p>

        <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Página no encontrada
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-8 leading-relaxed">
          La ruta que intentas acceder no existe o fue movida. Verifica la
          dirección o regresa al inicio.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
      </motion.div>
    </div>
  );
}
