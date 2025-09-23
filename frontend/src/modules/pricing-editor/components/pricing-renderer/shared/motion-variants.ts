import { Variants } from 'framer-motion';

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i = 1) => ({ opacity: 1, x: 0, transition: { delay: i * 0.06 } }),
};

export const accordionVariants: Variants = {
  closed: { height: 0, opacity: 0 },
  open: { height: 'auto', opacity: 1, transition: { duration: 0.3 } },
};
