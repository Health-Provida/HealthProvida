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
  const [averageWidth, setAverageWidth] = useState(null);
  const prefersReducedMotion = useReducedMotion();
  const timerRef = useRef(null);
  const measureRef = useRef(null);

  // Measure the average width of all words to lock container width and keep surrounding text fixed.
  useEffect(() => {
    if (!words || words.length === 0) return;

    const measure = () => {
      if (!measureRef.current) return;
      const wordElements = measureRef.current.children;
      if (wordElements.length === 0) return;

      let totalWidth = 0;
      for (let i = 0; i < wordElements.length; i++) {
        totalWidth += wordElements[i].getBoundingClientRect().width;
      }
      const avg = totalWidth / wordElements.length;
      if (avg > 0) {
        setAverageWidth(avg);
      }
    };

    measure();

    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }

    return () => {
      window.removeEventListener('resize', measure);
    };
  }, [words]);

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

  const avgCharCount = words.length
    ? words.reduce((sum, w) => sum + w.length, 0) / words.length
    : 0;

  const wrapperStyle = averageWidth
    ? { width: `${averageWidth}px`, minWidth: `${averageWidth}px` }
    : { minWidth: `${avgCharCount}ch` };

  return (
    <span
      className={`rotating-text-wrapper ${className}`}
      style={wrapperStyle}
      aria-live="off"
      aria-atomic="true"
    >
      {/* Offscreen measurement container for measuring exact rendered word widths */}
      <span
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          height: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {words.map((word, i) => (
          <span key={i} className="rotating-text-word" style={{ position: 'static' }}>
            {word}
          </span>
        ))}
      </span>

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
