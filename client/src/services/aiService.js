/**
 * SafeSphere AI / Agentic Layer
 * Modular disaster intelligence processing pipeline
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_SERVER_URL || 'http://localhost:5000';

/**
 * Agent 1: Evidence & Verification Agent
 */
export const verifyEvidence = (mediaUrl, description = '') => {
  let score = 0.70;
  let assessment = 'Citizen text report submitted.';
  if (mediaUrl) {
    score += 0.22;
    assessment += ' Verified photo/video evidence attached.';
  }
  if (description.length > 100) {
    score += 0.05;
    assessment += ' Detailed situational description provided.';
  }
  return {
    confidenceScore: Number(Math.min(0.98, score).toFixed(2)),
    evidenceAssessment: assessment
  };
};

/**
 * Agent 2: Haversine distance calculator for geographical proximity
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Agent 3: Duplicate & Clustering Agent
 */
export const detectDuplicates = (newIncident, existingIncidents = []) => {
  if (!existingIncidents || existingIncidents.length === 0) {
    return { isDuplicate: false, clusterId: `cluster-${Date.now().toString(36)}`, matchedIncident: null };
  }

  const { type, latitude, longitude, description = '' } = newIncident;
  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);

  for (const inc of existingIncidents) {
    if (inc.type === type) {
      const dist = calculateDistance(latNum, lngNum, parseFloat(inc.latitude), parseFloat(inc.longitude));
      // Proximity threshold: 2.5 km
      if (dist <= 2.5) {
        return {
          isDuplicate: true,
          clusterId: inc.cluster_id || inc.id || `cluster-${inc.type.toLowerCase()}-1`,
          matchedIncident: inc
        };
      }
    }
  }

  return { isDuplicate: false, clusterId: `cluster-${Date.now().toString(36)}`, matchedIncident: null };
};

/**
 * Agent 4: Severity Agent
 */
export const calculateSeverity = (type, description = '', evidenceScore = 0.8) => {
  const descLower = description.toLowerCase();
  
  if (
    descLower.includes('severe') ||
    descLower.includes('submerged') ||
    descLower.includes('trapped') ||
    descLower.includes('casualties') ||
    descLower.includes('explosion') ||
    descLower.includes('critical') ||
    type === 'Fire'
  ) {
    return 'Critical';
  }
  if (
    descLower.includes('blocked') ||
    descLower.includes('damaged') ||
    descLower.includes('rising water') ||
    descLower.includes('power loss') ||
    type === 'Landslide' ||
    type === 'Infrastructure Damage'
  ) {
    return 'High';
  }
  if (descLower.includes('minor') || descLower.includes('small') || descLower.includes('slow')) {
    return 'Low';
  }

  return 'Medium';
};

/**
 * Agent 5: Priority Agent
 */
export const calculatePriority = (severity, isDuplicate = false, clusterCount = 1) => {
  if (severity === 'Critical') return 'Critical';
  if (severity === 'High') {
    return clusterCount > 1 ? 'Critical' : 'High';
  }
  if (severity === 'Medium') {
    return clusterCount > 2 ? 'High' : 'Medium';
  }
  return 'Low';
};

/**
 * Agent 6: Response Coordination Agent
 */
export const generateResponse = (type, severity, priority, description = '') => {
  let actions = [];
  
  switch (type) {
    case 'Flood':
      actions.push('Deploy water rescue team and inflatable craft.');
      actions.push('Issue localized emergency evacuation advisory.');
      actions.push('Erect temporary barrier dams and divert traffic.');
      break;
    case 'Landslide':
      actions.push('Dispatch heavy excavator machinery and search-and-rescue teams.');
      actions.push('Evacuate downhill residences within 500m zone.');
      actions.push('Block affected mountain transit routes.');
      break;
    case 'Road Blockage':
    case 'Fallen Tree':
      actions.push('Alert municipal public works and tree clearing crews.');
      actions.push('Setup traffic diversion cones and high-visibility signs.');
      break;
    case 'Fire':
      actions.push('Dispatch fire brigade units and emergency medical technicians.');
      actions.push('Cordon off 200m perimeter and shut off gas/power lines.');
      break;
    case 'Infrastructure Damage':
      actions.push('Send structural assessment engineers to verify building stability.');
      actions.push('Restrict heavy vehicle movement over affected bridge/road.');
      break;
    default:
      actions.push('Dispatch local patrol unit for immediate site assessment.');
  }

  if (severity === 'Critical' || priority === 'Critical') {
    actions.unshift('URGENT: Escalate case to Regional Disaster Management Command.');
  }

  return actions.join(' ');
};

/**
 * Master Pipeline Orchestrator: analyzeIncident
 */
export const analyzeIncident = async (reportData, existingIncidents = []) => {
  // Attempt to process via server proxy (for Gemini API)
  try {
    const res = await fetch(`${BACKEND_URL}/api/analyze-incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...reportData, existingIncidents })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[SafeSphere Client AI] Backend server proxy offline. Using client agentic pipeline fallback.');
  }

  // Fallback Local Agentic Pipeline
  const evidenceRes = verifyEvidence(reportData.media_url || reportData.mediaUrl, reportData.description);
  const dupRes = detectDuplicates(reportData, existingIncidents);
  const severity = calculateSeverity(reportData.type, reportData.description, evidenceRes.confidenceScore);
  const priority = calculatePriority(severity, dupRes.isDuplicate, dupRes.isDuplicate ? 2 : 1);
  const recommendedResponse = generateResponse(reportData.type, severity, priority, reportData.description);

  const aiSummary = `${reportData.type} report received for ${reportData.location || 'specified coordinates'}. ${
    dupRes.isDuplicate ? 'Identified as cluster duplicate.' : 'Initial report processed.'
  } Evaluated severity: ${severity.toUpperCase()}.`;

  return {
    ai_summary: aiSummary,
    severity,
    priority,
    ai_confidence: evidenceRes.confidenceScore,
    evidence_assessment: evidenceRes.evidenceAssessment,
    recommended_response: recommendedResponse,
    cluster_id: dupRes.clusterId,
    is_duplicate: dupRes.isDuplicate,
    extracted_location: reportData.location || `${reportData.latitude}, ${reportData.longitude}`
  };
};
