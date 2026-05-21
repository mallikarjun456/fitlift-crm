import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../context/LeadsContext';
import { LEAD_SOURCES, cn } from '../utils/helpers';
import { Spinner } from '../components/ui';
import { getWhatsAppWelcomeLink } from '../utils/whatsapp';

const INITIAL = {
  name: '', email: '', phone: '', fitnessGoal: '', preferredPlan: '',
  notes: '', source: LEAD_SOURCES[0], status: 'NEW', trialInterested: false,
};

const GOALS = [
  'Weight Loss', 'Muscle Gain', 'General Fitness', 'Bodybuilding',
  'Cardio & Stamina', 'Flexibility / Yoga', 'Rehabilitation'
];

const PLANS = ['Standard', 'Premium', 'Monthly', 'Quarterly', 'Annual'];

const FIELDS = [
  { key: 'name', label: 'Full Name', placeholder: 'Arjun Mehta', required: true, type: 'text' },
  { key: 'email', label: 'Email Address', placeholder: 'arjun@gym.com', required: false, type: 'email' },
  { key: 'phone', label: 'Phone Number', placeholder: 'Enter phone number', required: true, type: 'tel' },
  { key: 'fitnessGoal', label: 'Fitness Goal', options: GOALS, required: false, type: 'select' },
  { key: 'preferredPlan', label: 'Preferred Plan', options: PLANS, required: false, type: 'select' },
];

export default function CapturePage() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const { createLead } = useLeads();
  const navigate = useNavigate();

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    setServerError(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError(null);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim().replace(/\s+/g, ''), // Sanitise for backend regex
        fitnessGoal: form.fitnessGoal || GOALS[2], // Default to General Fitness if empty
        preferredPlan: form.preferredPlan || PLANS[0], // Default to Standard if empty
        source: form.source,
        status: form.status,
        notes: form.notes.trim(),
        trialInterested: form.trialInterested,
      };
      const lead = await createLead(payload);
      setSuccess(lead);
      setForm(INITIAL);
    } catch (err) {
      setServerError(err.message || 'Failed to save lead. Please check your input.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[70vh] animate-fade-in">
        <div className="card p-8 sm:p-10 text-center max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center text-4xl mx-auto mb-5">🎉</div>
          <h2 className="text-2xl font-bold text-surface-900 mb-2">Lead Captured!</h2>
          <p className="text-surface-500 mb-2">
            <strong className="text-surface-900">{success.name}</strong> has been added to your pipeline.
          </p>
          {success.score != null && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm mb-6 ${
              success.score >= 80 ? 'bg-red-50 text-red-700' : success.score >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
            }`}>
              {success.score >= 80 ? '🔥 HOT Lead' : success.score >= 50 ? '🌡️ WARM Lead' : '❄️ COLD Lead'}
            </div>
          )}
          <div className="flex flex-col gap-2.5 w-full mt-2">
            {success.phone && (
              <a
                href={getWhatsAppWelcomeLink(success)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 py-3 shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all font-semibold rounded-xl text-sm border-0"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Send WhatsApp Welcome
              </a>
            )}
            <div className="flex gap-3">
              <button onClick={() => navigate('/pipeline')} className="btn-secondary flex-1 justify-center py-2.5">
                View Pipeline
              </button>
              <button onClick={() => setSuccess(null)} className="btn-ghost border border-surface-200 hover:bg-surface-50 flex-1 justify-center py-2.5 text-xs text-surface-600">
                Add Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900">Capture New Lead</h1>
          <p className="text-xs sm:text-sm text-surface-400 mt-1">Fill in the details below to add a new gym lead.</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 text-danger-700 rounded-2xl text-sm flex gap-3 animate-shake">
            <span>⚠️</span>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main fields */}
          <div className="card p-6 space-y-5">
            <h2 className="text-sm font-semibold text-surface-700 pb-2 border-b border-surface-100">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {FIELDS.map(({ key, label, placeholder, required, type, options }) => (
                <div key={key}>
                  <label className="label">
                    {label} {required && <span className="text-danger-500 normal-case tracking-normal">*</span>}
                  </label>
                  {type === 'select' ? (
                    <select
                      value={form[key]}
                      onChange={set(key)}
                      className="input-field"
                    >
                      <option value="">Select {label}</option>
                      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={type}
                      value={form[key]}
                      onChange={set(key)}
                      placeholder={placeholder}
                      className={cn('input-field', errors[key] && 'border-danger-300 focus:ring-danger-200 focus:border-danger-400')}
                    />
                  )}
                  {errors[key] && <p className="text-xs text-danger-500 mt-1">{errors[key]}</p>}
                </div>
              ))}

              {/* Source dropdown */}
              <div>
                <label className="label">Lead Source</label>
                <select value={form.source} onChange={set('source')} className="input-field">
                  {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-surface-700 pb-2 border-b border-surface-100 mb-5">Additional Details</h2>
            <div>
              <label className="label">Notes</label>
              <textarea
                value={form.notes}
                onChange={set('notes')}
                placeholder="Describe the lead's goals, interests, or any relevant context…"
                rows={5}
                className="input-field resize-none"
              />
            </div>
            
            <div className="mt-4 flex items-center gap-3 bg-surface-50 p-3 rounded-xl border border-surface-100">
              <input
                id="trialInterested"
                type="checkbox"
                checked={form.trialInterested}
                onChange={set('trialInterested')}
                className="w-5 h-5 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="trialInterested" className="text-sm font-medium text-surface-700 cursor-pointer">
                Interested in a Trial Session?
              </label>
            </div>
          </div>

          {/* Info banner */}
          <div className="rounded-2xl bg-gradient-to-r from-brand-50 to-purple-50 border border-brand-100 p-5 flex gap-4">
            <div className="text-2xl flex-shrink-0">🏋️</div>
            <div>
              <p className="text-sm font-semibold text-surface-800">Gym Lead Capture</p>
              <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">
                This lead will be automatically scored 0–100 based on fitness goal, preferred plan, source, and notes. High-scoring leads (80+) are flagged as hot.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/leads')}
              className="btn-ghost"
            >
              ← Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={cn('btn-primary px-8', submitting && 'opacity-80')}
            >
              {submitting ? (
                <><Spinner size={16} color="white" /> Saving…</>
              ) : (
                <>➕ Add Lead</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
