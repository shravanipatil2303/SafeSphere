const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE || 'SAFESPHERE_ADMIN_2026';

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('[SafeSphere Backend] Gemini API initialized securely on server.');
  } catch (e) {
    console.log('[SafeSphere Backend] @google/generative-ai package not available on server.');
  }
} else {
  console.log('[SafeSphere Backend] GEMINI_API_KEY not set. Using local agentic intelligence engine.');
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371;
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
}

function fallbackAnalyzeIncident(data) {
  const { type, description, location, latitude, longitude, existingIncidents = [] } = data;
  const descLower = (description || '').toLowerCase();

  let evidenceScore = 0.75;
  let evidenceAssessment = 'Clear citizen text report received.';
  if (data.mediaUrl) {
    evidenceScore += 0.2;
    evidenceAssessment += ' High-credibility photo/media evidence attached.';
  }
  if (descLower.length > 80) evidenceScore += 0.05;
  evidenceScore = Math.min(0.98, evidenceScore);

  let severity = 'Medium';
  if (
    descLower.includes('severe') ||
    descLower.includes('submerged') ||
    descLower.includes('collapse') ||
    descLower.includes('trapped') ||
    descLower.includes('fire') ||
    descLower.includes('critical') ||
    descLower.includes('casualty')
  ) {
    severity = 'Critical';
  } else if (
    descLower.includes('blocked') ||
    descLower.includes('damaged') ||
    descLower.includes('landslide') ||
    descLower.includes('rising') ||
    descLower.includes('danger')
  ) {
    severity = 'High';
  } else if (descLower.includes('minor') || descLower.includes('small')) {
    severity = 'Low';
  }

  let matchedClusterId = null;
  let isDuplicate = false;
  if (Array.isArray(existingIncidents) && existingIncidents.length > 0) {
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    for (const inc of existingIncidents) {
      if (inc.type === type) {
        const dist = haversineDistance(latNum, lngNum, parseFloat(inc.latitude), parseFloat(inc.longitude));
        if (dist <= 2.5) {
          matchedClusterId = inc.cluster_id || inc.id;
          isDuplicate = true;
          break;
        }
      }
    }
  }
  const clusterId = matchedClusterId || `cluster-${Date.now().toString(36)}`;

  let priority = severity;
  if (isDuplicate && (severity === 'High' || severity === 'Critical')) {
    priority = 'Critical';
  }

  let recommendedResponse = 'Dispatch first responder unit for site verification and traffic management.';
  if (type === 'Flood') {
    recommendedResponse = 'Deploy water rescue team, issue localized evacuation warning, and set up road diversions.';
  } else if (type === 'Landslide') {
    recommendedResponse = 'Dispatch heavy earth-moving equipment, clear debris, and evacuate downhill structures.';
  } else if (type === 'Road Blockage' || type === 'Fallen Tree') {
    recommendedResponse = 'Alert municipal public works authority and traffic police for rapid clearance.';
  } else if (type === 'Fire') {
    recommendedResponse = 'Immediately dispatch fire brigade units, establish safety perimeter, and isolate gas/power lines.';
  } else if (type === 'Infrastructure Damage') {
    recommendedResponse = 'Send structural assessment engineers to inspect stability and cordon off affected zone.';
  }

  const aiSummary = `${type} incident reported at ${location || 'specified coordinates'}. ${
    isDuplicate ? 'Identified as duplicate report clustered with existing incident.' : 'Initial report received.'
  } Severity evaluated as ${severity.toUpperCase()}.`;

  return {
    ai_summary: aiSummary,
    severity,
    priority,
    ai_confidence: Number(evidenceScore.toFixed(2)),
    evidence_assessment: evidenceAssessment,
    recommended_response: recommendedResponse,
    cluster_id: clusterId,
    is_duplicate: isDuplicate,
    extracted_location: location || `${latitude}, ${longitude}`
  };
}

app.post('/api/analyze-incident', async (req, res) => {
  try {
    const { type, description, location, latitude, longitude, mediaUrl } = req.body;

    if (!genAI) {
      const fallbackResult = fallbackAnalyzeIncident(req.body);
      return res.json({
        success: true,
        source: 'local_agentic_engine',
        data: fallbackResult
      });
    }

    const model = genAI.getGenerativeAIModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are the SafeSphere Incident Intelligence AI Agent. Analyze this disaster report:
Type: ${type}
Description: ${description}
Location: ${location} (Lat: ${latitude}, Lng: ${longitude})
Has Photo: ${mediaUrl ? 'Yes' : 'No'}

Return ONLY a valid JSON object:
{
  "ai_summary": "Concise disaster summary",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "priority": "Low" | "Medium" | "High" | "Critical",
  "ai_confidence": number 0.5-0.99,
  "evidence_assessment": "Brief evidence credibility statement",
  "recommended_response": "Emergency response recommendation",
  "extracted_location": "Location string"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Parsing failed');

    const aiParsed = JSON.parse(jsonMatch[0]);
    const localClusterInfo = fallbackAnalyzeIncident(req.body);

    return res.json({
      success: true,
      source: 'gemini_api_server',
      data: {
        ...aiParsed,
        cluster_id: localClusterInfo.cluster_id,
        is_duplicate: localClusterInfo.is_duplicate
      }
    });
  } catch (err) {
    const fallbackResult = fallbackAnalyzeIncident(req.body);
    return res.json({
      success: true,
      source: 'local_fallback_after_error',
      data: fallbackResult
    });
  }
});

app.post('/api/admin/verify-code', (req, res) => {
  const { inviteCode } = req.body;
  if (!inviteCode || inviteCode.trim() !== ADMIN_INVITE_CODE.trim()) {
    return res.status(403).json({
      success: false,
      valid: false,
      error: 'Invalid admin authorization code. Access denied.'
    });
  }
  return res.json({
    success: true,
    valid: true,
    message: 'Admin authorization code verified.'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'SafeSphere Emergency Intelligence Platform',
    gemini_enabled: !!genAI
  });
});

app.listen(PORT, () => {
  console.log(`[SafeSphere Server Proxy] Running on http://localhost:${PORT}`);
});
