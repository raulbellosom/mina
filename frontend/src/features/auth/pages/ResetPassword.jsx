import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import PasswordInput from '../../../shared/components/PasswordInput';

export default function ResetPassword() {
    const { resetPassword } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Extraer tokens magicos del URL enviado por Appwrite
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    const [password, setPassword] = useState('');
    const [passwordAgain, setPasswordAgain] = useState('');
    const [status, setStatus] = useState(userId && secret ? 'idle' : 'invalid'); // idle | loading | success | error | invalid
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== passwordAgain) {
            setErrorMsg("Las contraseñas no coinciden");
            setStatus('error');
            return;
        }

        if (password.length < 8) {
            setErrorMsg("La contraseña debe tener mínimo 8 caracteres");
            setStatus('error');
            return;
        }

        setStatus('loading');
        try {
            await resetPassword(userId, secret, password, passwordAgain);
            setStatus('success');

            // Redirect despues de 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setErrorMsg(err.message || 'Error al restablecer contraseña. Es posible que el enlace haya expirado.');
            setStatus('error');
        }
    };

    if (status === 'invalid') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <div className="w-full max-w-md text-center bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                    <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Enlace Inválido</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Faltan los parámetros de seguridad en este enlace, o está mal formado.</p>
                    <Link to="/login" className="text-primary-600 hover:text-primary-500 text-sm font-medium">Volver a intentar</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="flex flex-col items-center mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Establecer Nueva Clave</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Ingresa y confirma tu nueva contraseña de acceso.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center animate-in zoom-in duration-300">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
                        <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-400 mb-2">Configurada con éxito</h3>
                        <p className="text-sm text-emerald-600 dark:text-emerald-500 mb-4">
                            Tu contraseña se ha actualizado correctamente.
                        </p>
                        <div className="flex items-center justify-center text-sm text-slate-500">
                            <Loader2 className="animate-spin h-4 w-4 mr-2" /> Redirigiendo...
                        </div>
                    </div>
                ) : (
                    <>
                        {status === 'error' && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800/50">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <PasswordInput
                                id="pass1"
                                label="Nueva Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                showMeter={true}
                            />
                            <PasswordInput
                                id="pass2"
                                label="Confirma la Contraseña"
                                value={passwordAgain}
                                onChange={(e) => setPasswordAgain(e.target.value)}
                                showMeter={false}
                            />

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700 h-10 py-2 px-4 w-full mt-6"
                            >
                                {status === 'loading' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Guardar nueva contraseña'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
