import { useMemo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Slider,
  Box,
  Typography,
  Paper,
  IconButton,
  Grid,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';

type VarValue = string | number | boolean;

interface Props {
  open: boolean;
  onClose: () => void;
  variables: Record<string, VarValue> | undefined;
  onApply: (variables: Record<string, VarValue>) => void;
}

const listVariants = {
  hidden: { opacity: 0 },
  enter: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
};

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

  function normalizeValue(v: unknown): VarValue {
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
  }

  function handleApply() {
    const out: Record<string, VarValue> = {};
    for (const k of keys) out[k] = normalizeValue(local[k]);
    onApply(out);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <Paper component={motion.div} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} sx={{ overflow: 'hidden' }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">Variables calculator</Typography>
            <Typography variant="caption" color="text.secondary">Adjust variables and press Compute to update the YAML</Typography>
          </Box>
          <IconButton onClick={onClose} size="small" aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2, maxHeight: '64vh' }}>
          {keys.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography>No variables defined in this pricing.</Typography>
            </Box>
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div variants={listVariants} initial="hidden" animate="enter">
                <Grid container spacing={2}>
                  {keys.map((k) => {
                    const original = initial[k];
                    const value = local[k];
                    const type = typeof original;

                    return (
                      <Grid item xs={12} md={6} key={k} component={motion.div} variants={itemVariants} layout>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }} elevation={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 700 }}>{k}</Typography>
                            <Typography variant="caption" color="text.secondary">{type}</Typography>
                          </Box>

                          {type === 'boolean' && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FormControlLabel
                                control={<Switch checked={value === true} onChange={(e) => setLocal(s => ({ ...s, [k]: e.target.checked }))} />}
                                label={value === true ? 'True' : 'False'}
                              />
                            </Box>
                          )}

                          {type === 'number' && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
                                <FormControlLabel
                                  control={<Switch checked={decimalsAllowed[k] === true} onChange={(e) => setDecimalsAllowed(s => ({ ...s, [k]: e.target.checked }))} />}
                                  label={decimalsAllowed[k] ? 'Decimals (2)' : 'Integers'}
                                />
                                <TextField
                                  size="small"
                                  type="number"
                                  value={value ?? ''}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    if (raw === '') return setLocal(s => ({ ...s, [k]: '' }));
                                    const n = Number(raw);
                                    if (Number.isNaN(n)) return;
                                    setLocal(s => ({ ...s, [k]: decimalsAllowed[k] ? Number(n.toFixed(2)) : Math.round(n) }));
                                  }}
                                  inputProps={{ step: decimalsAllowed[k] ? 0.01 : 1 }}
                                  sx={{ width: 140 }}
                                />
                              </Box>

                              <Slider
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
                                min={0}
                                max={100}
                                onChange={(_, v) => {
                                  const s = Array.isArray(v) ? v[0] : (v as number);
                                  const base = Number(original) || 0;
                                  const maxLog = 6;
                                  const log = ((s - 50) / 100) * maxLog;
                                  const mult = Math.pow(10, log);
                                  const newVal = base * mult;
                                  const fixed = decimalsAllowed[k] ? Number(newVal.toFixed(2)) : Math.round(newVal);
                                  setLocal(st => ({ ...st, [k]: fixed }));
                                }}
                              />

                              <Typography variant="caption" color="text.secondary">Base: {String(original)}</Typography>
                            </Box>
                          )}

                          {type === 'string' && (
                            <TextField size="small" fullWidth value={String(value ?? '')} onChange={(e) => setLocal(s => ({ ...s, [k]: e.target.value }))} />
                          )}
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </motion.div>
            </AnimatePresence>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleApply} color="primary">Compute</Button>
        </DialogActions>
      </Paper>
    </Dialog>
  );
}
