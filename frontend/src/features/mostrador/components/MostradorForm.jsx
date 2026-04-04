import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'transfer', label: 'Transferencia bancaria' },
    { value: 'card', label: 'Tarjeta' },
    { value: 'check', label: 'Cheque' },
    { value: 'other', label: 'Otro' },
];

const UNITS = [
    { value: 'viaje', label: 'Viaje completo' },
    { value: 'tonelada', label: 'Tonelada (ton)' },
    { value: 'm3', label: 'Metro cúbico (m³)' },
    { value: 'kg', label: 'Kilogramo (kg)' },
    { value: 'pieza', label: 'Pieza' },
];

const EMPTY_FORM = {
    clientId: '',
    clientName: '',
    driverId: '',
    truckId: '',
    materialId: '',
    plantId: '',
    commercialQty: '',
    commercialUnit: 'viaje',
    paymentMethod: 'cash',
    paymentReference: '',
    notes: '',
};

/**
 * Modal para registrar una nueva venta en mostrador.
 *
 * Props:
 *   open         {boolean}
 *   onOpenChange {fn}
 *   clients      {array}
 *   drivers      {array}
 *   trucks       {array}
 *   materials    {array}
 *   plants       {array}
 *   onSubmit     {fn(data)} — async, recibe los datos del formulario
 */
export default function MostradorForm({ open, onOpenChange, clients, drivers, trucks, materials, plants, onSubmit }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [useRegisteredClient, setUseRegisteredClient] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            setForm(EMPTY_FORM);
            setUseRegisteredClient(true);
            setError(null);
        }
    }, [open]);

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.materialId) { setError('Selecciona un material'); return; }
        if (!form.plantId) { setError('Selecciona una planta/origen'); return; }
        if (!form.commercialQty || parseFloat(form.commercialQty) <= 0) { setError('La cantidad debe ser mayor a 0'); return; }

        setSubmitting(true);
        try {
            await onSubmit({
                ...form,
                clientId: useRegisteredClient ? form.clientId : '',
                clientName: !useRegisteredClient ? form.clientName : '',
            });
            onOpenChange(false);
        } catch (err) {
            setError(err.message || 'Error al registrar la venta');
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = 'mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white';
    const selectCls = 'mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white';
    const labelCls = 'text-sm font-medium text-slate-700 dark:text-slate-300';

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xl mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-5">
                        <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
                            Nueva venta en mostrador
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X size={20} />
                            </button>
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* ── Cliente ── */}
                        <fieldset className="space-y-3">
                            <legend className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cliente</legend>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={useRegisteredClient}
                                        onChange={() => setUseRegisteredClient(true)}
                                        className="accent-primary-600"
                                    />
                                    Cliente registrado
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={!useRegisteredClient}
                                        onChange={() => setUseRegisteredClient(false)}
                                        className="accent-primary-600"
                                    />
                                    Cliente ocasional
                                </label>
                            </div>
                            {useRegisteredClient ? (
                                <div>
                                    <label className={labelCls}>Cliente</label>
                                    <select value={form.clientId} onChange={set('clientId')} className={selectCls}>
                                        <option value="">Sin cliente específico</option>
                                        {clients.map(c => (
                                            <option key={c.$id} value={c.$id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className={labelCls}>Nombre del cliente ocasional</label>
                                    <input
                                        value={form.clientName}
                                        onChange={set('clientName')}
                                        placeholder="Nombre o referencia del comprador"
                                        className={inputCls}
                                    />
                                </div>
                            )}
                        </fieldset>

                        {/* ── Chofer y Camión ── */}
                        <fieldset className="space-y-3">
                            <legend className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Transporte</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Chofer</label>
                                    <select value={form.driverId} onChange={set('driverId')} className={selectCls}>
                                        <option value="">Sin chofer registrado</option>
                                        {drivers.map(d => (
                                            <option key={d.$id} value={d.$id}>{d.fullName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Camión</label>
                                    <select value={form.truckId} onChange={set('truckId')} className={selectCls}>
                                        <option value="">Sin camión registrado</option>
                                        {trucks.map(t => (
                                            <option key={t.$id} value={t.$id}>
                                                {t.plates}{t.alias ? ` — ${t.alias}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        {/* ── Material y Planta ── */}
                        <fieldset className="space-y-3">
                            <legend className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Material</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Material <span className="text-red-500">*</span></label>
                                    <select value={form.materialId} onChange={set('materialId')} required className={selectCls}>
                                        <option value="">Seleccionar material</option>
                                        {materials.map(m => (
                                            <option key={m.$id} value={m.$id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Planta / Origen <span className="text-red-500">*</span></label>
                                    <select value={form.plantId} onChange={set('plantId')} required className={selectCls}>
                                        <option value="">Seleccionar planta</option>
                                        {plants.map(p => (
                                            <option key={p.$id} value={p.$id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Cantidad <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        value={form.commercialQty}
                                        onChange={set('commercialQty')}
                                        required
                                        min="0.01"
                                        step="0.01"
                                        placeholder="0"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Unidad</label>
                                    <select value={form.commercialUnit} onChange={set('commercialUnit')} className={selectCls}>
                                        {UNITS.map(u => (
                                            <option key={u.value} value={u.value}>{u.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        {/* ── Pago ── */}
                        <fieldset className="space-y-3">
                            <legend className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pago referencial</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Método de pago <span className="text-red-500">*</span></label>
                                    <select value={form.paymentMethod} onChange={set('paymentMethod')} required className={selectCls}>
                                        {PAYMENT_METHODS.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Referencia de pago</label>
                                    <input
                                        value={form.paymentReference}
                                        onChange={set('paymentReference')}
                                        placeholder="Folio, número de transferencia, etc."
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* ── Notas ── */}
                        <div>
                            <label className={labelCls}>Observaciones</label>
                            <textarea
                                value={form.notes}
                                onChange={set('notes')}
                                rows={2}
                                placeholder="Notas adicionales de la venta..."
                                className={`${inputCls} resize-none`}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                            <Dialog.Close asChild>
                                <button
                                    type="button"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                >
                                    Cancelar
                                </button>
                            </Dialog.Close>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
                            >
                                {submitting && <Loader2 size={14} className="animate-spin" />}
                                Registrar venta
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
