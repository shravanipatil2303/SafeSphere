import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getIncidents } from '../../services/incidentStore';
import { AlertTriangle, Clock, CheckCircle2, Eye, Plus, ArrowRight, ShieldCheck } from 'lucide-react';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserIncidents();
  }, [user]);

  const loadUserIncidents = async () => {
    setLoading(true);
    try {
      // In demo mode or user context, fetch user-relevant reports
      const data = await getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const total = incidents.length;
  const pending = incidents.filter(i => i.status === 'Pending').length;
  const inProgress = incidents.filter(i => i.status === 'In Progress' || i.status === 'Seen').length;
  const resolved = incidents.filter(i => i.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome & Quick Action Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>SafeSphere Citizen Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p className="mt-1 text-slate-300 text-sm max-w-xl">
            Report community hazards and track real-time emergency responder actions powered by Agentic AI.
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-bold transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Report New Incident</span>
        </Link>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="saas-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reports</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{total}</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="saas-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{pending}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="saas-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress / Actioned</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{inProgress}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="saas-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved Cases</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{resolved}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="saas-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Incident Submissions</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track live authority status and AI severity analysis</p>
          </div>
          <Link
            to="/citizen/reports"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Loading incident records...
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertTriangle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No Incidents Reported Yet</p>
            <p className="text-xs text-slate-500 mt-1">Submit a report if you notice flooding, landslides, or infrastructure hazards.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {incidents.slice(0, 4).map((inc) => (
              <div key={inc.id} className="p-5 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-bold text-slate-900 text-sm">{inc.type}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      inc.severity === 'Critical' ? 'badge-critical' :
                      inc.severity === 'High' ? 'badge-high' :
                      inc.severity === 'Medium' ? 'badge-medium' : 'badge-low'
                    }`}>
                      {inc.severity} Severity
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      inc.status === 'Resolved' ? 'badge-resolved' :
                      inc.status === 'In Progress' ? 'badge-in-progress' :
                      inc.status === 'Seen' ? 'badge-seen' : 'badge-pending'
                    }`}>
                      ? {inc.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{inc.description}</p>
                  <p className="text-xs text-slate-400">{inc.location} • {new Date(inc.created_at).toLocaleString()}</p>
                </div>

                <Link
                  to="/citizen/reports"
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 bg-white transition self-start sm:self-center"
                >
                  View Status & Updates
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
