import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getIncidents, getIncidentUpdates } from '../../services/incidentStore';
import { AlertTriangle, Clock, CheckCircle2, MessageSquare, ChevronDown, ChevronUp, Sparkles, MapPin, ShieldCheck } from 'lucide-react';

export const MyReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updatesMap, setUpdatesMap] = useState({});

  useEffect(() => {
    fetchMyReports();
  }, [user]);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const data = await getIncidents();
      setReports(data);

      // Fetch updates for all reports
      const updatesObj = {};
      for (const rep of data) {
        try {
          const { updates } = await getIncidentUpdates ? await getIncidentUpdates(rep.id) : { updates: [] };
          updatesObj[rep.id] = updates || [];
        } catch (e) {
          updatesObj[rep.id] = [];
        }
      }
      setUpdatesMap(updatesObj);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Disaster Incident Reports</h1>
        <p className="text-xs text-slate-500 mt-1">Track status updates and direct emergency authority responses</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          Loading your report history...
        </div>
      ) : reports.length === 0 ? (
        <div className="saas-card p-12 text-center text-slate-500">
          <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Incidents Submitted</h3>
          <p className="text-xs text-slate-500 mt-1">When you report an emergency, it will appear here with live status tracking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => {
            const isExpanded = expandedId === rep.id;
            const updates = updatesMap[rep.id] || [];

            return (
              <div key={rep.id} className="saas-card overflow-hidden">
                
                {/* Report Header Row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-bold text-slate-900 text-base">{rep.type}</span>
                      
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        rep.severity === 'Critical' ? 'badge-critical' :
                        rep.severity === 'High' ? 'badge-high' :
                        rep.severity === 'Medium' ? 'badge-medium' : 'badge-low'
                      }`}>
                        {rep.severity} Severity
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        rep.status === 'Resolved' ? 'badge-resolved' :
                        rep.status === 'In Progress' ? 'badge-in-progress' :
                        rep.status === 'Seen' ? 'badge-seen' : 'badge-pending'
                      }`}>
                        Status: {rep.status}
                      </span>

                      {rep.cluster_id && (
                        <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2 py-0.5 rounded-full font-semibold">
                          Clustered Report
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rep.location}</span>
                      <span>•</span>
                      <span>{new Date(rep.created_at).toLocaleString()}</span>
                    </div>

                    <p className="text-sm text-slate-700">{rep.description}</p>
                  </div>

                  <button
                    onClick={() => toggleExpand(rep.id)}
                    className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 self-start md:self-center px-3 py-2 bg-blue-50 rounded-lg transition"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View AI Analysis & Updates'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/70 border-t border-slate-100 space-y-6">
                    
                    {/* AI Agent Analysis Summary Box */}
                    <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm space-y-3">
                      <div className="flex items-center space-x-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Agentic AI Analysis Assessment</span>
                      </div>
                      
                      <p className="text-sm text-slate-800 font-medium">{rep.ai_summary}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                        <div>
                          <span className="font-semibold text-slate-500">Evidence Assessment:</span>
                          <p className="text-slate-700 mt-0.5">{rep.evidence_assessment || 'Verified'}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500">Recommended Action:</span>
                          <p className="text-slate-700 mt-0.5">{rep.recommended_response}</p>
                        </div>
                      </div>
                    </div>

                    {/* Admin Response & Updates Log */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Emergency Authority Updates & Response Log</span>
                      </div>

                      {updates.length === 0 ? (
                        <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 italic">
                          No direct messages published by disaster authorities yet. Status will update in real-time.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {updates.map((upd) => (
                            <div key={upd.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-900">{upd.admin_name || 'Disaster Control Authority'}</span>
                                <span className="text-slate-400">{new Date(upd.created_at).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  upd.status === 'Resolved' ? 'badge-resolved' :
                                  upd.status === 'In Progress' ? 'badge-in-progress' : 'badge-seen'
                                }`}>
                                  {upd.status}
                                </span>
                                <p className="text-xs text-slate-700 font-medium">{upd.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
