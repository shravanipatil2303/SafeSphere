import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getIncidents } from '../../services/incidentStore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertOctagon, ShieldAlert, Eye, CheckCircle2, Filter, Search, MapPin, ArrowRight, Layers } from 'lucide-react';
import L from 'leaflet';

// Color-coded Leaflet markers based on severity
const createSeverityIcon = (severity) => {
  let color = '#2563eb'; // blue
  if (severity === 'Critical') color = '#dc2626'; // red
  else if (severity === 'High') color = '#ea580c'; // orange
  else if (severity === 'Medium') color = '#ca8a04'; // yellow
  else if (severity === 'Low') color = '#16a34a'; // green

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" stroke="#ffffff" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30]
  });
};

export const AdminDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [typeFilter, setTypeFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredIncidents = incidents.filter((inc) => {
    if (typeFilter !== 'All' && inc.type !== typeFilter) return false;
    if (severityFilter !== 'All' && inc.severity !== severityFilter) return false;
    if (priorityFilter !== 'All' && inc.priority !== priorityFilter) return false;
    if (statusFilter !== 'All' && inc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLoc = (inc.location || '').toLowerCase().includes(q);
      const matchDesc = (inc.description || '').toLowerCase().includes(q);
      const matchType = (inc.type || '').toLowerCase().includes(q);
      if (!matchLoc && !matchDesc && !matchType) return false;
    }
    return true;
  });

  // Metrics
  const totalCount = incidents.length;
  const criticalCount = incidents.filter((i) => i.severity === 'Critical').length;
  const highPriorityCount = incidents.filter((i) => i.priority === 'High' || i.priority === 'Critical').length;
  const pendingCount = incidents.filter((i) => i.status === 'Pending').length;
  const resolvedCount = incidents.filter((i) => i.status === 'Resolved').length;

  // Recharts Data Transformation
  const typeCountsMap = {};
  incidents.forEach((i) => {
    typeCountsMap[i.type] = (typeCountsMap[i.type] || 0) + 1;
  });
  const chartData = Object.keys(typeCountsMap).map((key) => ({
    name: key,
    count: typeCountsMap[key]
  }));

  const COLORS = ['#2563eb', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#8b5cf6', '#64748b'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency Management Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Authority Incident Command Dashboard
          </h1>
        </div>

        <button
          onClick={fetchData}
          className="self-start md:self-center px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition"
        >
          Refresh Live Intelligence Feed
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="saas-card p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Reports</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</p>
        </div>

        <div className="saas-card p-4 border-l-4 border-l-red-600">
          <p className="text-xs font-semibold text-red-600 uppercase">Critical Severity</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{criticalCount}</p>
        </div>

        <div className="saas-card p-4 border-l-4 border-l-orange-500">
          <p className="text-xs font-semibold text-orange-600 uppercase">High/Critical Priority</p>
          <p className="text-2xl font-extrabold text-orange-600 mt-1">{highPriorityCount}</p>
        </div>

        <div className="saas-card p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-amber-600 uppercase">Pending Review</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
        </div>

        <div className="saas-card p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Resolved</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Interactive Map & Recharts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leaflet Interactive Map (2 cols) */}
        <div className="lg:col-span-2 saas-card p-4 space-y-3 flex flex-col h-[460px]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Geospatial Incident Location Map</span>
            </h3>
            <span className="text-xs text-slate-500">Showing {filteredIncidents.length} active markers</span>
          </div>

          <div className="flex-1 rounded-lg overflow-hidden border border-slate-200">
            <MapContainer
              center={[18.5204, 73.8567]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {filteredIncidents.map((inc) => (
                <Marker
                  key={inc.id}
                  position={[parseFloat(inc.latitude), parseFloat(inc.longitude)]}
                  icon={createSeverityIcon(inc.severity)}
                >
                  <Popup>
                    <div className="p-1 space-y-1 max-w-xs text-xs font-sans">
                      <div className="flex items-center justify-between font-bold">
                        <span>{inc.type}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          inc.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {inc.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-2">{inc.description}</p>
                      <p className="text-[10px] text-slate-400">{inc.location}</p>
                      <Link
                        to={`/admin/incident/${inc.id}`}
                        className="block text-center mt-2 bg-blue-600 text-white font-bold py-1 px-2 rounded text-[11px] hover:bg-blue-500"
                      >
                        Inspect Incident Case ?
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Recharts Analytics Chart (1 col) */}
        <div className="saas-card p-4 space-y-4 h-[460px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Incident Breakdown by Category</h3>
            <p className="text-xs text-slate-500">Distribution of reported disaster types</p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600">
            <span className="font-bold text-slate-900">Intelligence Note:</span> Floods and Road Blockages account for the majority of active community reports.
          </div>
        </div>

      </div>

      {/* Multi-Parameter Filter Toolbar */}
      <div className="saas-card p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 font-bold text-sm text-slate-800">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Incident Filter & Search Operations</span>
          </div>
          <button
            onClick={() => {
              setTypeFilter('All');
              setSeverityFilter('All');
              setPriorityFilter('All');
              setStatusFilter('All');
              setSearchQuery('');
            }}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location/text..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
          >
            <option value="All">All Types</option>
            <option value="Flood">Flood</option>
            <option value="Landslide">Landslide</option>
            <option value="Road Blockage">Road Blockage</option>
            <option value="Fallen Tree">Fallen Tree</option>
            <option value="Infrastructure Damage">Infrastructure Damage</option>
            <option value="Fire">Fire</option>
            <option value="Other">Other</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Seen">Seen</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

        </div>
      </div>

      {/* Incident List Table */}
      <div className="saas-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Incidents Queue ({filteredIncidents.length} matching)
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Loading authority records...
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No incidents found matching current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-3">Type & Location</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Duplicate Cluster</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 space-y-0.5">
                      <p className="font-bold text-slate-900">{inc.type}</p>
                      <p className="text-slate-500 text-[11px]">{inc.location}</p>
                    </td>

                    <td className="p-3 max-w-xs">
                      <p className="text-slate-700 line-clamp-2 text-[11px]">{inc.description}</p>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        inc.severity === 'Critical' ? 'badge-critical' :
                        inc.severity === 'High' ? 'badge-high' :
                        inc.severity === 'Medium' ? 'badge-medium' : 'badge-low'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        inc.priority === 'Critical' ? 'bg-purple-100 text-purple-700' :
                        inc.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {inc.priority}
                      </span>
                    </td>

                    <td className="p-3">
                      {inc.cluster_id ? (
                        <span className="inline-flex items-center space-x-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">
                          <Layers className="w-3 h-3" />
                          <span>Clustered</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Single Report</span>
                      )}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        inc.status === 'Resolved' ? 'badge-resolved' :
                        inc.status === 'In Progress' ? 'badge-in-progress' :
                        inc.status === 'Seen' ? 'badge-seen' : 'badge-pending'
                      }`}>
                        {inc.status}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <Link
                        to={`/admin/incident/${inc.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition"
                      >
                        <span>Open Incident</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
