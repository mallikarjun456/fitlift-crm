import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLeads } from '../../context/LeadsContext';
import { cn } from '../../utils/helpers';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: GridIcon, exact: true },
  { path: '/leads', label: 'All Leads', icon: UsersIcon },
  { path: '/pipeline', label: 'Pipeline', icon: KanbanIcon },
  { path: '/capture', label: 'Capture Lead', icon: PlusCircleIcon },
];

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { stats, leads, search, setSearch } = useLeads();
  const location = useLocation();

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!showProfile) return;
    const h = () => setShowProfile(false);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, [showProfile]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={cn(
        'fixed inset-y-0 left-0 lg:static flex flex-col bg-white border-r border-surface-200 transition-all duration-300 flex-shrink-0 z-50',
        collapsed ? 'w-16' : 'w-64',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className={cn('flex items-center h-16 px-4 border-b border-surface-100', (collapsed && !mobileMenuOpen) ? 'justify-center' : 'gap-3')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <span className="text-sm font-bold text-surface-900">LeadAI</span>
              <span className="ml-1.5 text-[10px] font-semibold bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-md">CRM</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className={({ isActive }) =>
                cn('nav-item', isActive ? 'nav-item-active' : 'nav-item-inactive', (collapsed && !mobileMenuOpen) && 'justify-center px-2')
              }
            >
              <Icon size={18} />
              {(!collapsed || mobileMenuOpen) && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Stats summary (Desktop only or expanded mobile) */}
        {(!collapsed || mobileMenuOpen) && stats && (
          <div className="p-3 border-t border-surface-100">
            <div className="rounded-xl bg-surface-50 p-3 space-y-2">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Quick Stats</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Total', value: stats.totalLeads, color: 'text-brand-600' },
                  { label: 'Won', value: stats.wonLeads, color: 'text-success-500' },
                  { label: 'Qualified', value: stats.qualifiedLeads, color: 'text-warning-500' },
                  { label: 'Avg Score', value: stats.avgScore, color: 'text-surface-700' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <p className="text-xs text-surface-400">{label}</p>
                    <p className={cn('text-sm font-bold', color)}>{value ?? '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle (Desktop only) */}
        <div className="hidden lg:block p-3 border-t border-surface-100">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn('w-full flex items-center gap-2 px-2 py-2 rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-900 transition-all text-sm font-medium', collapsed && 'justify-center')}
          >
            <CollapseIcon size={16} flipped={collapsed} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-surface-500 hover:bg-surface-50 transition-colors"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-surface-900">
                {NAV_ITEMS.find(n => n.exact ? location.pathname === n.path : location.pathname.startsWith(n.path))?.label || 'LeadAI'}
              </h1>
              <p className="text-[10px] text-surface-400 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative group">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-24 xs:w-32 sm:w-48 pl-8 pr-8 py-1.5 text-xs sm:text-sm bg-surface-100 border-0 rounded-xl text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-0.5"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <div 
                onClick={() => setShowProfile(!showProfile)}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:shadow-lg transition-all active:scale-95"
              >
                A
              </div>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-surface-100 py-2 z-50 animate-fade-in origin-top-right">
                  <div className="px-4 py-2 border-b border-surface-50 mb-1">
                    <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Gym Profile</p>
                    <p className="text-sm font-bold text-surface-900 mt-0.5">FitLift Elite Gym</p>
                  </div>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50 hover:text-brand-600 transition-colors">
                    <span>⚙️</span> Settings
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger-500 hover:bg-danger-50 transition-colors">
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Inline Icons ──────────────────────────────────────────────────────────────
function GridIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  );
}
function UsersIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function KanbanIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  );
}
function PlusCircleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function CollapseIcon({ size = 16, flipped }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: flipped ? 'rotate(180deg)' : undefined, transition: 'transform 0.3s' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
  );
}
