import { useAuth } from "../../auth/hooks/useAuth";
import { Scale, FileText, Boxes, Truck, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const { user, profile } = useAuth();

  const roleLabel =
    profile?.role === "admin"
      ? "Administrador"
      : profile?.role || "Sin asignar";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header>
        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
          <span>Operación</span>
          <ChevronRight size={14} />
          <span className="text-slate-900 dark:text-slate-100">Dashboard</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard Operativo
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Bienvenido,{" "}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {user?.name || "Operador"}
          </span>
          . &nbsp;Rol:{" "}
          <span className="font-semibold text-primary-600 dark:text-primary-400">
            {roleLabel}
          </span>
        </p>
      </header>

      {/* Stats empty state */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tickets Hoy", icon: FileText, value: null },
          { label: "Toneladas Hoy", icon: Scale, value: null },
          { label: "Catálogos Activos", icon: Boxes, value: null },
          { label: "Camiones Registrados", icon: Truck, value: null },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {card.label}
              </span>
              <card.icon
                size={18}
                className="text-slate-400 dark:text-slate-600"
              />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              —
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-600">
              Sin datos aún
            </p>
          </div>
        ))}
      </div>

      {/* Empty chart placeholder */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center">
        <Scale
          size={40}
          className="mx-auto text-slate-300 dark:text-slate-700 mb-4"
        />
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Las gráficas de operación aparecerán aquí conforme se registren
          tickets y pesajes.
        </p>
        <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">
          Empieza registrando catálogos y operando la báscula.
        </p>
      </div>
    </div>
  );
}
