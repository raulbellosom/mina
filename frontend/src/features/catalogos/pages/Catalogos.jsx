import { Link } from 'react-router-dom';
import { Pickaxe, Users, UserSquare2, Truck, Droplet, Tag } from 'lucide-react';

export default function Catalogos() {
    const catalogCards = [
        { title: 'Materiales', path: '/catalogos/materiales', icon: Pickaxe, description: 'Materiales en venta y sus categorías.' },
        { title: 'Categorías', path: '/catalogos/categorias', icon: Tag, description: 'Clasificación de materiales.' },
        { title: 'Clientes', path: '/catalogos/clientes', icon: Users, description: 'Empresas y compradores recurrentes.' },
        { title: 'Choferes', path: '/catalogos/choferes', icon: UserSquare2, description: 'Catálogo de conductores registrados.' },
        { title: 'Camiones', path: '/catalogos/camiones', icon: Truck, description: 'Flotillas y sus capacidades métricas.' },
        { title: 'Plantas / Orígenes', path: '/catalogos/plantas', icon: Droplet, description: 'Minas u orígenes de extracción.' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Catálogos Maestros</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Configuración y administración general de la mina.</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {catalogCards.map(cat => (
                    <Link key={cat.path} to={cat.path} className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 p-6 flex flex-col items-center text-center">
                        <div className="mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 text-blue-600 dark:text-blue-400">
                            <cat.icon className="h-8 w-8" />
                        </div>
                        <h2 className="text-lg font-semibold">{cat.title}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{cat.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
