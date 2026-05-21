import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../context/LeadsContext';
import { StatusBadge, LeadAvatar, ScoreRing, Skeleton } from '../components/ui';
import { PIPELINE_STAGES, timeAgo, cn } from '../utils/helpers';
import { checkReminder, getReminderLeads, getWhatsAppWelcomeLink } from '../utils/whatsapp';

const STAT_CARDS = [
  {
    key: 'total',
    label: 'Total Leads',
    icon: '👥',
    color: 'from-brand-500 to-brand-700',
  },
  {
    key: 'active',
    label: 'Active Leads',
    icon: '🔥',
    color: 'from-rose-400 to-rose-600',
  },
  {
    key: 'followUpToday',
    label: 'Follow-ups Today',
    icon: '⏰',
    color: 'from-amber-400 to-amber-600',
  },
  {
    key: 'joined',
    label: 'Joined Members',
    icon: '🏆',
    color: 'from-emerald-400 to-emerald-600',
  },
];

const PIE_COLORS = PIPELINE_STAGES.map((s) => s.dot);

export default function Dashboard() {
  const { leads, stats, loading } = useLeads();
  const navigate = useNavigate();

  // Calculate reminder counts
  const reminderLeads = useMemo(() => getReminderLeads(leads), [leads]);
  const reminderCount = reminderLeads.length;

  // Calculate local stats
  const totalLeadsCount = useMemo(() => leads.length, [leads]);
  const activeLeadsCount = useMemo(() => 
    leads.filter((l) => ['NEW', 'CONTACTED', 'FOLLOW_UP'].includes(l.status) || (l.score || 0) >= 80).length,
    [leads]
  );
  const joinedCount = useMemo(() => 
    leads.filter((l) => l.status === 'JOINED').length,
    [leads]
  );

  const statCardValues = useMemo(() => ({
    total: totalLeadsCount,
    active: activeLeadsCount,
    followUpToday: reminderCount,
    joined: joinedCount,
  }), [totalLeadsCount, activeLeadsCount, reminderCount, joinedCount]);

  // Calculate mini stats
  const leadsThisWeek = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return leads.filter((l) => l.createdAt && new Date(l.createdAt).getTime() > sevenDaysAgo).length;
  }, [leads]);

  const contactedCount = useMemo(() => {
    return leads.filter((l) => ['CONTACTED', 'TRIAL_BOOKED', 'FOLLOW_UP', 'JOINED'].includes(l.status)).length;
  }, [leads]);

  const convertedCount = useMemo(() => {
    return leads.filter((l) => l.status === 'JOINED').length;
  }, [leads]);

  // Sort Recent Leads: Reminder leads first, then newest first
  const recentLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      const aReminder = checkReminder(a);
      const bReminder = checkReminder(b);
      
      if (aReminder && !bReminder) return -1;
      if (!aReminder && bReminder) return 1;
      
      return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 6);
  }, [leads]);

  const pipelineData = useMemo(() =>
    PIPELINE_STAGES.map((s) => ({
      name: s.label,
      value: leads.filter((l) => l.status === s.id).length,
      color: s.dot,
    })).filter((d) => d.value > 0),
    [leads]
  );

  const scoreData = useMemo(() => {
    const buckets = [
      { range: '0–20', min: 0, max: 20 },
      { range: '21–40', min: 21, max: 40 },
      { range: '41–60', min: 41, max: 60 },
      { range: '61–80', min: 61, max: 80 },
      { range: '81–100', min: 81, max: 100 },
    ];
    return buckets.map((b) => ({
      range: b.range,
      count: leads.filter((l) => l.score >= b.min && l.score <= b.max).length,
    }));
  }, [leads]);

  const hotLeads = useMemo(() =>
    leads.filter((l) => (l.score || 0) >= 80).slice(0, 4),
    [leads]
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Dashboard Header with Compact Reminder Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-surface-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-surface-900">Gym Dashboard</h1>
          <p className="text-xs text-surface-400 mt-0.5">Real-time performance and lead indicators</p>
        </div>
        
        {reminderCount > 0 && (
          <div 
            onClick={() => navigate('/leads')}
            className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all animate-pulse"
          >
            <span className="text-sm">⏰</span>
            <span className="text-xs font-bold">{reminderCount} {reminderCount === 1 ? 'Lead Needs' : 'Leads Need'} Follow-Up</span>
          </div>
        )}
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-surface-100 shadow-sm text-center">
        <div>
          <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Leads This Week</p>
          <p className="text-lg sm:text-2xl font-bold text-surface-900 mt-0.5 font-mono">{leadsThisWeek}</p>
        </div>
        <div className="border-x border-surface-100">
          <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Contacted</p>
          <p className="text-lg sm:text-2xl font-bold text-brand-600 mt-0.5 font-mono">{contactedCount}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Converted</p>
          <p className="text-lg sm:text-2xl font-bold text-success-500 mt-0.5 font-mono">{convertedCount}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STAT_CARDS.map(({ key, label, icon, color, change }, i) => (
          <div key={key} className="stat-card" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl', color)}>
                {icon}
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-surface-900 font-mono">{statCardValues[key] ?? 0}</p>
              <p className="text-sm text-surface-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (Follow-Ups and Hot Leads Stack) */}
        <div className="space-y-4 lg:col-span-1">
          {/* Today's Follow-Ups Widget */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base">⏰</span>
                <h2 className="section-title">Today's Follow-Ups</h2>
              </div>
              {reminderCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                  {reminderCount} Due
                </span>
              )}
            </div>
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {reminderLeads.length === 0 ? (
                <p className="text-sm text-surface-400 py-6 text-center">🎉 All caught up for today!</p>
              ) : (
                reminderLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-surface-50 border border-surface-100 hover:border-brand-200 transition-all group"
                  >
                    <div 
                      className="flex items-center gap-2.5 min-w-0 flex-1 mr-2 cursor-pointer" 
                      onClick={() => navigate('/leads', { state: { openLead: lead.id } })}
                    >
                      <LeadAvatar name={lead.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-surface-900 truncate group-hover:text-brand-600 transition-colors">
                          {lead.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <StatusBadge status={lead.status} />
                          <span className="text-[10px] text-surface-400 font-medium">
                            {timeAgo(lead.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* WhatsApp Action Button */}
                    <a
                      href={getWhatsAppWelcomeLink(lead)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0 w-8 h-8 rounded-xl bg-success-50 hover:bg-success-100 border border-success-200 flex items-center justify-center text-success-600 transition-all hover:scale-105 active:scale-95"
                      title="Send WhatsApp Follow-up"
                    >
                      <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.978 14.12 1.9 12.003 1.9c-5.439 0-9.865 4.37-9.87 9.8-.002 1.778.474 3.514 1.378 5.078l-.997 3.645 3.734-.972zm10.113-4.9c-.272-.135-1.614-.793-1.863-.884-.25-.09-.432-.135-.613.137-.18.271-.7 1.042-.857 1.222-.158.18-.317.2-.589.065-1.96-.948-3.08-1.841-4.223-3.802-.302-.517.302-.48.86-1.597.09-.18.044-.337-.023-.472-.068-.136-.613-1.477-.84-2.02-.22-.53-.443-.457-.613-.466-.16-.008-.344-.01-.529-.01-.184 0-.485.07-.74.352-.254.278-.97.949-.97 2.31 0 1.361.99 2.68 1.103 2.83.114.15 1.947 2.972 4.717 4.168.659.284 1.174.454 1.576.581.662.21 1.265.18 1.741.11.531-.08 1.614-.66 1.84-1.294.228-.635.228-1.179.16-1.294-.069-.115-.25-.2-.522-.335z"/>
                      </svg>
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Hot Leads Widget */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">🔥</span>
              <h2 className="section-title">Hot Leads</h2>
            </div>
            <div className="space-y-3">
              {hotLeads.length === 0 ? (
                <p className="text-sm text-surface-400 py-4 text-center">No hot leads yet</p>
              ) : hotLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => navigate('/leads', { state: { openLead: lead.id } })}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-50 cursor-pointer transition-colors group"
                >
                  <LeadAvatar name={lead.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-900 truncate group-hover:text-brand-600 transition-colors">{lead.name}</p>
                    <p className="text-xs text-surface-400 truncate">{lead.fitnessGoal || '—'}</p>
                  </div>
                  <ScoreRing score={lead.score} status={lead.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent leads */}
        <div className="card p-5 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Leads</h2>
            <button onClick={() => navigate('/leads')} className="text-xs text-brand-600 font-semibold hover:text-brand-700 transition-colors">
              View all →
            </button>
          </div>
          <div className="space-y-0 -mx-2">
            {recentLeads.map((lead) => {
              const isActionDue = checkReminder(lead);
              return (
                <div
                  key={lead.id}
                  onClick={() => navigate('/leads', { state: { openLead: lead.id } })}
                  className={cn(
                    "flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-surface-50 cursor-pointer group transition-colors",
                    isActionDue && "bg-amber-50/40 border-l-2 border-amber-500 rounded-l-none"
                  )}
                >
                  <LeadAvatar name={lead.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <p className="text-sm font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">{lead.name}</p>
                      <StatusBadge status={lead.status} />
                      {isActionDue && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-amber-500 text-white px-1.5 py-0.5 rounded-md animate-pulse">
                          ⏰ Action Due
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-surface-400 truncate">{lead.fitnessGoal} · {lead.source}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <ScoreRing score={lead.score} status={lead.status} />
                    <p className="text-xs text-surface-300 mt-1">{timeAgo(lead.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-56 rounded-2xl col-span-2" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}
