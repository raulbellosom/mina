import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { HardHat, Loader2, ShieldAlert } from 'lucide-react';
import { databases, DATABASE_ID } from '../../../shared/lib/appwrite';
import PasswordInput from '../../../shared/components/PasswordInput';

export default function Login() {
    const { login, registerAdmin } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [checking, setChecking] = useState(true);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const verifySetup = async () => {
            try {
                const response = await databases.getDocument(DATABASE_ID, 'system_config', 'singleton');
                if (response.isInitialized) {
                    setMode('login');
                } else {
                    setMode('register');
                }
            } catch (err) {
                // Identificamos que el documento nunca ha sido creado (entorno virgen)
                if (err.code === 404) {
                    setMode('register');
                } else {
                    setMode('login');
                }
            } finally {
                setChecking(false);
            }
        };
        verifySetup();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (mode === 'register') {
                if (password.length < 8) throw new Error("La contraseña debe tener 8 caracteres");
                if (password !== passwordConfirm) throw new Error("Las contraseñas no coinciden");
                await registerAdmin(name, email, password);
                navigate('/');
            } else {
                await login(email, password);
                navigate('/');
            }
        } catch (err) {
            setError(err.message || "Error procesando solicitud");
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-500">
                <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin h-8 w-8 mb-4 text-blue-500" />
                    <p>Conectando al servidor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className={`p-3 rounded-xl mb-4 ${mode === 'register' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                        {mode === 'register' ? <ShieldAlert size={32} /> : <HardHat size={32} />}
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {mode === 'register' ? 'Setup de Administrador' : 'Acceso a Mina'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {mode === 'register'
                            ? 'Este sistema no tiene usuarios registrados. Crea el perfil administrativo principal para bloquear el acceso.'
                            : 'Ingresa tus credenciales operativas'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800/50">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="name">Nombre Completo</label>
                            <input
                                id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-700 disabled:opacity-50"
                                placeholder="Jefe de Operaciones"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="email">Correo electrónico</label>
                        <input
                            id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 disabled:opacity-50"
                            placeholder="operador@mina.com"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="sr-only" htmlFor="password">Contraseña</label>
                            {mode === 'login' && (
                                <div className="w-full flex justify-end">
                                    <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                            )}
                        </div>
                        <PasswordInput
                            id="password"
                            label="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            showMeter={mode === 'register'}
                        />
                        {mode === 'register' && (
                            <PasswordInput
                                id="passwordConfirm"
                                label="Confirma la contraseña"
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                showMeter={false}
                            />
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 h-10 py-2 px-4 w-full mt-6 ${mode === 'register' ? 'bg-amber-600 hover:bg-amber-700 text-white focus-visible:ring-amber-400' : 'bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-400'}`}
                    >
                        {loading
                            ? (mode === 'register' ? 'Registrando espere...' : 'Accediendo...')
                            : (mode === 'register' ? 'Crear Administrador y Sellar Registro' : 'Iniciar Sesión')}
                    </button>
                </form>
            </div>
        </div>
    );
}
