import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({
    id,
    value,
    onChange,
    placeholder = "••••••••",
    label = "Contraseña",
    required = true,
    showMeter = false
}) {
    const [show, setShow] = useState(false);

    // Calc strength (0 to 4)
    const calculateStrength = (pass) => {
        if (!pass) return 0;
        let score = 0;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const strength = calculateStrength(value);

    // Labels for strength
    const strengthLabels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'];
    const strengthColors = ['bg-slate-200 dark:bg-slate-700', 'bg-red-500', 'bg-amber-500', 'bg-emerald-400', 'bg-emerald-600'];

    // active color based on strength
    const activeColor = strength === 0 ? strengthColors[0] : strengthColors[strength];

    return (
        <div className="space-y-2 w-full">
            <label className="text-sm font-medium leading-none" htmlFor={id}>{label}</label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    required={required}
                    minLength={8}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 disabled:opacity-50"
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-0 top-0 h-10 px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {showMeter && (
                <div className="pt-1">
                    <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <div className={`h-full transition-all duration-300 ${strength >= 1 ? activeColor : 'bg-transparent'}`} style={{ width: '25%' }} />
                        <div className={`h-full transition-all duration-300 ${strength >= 2 ? activeColor : 'bg-transparent'}`} style={{ width: '25%' }} />
                        <div className={`h-full transition-all duration-300 ${strength >= 3 ? activeColor : 'bg-transparent'}`} style={{ width: '25%' }} />
                        <div className={`h-full transition-all duration-300 ${strength >= 4 ? activeColor : 'bg-transparent'}`} style={{ width: '25%' }} />
                    </div>
                    <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[10px] text-slate-500">{strengthLabels[strength]}</span>
                        <span className="text-[10px] text-slate-400">Mínimo 8 caracteres</span>
                    </div>
                </div>
            )}
        </div>
    );
}
