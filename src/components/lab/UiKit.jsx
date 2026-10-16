/**
 * Lab UI Kit — reusable layout components for the lab portal pages.
 * PageHeader, Surface, KpiCard, Timeline, EmptyState.
 * Converted from Lovable TSX to JSX with Tailwind v3 classes.
 */
import React from 'react';
import { Link } from 'react-router-dom';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Surface({ children, className = '', title, description, action }) {
  return (
    <section className={'rounded-xl border border-gray-200 bg-white shadow-sm ' + className}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3.5 sm:px-5">
          <div>
            {title && <h2 className="text-base font-semibold text-gray-900">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-[13px] text-gray-500">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-500 opacity-90">
        <Icon className="h-5 w-5 text-white" aria-hidden="true" />
      </span>
      <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] text-gray-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function KpiCard({ label, value, hint, icon: Icon, to, tone = 'blue' }) {
  const bgClass = tone === 'green' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-600';

  return (
    <Link
      to={to}
      className="group block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none sm:p-5"
    >
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-medium text-gray-500">{label}</span>
        <span className={'flex h-8 w-8 items-center justify-center rounded-lg ' + bgClass}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-[30px] leading-none font-semibold text-gray-900">{value}</p>
      <p className="mt-2 text-xs text-gray-500 group-hover:text-blue-600">{hint}</p>
    </Link>
  );
}

export function Timeline({ steps, currentIndex }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        let circleClass = 'border-gray-200 bg-white text-gray-400';
        if (done) circleClass = 'border-green-500 bg-green-500 text-white';
        if (active) circleClass = 'border-blue-600 bg-blue-50 text-blue-600';

        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={
                  'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-bold ' +
                  circleClass
                }
              >
                {done ? '✓' : i + 1}
              </span>
              {i < steps.length - 1 && (
                <span className={'my-1 w-0.5 flex-1 ' + (done ? 'bg-green-300' : 'bg-gray-200')} />
              )}
            </div>
            <div className="pb-5">
              <p
                className={
                  'text-sm ' +
                  (active ? 'font-semibold text-blue-600' : '') +
                  (done ? ' text-gray-900' : '') +
                  (!done && !active ? ' text-gray-400' : '')
                }
              >
                {step}
              </p>
              <p className="text-xs text-gray-500">
                {done ? 'Completed' : active ? 'Current stage' : 'Pending'}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
