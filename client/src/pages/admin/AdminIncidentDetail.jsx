import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getIncidentById, updateIncidentStatus } from '../../services/incidentStore';
import { ShieldCheck, Sparkles, AlertTriangle, Layers, MapPin, CheckCircle2, Clock, Send, ArrowLeft, Camera, Eye } from 'lucide-react';

export const AdminIncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();

  const [incident, setIncident] = useState(null);
  const [similarReports, setSimilarReports] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status & Message Form State
  const [status, setStatus] = useState('Seen');
  const [message, setMessage] = useState('');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadIncidentData();
  }, [id]);

  const loadIncidentData = async () => {
    setLoading(true);
    try {
      const res = await getIncidentById(id);
      if (res) {
        setIncident(res.incident);
        setSimilarReports(res.similarReports || []);
        setUpdates(res.updates || []);
        setStatus(res.incident.status || 'Seen');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSeen = async () => {
    if (!incident) return;
    setUpdating(true);
    try {
      await updateIncidentStatus(incident.id, 'Seen', adminUser, 'Incident opened and acknowledged by Disaster Control Center.');
      setFeedback('Incident marked as SEEN.');
      loadIncidentData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!incident) return;
    setUpdating(true);
    setFeedback('');
    try {
      await updateIncidentStatus(incident.id, status, adminUser, message);
      setFeedback('Status update & response message published successfully!');
      setMessage('');
      loadIncidentData();
    } catch (err) {
      console.error(err);
      setFeedback('Failed to update incident.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
        Loading Incident Intelligence File...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Incident Record Not Found</h2>
        <Link to="/admin/dashboard" className="text-sm font-semibold text-blue-600 mt-2 block">
          Return to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-mono">ID: {incident.id}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                incident.status === 'Resolved' ? 'badge-resolved' :
                incident.status === 'In Progress' ? 'badge-in-progress' :
                incident.status === 'Seen' ? 'badge-seen' : 'badge-pending'
              }`}>
                Current Status: {incident.status}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {incident.type} Case Analysis
            </h1>
          </div>
        </div>

        {/* Quick Mark Seen Action */}
        {!incident.admin_seen && (
          <button
            onClick={handleMarkSeen}
            disabled={updating}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            <span>Mark Incident as Seen</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium">
          {feedback}
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 cols): Citizen Report & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Citizen Report Card */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Citizen Submitted Evidence</span>
              <span className="text-xs text-slate-400 font-normal">
                {new Date(incident.created_at).toLocaleString()}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block">Reporting Citizen:</span>
                <span className="text-slate-900 font-bold">{incident.user_name || 'Citizen'} ({incident.user_email})</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Geospatial Coordinates:</span>
                <span className="text-slate-900 font-mono">{incident.latitude}, {incident.longitude}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold block mb-1">Declared Location:</span>
              <div className="flex items-center space-x-1 text-sm font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{incident.location}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold block mb-1">Full Description:</span>
              <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200/60 font-medium">
                {incident.description}
              </p>
            </div>

            {/* Media Upload / Photo Evidence */}
            {incident.media_url ? (
              <div>
                <span className="text-xs text-slate-500 font-semibold block mb-2">Attached Photo Evidence:</span>
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-80 bg-slate-900">
                  <img src={incident.media_url} alt="Evidence" className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 flex items-center space-x-2">
                <Camera className="w-4 h-4 text-slate-400" />
                <span>No photographic media uploaded with this report.</span>
              </div>
            )}
          </div>

          {/* AI Agentic Analysis Panel */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl space-y-6 shadow-xl border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold tracking-tight text-white">Agentic AI Intelligence Report</h3>
              </div>
              <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                Confidence: {Math.round((incident.ai_confidence || 0.85) * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Severity</span>
                <span className={`text-sm font-extrabold block mt-0.5 ${
                  incident.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {incident.severity}
                </span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Priority</span>
                <span className={`text-sm font-extrabold block mt-0.5 ${
                  incident.priority === 'Critical' ? 'text-purple-400' : 'text-orange-400'
                }`}>
                  {incident.priority}
                </span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Category</span>
                <span className="text-sm font-bold text-white block mt-0.5">{incident.type}</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Cluster ID</span>
                <span className="text-xs font-mono text-purple-300 block truncate mt-0.5">
                  {incident.cluster_id || 'Single'}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Synthesized Disaster Summary:</span>
                <p className="text-slate-200 text-sm leading-relaxed">{incident.ai_summary}</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Evidence Credibility Assessment:</span>
                <p className="text-slate-300">{incident.evidence_assessment || 'Verified textual report.'}</p>
              </div>

              <div className="bg-blue-950/60 p-4 rounded-xl border border-blue-800/80 space-y-1">
                <span className="text-blue-300 font-bold uppercase tracking-wider text-[10px]">
                  Recommended Response Procedure:
                </span>
                <p className="text-blue-100 text-xs font-medium leading-relaxed">
                  {incident.recommended_response}
                </p>
              </div>
            </div>
          </div>

          {/* Similar Reports & Duplicate Cluster Section */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Similar Clustered Disaster Reports</h3>
              </div>
              <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full">
                {similarReports.length + 1} Total In Cluster
              </span>
            </div>

            {similarReports.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 italic">
                No duplicate or similar citizen reports identified for this spatial cluster.
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  AI Agentic duplicate detection grouped the following citizen reports into the same incident cluster based on type, spatial proximity (~2.5km), and time window:
                </p>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {similarReports.map((sim) => (
                    <div key={sim.id} className="p-4 bg-white hover:bg-slate-50 transition flex items-start justify-between gap-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{sim.user_name || 'Citizen'}</span>
                          <span className="text-slate-400">• {new Date(sim.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-700">{sim.description}</p>
                        <p className="text-slate-400 font-mono text-[10px]">{sim.location}</p>
                      </div>

                      <Link
                        to={`/admin/incident/${sim.id}`}
                        className="text-xs font-bold text-purple-600 hover:text-purple-700 flex-shrink-0"
                      >
                        Inspect ?
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1 col): Action Controls & Update Dispatcher */}
        <div className="space-y-6">
          
          {/* Action / Status Update Box */}
          <div className="saas-card p-6 space-y-5">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3>Admin Action & Response Control</h3>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Update Incident Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Seen">Seen (Acknowledged)</option>
                  <option value="In Progress">In Progress (Responder Dispatched)</option>
                  <option value="Resolved">Resolved (Hazard Cleared)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Admin Message for Citizen *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. NDRF rescue team dispatched with motorboats. Road diversions active."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This message will immediately be visible to the reporting citizen on their "My Reports" page.
                </p>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{updating ? 'Publishing Update...' : 'Publish Update to Citizen'}</span>
              </button>
            </form>
          </div>

          {/* Admin Updates History */}
          <div className="saas-card p-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
              Published Admin Updates Log
            </h4>

            {updates.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No admin response messages published yet.</p>
            ) : (
              <div className="space-y-3">
                {updates.map((upd) => (
                  <div key={upd.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{upd.admin_name || 'Authority Desk'}</span>
                      <span className="text-[10px] text-slate-400">{new Date(upd.created_at).toLocaleTimeString()}</span>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {upd.status}
                    </span>
                    <p className="text-slate-700 font-medium">{upd.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
