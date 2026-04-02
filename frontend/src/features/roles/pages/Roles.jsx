import { useState } from 'react';
import { Crown, Shield, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { usePermissions } from '../../../shared/hooks/usePermissions';
import { PERMISSIONS_BY_LABEL, MODULE_LABELS, SYSTEM_LABELS } from '../../../shared/config/permissions-config';

const LABEL_STYLE = {
    admin:      { icon: Shield,      bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-800',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',   title: 'text-blue-700 dark:text-blue-400' },
    operador:   { icon: ShieldCheck, bg: 'bg-teal-50 dark:bg-teal-900/20',   border: 'border-teal-200 dark:border-teal-800',   badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',   title: 'text-teal-700 dark:text-teal-400' },
    capturista: { icon: Shield,      bg: 'bg-slate-50 dark:bg-slate-800/50', border: 'border-slate-200 dark:border-slate-700', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',   title: 'text-slate-700 dark:text-slate-300' },
};

function groupByModule(permCodes) {
    const map = {};
    for (const code of permCodes) {
        const mod = code.split('.')[0];
        if (!map[mod]) map[mod] = [];
        map[mod].push(code);
    }
    return map;
}

export default function Roles() {
    const { can } = usePermissions();
    const [expanded, setExpanded] = useState({});

    if (!can('roles.view')) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShieldAlert size={36} className="text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    No tienes permiso para ver este módulo.
                </p>
            </div>
        );
    }

    const toggle = (label) => setExpanded(e => ({ ...e, [label]: !e[label] }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <header>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Perfiles y Permisos
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
                    Permisos asignados a cada perfil de acceso del sistema.
                </p>
            </header>

            {/* Owner / Root — bypass card */}
            <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-5">
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                        <Crown size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">owner</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">root</span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">Acceso total — bypass</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Estos perfiles tienen acceso completo a todo el sistema sin restricciones, independientemente de los permisos definidos abajo.
                        </p>
                    </div>
                </div>
            </div>

            {/* Perfiles configurables */}
            <div className="space-y-3">
                {SYSTEM_LABELS.map(({ label, title }) => {
                    const style = LABEL_STYLE[label];
                    const Icon = style.icon;
                    const perms = PERMISSIONS_BY_LABEL[label] || [];
                    const grouped = groupByModule(perms);
                    const isOpen = Boolean(expanded[label]);

                    return (
                        <div key={label} className={`rounded-xl border ${style.border} bg-white dark:bg-slate-900 overflow-hidden`}>
                            {/* Header del perfil */}
                            <button
                                onClick={() => toggle(label)}
                                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full ${style.bg} flex items-center justify-center shrink-0`}>
                                        <Icon size={18} className={style.title} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{title}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${style.badge}`}>
                                                {label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {perms.length} permiso{perms.length !== 1 ? 's' : ''} asignado{perms.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0 text-slate-400">
                                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </button>

                            {/* Permisos agrupados por módulo */}
                            {isOpen && (
                                <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(grouped).sort().map(([mod, codes]) => (
                                            <div key={mod} className="space-y-1.5">
                                                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                                    {MODULE_LABELS[mod] || mod}
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {codes.map(code => (
                                                        <span
                                                            key={code}
                                                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                        >
                                                            {code.split('.')[1]}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-600 text-center">
                Los permisos están definidos por perfil. El acceso real en Appwrite lo controlan los labels de cada usuario.
            </p>
        </div>
    );
}
