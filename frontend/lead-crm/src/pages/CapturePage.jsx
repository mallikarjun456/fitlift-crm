import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../context/LeadsContext';
import { LEAD_SOURCES, cn } from '../utils/helpers';
import { Spinner } from '../components/ui';

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
  { key: 'email', label: 'Email Address', placeholder: 'arjun@gym.com', required: true, type: 'email' },
  { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', required: true, type: 'tel' },
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
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
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
        <div className="card p-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center text-4xl mx-auto mb-5">🎉</div>
          <h2 className="text-2xl font-bold text-surface-900 mb-2">Lead Captured!</h2>
          <p className="text-surface-500 mb-2">
            <strong className="text-surface-900">{success.name}</strong> has been added to your pipeline.
          </p>
          {success.score != null && (
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-2 rounded-xl font-semibold text-sm mb-6">
              Lead Score: {success.score}/100
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/leads')} className="btn-primary">View All Leads</button>
            <button onClick={() => setSuccess(null)} className="btn-secondary">Add Another</button>
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
