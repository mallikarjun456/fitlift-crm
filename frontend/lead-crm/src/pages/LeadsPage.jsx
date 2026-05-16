import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLeads } from '../context/LeadsContext';
import { StatusBadge, LeadAvatar, ScoreRing, ScoreChip, EmptyState, Skeleton, IconButton } from '../components/ui';
import LeadModal from '../components/leads/LeadModal';
import { PIPELINE_STAGES, timeAgo, cn, truncate } from '../utils/helpers';

const SORT_OPTIONS = [
  { value: 'score_desc', label: 'Score: High → Low' },
  { value: 'score_asc', label: 'Score: Low → High' },
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name A–Z' },
];

export default function LeadsPage() {
  const { leads, filteredLeads, search, setSearch, loading, deleteLead, updateLeadStatus } = useLeads();
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('score_desc');
  const [selectedLead, setSelectedLead] = useState(null);

  // Auto-open lead from navigation state
  useEffect(() => {
    if (location.state?.openLead && leads.length > 0) {
      const lead = leads.find((l) => l.id === location.state.openLead);
      if (lead) setSelectedLead(lead);
    }
  }, [location.state, leads]);

  const filtered = useMemo(() => {
    let result = [...filteredLeads];

    if (statusFilter !== 'ALL') {
      result = result.filter((l) => l.status === statusFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'score_desc': return (b.score || 0) - (a.score || 0);
        case 'score_asc': return (a.score || 0) - (b.score || 0);
        case 'date_desc': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'date_asc': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name_asc': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return result;
  }, [filteredLeads, statusFilter, sortBy]);

  const counts = useMemo(() => {
    const obj = { ALL: leads.length };
    PIPELINE_STAGES.forEach((s) => { obj[s.id] = leads.filter((l) => l.status === s.id).length; });
    return obj;
  }, [leads]);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-5 animate-fade-in overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-surface-900">All Leads</h1>
          <p className="text-sm text-surface-400 mt-0.5">{filtered.length} of {leads.length} leads</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field py-2 w-full sm:w-44 text-xs"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="card p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, fitness goal…"
            className="input-field pl-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">×</button>
          )}
        </div>
        {/* Status chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <FilterChip active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')} color="#4f6ef7">
            All ({counts.ALL})
          </FilterChip>
          {PIPELINE_STAGES.map((s) => (
            <FilterChip key={s.id} active={statusFilter === s.id} onClick={() => setStatusFilter(s.id)} color={s.dot}>
              {s.label} ({counts[s.id] || 0})
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card overflow-hidden">
          <div className="divide-y divide-surface-100">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="w-9 h-9 flex-shrink-0" />
                <div className="flex-1 space-y-2"><Skeleton className="h-3 w-48" /><Skeleton className="h-3 w-32" /></div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No leads found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="card overflow-x-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-surface-50 border-b border-surface-100 text-xs font-semibold text-surface-400 uppercase tracking-wider">
            <span>Lead</span>
            <span>Fitness Goal</span>
            <span>Source</span>
            <span>Status</span>
            <span>Score</span>
            <span></span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-surface-50">
            {filtered.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                onOpen={() => setSelectedLead(lead)}
                onDelete={() => deleteLead(lead.id)}
                onStatusChange={updateLeadStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}

// ── Lead Row ──────────────────────────────────────────────────────────────────
function LeadRow({ lead, onOpen, onDelete, onStatusChange }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn('transition-colors cursor-pointer', hovered && 'bg-surface-50/80')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Mobile card layout */}
      <div className="flex sm:hidden items-center gap-3 px-4 py-3" onClick={onOpen}>
        <LeadAvatar name={lead.name} />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold truncate', hovered ? 'text-brand-600' : 'text-surface-900')}>{lead.name}</p>
          <p className="text-xs text-surface-400 truncate">{lead.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={lead.status} />
            <ScoreChip score={lead.score} />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              title="Call"
              className="p-2 rounded-lg text-surface-400 active:bg-brand-50 active:text-brand-600 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <RowPhoneIcon />
            </a>
          )}
          {lead.phone && (
            <a
              href={`https://wa.me/${lead.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              className="p-2 rounded-lg text-surface-400 active:bg-green-50 active:text-green-600 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <RowWhatsAppIcon />
            </a>
          )}
        </div>
      </div>

      {/* Desktop table row layout */}
      <div
        className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center"
        onClick={onOpen}
      >
        {/* Name */}
        <div className="flex items-center gap-3 min-w-0">
          <LeadAvatar name={lead.name} />
          <div className="min-w-0">
            <p className={cn('text-sm font-semibold truncate transition-colors', hovered ? 'text-brand-600' : 'text-surface-900')}>{lead.name}</p>
            <p className="text-xs text-surface-400 truncate">{lead.email}</p>
          </div>
        </div>

        {/* Fitness Goal */}
        <div>
          <p className="text-sm text-surface-700 font-medium truncate">{lead.fitnessGoal || '—'}</p>
          <p className="text-xs text-surface-400">{lead.preferredPlan || ''}</p>
        </div>

        {/* Source */}
        <div>
          <span className="text-xs font-medium text-surface-500 bg-surface-100 px-2 py-1 rounded-lg">{lead.source}</span>
        </div>

        {/* Status */}
        <div onClick={(e) => e.stopPropagation()}>
          <select
            value={lead.status}
            onChange={(e) => onStatusChange(lead.id, e.target.value)}
            className="text-xs bg-transparent border-0 focus:outline-none cursor-pointer"
            style={{ appearance: 'none' }}
          >
            {PIPELINE_STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <StatusBadge status={lead.status} />
        </div>

        {/* Score */}
        <div className="flex items-center gap-2">
          <ScoreRing score={lead.score} size={40} />
          <ScoreChip score={lead.score} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              title="Call"
              className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            >
              <RowPhoneIcon />
            </a>
          )}
          {lead.phone && (
            <a
              href={`https://wa.me/${lead.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              className="p-1.5 rounded-lg text-surface-400 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <RowWhatsAppIcon />
            </a>
          )}
          <IconButton onClick={onOpen} title="Open" variant="primary">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </IconButton>
          <IconButton onClick={onDelete} title="Delete" variant="danger">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </IconButton>
        </div>
      </div>
    </div>
  );
}

// ── Filter Chip ───────────────────────────────────────────────────────────────
function FilterChip({ children, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={cn('text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all', active ? 'border-current' : 'border-surface-200 text-surface-500 hover:border-surface-300')}
      style={active ? { color, backgroundColor: `${color}15`, borderColor: `${color}50` } : {}}
    >
      {children}
    </button>
  );
}

// ── Row Quick-Action Icons ────────────────────────────────────────────────────
function RowPhoneIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
}
function RowWhatsAppIcon() {
  return <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
}
