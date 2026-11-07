"use client";

import { useMotionValue, useSpring, useTransform } from "motion/react";
import * as motion from "motion/react-m";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={false}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ amount: 0.15, once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

type HeroVisualProps = {
  launchLabel: string;
  promptLabel: string;
  readyLabel: string;
};

export function HeroVisual({ launchLabel, promptLabel, readyLabel }: HeroVisualProps) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [10, -10]), {
    stiffness: 90,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 90,
    damping: 18,
  });

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <div
      aria-hidden="true"
      className="hero-visual"
      onPointerLeave={resetPointer}
      onPointerMove={handlePointerMove}
    >
      <motion.div className="sculpture-wrap" style={{ rotateX, rotateY, x: "-50%", y: "-50%" }}>
        <div className="sculpture">
          <span className="sculpture-beam beam-one" />
          <span className="sculpture-beam beam-two" />
          <span className="sculpture-core" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-4, -2, -4] }}
        className="float-card float-card-prompt"
        transition={{ duration: 5.5, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      >
        <span className="float-card-dot" />
        <div>
          <small>{promptLabel}</small>
          <strong>“Minimal coffee shop”</strong>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 11, 0], rotate: [3, 1, 3] }}
        className="float-card float-card-ready"
        transition={{ duration: 6.3, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      >
        <span className="status-pulse" />
        <div>
          <small>{launchLabel}</small>
          <strong>{readyLabel}</strong>
        </div>
      </motion.div>

      <div className="float-chip chip-one">Payme</div>
      <div className="float-chip chip-two">SEO 100</div>
      <div className="float-chip chip-three">.UZ</div>
    </div>
  );
}

export function TiltCard({ children, className }: RevealProps) {
  return (
    <motion.div
      className={cn("tilt-card", className)}
      transition={{ duration: 0.25 }}
      whileHover={{ rotateX: 2, rotateY: -2, scale: 1.012, y: -4 }}
    >
      {children}
    </motion.div>
  );
}
