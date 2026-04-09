import { AnimatePresence, motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
    <div className="my-4 flex items-center justify-center gap-2">
      <button
        type="button"
        className="rounded-full p-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => goToPage(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        aria-label="previous page"
      >
        <FaChevronLeft />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentPage}-${limit}-${total}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
        >
          <p className="text-sm">
            Page {currentPage} / {totalPages}
          </p>
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        className="rounded-full p-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label="next page"
      >
        <FaChevronRight />
      </button>
    </div>
  );
}
