import { Box, IconButton, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

type Props = {
  limit: number;
  offset: number;
  total: number;
  onChange: (offset: number, limit: number) => void;
};

export default function PricingsPagination({ limit, offset, total, onChange }: Props) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const goToPage = (page: number) => {
    const newOffset = Math.max(0, (page - 1) * limit);
    onChange(newOffset, limit);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        mt: 4,
        mb: 4,
      }}
    >
      <IconButton
        onClick={() => goToPage(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        aria-label="previous page"
      >
        <ChevronLeftIcon />
      </IconButton>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentPage}-${limit}-${total}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
        >
          <Typography variant="body2">
            Page {currentPage} / {totalPages}
          </Typography>
        </motion.div>
      </AnimatePresence>

      <IconButton
        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label="next page"
      >
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
}
