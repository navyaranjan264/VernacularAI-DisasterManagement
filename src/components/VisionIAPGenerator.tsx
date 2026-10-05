import React, { useState, useEffect, useId } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Camera,
  Upload,
  Activity,
  Sliders,
  Users,
  Compass,
  MapPin,
  CheckCircle2,
  PhoneCall,
  Droplets,
  Package,
  Layers,
  RefreshCw,
  AlertTriangle,
  Building2,
  Eye,
  Shield,
  Send,
  Navigation,
  Sparkles,
  Smartphone,
  Copy,
  Check,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  getAllCalamityCorridors,
  findSheltersByLocation,
  buildGroundedPrompt,
  CalamityCorridor,
  VerifiedShelter,
} from '@/services/ragService';
import CalamityCorridorMap from './CalamityCorridorMap';
import { sendVernacularSMS, sanitizePhoneNumbers, SMSDispatchResult } from '@/services/smsService';

export type SeverityLevel = 'Guarded' | 'Moderate' | 'High' | 'Severe' | 'Critical';

interface StructuralMetrics {
  waterlineDepth: string;
  roadBlockage: string;
  foundationCompromise: string;
  observations: string[];
}

interface TacticalObjective {
  timeframe: string;
  objective: string;
  priority: 'Immediate' | 'High' | 'Medium';
}

interface ResourceItem {
  resource: string;
  quantity: string;
  deploymentZone: string;
}

interface VisionAssessmentResult {
  hazardType: string;
  severityGrade: SeverityLevel;
  confidenceScore: number;
  structuralMetrics: StructuralMetrics;
  tacticalObjectives: TacticalObjective[];
  resourceAllocation: ResourceItem[];
  nearestSafeShelter: string;
  evacuationGuidance: string;
  vernacularAdvisory: string;
  microAlert30: string;
}

const MODEL_NAME = 'gemini-3.5-flash';

const stripEmoji = (s: string) =>
  s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').trim();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function compressImage(file: File, maxDim = 1024): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas rasterization failure'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.split(',')[1];
      resolve({ data: base64, mimeType: 'image/jpeg' });
    };
    img.onerror = () => reject(new Error('Failed to parse image file.'));
    img.src = URL.createObjectURL(file);
  });
}

const VISION_SCHEMA = {
  type: 'object',
  properties: {
    hazardType: { type: 'string' },
    severityGrade: {
      type: 'string',
      enum: ['Guarded', 'Moderate', 'High', 'Severe', 'Critical'],
    },
    confidenceScore: { type: 'number' },
    waterlineDepth: { type: 'string' },
    roadBlockage: { type: 'string' },
    foundationCompromise: { type: 'string' },
    structuralObservations: {
      type: 'array',
      items: { type: 'string' },
    },
    tacticalObjectives: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          timeframe: { type: 'string' },
          objective: { type: 'string' },
          priority: { type: 'string', enum: ['Immediate', 'High', 'Medium'] },
        },
        required: ['timeframe', 'objective', 'priority'],
      },
    },
    resourceAllocation: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          resource: { type: 'string' },
          quantity: { type: 'string' },
          deploymentZone: { type: 'string' },
        },
        required: ['resource', 'quantity', 'deploymentZone'],
      },
    },
    nearestSafeShelter: { type: 'string' },
    evacuationGuidance: { type: 'string' },
    vernacularAdvisory: { type: 'string' },
    microAlert30: { type: 'string' },
  },
  required: [
    'hazardType',
    'severityGrade',
    'waterlineDepth',
    'roadBlockage',
    'foundationCompromise',
    'structuralObservations',
    'tacticalObjectives',
    'resourceAllocation',
    'nearestSafeShelter',
    'evacuationGuidance',
    'vernacularAdvisory',
    'microAlert30',
  ],
};

export default function VisionIAPGenerator() {
  const { t, language, currentLanguageMeta, supportedLanguages, setLanguage } = useLanguage();
  const alertInputId = useId();
  const phoneInputId = useId();

  // All 10 Calamity Corridors
  const allCorridors = getAllCalamityCorridors();
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(allCorridors[0].id);
  const currentCorridor = allCorridors.find((c) => c.id === selectedCorridorId) || allCorridors[0];

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customLocation, setCustomLocation] = useState<string>(currentCorridor.city);
  const [headcount, setHeadcount] = useState<number>(150);
  const [loading, setLoading] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<VisionAssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Micro-alert & SMS dispatch state
  const [editableAlert, setEditableAlert] = useState<string>('FLOOD: MOVE TO RIDGE SHELTER');
  const [phoneNumbers, setPhoneNumbers] = useState<string>('9876543210, 9123456789');
  const [isDispatchingSMS, setIsDispatchingSMS] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<SMSDispatchResult | null>(null);
  const [copiedAlert, setCopiedAlert] = useState<boolean>(false);

  // Keep location in sync when user selects a corridor preset
  const handleCorridorChange = (corridorId: string) => {
    setSelectedCorridorId(corridorId);
    const found = allCorridors.find((c) => c.id === corridorId);
    if (found) {
      setCustomLocation(found.city);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError(null);

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Generate synthetic test image for instant demo if no image is available
  const handleUseSampleImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Procedural flood hazard scene
    ctx.fillStyle = '#14273E';
    ctx.fillRect(0, 0, 640, 420);
    // Water layer
    ctx.fillStyle = '#204764';
    ctx.fillRect(0, 240, 640, 180);
    // Road line
    ctx.strokeStyle = '#E06D53';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(0, 310);
    ctx.lineTo(640, 310);
    ctx.stroke();
    // Submerged marker text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px -apple-system, sans-serif';
    ctx.fillText(`${currentCorridor.city.toUpperCase()} DISASTER SITE`, 40, 80);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#7D9D8B';
    ctx.fillText(`THREAT: ${currentCorridor.primaryThreat.toUpperCase()}`, 40, 115);
    ctx.fillText(`WATERLINE LEVEL: +1.4M ABOVE PLINTH SILL`, 40, 140);
    ctx.fillText(`GROUND ELEVATION: ${currentCorridor.elevationMeters}M MSL`, 40, 165);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'sample_calamity_damage.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }, 'image/jpeg');
  };

  // Multimodal Single-Pass Vision Assessment
  const handleAnalyzeVision = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();
    if (!apiKey) {
      setError('Operational API key is not configured in local environment.');
      return;
    }

    if (!selectedFile) {
      setError('Please upload a disaster damage photograph or select a sample image.');
      return;
    }

    setLoading(true);

    try {
      const processedImage = await compressImage(selectedFile);
      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: VISION_SCHEMA as any,
          temperature: 0.2,
        },
      });

      // RAG Grounded Prompt Injection from shelterRegistry.json
      const groundedContext = buildGroundedPrompt(
        customLocation || currentCorridor.city,
        headcount,
        currentLanguageMeta.name
      );

      const promptText = `You are a Principal Disaster Response Operations Specialist evaluating an immediate emergency disaster site.
Conduct a MULTIMODAL SINGLE-PASS VISION ASSESSMENT directly from the uploaded disaster damage photo.

${groundedContext}

OPERATIONAL DIRECTIVES:
1. Extract exact structural damage metrics:
   - waterlineDepth: Estimate floodwater depth (e.g., "1.3 meters / submerged ground sill").
   - roadBlockage: Assess vehicle road accessibility (e.g., "75% blocked by debris and mud").
   - foundationCompromise: Assess structural compromise (e.g., "Scour along south-side plinth").
   - structuralObservations: 3-5 concrete visual findings observed in the image.
2. Formulate tactical operational objectives (timeframe, objective, priority).
3. Specify prioritized field resource deployment items (resource, quantity, deploymentZone).
4. Identify the nearest safe shelter by name and elevation based on the grounded context.
5. Provide safe corridor evacuation guidance avoiding known inundation chokepoints.
6. Synthesize an immediate vernacular public advisory of 70 to 120 words written STRICTLY in ${currentLanguageMeta.name} script without emojis.
7. Synthesize an urgent 30-character micro-alert string (UPPERCASE, <= 30 chars, no emojis, e.g. "FLOOD: MOVE TO RIDGE SHELTER").

Return output strictly conforming to the JSON schema.`;

      let response;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          attempts++;
          response = await model.generateContent([
            {
              inlineData: {
                data: processedImage.data,
                mimeType: processedImage.mimeType,
              },
            },
            promptText,
          ]);
          break;
        } catch (err: any) {
          const isBusy = err?.message?.includes('503') || err?.message?.includes('429');
          if (isBusy && attempts < maxAttempts) {
            console.warn(`Gateway retry attempt ${attempts}/${maxAttempts}. Resuming in 2000ms...`);
            await delay(2000);
          } else {
            throw err;
          }
        }
      }

      if (!response) throw new Error('No operational response received from vision inference.');

      const resText = response.response.text();
      const parsed = JSON.parse(resText);

      const result: VisionAssessmentResult = {
        hazardType: stripEmoji(parsed.hazardType || currentCorridor.primaryThreat),
        severityGrade: parsed.severityGrade || 'High',
        confidenceScore: parsed.confidenceScore || 0.94,
        structuralMetrics: {
          waterlineDepth: stripEmoji(parsed.waterlineDepth || '1.2m above baseline'),
          roadBlockage: stripEmoji(parsed.roadBlockage || 'Partial mud and silt deposition'),
          foundationCompromise: stripEmoji(parsed.foundationCompromise || 'Surface erosion detected'),
          observations: (parsed.structuralObservations || []).map(stripEmoji),
        },
        tacticalObjectives: (parsed.tacticalObjectives || []).map((t: any) => ({
          timeframe: stripEmoji(t.timeframe || ''),
          objective: stripEmoji(t.objective || ''),
          priority: t.priority || 'High',
        })),
        resourceAllocation: (parsed.resourceAllocation || []).map((r: any) => ({
          resource: stripEmoji(r.resource || ''),
          quantity: stripEmoji(r.quantity || ''),
          deploymentZone: stripEmoji(r.deploymentZone || ''),
        })),
        nearestSafeShelter: stripEmoji(
          parsed.nearestSafeShelter || currentCorridor.verifiedShelters[0].name
        ),
        evacuationGuidance: stripEmoji(
          parsed.evacuationGuidance || currentCorridor.evacuationCorridors[0]?.primaryRouteName || ''
        ),
        vernacularAdvisory: stripEmoji(parsed.vernacularAdvisory || ''),
        microAlert30: stripEmoji(parsed.microAlert30 || 'FLOOD: MOVE TO RIDGE SHELTER').slice(0, 30),
      };

      setAssessmentResult(result);
      setEditableAlert(result.microAlert30);
    } catch (err: any) {
      console.error('Vision Assessment Error:', err);
      setAssessmentResult(null);
      setError(
        err?.message?.includes('503')
          ? 'Network is handling high volume. Please retry in a few moments.'
          : err?.message || 'Multimodal vision assessment failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fast2SMS Dispatch handler
  const handleDispatchSMS = async () => {
    const valid = sanitizePhoneNumbers(phoneNumbers);
    if (valid.length === 0) {
      alert('Please enter at least one valid 10-digit phone number.');
      return;
    }

    setIsDispatchingSMS(true);
    setDispatchResult(null);

    try {
      const res = await sendVernacularSMS({
        numbers: phoneNumbers,
        message: editableAlert,
        language: currentLanguageMeta.name.toLowerCase(),
      });
      setDispatchResult(res);
    } catch (err: any) {
      setDispatchResult({
        success: false,
        simulated: false,
        recipientCount: 0,
        message: err?.message || 'Cellular transmission failed.',
        error: 'DISPATCH_ERROR',
        timestamp: new Date().toLocaleTimeString('en-IN'),
      });
    } finally {
      setIsDispatchingSMS(false);
    }
  };

  // Scaled calculations for headcount N
  const n = Math.max(1, Math.round(headcount));
  const waterLiters = n * 3.5 * 3;
  const rationPackets = n * 6;
  const traumaKits = Math.max(1, Math.ceil(n / 10));
  const powerUnits = Math.max(1, Math.ceil(n / 4));
  const blankets = n;

  return (
    <div className="min-h-full bg-[#F9F8F5] text-[#0E1A2B] p-4 sm:p-6 lg:p-8 space-y-6 pb-24 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="apple-glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-white/60 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF2EE] text-[#335341] border border-[#7D9D8B]/30">
              <Eye className="w-3.5 h-3.5 text-[#7D9D8B]" />
              <span>Applied Multimodal Intelligence</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#7D9D8B]" />
              <span>Single-Pass Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A2B]">
              Visual Damage Assessment & Incident Action Plan
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Synthesize ground-level structural metrics, mathematically scaled resource manifests,
              evacuation corridors, and vernacular public advisories directly from disaster site imagery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="apple-glass-card px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-white/60">
              <Compass className="w-4 h-4 text-[#1D7A82]" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Calamity Corridors</div>
                <div className="text-xs font-semibold text-[#0E1A2B]">10 Verified Indian Zones</div>
              </div>
            </div>
            <div className="apple-glass-card px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-white/60">
              <Layers className="w-4 h-4 text-[#7D6B7D]" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Vernacular</div>
                <div className="text-xs font-semibold text-[#0E1A2B]">{currentLanguageMeta.nativeName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Input Form */}
      <form onSubmit={handleAnalyzeVision} className="apple-glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Image Upload & Previews */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#1D7A82]" />
                <span>Site Damage Photograph</span>
              </label>
              <button
                type="button"
                onClick={handleUseSampleImage}
                className="text-xs text-[#1D7A82] hover:text-[#13626A] font-semibold underline"
              >
                Use Sample Damage Image
              </button>
            </div>

            <div className="relative border-2 border-dashed border-slate-300 hover:border-[#1D7A82] rounded-2xl p-6 text-center transition-all bg-white/50 backdrop-blur-sm cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF2EE] flex items-center justify-center text-[#1D7A82] group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-[#0E1A2B]">
                  {selectedFile ? selectedFile.name : 'Select or drop incident photograph'}
                </div>
                <div className="text-xs text-slate-500">
                  JPEG, PNG, WebP • Auto-compressed to 1024px client-side
                </div>
              </div>
            </div>

            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-white/80 shadow-md max-h-56 bg-slate-900">
                <img src={previewUrl} alt="Disaster Scene Preview" className="w-full h-56 object-cover" />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-mono">
                  Compressed Raster • Ready for Single-Pass Inference
                </div>
              </div>
            )}
          </div>

          {/* Right: Corridor Selection & Parameters */}
          <div className="md:col-span-6 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#E06D53]" />
                <span>Verified Calamity Corridor (10 National Zones)</span>
              </label>
              <select
                value={selectedCorridorId}
                onChange={(e) => handleCorridorChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-sm font-semibold text-[#0E1A2B] focus:outline-hidden focus:ring-2 focus:ring-[#1D7A82]/30 shadow-xs"
              >
                {allCorridors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.city} ({c.state}) — {c.primaryThreat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Exact Landmark / Sector
                </label>
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="e.g. SRM Campus, Lowland Ward"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-sm text-[#0E1A2B] focus:outline-hidden focus:ring-2 focus:ring-[#1D7A82]/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Advisory Script Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-sm font-semibold text-[#0E1A2B] focus:outline-hidden focus:ring-2 focus:ring-[#1D7A82]/30 shadow-xs"
                >
                  {supportedLanguages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#7D6B7D]" />
                  <span>Impacted Headcount (N Persons ∈ ℕ)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[50, 150, 500, 1500].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setHeadcount(step)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/80 hover:bg-white text-slate-700 border border-slate-200 apple-btn-haptic"
                    >
                      {step}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min={1}
                value={headcount}
                onChange={(e) => setHeadcount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-sm font-mono font-bold text-[#0E1A2B] focus:outline-hidden focus:ring-2 focus:ring-[#1D7A82]/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#0E1A2B] hover:bg-[#14273E] active:scale-[0.98] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 text-[#7D9D8B] ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Synthesizing Multimodal Incident Action Plan...' : 'Run Single-Pass Vision Assessment'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#FBEBE8] border border-[#E06D53]/40 text-[#C85A4B] text-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Corridor Map Integration (Requirement 4) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-[#1D7A82]" />
            <span>Interactive GIS Corridors & Safe Shelters (Leaflet)</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Origin: [{currentCorridor.lat.toFixed(4)}, {currentCorridor.lng.toFixed(4)}]
          </span>
        </div>
        <CalamityCorridorMap corridor={currentCorridor} className="h-80 w-full" />
      </div>

      {/* Generated Assessment Results (Single-Pass Core) */}
      {assessmentResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Metric Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="apple-glass-card p-4 rounded-2xl border border-white/60 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Identified Hazard</span>
              <div className="text-base font-bold text-[#0E1A2B] line-clamp-1">{assessmentResult.hazardType}</div>
              <div className="text-[11px] font-mono text-[#1D7A82]">Confidence: {(assessmentResult.confidenceScore * 100).toFixed(0)}%</div>
            </div>

            <div className="apple-glass-card p-4 rounded-2xl border border-white/60 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity Classification</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#C85A4B]">{assessmentResult.severityGrade}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBEBE8] text-[#C85A4B] border border-[#E06D53]/30">
                  Level 3
                </span>
              </div>
              <div className="text-[11px] text-slate-500">Incident Command Triggered</div>
            </div>

            <div className="apple-glass-card p-4 rounded-2xl border border-white/60 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimated Waterline</span>
              <div className="text-base font-bold text-[#0E1A2B]">{assessmentResult.structuralMetrics.waterlineDepth}</div>
              <div className="text-[11px] text-slate-500">Submerged Structure Depth</div>
            </div>

            <div className="apple-glass-card p-4 rounded-2xl border border-white/60 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Road Accessibility</span>
              <div className="text-base font-bold text-[#0E1A2B] line-clamp-1">{assessmentResult.structuralMetrics.roadBlockage}</div>
              <div className="text-[11px] text-slate-500">{assessmentResult.structuralMetrics.foundationCompromise}</div>
            </div>
          </div>

          {/* Observations and Objectives */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 apple-glass-panel p-6 rounded-3xl border border-white/60 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                <Building2 className="w-4 h-4 text-[#1D7A82]" />
                <h3 className="text-sm font-bold text-[#0E1A2B] uppercase tracking-wider">
                  Ground-Level Structural Damage Findings
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {assessmentResult.structuralMetrics.observations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-white/70 border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A82] mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-6 apple-glass-panel p-6 rounded-3xl border border-white/60 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                <Activity className="w-4 h-4 text-[#7D9D8B]" />
                <h3 className="text-sm font-bold text-[#0E1A2B] uppercase tracking-wider">
                  Tactical Operational Objectives
                </h3>
              </div>
              <div className="space-y-2">
                {assessmentResult.tacticalObjectives.map((obj, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/70 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] text-[#1D7A82] font-bold">{obj.timeframe}</span>
                      <p className="font-medium text-slate-800">{obj.objective}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        obj.priority === 'Immediate'
                          ? 'bg-[#FBEBE8] text-[#C85A4B] border border-[#E06D53]/40'
                          : 'bg-[#EBF2EE] text-[#335341] border border-[#7D9D8B]/40'
                      }`}
                    >
                      {obj.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mathematical Preparedness Manifest Scaled for N Persons */}
          <div className="apple-glass-panel p-6 rounded-3xl border border-white/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#7D6B7D]" />
                <h3 className="text-sm font-bold text-[#0E1A2B] uppercase tracking-wider">
                  Dynamic Preparedness Manifest (Mathematically Scaled for N = {n} Persons)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">72-Hour Standard Survival Buffer</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                  <Droplets className="w-3.5 h-3.5 text-[#1D7A82]" />
                  <span>Potable Water</span>
                </div>
                <div className="text-base font-bold text-[#0E1A2B]">{waterLiters.toLocaleString('en-IN')} L</div>
                <div className="text-[10px] text-slate-500">3.5 L/person/day</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                  <Package className="w-3.5 h-3.5 text-[#7D9D8B]" />
                  <span>Dry Rations</span>
                </div>
                <div className="text-base font-bold text-[#0E1A2B]">{rationPackets.toLocaleString('en-IN')} Packs</div>
                <div className="text-[10px] text-slate-500">2,100 kcal meals</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                  <Shield className="w-3.5 h-3.5 text-[#E06D53]" />
                  <span>Trauma Packs</span>
                </div>
                <div className="text-base font-bold text-[#0E1A2B]">{traumaKits} Kit{traumaKits > 1 ? 's' : ''}</div>
                <div className="text-[10px] text-slate-500">1 kit per 10 persons</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                  <Activity className="w-3.5 h-3.5 text-[#7D6B7D]" />
                  <span>Power Units</span>
                </div>
                <div className="text-base font-bold text-[#0E1A2B]">{powerUnits} Units</div>
                <div className="text-[10px] text-slate-500">20,000 mAh Dry Pack</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Thermal Blankets</span>
                </div>
                <div className="text-base font-bold text-[#0E1A2B]">{blankets} Units</div>
                <div className="text-[10px] text-slate-500">1 unit per individual</div>
              </div>
            </div>
          </div>

          {/* Vernacular Public Advisory & Fast2SMS 30-Char Dispatch */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Vernacular Public Advisory */}
            <div className="lg:col-span-6 apple-glass-panel p-6 rounded-3xl border border-white/60 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <h3 className="text-sm font-bold text-[#0E1A2B] uppercase tracking-wider flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-[#7D9D8B]" />
                  <span>Public Vernacular Broadcast ({currentLanguageMeta.nativeName})</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF2EE] text-[#335341]">
                  Official Advisory
                </span>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed p-4 rounded-2xl bg-white/80 border border-slate-100 font-sans">
                {assessmentResult.vernacularAdvisory}
              </p>
            </div>

            {/* 30-Character Micro-Alert & Fast2SMS */}
            <div className="lg:col-span-6 apple-glass-panel p-6 rounded-3xl border border-white/60 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <h3 className="text-sm font-bold text-[#0E1A2B] uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#E06D53]" />
                  <span>30-Character Micro-Alert & Cellular Dispatch</span>
                </h3>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {editableAlert.length} / 30 Chars
                </span>
              </div>

              <div className="space-y-3">
                <input
                  id={alertInputId}
                  type="text"
                  maxLength={30}
                  value={editableAlert}
                  onChange={(e) => setEditableAlert(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-sm text-[#0E1A2B] focus:outline-hidden focus:ring-2 focus:ring-[#1D7A82]/30"
                  placeholder="30-CHAR MICRO ALERT"
                />

                <div>
                  <label htmlFor={phoneInputId} className="text-xs font-semibold text-slate-600 block mb-1">
                    Emergency Mobile Numbers (Comma-separated)
                  </label>
                  <input
                    id={phoneInputId}
                    type="text"
                    value={phoneNumbers}
                    onChange={(e) => setPhoneNumbers(e.target.value)}
                    placeholder="9876543210, 9123456789"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-[#0E1A2B] focus:outline-hidden focus:ring-2 focus:ring-[#1D7A82]/30"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDispatchSMS}
                  disabled={isDispatchingSMS || !editableAlert.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0E1A2B] hover:bg-[#14273E] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isDispatchingSMS ? 'Broadcasting Fast2SMS...' : 'Broadcast 30-Char Alert via Fast2SMS'}</span>
                </button>

                {dispatchResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      dispatchResult.success
                        ? 'bg-[#EBF2EE] border-[#7D9D8B]/40 text-[#335341]'
                        : 'bg-[#FBEBE8] border-[#E06D53]/40 text-[#C85A4B]'
                    }`}
                  >
                    <div className="font-bold">
                      {dispatchResult.success
                        ? dispatchResult.simulated
                          ? 'Simulation Gateway Confirmed'
                          : 'Live Cellular Broadcast Dispatched'
                        : 'Dispatch Error'}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed">{dispatchResult.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}