/**
 * StatCard.jsx
 * Animated stat card for the admin dashboard.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (typeof target !== 'number' || target === 0) {
      setCount(target || 0);
      return;
    }

    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return count;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'blue',
  onClick,
}) {
  const displayValue = useCountUp(typeof value === 'number' ? value : 0);

  const colorMap = {
    blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   border: 'border-blue-100' },
    green:  { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100' },
    amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600', border: 'border-amber-100' },
    red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',     border: 'border-red-100' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', border: 'border-purple-100' },
    teal:   { bg: 'bg-teal-50',   icon: 'bg-teal-100 text-teal-600',   border: 'border-teal-100' },
    slate:  { bg: 'bg-slate-50',  icon: 'bg-slate-100 text-slate-600', border: 'border-slate-100' },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`bg-white rounded-2xl border ${colors.border} p-5 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 tabular-nums">
            {typeof value === 'number' ? displayValue.toLocaleString() : value}
          </p>
          {(trend !== undefined || trendLabel) && (
            <p className="mt-1.5 text-xs font-medium text-gray-400">
              {trend !== undefined && (
                <span className={trend >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
              )}
              {trendLabel && <span className="ml-1">{trendLabel}</span>}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
