import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLeads } from '../context/LeadsContext';
import { StatusBadge, LeadAvatar, ScoreRing, Skeleton } from '../components/ui';
import { PIPELINE_STAGES, timeAgo, cn } from '../utils/helpers';

const STAT_CARDS = [
  {
    key: 'total',
    label: 'Total Leads',
    icon: '👥',
    color: 'from-brand-500 to-brand-700',
  },
  {
    key: 'hot',
    label: 'Hot Leads',
    icon: '🔥',
    color: 'from-rose-400 to-rose-600',
  },
  {
    key: 'trialBooked',
    label: 'Trials',
    icon: '📅',
    color: 'from-amber-400 to-amber-600',
  },
  {
    key: 'joined',
    label: 'Joined',
    icon: '🏆',
    color: 'from-emerald-400 to-emerald-600',
  },
];

const PIE_COLORS = PIPELINE_STAGES.map((s) => s.dot);

export default function Dashboard() {
  const { leads, stats, loading } = useLeads();
  const navigate = useNavigate();

  const recentLeads = useMemo(() =>
    [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    [leads]
  );

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
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STAT_CARDS.map(({ key, label, icon, color, change }, i) => (
          <div key={key} className="stat-card" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl', color)}>
                {icon}
              </div>
              <span className="text-xs font-semibold text-success-500 bg-success-50 px-2 py-0.5 rounded-full">{change}</span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-surface-900 font-mono">{stats?.[key] ?? 0}</p>
              <p className="text-sm text-surface-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        Score distribution
        <div className="card p-5 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Lead Score Distribution</h2>
            <span className="text-xs text-surface-400">All time</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={scoreData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#a0a8c8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a0a8c8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e4e8f5', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#1a1f45', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="count" stroke="#4f6ef7" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: '#4f6ef7', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        Pipeline pie
        <div className="card p-5">
          <h2 className="section-title mb-4">Pipeline Breakdown</h2>
          {pipelineData.length > 0 ? (
            <>
              <div className="flex justify-center mb-3">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" stroke="none">
                      {pipelineData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {pipelineData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-surface-600">{d.name}</span>
                    </div>
                    <span className="font-semibold text-surface-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-surface-400 text-center py-8">No leads yet</p>
          )}
        </div>
      </div> */}

      {/* Hot leads + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hot leads */}
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
                <ScoreRing score={lead.score} size={36} />
              </div>
            ))}
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
            {recentLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => navigate('/leads', { state: { openLead: lead.id } })}
                className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-surface-50 cursor-pointer group transition-colors"
              >
                <LeadAvatar name={lead.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">{lead.name}</p>
                    <StatusBadge status={lead.status} />
                  </div>
                  <p className="text-xs text-surface-400 truncate">{lead.fitnessGoal} · {lead.source}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <ScoreRing score={lead.score} size={36} />
                  <p className="text-xs text-surface-300 mt-1">{timeAgo(lead.createdAt)}</p>
                </div>
              </div>
            ))}
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
