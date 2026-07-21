import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * RotatingText
 * Cycles through a list of words/phrases with a smooth vertical crossfade.
 *
 * Props:
 *  - words      {string[]}  Array of words/phrases to rotate through.
 *  - interval   {number}    Milliseconds between transitions (default 2800).
 *  - className  {string}    Extra class names for the wrapper span.
 */
const RotatingText = ({ words = [], interval = 2800, initialDelay = 0, className = '' }) => {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const timerRef = useRef(null);

  // Advance to the next word on every tick.
  useEffect(() => {
    if (words.length <= 1) return;

    // Wait for the initialDelay before starting the rotation interval,
    // so the first word is shown statically when the page loads.
    const delayRef = setTimeout(() => {
      timerRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % words.length);
      }, interval);
    }, initialDelay);

    return () => {
      clearTimeout(delayRef);
      clearInterval(timerRef.current);
    };
  }, [words.length, interval, initialDelay]);

  // Framer Motion variants.
  // When reduced-motion is preferred we skip the translate and just crossfade.
  const variants = {
    enter: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.15 : 0.45,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : -16,
      transition: {
        duration: prefersReducedMotion ? 0.15 : 0.35,
        ease: 'easeIn',
      },
    },
  };

  return (
    /*
     * Wrapper uses inline-grid with a single grid area so all words
     * occupy the same space — this prevents the heading from reflowing
     * when a longer word appears. The min-width is set to the longest
     * word so the surrounding text never shifts.
     */
    <span
      className={`rotating-text-wrapper ${className}`}
      aria-live="off"
      aria-atomic="true"
    >
      {/* Hidden element that holds the current word for assistive tech */}
      <span className="sr-only">{words[index]}</span>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[index]}
          variants={variants}
          initial="enter"
          animate="visible"
          exit="exit"
          aria-hidden="true"
          className="rotating-text-word"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default RotatingText;
