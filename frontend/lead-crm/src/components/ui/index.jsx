import React from 'react';
import { STAGE_MAP, getScoreLabel, getScoreRingColor, getAvatarColors, getInitials, cn } from '../../utils/helpers';

// ── Status Badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status, size = 'sm' }) {
  const stage = STAGE_MAP[status];
  if (!stage) return null;
  const sizeClass = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 font-semibold rounded-full', sizeClass)}
      style={{ color: stage.color, backgroundColor: stage.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.dot }} />
      {stage.label}
    </span>
  );
}

// ── Lead Avatar ───────────────────────────────────────────────────────────────
export function LeadAvatar({ name, size = 'md' }) {
  const [bg, text] = getAvatarColors(name);
  const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  return (
    <div
      className={cn('rounded-xl flex items-center justify-center font-bold flex-shrink-0', sizeMap[size])}
      style={{ backgroundColor: bg, color: text }}
    >
      {getInitials(name)}
    </div>
  );
}

// ── Score Ring (now replaced with clean temperature/status badge) ──────────────
export function ScoreRing({ score, status }) {
  if (status === 'JOINED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-xl text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap uppercase tracking-wider">
        JOINED ✅
      </span>
    );
  }

  let bgClass = "bg-blue-50 text-blue-700 border-blue-100";
  let text = "COLD ❄️";

  if (score >= 80) {
    bgClass = "bg-rose-50 text-rose-700 border-rose-100";
    text = "HOT 🔥";
  } else if (score >= 50) {
    bgClass = "bg-amber-50 text-amber-700 border-amber-100";
    text = "WARM ☀️";
  }

  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-xl text-[10px] font-extrabold border whitespace-nowrap uppercase tracking-wider", bgClass)}>
      {text}
    </span>
  );
}

// ── Score Chip (wrapper for consistency) ──────────────────────────────────────
export function ScoreChip({ score, status }) {
  return <ScoreRing score={score} status={status} />;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center text-3xl mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-surface-700 mb-1">{title}</h3>
      <p className="text-sm text-surface-400 max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Icon Button ───────────────────────────────────────────────────────────────
export function IconButton({ onClick, title, className, children, variant = 'ghost' }) {
  const vars = {
    ghost: 'hover:bg-surface-100 text-surface-500 hover:text-surface-900',
    danger: 'hover:bg-danger-50 text-surface-400 hover:text-danger-600',
    primary: 'hover:bg-brand-50 text-surface-400 hover:text-brand-600',
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn('p-1.5 rounded-lg transition-all duration-150 flex-shrink-0', vars[variant], className)}
    >
      {children}
    </button>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ className }) {
  return <hr className={cn('border-surface-100', className)} />;
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color }}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
export function Tooltip({ content, children }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="tooltip bottom-full left-1/2 -translate-x-1/2 mb-2">
          {content}
        </div>
      )}
    </div>
  );
}
