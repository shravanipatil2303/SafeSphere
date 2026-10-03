import { supabase, isDemoMode } from './supabaseClient';
import { analyzeIncident } from './aiService';

// Pre-populated Seed Dataset for Instant Demo Flow
const INITIAL_DEMO_INCIDENTS = [
  {
    id: 'inc-demo-flood-1',
    user_id: 'usr-citizen-1',
    user_name: 'Aarav Sharma',
    user_email: 'aarav@example.com',
    type: 'Flood',
    description: 'Major street flooding near Riverfront Ave. Water level rising rapidly above car tire height. Stalled traffic.',
    location: 'Riverfront Ave, Pune',
    latitude: 18.5204,
    longitude: 73.8567,
    incident_datetime: new Date(Date.now() - 3600000 * 2).toISOString(),
    media_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    severity: 'High',
    priority: 'Critical',
    ai_summary: 'Flood incident reported at Riverfront Ave, Pune. Evaluated severity: HIGH. Clustered with 2 similar local reports.',
    ai_confidence: 0.94,
    evidence_assessment: 'Verified text report + clear photo of submerged street. High credibility.',
    cluster_id: 'cluster-flood-riverfront',
    status: 'In Progress',
    admin_seen: true,
    recommended_response: 'Deploy water rescue team, issue localized evacuation warning, and set up road diversions.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'inc-demo-flood-2',
    user_id: 'usr-citizen-2',
    user_name: 'Priya Patel',
    user_email: 'priya@example.com',
    type: 'Flood',
    description: 'Severe waterlogging on Riverfront Road near main bridge. Water encroaching residential ground floors.',
    location: 'Riverfront Road Near Bridge, Pune',
    latitude: 18.5220,
    longitude: 73.8580,
    incident_datetime: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    media_url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
    severity: 'Critical',
    priority: 'Critical',
    ai_summary: 'Flood incident reported at Riverfront Road Near Bridge, Pune. Cluster duplicate detected.',
    ai_confidence: 0.91,
    evidence_assessment: 'Photo evidence confirms deep waterlogging.',
    cluster_id: 'cluster-flood-riverfront',
    status: 'Pending',
    admin_seen: false,
    recommended_response: 'Deploy water rescue team and set up road diversions.',
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    id: 'inc-demo-flood-3',
    user_id: 'usr-citizen-3',
    user_name: 'Rohan Mehta',
    user_email: 'rohan@example.com',
    type: 'Flood',
    description: 'Flooded road section on Lower Riverfront Road with stalled cars and submerged pavement.',
    location: 'Lower Riverfront Road, Pune',
    latitude: 18.5212,
    longitude: 73.8572,
    incident_datetime: new Date(Date.now() - 3600000 * 1).toISOString(),
    media_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    severity: 'High',
    priority: 'High',
    ai_summary: 'Flood incident reported at Lower Riverfront Road, Pune. Cluster duplicate detected.',
    ai_confidence: 0.88,
    evidence_assessment: 'Citizen text + photo evidence.',
    cluster_id: 'cluster-flood-riverfront',
    status: 'Pending',
    admin_seen: false,
    recommended_response: 'Deploy water pumps and traffic police.',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'inc-demo-blockage',
    user_id: 'usr-citizen-4',
    user_name: 'Siddharth Rao',
    user_email: 'siddharth@example.com',
    type: 'Road Blockage',
    description: 'Landslide debris and fallen rocks blocking Highway 4 bypass lane entirely. Vehicles queueing.',
    location: 'Highway 4 Pass, Pune',
    latitude: 18.5400,
    longitude: 73.8200,
    incident_datetime: new Date(Date.now() - 3600000 * 4).toISOString(),
    media_url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    severity: 'High',
    priority: 'High',
    ai_summary: 'Road Blockage reported at Highway 4 Pass, Pune. Rocks blocking dual carriageway.',
    ai_confidence: 0.92,
    evidence_assessment: 'Detailed description and location coordinates.',
    cluster_id: 'cluster-blockage-hwy4',
    status: 'Seen',
    admin_seen: true,
    recommended_response: 'Alert municipal public works authority and traffic police for rapid clearing.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'inc-demo-tree',
    user_id: 'usr-citizen-5',
    user_name: 'Ananya Deshmukh',
    user_email: 'ananya@example.com',
    type: 'Fallen Tree',
    description: 'Large banyan tree fallen across Sector 5 main junction, snapping overhead power cables.',
    location: 'Sector 5 Junction, Pune',
    latitude: 18.4900,
    longitude: 73.8800,
    incident_datetime: new Date(Date.now() - 3600000 * 6).toISOString(),
    media_url: '',
    severity: 'Medium',
    priority: 'High',
    ai_summary: 'Fallen Tree reported at Sector 5 Junction, Pune. Power line damage noted.',
    ai_confidence: 0.85,
    evidence_assessment: 'Clear citizen report received.',
    cluster_id: 'cluster-tree-sec5',
    status: 'Pending',
    admin_seen: false,
    recommended_response: 'Alert municipal public works authority and electrical utility crew for cable isolation.',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'inc-demo-infra',
    user_id: 'usr-citizen-6',
    user_name: 'Vikram Joshi',
    user_email: 'vikram@example.com',
    type: 'Infrastructure Damage',
    description: 'Cracks visible on bridge support pillar near South Canal crossing after heavy rainfall.',
    location: 'South Canal Bridge, Pune',
    latitude: 18.5100,
    longitude: 73.8300,
    incident_datetime: new Date(Date.now() - 3600000 * 8).toISOString(),
    media_url: '',
    severity: 'Critical',
    priority: 'Critical',
    ai_summary: 'Infrastructure Damage reported at South Canal Bridge, Pune. Critical bridge pillar inspection required.',
    ai_confidence: 0.89,
    evidence_assessment: 'High urgency structural report.',
    cluster_id: 'cluster-infra-canal',
    status: 'Resolved',
    admin_seen: true,
    recommended_response: 'Send structural assessment engineers to inspect stability and cordon off affected bridge zone.',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

const INITIAL_DEMO_UPDATES = [
  {
    id: 'upd-1',
    incident_id: 'inc-demo-flood-1',
    admin_id: 'usr-admin-1',
    admin_name: 'Disaster Control Desk',
    status: 'In Progress',
    message: 'National Disaster Response Force (NDRF) Team 3 dispatched with 2 motorboats to Riverfront Ave. Traffic diverted at North Gate.',
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'upd-2',
    incident_id: 'inc-demo-infra',
    admin_id: 'usr-admin-1',
    admin_name: 'Chief Structural Engineer',
    status: 'Resolved',
    message: 'Structural inspection completed. Bridge load limited to light vehicles, temporary steel shoring installed.',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

const getLocalIncidents = () => {
  const saved = localStorage.getItem('safesphere_demo_incidents');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  localStorage.setItem('safesphere_demo_incidents', JSON.stringify(INITIAL_DEMO_INCIDENTS));
  return INITIAL_DEMO_INCIDENTS;
};

const saveLocalIncidents = (incidents) => {
  localStorage.setItem('safesphere_demo_incidents', JSON.stringify(incidents));
};

const getLocalUpdates = () => {
  const saved = localStorage.getItem('safesphere_demo_updates');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  localStorage.setItem('safesphere_demo_updates', JSON.stringify(INITIAL_DEMO_UPDATES));
  return INITIAL_DEMO_UPDATES;
};

const saveLocalUpdates = (updates) => {
  localStorage.setItem('safesphere_demo_updates', JSON.stringify(updates));
};

export const getIncidents = async (filters = {}) => {
  if (!isDemoMode && supabase) {
    let query = supabase.from('incidents').select('*').order('created_at', { ascending: false });
    if (filters.type && filters.type !== 'All') query = query.eq('type', filters.type);
    if (filters.severity && filters.severity !== 'All') query = query.eq('severity', filters.severity);
    if (filters.priority && filters.priority !== 'All') query = query.eq('priority', filters.priority);
    if (filters.status && filters.status !== 'All') query = query.eq('status', filters.status);
    if (filters.userId) query = query.eq('user_id', filters.userId);

    const { data, error } = await query;
    if (error) {
      console.error('[SafeSphere DB Error]:', error);
      throw error;
    }
    return data;
  }

  let list = getLocalIncidents();
  if (filters.type && filters.type !== 'All') list = list.filter(i => i.type === filters.type);
  if (filters.severity && filters.severity !== 'All') list = list.filter(i => i.severity === filters.severity);
  if (filters.priority && filters.priority !== 'All') list = list.filter(i => i.priority === filters.priority);
  if (filters.status && filters.status !== 'All') list = list.filter(i => i.status === filters.status);
  if (filters.userId) list = list.filter(i => i.user_id === filters.userId);

  return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getIncidentUpdates = async (incidentId) => {
  if (!isDemoMode && supabase) {
    const { data, error } = await supabase
      .from('incident_updates')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: true });
    if (error) return { updates: [] };
    return { updates: data || [] };
  }

  const updates = getLocalUpdates().filter(u => u.incident_id === incidentId).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
  return { updates };
};

export const getIncidentById = async (id) => {
  if (!isDemoMode && supabase) {
    const { data: incident, error } = await supabase.from('incidents').select('*').eq('id', id).single();
    if (error || !incident) return null;

    let similarReports = [];
    if (incident.cluster_id) {
      const { data: clusterData } = await supabase
        .from('incidents')
        .select('*')
        .eq('cluster_id', incident.cluster_id)
        .neq('id', id);
      similarReports = clusterData || [];
    }

    const { data: updates } = await supabase
      .from('incident_updates')
      .select('*')
      .eq('incident_id', id)
      .order('created_at', { ascending: true });

    return { incident, similarReports, updates: updates || [] };
  }

  const list = getLocalIncidents();
  const incident = list.find(i => i.id === id);
  if (!incident) return null;

  const similarReports = list.filter(i => i.cluster_id === incident.cluster_id && i.id !== id);
  const updates = getLocalUpdates().filter(u => u.incident_id === id).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));

  return { incident, similarReports, updates };
};

export const createIncident = async (incidentPayload, user) => {
  const existingIncidents = await getIncidents();

  const aiResult = await analyzeIncident(incidentPayload, existingIncidents);

  const newIncidentObj = {
    id: `inc-${Date.now()}`,
    user_id: user?.id || 'usr-anon',
    user_name: user?.name || user?.email || 'Anonymous Citizen',
    user_email: user?.email || 'citizen@safesphere.org',
    type: incidentPayload.type,
    description: incidentPayload.description,
    location: incidentPayload.location,
    latitude: parseFloat(incidentPayload.latitude),
    longitude: parseFloat(incidentPayload.longitude),
    incident_datetime: incidentPayload.incident_datetime || new Date().toISOString(),
    media_url: incidentPayload.media_url || '',
    severity: aiResult.severity,
    priority: aiResult.priority,
    ai_summary: aiResult.ai_summary,
    ai_confidence: aiResult.ai_confidence,
    evidence_assessment: aiResult.evidence_assessment,
    cluster_id: aiResult.cluster_id,
    status: 'Pending',
    admin_seen: false,
    recommended_response: aiResult.recommended_response,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (!isDemoMode && supabase) {
    const { data, error } = await supabase.from('incidents').insert([newIncidentObj]).select().single();
    if (error) {
      console.error('[Supabase Insert Incident Error]:', error);
      throw error;
    }
    return data;
  }

  const currentList = getLocalIncidents();
  const updatedList = [newIncidentObj, ...currentList];
  saveLocalIncidents(updatedList);
  return newIncidentObj;
};

export const updateIncidentStatus = async (incidentId, newStatus, adminUser, message = '') => {
  if (!isDemoMode && supabase) {
    const { error: incErr } = await supabase
      .from('incidents')
      .update({
        status: newStatus,
        admin_seen: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', incidentId);

    if (incErr) throw incErr;

    if (message.trim()) {
      const updateObj = {
        incident_id: incidentId,
        admin_id: adminUser?.id,
        status: newStatus,
        message: message.trim(),
        created_at: new Date().toISOString()
      };
      await supabase.from('incident_updates').insert([updateObj]);
    }

    return true;
  }

  const list = getLocalIncidents();
  const idx = list.findIndex(i => i.id === incidentId);
  if (idx !== -1) {
    list[idx].status = newStatus;
    list[idx].admin_seen = true;
    list[idx].updated_at = new Date().toISOString();
    saveLocalIncidents(list);
  }

  if (message.trim()) {
    const updates = getLocalUpdates();
    const newUpd = {
      id: `upd-${Date.now()}`,
      incident_id: incidentId,
      admin_id: adminUser?.id || 'usr-admin-1',
      admin_name: adminUser?.name || 'Emergency Authority Admin',
      status: newStatus,
      message: message.trim(),
      created_at: new Date().toISOString()
    };
    updates.push(newUpd);
    saveLocalUpdates(updates);
  }

  return true;
};
