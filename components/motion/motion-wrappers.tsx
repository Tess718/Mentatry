"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface MotionWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Doughnut Pattern: Outer Client Motion wrapper for section scroll-reveals.
 * Injects children from Server Component without converting the parent to Client Component.
 */
export function MotionSection({
  children,
  className,
  delay = 0,
  ...props
}: MotionWrapperProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.section>
  );
}

/**
 * Doughnut Pattern: Hero entrance animation wrapper
 */
export function MotionHero({
  children,
  className,
  ...props
}: MotionWrapperProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.section>
  );
}

/**
 * Stagger Container for Grids (e.g. Features, Play Modes, Steps)
 */
export function MotionStaggerContainer({
  children,
  className,
  staggerDelay = 0.12,
  ...props
}: MotionWrapperProps & { staggerDelay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger Child Item inside MotionStaggerContainer
 */
export function MotionStaggerItem({
  children,
  className,
  ...props
}: MotionWrapperProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.96 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 260,
            damping: 24,
          },
        },
      }}
      whileHover={{
        y: -6,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Interactive Stitched Tag Badge with a playful spring tilt
 */
export function MotionStitchedTag({
  children,
  className,
  initialRotate = -2,
}: {
  children: React.ReactNode;
  className?: string;
  initialRotate?: number;
}) {
  return (
    <motion.span
      initial={{ scale: 0.85, opacity: 0, rotate: initialRotate - 4 }}
      whileInView={{ scale: 1, opacity: 1, rotate: initialRotate }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, rotate: initialRotate + 2 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className={className}
    >
      {children}
    </motion.span>
  );
}

/**
 * Smooth Floating Circle Badge for Hero
 */
export function MotionFloatingBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.3,
      }}
      whileHover={{ scale: 1.1, rotate: 10 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Call to Action Box Interactive Entrance
 */
export function MotionCtaBox({
  children,
  className,
}: MotionWrapperProps) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95, y: 40 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
