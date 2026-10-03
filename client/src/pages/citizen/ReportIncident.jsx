import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createIncident } from '../../services/incidentStore';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { AlertTriangle, MapPin, Camera, Sparkles, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import L from 'leaflet';

// Custom Leaflet marker icon
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Component to handle map clicks for lat/lng selection
function LocationPickerMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export const ReportIncident = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState('Flood');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Riverfront Ave, Pune');
  const [position, setPosition] = useState([18.5204, 73.8567]); // Default Lat/Lng
  const [datetime, setDatetime] = useState(new Date().toISOString().slice(0, 16));
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentStep, setAgentStep] = useState(0);
  const [error, setError] = useState('');

  const agentSteps = [
    { title: 'Incident Intelligence Agent', desc: 'Parsing classification and extract location' },
    { title: 'Verification & Evidence Agent', desc: 'Evaluating media credibility and textual clarity' },
    { title: 'Duplicate & Clustering Agent', desc: 'Running spatial-temporal proximity clustering' },
    { title: 'Severity & Priority Agent', desc: 'Calculating hazard severity and dispatch urgency' },
    { title: 'Response Coordination Agent', desc: 'Synthesizing response recommendations' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a description of the incident.');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    setAgentStep(0);

    // Simulate Agentic pipeline execution steps for visual wow factor
    const stepInterval = setInterval(() => {
      setAgentStep((prev) => {
        if (prev < agentSteps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 450);

    try {
      const payload = {
        type,
        description,
        location,
        latitude: position[0],
        longitude: position[1],
        incident_datetime: new Date(datetime).toISOString(),
        media_url: mediaUrl
      };

      await createIncident(payload, user);

      setTimeout(() => {
        setIsAnalyzing(false);
        navigate('/citizen/reports');
      }, 2500);

    } catch (err) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setError(err.message || 'Failed to submit incident. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Report Community Hazard / Incident</h1>
          <p className="text-xs text-slate-500">Provide details for instant AI Agent risk evaluation & authority dispatch</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="saas-card p-6 space-y-6">
          
          {/* Incident Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Incident Category *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white transition font-medium"
              >
                <option value="Flood">Flood / Waterlogging</option>
                <option value="Landslide">Landslide / Debris Fall</option>
                <option value="Road Blockage">Road Blockage</option>
                <option value="Fallen Tree">Fallen Tree / Power Cable</option>
                <option value="Infrastructure Damage">Infrastructure / Bridge Damage</option>
                <option value="Fire">Fire / Explosion</option>
                <option value="Other">Other Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Date & Time of Incident *
              </label>
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, water depth, blocked lanes, trapped vehicles, or visible damage..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Location Name & Interactive Map Coordinates */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Location Name / Landmark *
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Riverfront Ave, near main bridge"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Leaflet Map Picker */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Pin Exact Geolocation (Click Map)
                </label>
                <span className="text-xs text-slate-500 font-mono">
                  Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}
                </span>
              </div>

              <div className="h-64 rounded-lg overflow-hidden border border-slate-300">
                <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <LocationPickerMarker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Media Evidence Upload Simulation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Photo / Evidence Media URL (Optional)
            </label>
            <div className="relative">
              <Camera className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-1547683905..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>
            {mediaUrl && (
              <div className="mt-3 relative h-36 w-full max-w-xs rounded-lg overflow-hidden border border-slate-200">
                <img src={mediaUrl} alt="Evidence preview" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-semibold">
                  Preview Evidence
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-base shadow-md transition disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>Submit Incident & Run AI Agentic Analysis</span>
        </button>
      </form>

      {/* AI Agent Execution Progress Modal */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-full animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">SafeSphere AI Agents At Work</h3>
              <p className="text-xs text-slate-500">Processing report through modular disaster intelligence pipeline...</p>
            </div>

            <div className="space-y-3">
              {agentSteps.map((step, idx) => {
                const isCurrent = idx === agentStep;
                const isCompleted = idx < agentStep;
                return (
                  <div
                    key={idx}
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition ${
                      isCurrent
                        ? 'bg-blue-50/80 border-blue-200'
                        : isCompleted
                        ? 'bg-slate-50 border-slate-100 opacity-80'
                        : 'bg-white border-transparent opacity-40'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-xs font-bold ${isCurrent ? 'text-blue-900' : 'text-slate-800'}`}>
                        {step.title}
                      </p>
                      <p className="text-[11px] text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
