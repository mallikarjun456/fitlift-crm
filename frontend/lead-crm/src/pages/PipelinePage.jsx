import React, { useState, useMemo, useRef } from 'react';
import { useLeads } from '../context/LeadsContext';
import { StatusBadge, LeadAvatar, ScoreRing, EmptyState } from '../components/ui';
import LeadModal from '../components/leads/LeadModal';
import { PIPELINE_STAGES, timeAgo, cn } from '../utils/helpers';

export default function PipelinePage() {
  const { leads, filteredLeads, updateLeadStatus, loading } = useLeads();
  const [selectedLead, setSelectedLead] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const grouped = useMemo(() => {
    const map = {};
    PIPELINE_STAGES.forEach((s) => {
      map[s.id] = filteredLeads
        .filter((l) => l.status === s.id)
        .sort((a, b) => (b.score || 0) - (a.score || 0));
    });
    return map;
  }, [filteredLeads]);

  const handleDragStart = (lead) => setDragging(lead);
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  const handleDrop = (stageId) => {
    if (dragging && dragging.status !== stageId) {
      updateLeadStatus(dragging.id, stageId);
    }
    setDragging(null);
    setDragOver(null);
  };

  const wonCount = grouped['WON']?.length || 0;
  const totalCount = leads.length;
  const winRate = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0;

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-surface-100 bg-white flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-surface-900">Pipeline</h1>
          <p className="text-sm text-surface-400 mt-0.5">{leads.length} leads · {winRate}% win rate</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success-50 text-success-700 rounded-xl font-semibold">
            <span>🏆</span> {wonCount} Won
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-50 text-surface-600 rounded-xl font-semibold text-xs">
            Drag cards to move stages
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth">
        <div className="flex gap-4 p-4 h-full" style={{ minWidth: 'max-content' }}>
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = grouped[stage.id] || [];
            const isOver = dragOver === stage.id;

            return (
              <div
                key={stage.id}
                className={cn(
                  'pipeline-column flex-shrink-0 transition-all duration-200 snap-center',
                  isOver ? 'scale-[1.01]' : ''
                )}
                style={{
                  background: isOver ? stage.bg : '#f8f9fc',
                  border: `2px solid ${isOver ? stage.dot : 'transparent'}`,
                  width: 'calc(100vw - 64px)',
                  maxWidth: '280px'
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(stage.id); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null); }}
                onDrop={() => handleDrop(stage.id)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stage.dot }} />
                    <span className="text-xs font-bold text-surface-700 uppercase tracking-wider">{stage.label}</span>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ color: stage.color, backgroundColor: stage.bg }}
                  >
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2.5 overflow-y-auto no-scrollbar pb-2" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  {stageLeads.length === 0 && (
                    <div
                      className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed text-center"
                      style={{ borderColor: `${stage.dot}40` }}
                    >
                      <p className="text-xs text-surface-400">Drop leads here</p>
                    </div>
                  )}

                  {stageLeads.map((lead) => (
                    <KanbanCard
                      key={lead.id}
                      lead={lead}
                      stage={stage}
                      isDragging={dragging?.id === lead.id}
                      onDragStart={() => handleDragStart(lead)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedLead(lead)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}

// ── Kanban Card ───────────────────────────────────────────────────────────────
function KanbanCard({ lead, stage, isDragging, onDragStart, onDragEnd, onClick }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'kanban-card select-none',
        isDragging && 'opacity-40 scale-95 rotate-1'
      )}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <LeadAvatar name={lead.name} size="sm" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-surface-900 truncate">{lead.name}</p>
            <p className="text-xs text-surface-400 truncate">{lead.fitnessGoal || lead.preferredPlan || '—'}</p>
          </div>
        </div>
        <ScoreRing score={lead.score} size={36} />
      </div>

      {/* Notes preview */}
      {lead.notes && (
        <p className="text-xs text-surface-500 leading-relaxed line-clamp-2 mb-3 bg-surface-50 p-2 rounded-lg">
          {lead.notes}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs bg-surface-100 text-surface-500 px-2 py-0.5 rounded-md font-medium">{lead.source}</span>
        <span className="text-xs text-surface-300">{timeAgo(lead.createdAt)}</span>
      </div>

      {/* AI badges */}
      {(lead.aiAnalysis || lead.aiReply) && (
        <div className="flex gap-1 mt-2 pt-2 border-t border-surface-50">
          {lead.aiAnalysis && <span className="text-[10px] px-1.5 py-0.5 bg-brand-50 text-brand-600 rounded-md font-semibold">🧠 Analyzed</span>}
          {lead.aiReply && <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-md font-semibold">✉️ Reply ready</span>}
        </div>
      )}
    </div>
  );
}
