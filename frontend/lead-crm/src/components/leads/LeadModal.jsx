import React, { useState, useEffect } from 'react';
import { useLeads } from '../../context/LeadsContext';
import { StatusBadge, LeadAvatar, ScoreRing, ScoreChip, IconButton } from '../ui';
import { PIPELINE_STAGES, formatDate, cn } from '../../utils/helpers';
import { getWhatsAppWelcomeLink } from '../../utils/whatsapp';

const TABS = ['Overview'];

export default function LeadModal({ lead: initialLead, onClose }) {
  const { updateLeadStatus, updateLead, leads } = useLeads();
  const [tab, setTab] = useState('Overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Keep in sync with context
  const lead = leads.find((l) => l.id === initialLead.id) || initialLead;

  useEffect(() => {
    setEditForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      fitnessGoal: lead.fitnessGoal,
      preferredPlan: lead.preferredPlan,
      notes: lead.notes,
      source: lead.source,
      status: lead.status,
      trialInterested: lead.trialInterested,
      trialDate: lead.trialDate
    });
  }, [lead, isEditing]);

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async () => {
    await updateLead(lead.id, editForm);
    setIsEditing(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-modal w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-slide-up mx-2 sm:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-4 sm:p-6 border-b border-surface-100">
          <LeadAvatar name={lead.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-bold text-surface-900 truncate">{lead.name}</h2>
                <p className="text-xs sm:text-sm text-surface-500 mt-0.5 truncate">{lead.preferredPlan || 'N/A'} {lead.fitnessGoal ? `· ${lead.fitnessGoal}` : ''}</p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                    isEditing ? "bg-brand-50 text-brand-600 border-brand-200" : "bg-surface-50 text-surface-600 border-surface-200 hover:bg-surface-100"
                  )}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                <IconButton onClick={onClose} title="Close">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </IconButton>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <StatusBadge status={lead.status} />
              <ScoreRing score={lead.score} status={lead.status} />
              <span className="text-xs text-surface-400">{lead.source}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-6 border-b border-surface-100">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-all',
                tab === t ? 'border-brand-500 text-brand-600' : 'border-transparent text-surface-500 hover:text-surface-900'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
          {isEditing ? (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-widest ml-1">Name</label>
                  <input 
                    className="input-field"
                    value={editForm.name} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-widest ml-1">Phone</label>
                  <input 
                    className="input-field" 
                    value={editForm.phone} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    className="input-field" 
                    value={editForm.email} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-widest ml-1">Fitness Goal</label>
                  <select 
                    className="input-field" 
                    value={editForm.fitnessGoal} 
                    onChange={(e) => setEditForm({...editForm, fitnessGoal: e.target.value})}
                  >
                    {['Weight Loss', 'Muscle Gain', 'General Fitness', 'Bodybuilding', 'Cardio & Stamina', 'Flexibility / Yoga', 'Rehabilitation'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-surface-400 uppercase tracking-widest ml-1">Notes</label>
                <textarea 
                  className="input-field min-h-[100px]" 
                  value={editForm.notes} 
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                />
              </div>
              <button 
                onClick={handleSave}
                className="btn-primary w-full py-3 mt-2 shadow-lg shadow-brand-200"
              >
                Save Changes
              </button>
            </div>
          ) : (
            tab === 'Overview' && <OverviewTab lead={lead} onStatusChange={updateLeadStatus} />
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 px-4 sm:px-6 py-3 sm:py-4 border-t border-surface-100 bg-surface-50 rounded-b-2xl sm:rounded-b-3xl">
          <a href={`mailto:${lead.email}`} className="btn-secondary text-sm py-3 sm:text-xs sm:py-2 justify-center min-h-[44px] sm:min-h-0">
            <MailIcon />Email
          </a>
          {lead.phone && (
            <a href={`tel:${lead.phone}`} className="btn-secondary text-sm py-3 sm:text-xs sm:py-2 justify-center min-h-[44px] sm:min-h-0">
              <PhoneIcon />Call
            </a>
          )}
          {lead.phone && (
            <a
              href={getWhatsAppWelcomeLink(lead)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm py-3 sm:text-xs sm:py-2 justify-center min-h-[44px] sm:min-h-0 bg-emerald-600 hover:bg-emerald-700 border-0"
            >
              <WhatsAppIcon />WhatsApp Lead
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ lead, onStatusChange }) {
  return (
    <div className="space-y-5">
      {/* Contact info */}
      <section>
        <h3 className="label">Contact Info</h3>
        <div className="card p-3 sm:p-4 grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
          {[
            { label: 'Email', value: lead.email, href: `mailto:${lead.email}` },
            { label: 'Phone', value: lead.phone || '—' },
            { label: 'Fitness Goal', value: lead.fitnessGoal || '—' },
            { label: 'Preferred Plan', value: lead.preferredPlan || '—' },
            { label: 'Source', value: lead.source },
            { label: 'Created', value: formatDate(lead.createdAt) },
          ].map(({ label, value, href }) => (
            <div key={label}>
              <p className="text-xs text-surface-400 mb-0.5">{label}</p>
              {href ? (
                <a href={href} className="text-sm font-medium text-brand-600 hover:underline">{value}</a>
              ) : (
                <p className="text-sm font-medium text-surface-800">{value}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Notes */}
      {lead.notes && (
        <section>
          <h3 className="label">Notes</h3>
          <div className="card p-4">
            <p className="text-sm text-surface-700 leading-relaxed">{lead.notes}</p>
          </div>
        </section>
      )}

      {/* Pipeline stage */}
      <section>
        <h3 className="label">Pipeline Stage</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PIPELINE_STAGES.map((stage) => (
            <button
              key={stage.id}
              onClick={() => onStatusChange(lead.id, stage.id)}
              className={cn(
                'text-xs font-semibold py-2.5 sm:py-2 px-2 rounded-xl border-2 transition-all min-h-[40px] sm:min-h-0',
                lead.status === stage.id
                  ? 'border-current'
                  : 'border-transparent bg-surface-50 text-surface-500 hover:bg-surface-100'
              )}
              style={lead.status === stage.id ? { color: stage.color, backgroundColor: stage.bg, borderColor: stage.dot } : {}}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Tiny Icons ────────────────────────────────────────────────────────────────
function MailIcon() {
  return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}
function PhoneIcon() {
  return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
}
function WhatsAppIcon() {
  return <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
}
