import { Box } from '@mui/material';
import { motion } from 'framer-motion';

type Props = {
  children: React.ReactNode;
};

export default function PricingsListContainer({ children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <Box sx={{ width: '100%' }}>{children}</Box>
    </motion.div>
  );
}
