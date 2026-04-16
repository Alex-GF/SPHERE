import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRegCircleXmark,
  FaCalculator,
  FaList,
  FaCode,
  FaPlus,
  FaTrash,
  FaCircleInfo,
} from 'react-icons/fa6';
import { camelToTitle } from '../shared/stringUtils';

type JsonPrimitive = string | number | boolean | null;
type VarValue = JsonPrimitive | VarValue[] | { [key: string]: VarValue };
type ValueKind = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object';
type CollectionItemKind = 'string' | 'number' | 'boolean' | 'null' | 'json';

interface Props {
  open: boolean;
  onClose: () => void;
  variables: Record<string, VarValue> | undefined;
  onApply: (variables: Record<string, VarValue>) => void;
}

function getValueKind(value: VarValue): ValueKind {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'string';
}

function isPlainObject(value: unknown): value is { [key: string]: VarValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toJsonText(value: VarValue): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function kindLabel(kind: ValueKind): string {
  if (kind === 'array') return 'List';
  if (kind === 'object') return 'Object';
  if (kind === 'null') return 'Null';
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function collectionTypeOf(v: VarValue): CollectionItemKind {
  if (v === null) return 'null';
  if (typeof v === 'boolean') return 'boolean';
  if (typeof v === 'number') return 'number';
  if (typeof v === 'string') return 'string';
  return 'json';
}

function defaultValueForCollectionKind(kind: CollectionItemKind): VarValue {
  if (kind === 'number') return 0;
  if (kind === 'boolean') return false;
  if (kind === 'null') return null;
  if (kind === 'json') return {};
  return '';
}

function parseCollectionValue(raw: string, kind: CollectionItemKind): VarValue {
  if (kind === 'string') return raw;
  if (kind === 'number') {
    const n = Number(raw);
    return Number.isNaN(n) ? 0 : n;
  }
  if (kind === 'boolean') return raw === 'true';
  if (kind === 'null') return null;
  try {
    return JSON.parse(raw) as VarValue;
  } catch {
    return raw;
  }
}

function NumberEditor({
  variableKey,
  original,
  value,
  decimalsAllowed,
  onValueChange,
  onDecimalsChange,
}: {
  variableKey: string;
  original: number;
  value: VarValue;
  decimalsAllowed: boolean;
  onValueChange: (next: number) => void;
  onDecimalsChange: (next: boolean) => void;
}) {
  const current = typeof value === 'number' ? value : 0;
  const sliderValue = (() => {
    const base = Number(original) || 0;
    if (base === 0) return 50;
    const mult = current / base || 1;
    const maxLog = 4;
    const log = Math.log10(Math.max(mult, 1e-9));
    const ratio = Math.max(0, Math.min(100, ((log / maxLog) * 100) + 50));
    return Math.round(ratio);
  })();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[180px_1fr]">
        <input
          type="number"
          value={current}
          step={decimalsAllowed ? 0.01 : 1}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isNaN(n)) return;
            onValueChange(decimalsAllowed ? Number(n.toFixed(2)) : Math.round(n));
          }}
          className="w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
        />

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/60 px-4 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Base</span>
          <span className="text-sm font-semibold text-slate-800">{String(original)}</span>
          <span className="text-slate-300">|</span>
          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={decimalsAllowed}
              onChange={(e) => onDecimalsChange(e.target.checked)}
            />
            {decimalsAllowed ? '2 decimales' : 'Enteros'}
          </label>
        </div>
      </div>

      <div>
        <input
          type="range"
          min={0}
          max={100}
          value={sliderValue}
          onChange={(e) => {
            const s = Number(e.target.value);
            const maxLog = 4;
            const log = ((s - 50) / 100) * maxLog;
            const mult = Math.pow(10, log);
            const newVal = original * mult;
            onValueChange(decimalsAllowed ? Number(newVal.toFixed(2)) : Math.round(newVal));
          }}
          aria-label={`Range editor for ${variableKey}`}
          className="w-full accent-cyan-600"
        />
      </div>
    </div>
  );
}

function CollectionTypeSelector({
  value,
  onChange,
}: {
  value: CollectionItemKind;
  onChange: (next: CollectionItemKind) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CollectionItemKind)}
      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
    >
      <option value="string">string</option>
      <option value="number">number</option>
      <option value="boolean">boolean</option>
      <option value="null">null</option>
      <option value="json">json</option>
    </select>
  );
}

function CollectionValueEditor({
  type,
  value,
  onChange,
}: {
  type: CollectionItemKind;
  value: VarValue;
  onChange: (next: VarValue) => void;
}) {
  if (type === 'boolean') {
    return (
      <select
        value={value === true ? 'true' : 'false'}
        onChange={(e) => onChange(e.target.value === 'true')}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }

  if (type === 'null') {
    return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600">null</div>;
  }

  if (type === 'json') {
    return (
      <textarea
        value={toJsonText(value)}
        onChange={(e) => onChange(parseCollectionValue(e.target.value, 'json'))}
        className="h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
      />
    );
  }

  return (
    <input
      type={type === 'number' ? 'number' : 'text'}
      value={type === 'number' ? (typeof value === 'number' ? value : 0) : String(value ?? '')}
      onChange={(e) => onChange(parseCollectionValue(e.target.value, type))}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
    />
  );
}

function ArrayEditor({
  value,
  onChange,
}: {
  value: VarValue[];
  onChange: (next: VarValue[]) => void;
}) {
  const itemTypes = useMemo(() => value.map((item) => collectionTypeOf(item)), [value]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{value.length} items</div>
        <button
          type="button"
          onClick={() => onChange([...value, ''])}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-300 bg-cyan-50 px-2.5 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-100"
        >
          <FaPlus /> Add item
        </button>
      </div>

      <div className="space-y-2">
        {value.map((item, idx) => (
          <div key={`array-item-${idx}`} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[110px_1fr_auto]">
            <CollectionTypeSelector
              value={itemTypes[idx]}
              onChange={(nextType) => {
                const next = [...value];
                next[idx] = defaultValueForCollectionKind(nextType);
                onChange(next);
              }}
            />

            <CollectionValueEditor
              type={itemTypes[idx]}
              value={item}
              onChange={(nextValue) => {
                const next = [...value];
                next[idx] = nextValue;
                onChange(next);
              }}
            />

            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== idx))}
              className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-rose-700 hover:bg-rose-100"
              aria-label={`Remove item ${idx + 1}`}
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ObjectEditor({
  value,
  onChange,
}: {
  value: { [key: string]: VarValue };
  onChange: (next: { [key: string]: VarValue }) => void;
}) {
  const entries = Object.entries(value);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{entries.length} properties</div>
        <button
          type="button"
          onClick={() => {
            let candidate = 'newKey';
            let i = 1;
            while (Object.prototype.hasOwnProperty.call(value, candidate)) {
              candidate = `newKey${i}`;
              i += 1;
            }
            onChange({ ...value, [candidate]: '' });
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-300 bg-cyan-50 px-2.5 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-100"
        >
          <FaPlus /> Add property
        </button>
      </div>

      <div className="space-y-2">
        {entries.map(([key, item]) => {
          const itemType = collectionTypeOf(item);
          return (
            <div key={key} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[1fr_110px_1.7fr_auto]">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const nextKey = e.target.value.trim();
                  if (!nextKey || nextKey === key || Object.prototype.hasOwnProperty.call(value, nextKey)) return;
                  const next = { ...value };
                  delete next[key];
                  next[nextKey] = item;
                  onChange(next);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />

              <CollectionTypeSelector
                value={itemType}
                onChange={(nextType) => onChange({ ...value, [key]: defaultValueForCollectionKind(nextType) })}
              />

              <CollectionValueEditor
                type={itemType}
                value={item}
                onChange={(nextValue) => onChange({ ...value, [key]: nextValue })}
              />

              <button
                type="button"
                onClick={() => {
                  const next = { ...value };
                  delete next[key];
                  onChange(next);
                }}
                className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-rose-700 hover:bg-rose-100"
                aria-label={`Remove property ${key}`}
              >
                <FaTrash />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
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
    if (v === null) return null;
    if (Array.isArray(v)) return v.map(normalizeValue);
    if (isPlainObject(v)) {
      const out: Record<string, VarValue> = {};
      for (const [key, value] of Object.entries(v)) out[key] = normalizeValue(value);
      return out;
    }
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const s = v.trim();
      if (s === 'true') return true;
      if (s === 'false') return false;
      if (s === 'null') return null;
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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_15%_20%,rgba(0,201,255,0.23),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.18),transparent_30%),rgba(2,6,23,0.82)] p-3 backdrop-blur-sm transition ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      aria-hidden={!open}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16, scale: 0.99 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="max-h-[93vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-cyan-100/30 bg-[linear-gradient(180deg,#f8fdff_0%,#f6faff_42%,#ffffff_100%)] shadow-[0_45px_120px_-35px_rgba(2,132,199,0.55)]"
      >
        <div className="relative overflow-hidden border-b border-cyan-100/70 px-5 py-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(34,211,238,0.2),transparent_42%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">Variables Simulator</h2>
              <p className="mt-1 text-sm text-slate-600">
                Experiment with different values for the variables defined in this pricing!
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                <FaCircleInfo /> {keys.length} editable variables
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white/80 p-2.5 text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                aria-label="close"
              >
                <FaRegCircleXmark />
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {keys.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 py-20 text-center text-slate-500">
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
                    const kind = getValueKind(original);

                    return (
                      <div key={k}>
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 28, delay: idx * 0.02 }}
                        >
                          <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 shadow-[0_12px_34px_-24px_rgba(2,132,199,0.8)] backdrop-blur-sm">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div>
                                <div className="font-extrabold text-slate-900">{camelToTitle(k)}</div>
                                <div className="mt-0.5 inline-flex items-center gap-2 text-xs text-slate-500">
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">{kindLabel(kind)}</span>
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">raw: {k}</span>
                                </div>
                              </div>

                              <div className="max-w-[180px] rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-right text-xs font-semibold text-slate-700">
                                {kind === 'boolean'
                                  ? value === true
                                    ? 'True'
                                    : 'False'
                                  : kind === 'array'
                                    ? `${Array.isArray(value) ? value.length : 0} items`
                                    : kind === 'object'
                                      ? `${isPlainObject(value) ? Object.keys(value).length : 0} props`
                                      : String(value)}
                              </div>
                            </div>

                            {kind === 'boolean' && (
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setLocal(s => ({ ...s, [k]: value === true ? false : true }))}
                                aria-pressed={value === true}
                                className={`group relative flex w-full max-w-[320px] items-center justify-between overflow-hidden rounded-2xl border p-2.5 text-left shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] transition ${
                                  value === true
                                    ? 'border-cyan-200 bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-600 text-white'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50'
                                }`}
                              >
                                <div className="relative z-10 flex items-center gap-3 px-1.5 py-1">
                                  <div>
                                    <div className="text-sm font-semibold leading-5">{value === true ? 'Enabled' : 'Disabled'}</div>
                                    <div className={`text-[11px] font-medium ${value === true ? 'text-white/80' : 'text-slate-500'}`}>
                                      Click to switch state
                                    </div>
                                  </div>
                                </div>

                                <div className="relative z-10 flex items-center">
                                  <div
                                    className={`relative h-8 w-14 rounded-full p-1 transition ${
                                      value === true ? 'bg-white/20' : 'bg-slate-200'
                                    }`}
                                  >
                                    <motion.span
                                      animate={{ x: value === true ? 24 : 0 }}
                                      transition={{ type: 'spring', stiffness: 700, damping: 35 }}
                                      className={`block h-6 w-6 rounded-full shadow-md ${value === true ? 'bg-white' : 'bg-slate-500'}`}
                                    />
                                  </div>
                                </div>
                              </motion.button>
                            )}

                            {kind === 'number' && (
                              <NumberEditor
                                variableKey={k}
                                original={typeof original === 'number' ? original : 0}
                                value={value}
                                decimalsAllowed={decimalsAllowed[k] === true}
                                onValueChange={(next) => setLocal((s) => ({ ...s, [k]: next }))}
                                onDecimalsChange={(next) => setDecimalsAllowed((s) => ({ ...s, [k]: next }))}
                              />
                            )}

                            {kind === 'string' && (
                              <input
                                type="text"
                                value={String(value ?? '')}
                                onChange={(e) => setLocal(s => ({ ...s, [k]: e.target.value }))}
                                className="w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                              />
                            )}

                            {kind === 'null' && (
                              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                This variable is currently <span className="font-semibold">null</span>.
                              </div>
                            )}

                            {kind === 'array' && (
                              <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
                                  <FaList /> List editor
                                </div>
                                <ArrayEditor
                                  value={Array.isArray(value) ? value : []}
                                  onChange={(next) => setLocal((s) => ({ ...s, [k]: next }))}
                                />
                              </div>
                            )}

                            {kind === 'object' && (
                              <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                                  <FaCode /> Object editor
                                </div>
                                <ObjectEditor
                                  value={isPlainObject(value) ? value : {}}
                                  onChange={(next) => setLocal((s) => ({ ...s, [k]: next }))}
                                />
                              </div>
                            )}

                            {(kind === 'array' || kind === 'object') && (
                              <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-600">
                                  JSON preview
                                </summary>
                                <pre className="mt-2 max-h-52 overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] leading-5 text-emerald-200">
                                  {toJsonText(value)}
                                </pre>
                              </details>
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

        <div className="flex items-center gap-2 border-t border-cyan-100/70 bg-white/80 px-5 py-4">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            Reset
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-cyan-500 hover:to-sky-500"
          >
            <span className="inline-flex items-center gap-2"><FaCalculator /> Test</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
