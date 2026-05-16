import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LeadsProvider } from './context/LeadsContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LeadsPage from './pages/LeadsPage';
import PipelinePage from './pages/PipelinePage';
import CapturePage from './pages/CapturePage';

export default function App() {
  return (
    <BrowserRouter>
      <LeadsProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/capture" element={<CapturePage />} />
          </Routes>
        </Layout>

        <Toaster
          position="bottom-right"
          gutter={8}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1a1f45',
              color: '#e8eaf0',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 12,
              padding: '10px 16px',
              boxShadow: '0 8px 32px rgba(14,20,60,0.2)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </LeadsProvider>
    </BrowserRouter>
  );
}
