import { formatDistanceToNow, format } from 'date-fns';

// ── Pipeline Stages ──────────────────────────────────────────────────────────

export const PIPELINE_STAGES = [
  { id: 'NEW',            label: 'New',            color: '#6c8fff', bg: '#eef1ff', dot: '#4f6ef7' },
  { id: 'CONTACTED',      label: 'Contacted',      color: '#a78bfa', bg: '#f3f0ff', dot: '#8b5cf6' },
  { id: 'TRIAL_BOOKED',   label: 'Trial Booked',   color: '#34d399', bg: '#ecfdf5', dot: '#10b981' },
  { id: 'FOLLOW_UP',      label: 'Follow Up',      color: '#fbbf24', bg: '#fffbeb', dot: '#f59e0b' },
  { id: 'JOINED',         label: 'Joined',         color: '#4ade80', bg: '#f0fdf4', dot: '#16a34a' },
  { id: 'NOT_INTERESTED', label: 'Not Interested', color: '#f87171', bg: '#fef2f2', dot: '#ef4444' },
];

export const STAGE_MAP = Object.fromEntries(PIPELINE_STAGES.map((s) => [s.id, s]));

export const LEAD_SOURCES = [
  'Instagram Ads', 'Facebook Ads', 'Walk-in', 'Referral',
  'WhatsApp', 'Website', 'Google Ads', 'Other',
];

// ── Score helpers ────────────────────────────────────────────────────────────

export function getScoreLabel(score) {
  if (!score && score !== 0) return { label: 'Unscored', color: 'text-surface-400', bg: 'bg-surface-100' };
  if (score >= 80) return { label: 'HOT',  color: 'text-danger-700',  bg: 'bg-danger-50'  };
  if (score >= 50) return { label: 'WARM', color: 'text-warning-700', bg: 'bg-warning-50' };
  return                  { label: 'COLD', color: 'text-info-700',    bg: 'bg-info-50'    };
}

export function getScoreRingColor(score) {
  if (!score && score !== 0) return '#d0d6eb';
  if (score >= 80) return '#ef4444'; // red  – HOT
  if (score >= 50) return '#f97316'; // orange – WARM
  return '#3b82f6';                  // blue  – COLD
}

export function getLeadTemperature(score) {
  if (score >= 80) return 'HOT';
  if (score >= 50) return 'WARM';
  return 'COLD';
}

// ── Date helpers ─────────────────────────────────────────────────────────────

export function timeAgo(dateStr) {
  if (!dateStr) return '—';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '—';
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

// ── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  ['#e0e9ff', '#3a50e0'], ['#f3f0ff', '#7c3aed'], ['#ecfdf5', '#047857'],
  ['#fffbeb', '#b45309'], ['#fef2f2', '#b91c1c'], ['#eff6ff', '#1d4ed8'],
];

export function getAvatarColors(name = '') {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ── Misc ─────────────────────────────────────────────────────────────────────

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str, len = 60) {
  if (!str) return '—';
  return str.length > len ? str.slice(0, len) + '…' : str;
}
