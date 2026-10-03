import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { CitizenRoute, AdminRoute } from './components/ProtectedRoutes';

import { CitizenLogin } from './pages/citizen/CitizenLogin';
import { CitizenSignup } from './pages/citizen/CitizenSignup';
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { ReportIncident } from './pages/citizen/ReportIncident';
import { MyReports } from './pages/citizen/MyReports';

import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminSignup } from './pages/admin/AdminSignup';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminIncidentDetail } from './pages/admin/AdminIncidentDetail';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/citizen/dashboard" replace />} />

              {/* Citizen Public Auth Routes */}
              <Route path="/citizen/login" element={<CitizenLogin />} />
              <Route path="/citizen/signup" element={<CitizenSignup />} />

              {/* Citizen Protected Routes */}
              <Route element={<CitizenRoute />}>
                <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
                <Route path="/citizen/report" element={<ReportIncident />} />
                <Route path="/citizen/reports" element={<MyReports />} />
              </Route>

              {/* Admin Public Auth Routes (Invite Code Required on Signup) */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/signup" element={<AdminSignup />} />

              {/* Admin Protected Authority Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/incident/:id" element={<AdminIncidentDetail />} />
              </Route>

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/citizen/dashboard" replace />} />
            </Routes>
          </main>

          <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>&copy; 2026 SafeSphere - Agentic AI Community Disaster Intelligence Platform</p>
              <p className="text-slate-500">Emergency Response Command & Citizen Co-Production</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
