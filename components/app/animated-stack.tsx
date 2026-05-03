"use client";

import { motion } from "motion/react";

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

type AnimatedStackProps = {
  items: string[];
};

export function AnimatedStack({ items }: AnimatedStackProps) {
  return (
    <motion.div
      animate="visible"
      className="mt-6 flex flex-wrap gap-2"
      initial="hidden"
      variants={listVariants}
    >
      {items.map((item) => (
        <motion.span
          className="rounded-full bg-muted px-3 py-1 text-sm font-medium"
          key={item}
          variants={itemVariants}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {item}
        </motion.span>
      ))}
    </motion.div>
  );
}
