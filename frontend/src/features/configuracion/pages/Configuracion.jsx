import { Settings } from 'lucide-react';

export default function Configuracion() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Configuración General
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Parámetros globales del sistema y preferencias operativas.
                </p>
            </header>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
                <Settings size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Módulo en construcción — Task 25.</p>
            </div>
        </div>
    );
}
