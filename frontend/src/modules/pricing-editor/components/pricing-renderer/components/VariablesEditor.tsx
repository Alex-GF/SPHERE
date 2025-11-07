import { useMemo, useState, useEffect, useCallback } from 'react';
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
  Divider,
  Stack,
  Tooltip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CalculateIcon from '@mui/icons-material/Calculate';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        sx={{ overflow: 'hidden' }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h6">Variables calculator</Typography>
            <Typography variant="body2" color="text.secondary">Preview & tweak variables to see pricing changes in real time.</Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Reset changes">
              <IconButton onClick={handleReset} size="small" color="inherit">
                <AutoFixHighIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose} size="small" aria-label="close">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent dividers sx={{ p: 3, maxHeight: '72vh' }}>
          {keys.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">No variables found</Typography>
              <Typography variant="body2" color="text.secondary">This pricing does not declare any editable variables.</Typography>
            </Box>
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
                initial="hidden"
                animate="show"
              >
                <Grid container spacing={2}>
                  {keys.map((k, idx) => {
                    const original = initial[k];
                    const value = local[k];
                    const type = typeof original;

                    return (
                      <Grid item xs={12} md={6} key={k}>
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 28, delay: idx * 0.02 }}
                        >
                          <Paper elevation={6} sx={{ p: 2.25, borderRadius: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Box>
                                <Typography sx={{ fontWeight: 800 }}>{camelToTitle(k)}</Typography>
                                <Typography variant="caption" color="text.secondary">Type: {type}</Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                {type === 'number' && (
                                  <Typography sx={{ fontWeight: 700 }}>{String(value)}</Typography>
                                )}
                                {type === 'string' && (
                                  <Typography sx={{ fontWeight: 700 }}>{String(value)}</Typography>
                                )}
                                {type === 'boolean' && (
                                  <Typography sx={{ fontWeight: 700 }}>{value === true ? 'True' : 'False'}</Typography>
                                )}
                              </Box>
                            </Stack>

                            {type === 'boolean' && (
                              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <Switch
                                  checked={value === true}
                                  onChange={(e) => setLocal(s => ({ ...s, [k]: e.target.checked }))}
                                  size="small"
                                  inputProps={{ 'aria-label': `${k}-switch` }}
                                />
                              </Box>
                            )}

                            {type === 'number' && (
                              <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
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
                                    sx={{ width: 120 }}
                                  />
                                </Stack>

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

                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                  <FormControlLabel
                                    control={<Switch checked={decimalsAllowed[k] === true} onChange={(e) => setDecimalsAllowed(s => ({ ...s, [k]: e.target.checked }))} />}
                                    label={<Typography variant="caption">{decimalsAllowed[k] ? 'Allow 2 decimals' : 'Integers'}</Typography>}
                                  />
                                  <Typography variant="caption" color="text.secondary">Base: {String(original)}</Typography>
                                </Stack>
                              </Stack>
                            )}

                            {type === 'string' && (
                              <TextField size="small" fullWidth value={String(value ?? '')} onChange={(e) => setLocal(s => ({ ...s, [k]: e.target.value }))} />
                            )}
                          </Paper>
                        </motion.div>
                      </Grid>
                    );
                  })}
                </Grid>
              </motion.div>
            </AnimatePresence>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 2 }}>
          <Button onClick={handleReset} startIcon={<AutoFixHighIcon />}>Reset</Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleApply} style={{color: "white"}}>Compute</Button>
        </DialogActions>
      </Paper>
    </Dialog>
  );
}
