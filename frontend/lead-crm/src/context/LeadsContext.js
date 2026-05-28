import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { leadsApi } from '../services/api';

const LeadsContext = createContext(null);
const COLD_START_MESSAGE = 'Server is waking up... please wait a few seconds.';

export function LeadsProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchLeads = useCallback(async () => {
    let wakeTimer;

    try {
      setLoading(true);
      setError(null);

      wakeTimer = setTimeout(() => {
        setError(COLD_START_MESSAGE);
      }, 3000);

      const [leadsData, statsData] = await Promise.all([
        leadsApi.getAll(),
        leadsApi.getStats(),
      ]);

      setLeads(leadsData || []);
      setStats(statsData || {});
      setError(null);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      setError(err.isConnectionIssue ? COLD_START_MESSAGE : 'Unable to load leads right now. Please try again.');
    } finally {
      if (wakeTimer) clearTimeout(wakeTimer);
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await leadsApi.getStats();
      setStats(data);
    } catch {
      // derive from leads
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [fetchLeads, fetchStats]);

  const createLead = useCallback(async (formData) => {
    const tid = toast.loading('Creating lead...');

    try {
      const newLead = await leadsApi.create(formData);
      setLeads((prev) => [newLead, ...prev]);
      toast.success('Lead created successfully!', { id: tid });
      return newLead;
    } catch (err) {
      // Demo mode: create locally
      // const mockLead = { ...formData, id: Date.now(), status: 'NEW', score: Math.floor(Math.random() * 45 + 50), createdAt: new Date().toISOString(), source: formData.source || 'Website' };
      toast.error('backend connect failed', { id: tid });
      console.error(err);
      throw err;
    }
  }, []);

  const updateLeadStatus = useCallback(async (id, status) => {
    const prev = leads.find((l) => l.id === id);
    // Optimistic update
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status: status } : l)));
    try {
      await leadsApi.updateStatus(id, status);
    } catch {
      // Rollback
      if (prev) setLeads((ls) => ls.map((l) => (l.id === id ? prev : l)));
      toast.error('Failed to update status');
    }
  }, [leads]);
  //   const tid = toast.loading('Running AI analysis…');
  //   try {
  //     const updated = await leadsApi.analyze(id);
  //     setLeads((ls) => ls.map((l) => (l.id === id ? updated : l)));
  //     toast.success('Analysis complete!', { id: tid });
  //     return updated;
  //   } catch {
  //     toast.error('Failed to analyze lead', { id: tid });
  //     throw new Error('Analysis failed');
  //   }
  // }, []);

  // const generateReply = useCallback(async (id) => {
  //   const tid = toast.loading('Generating AI reply…');
  //   try {
  //     const updated = await leadsApi.generateReply(id);
  //     setLeads((ls) => ls.map((l) => (l.id === id ? updated : l)));
  //     toast.success('Reply generated!', { id: tid });
  //     return updated;
  //   } catch {
  //     toast.error('Failed to generate reply', { id: tid });
  //     throw new Error('Reply failed');
  //   }
  // }, []);

  const deleteLead = useCallback(async (id) => {
    setLeads((ls) => ls.filter((l) => l.id !== id));
    try {
      await leadsApi.delete(id);
      toast.success('Lead deleted');
    } catch {
      toast.error('Delete failed');
    }
  }, []);

  // Computed stats from leads when API stats unavailable
  const computedStats = stats || {
    total: leads.length,
    hot: leads.filter((l) => (l.score || 0) >= 80).length,
    warm: leads.filter((l) => (l.score || 0) >= 50 && (l.score || 0) < 80).length,
    cold: leads.filter((l) => (l.score || 0) < 50).length,

    newToday: leads.filter((l) => l.status === 'NEW').length,

    trialBooked: leads.filter(
      (l) => l.status === 'TRIAL_BOOKED'
    ).length,

    joined: leads.filter(
      (l) => l.status === 'JOINED'
    ).length,
  };

  const filteredLeads = React.useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter((l) => 
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.phone?.toLowerCase().includes(q) ||
      l.fitnessGoal?.toLowerCase().includes(q)
    );
  }, [leads, search]);

  const updateLead = useCallback(async (id, formData) => {
    const tid = toast.loading('Updating lead...');
    try {
      const updated = await leadsApi.update(id, formData);
      setLeads((ls) => ls.map((l) => (l.id === id ? updated : l)));
      toast.success('Lead updated successfully!', { id: tid });
      return updated;
    } catch (err) {
      toast.error('Update failed', { id: tid });
      throw err;
    }
  }, []);

  return (
    <LeadsContext.Provider
      value={{
        leads,
        stats: computedStats,
        loading,
        error,
        fetchLeads,
        createLead,
        updateLead,
        updateLeadStatus,
        deleteLead,
        search,
        setSearch,
        filteredLeads,
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be inside LeadsProvider');
  return ctx;
}

// ── Mock Data (demo when backend is offline) ──────────────────────────────────
const MOCK_LEADS = [
  { id: 1, name: 'Arjun Mehta', email: 'arjun.mehta@gmail.com', phone: '+919876543210', fitnessGoal: 'Weight Loss', preferredPlan: 'Annual', notes: 'Looking to lose 10kg in 3 months.', status: 'NEW', source: 'Instagram Ads', score: 92, createdAt: '2026-05-15T09:30:00' },
  { id: 2, name: 'Priya Sharma', email: 'priya@outlook.com', phone: '+918765432109', fitnessGoal: 'Muscle Gain', preferredPlan: 'Monthly', notes: 'Interested in personal training.', status: 'CONTACTED', source: 'Website', score: 71, createdAt: '2026-05-16T14:20:00' },
  { id: 3, name: 'Raj Patel', email: 'raj@yahoo.com', phone: '+917654321098', fitnessGoal: 'General Fitness', preferredPlan: 'Quarterly', notes: 'Evaluated 3 gyms, likes our pool.', status: 'TRIAL_BOOKED', source: 'Referral', score: 88, createdAt: '2026-05-14T11:00:00' },
  { id: 4, name: 'Sneha Nair', email: 'sneha@gmail.com', phone: '+916543210987', fitnessGoal: 'Flexibility / Yoga', preferredPlan: 'Annual', notes: 'Needs early morning slots.', status: 'NEW', source: 'Google Ads', score: 55, createdAt: '2026-05-16T16:45:00' },
];
