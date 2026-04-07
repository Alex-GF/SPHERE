import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegCircleXmark, FaWandMagicSparkles, FaCalculator, FaToggleOn } from 'react-icons/fa6';
import { camelToTitle } from '../shared/stringUtils';

type VarValue = string | number | boolean;

interface Props {
  open: boolean;
  onClose: () => void;
  variables: Record<string, VarValue> | undefined;
  onApply: (variables: Record<string, VarValue>) => void;
}


export default function VariablesEditor({ open, onClose, variables, onApply }: Props) {
  const initial = useMemo(() => variables ?? {}, [variables]);
  const [local, setLocal] = useState<Record<string, VarValue>>(initial);
  const [decimalsAllowed, setDecimalsAllowed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLocal(initial);
    const decMap: Record<string, boolean> = {};
    for (const k of Object.keys(initial)) decMap[k] = false;
    setDecimalsAllowed(decMap);
  }, [open, initial]);

  const keys = useMemo(() => Object.keys(initial), [initial]);

  const normalizeValue = useCallback((v: unknown): VarValue => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const s = v.trim();
      if (s === 'true') return true;
      if (s === 'false') return false;
      const n = Number(s);
      if (s !== '' && !Number.isNaN(n)) return n;
      return s;
    }
    return String(v ?? '');
  }, []);

  const handleApply = () => {
    const out: Record<string, VarValue> = {};
    for (const k of keys) out[k] = normalizeValue(local[k]);
    onApply(out);
    onClose();
  };

  const handleReset = () => {
    setLocal(initial);
    const decMap: Record<string, boolean> = {};
    for (const k of Object.keys(initial)) decMap[k] = false;
    setDecimalsAllowed(decMap);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      aria-hidden={!open}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4">
          <div>
            <h2 className="text-lg font-semibold">Variables calculator</h2>
            <p className="text-sm text-slate-600">Preview and tweak variables to see pricing changes in real time.</p>
          </div>

          <div className="flex items-center gap-1">
            <button type="button" onClick={handleReset} className="rounded-md p-2 hover:bg-slate-100" title="Reset changes">
              <FaWandMagicSparkles />
            </button>
            <button type="button" onClick={onClose} className="rounded-md p-2 hover:bg-slate-100" aria-label="close">
              <FaRegCircleXmark />
            </button>
          </div>
        </div>

        <div className="max-h-[72vh] overflow-y-auto p-4">
          {keys.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <div className="text-lg font-semibold">No variables found</div>
              <div className="text-sm">This pricing does not declare any editable variables.</div>
            </div>
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
                initial="hidden"
                animate="show"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {keys.map((k, idx) => {
                    const original = initial[k];
                    const value = local[k];
                    const type = typeof original;

                    return (
                      <div key={k}>
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 28, delay: idx * 0.02 }}
                        >
                          <div className="rounded-xl border border-slate-200 p-4 shadow-sm">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div>
                                <div className="font-extrabold">{camelToTitle(k)}</div>
                                <div className="text-xs text-slate-500">Type: {type}</div>
                              </div>
                              <div className="text-right font-semibold">
                                {type === 'boolean' ? (value === true ? 'True' : 'False') : String(value)}
                              </div>
                            </div>

                            {type === 'boolean' && (
                              <button
                                type="button"
                                onClick={() => setLocal(s => ({ ...s, [k]: value === true ? false : true }))}
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${value === true ? 'bg-sky-600 text-white' : 'border border-slate-300 text-slate-700'}`}
                              >
                                <FaToggleOn />
                                {value === true ? 'Enabled' : 'Disabled'}
                              </button>
                            )}

                            {type === 'number' && (
                              <div className="space-y-3">
                                <input
                                  type="number"
                                  value={value ?? ''}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    if (raw === '') return setLocal(s => ({ ...s, [k]: '' }));
                                    const n = Number(raw);
                                    if (Number.isNaN(n)) return;
                                    setLocal(s => ({ ...s, [k]: decimalsAllowed[k] ? Number(n.toFixed(2)) : Math.round(n) }));
                                  }}
                                  step={decimalsAllowed[k] ? 0.01 : 1}
                                  className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm"
                                />

                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={(() => {
                                    const base = Number(original) || 0;
                                    const cur = Number(value) || 0;
                                    if (base === 0) return 50;
                                    const mult = cur / base || 1;
                                    const maxLog = 6;
                                    const log = Math.log10(Math.max(mult, 1e-9));
                                    const s = Math.max(0, Math.min(100, ((log / maxLog) * 100) + 50));
                                    return Math.round(s);
                                  })()}
                                  onChange={(e) => {
                                    const s = Number(e.target.value);
                                    const base = Number(original) || 0;
                                    const maxLog = 6;
                                    const log = ((s - 50) / 100) * maxLog;
                                    const mult = Math.pow(10, log);
                                    const newVal = base * mult;
                                    const fixed = decimalsAllowed[k] ? Number(newVal.toFixed(2)) : Math.round(newVal);
                                    setLocal(st => ({ ...st, [k]: fixed }));
                                  }}
                                  className="w-full accent-sky-600"
                                />

                                <label className="flex items-center justify-between gap-3 text-xs text-slate-600">
                                  <span className="inline-flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={decimalsAllowed[k] === true}
                                      onChange={(e) => setDecimalsAllowed(s => ({ ...s, [k]: e.target.checked }))}
                                    />
                                    {decimalsAllowed[k] ? 'Allow 2 decimals' : 'Integers'}
                                  </span>
                                  <span>Base: {String(original)}</span>
                                </label>
                              </div>
                            )}

                            {type === 'string' && (
                              <input
                                type="text"
                                value={String(value ?? '')}
                                onChange={(e) => setLocal(s => ({ ...s, [k]: e.target.value }))}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                              />
                            )}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-200 p-4">
          <button type="button" onClick={handleReset} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
            Reset
          </button>
          <div className="flex-1" />
          <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={handleApply} className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700">
            <span className="inline-flex items-center gap-2"><FaCalculator /> Compute</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
