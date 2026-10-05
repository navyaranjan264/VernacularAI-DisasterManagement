import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

/* ------------------------------------------------------------------ */
/* Types and constants                                                 */
/* ------------------------------------------------------------------ */

interface TimelineEntry { hour: number; phase: string; actions: string[] }
interface Corridor { name: string; route: string; capacity: string; hazards: string }
interface AssemblyPoint { name: string; location: string; capacity: string; facilities: string }
interface LogisticsItem { category: string; items: string; quantity: string; priority: string }
interface SimResult {
  summary: string;
  timeline: TimelineEntry[];
  corridors: Corridor[];
  assemblyPoints: AssemblyPoint[];
  logistics: LogisticsItem[];
  advisory: string;
}

const LANGUAGES = [
  { name: "Tamil", tag: "ta-IN" },
  { name: "Hindi", tag: "hi-IN" },
  { name: "Telugu", tag: "te-IN" },
  { name: "Malayalam", tag: "ml-IN" },
  { name: "English", tag: "en-IN" },
] as const;

const DISASTER_TYPES = [
  "Cyclone",
  "Reservoir Breach",
  "Coastal Flood",
  "Flash Flood",
  "Tsunami",
  "Urban Flooding",
];

const SEVERITIES = [
  { level: 1, label: "Watch" },
  { level: 2, label: "Warning" },
  { level: 3, label: "Severe" },
  { level: 4, label: "Critical" },
  { level: 5, label: "Catastrophic" },
];

const MODEL_NAME = "gemini-3.5-flash";

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

// Removes pictographic characters so generated text always honours the no-emoji rule.
const stripEmoji = (s: string) => s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "");
const clean = (v: unknown): string => (typeof v === "string" ? stripEmoji(v).trim() : "");
const cleanList = (v: unknown): string[] => (Array.isArray(v) ? v.map(clean).filter(Boolean) : []);
const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

// Converts markdown into plain speakable text.
function stripMarkdown(input: string): string {
  return stripEmoji(input)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*([-*+]|\d+[.)])\s+/gm, "")
    .replace(/^\s*([-*_]\s*){3,}$/gm, " ")
    .replace(/\|/g, " ")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/[*_#>~`]/g, "")
    .replace(/\s*\n\s*/g, ". ")
    .replace(/\.\s*\.+/g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Chrome and Android stop long utterances early, so speech is queued in short chunks.
function chunkForSpeech(text: string, max = 180): string[] {
  const sentences = text.match(/[^.!?\u0964\u0965]+[.!?\u0964\u0965]*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    if ((current + " " + s).trim().length > max && current) {
      chunks.push(current);
      current = s;
    } else {
      current = (current + " " + s).trim();
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function parseModelJson(raw: string): unknown {
  const trimmed = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(trimmed);
}

function normalize(data: any): SimResult {
  return {
    summary: clean(data?.summary),
    timeline: asArray<any>(data?.timeline)
      .map((t) => ({ hour: Number(t?.hour) || 0, phase: clean(t?.phase), actions: cleanList(t?.actions) }))
      .sort((a, b) => a.hour - b.hour),
    corridors: asArray<any>(data?.corridors).map((c) => ({
      name: clean(c?.name), route: clean(c?.route), capacity: clean(c?.capacity), hazards: clean(c?.hazards),
    })),
    assemblyPoints: asArray<any>(data?.assemblyPoints).map((a) => ({
      name: clean(a?.name), location: clean(a?.location), capacity: clean(a?.capacity), facilities: clean(a?.facilities),
    })),
    logistics: asArray<any>(data?.logistics).map((l) => ({
      category: clean(l?.category), items: clean(l?.items), quantity: clean(l?.quantity), priority: clean(l?.priority),
    })),
    advisory: clean(data?.advisory),
  };
}

function buildPrompt(p: {
  disaster: string; zone: string; severity: string; population: number; language: string;
}): string {
  return `You are an emergency management planning assistant supporting an Indian state disaster response control room.

Scenario:
- Disaster type: ${p.disaster}
- Location zone: ${p.zone}
- Severity: ${p.severity}
- Estimated affected population: ${p.population.toLocaleString("en-IN")}
- Public advisory language: ${p.language}

Produce a realistic planning simulation for this scenario. Use plausible, region-appropriate road names, landmarks, and facility types for the zone. Where exact names are unknown, describe the facility type and general direction, and do not invent official telephone numbers.

Return ONLY a JSON object with exactly these keys, no markdown fences, no commentary:
{
  "summary": "two sentence situation overview in English",
  "timeline": [ { "hour": number, "phase": "short phase title", "actions": ["action", "action"] } ],
  "corridors": [ { "name": "corridor name", "route": "from, via, to", "capacity": "approximate persons or vehicles per hour", "hazards": "main risks and mitigation" } ],
  "assemblyPoints": [ { "name": "site name", "location": "area and direction", "capacity": "approximate persons", "facilities": "medical, water, power, shelter details" } ],
  "logistics": [ { "category": "category", "items": "specific items", "quantity": "quantity scaled to the population", "priority": "Immediate or High or Medium" } ],
  "advisory": "public emergency advisory"
}

Rules:
- timeline must contain at least 8 entries covering hour 0 through hour 24 (T+0h to T+24h), ordered by hour.
- corridors: 3 to 4 entries. assemblyPoints: 3 to 5 entries. logistics: 6 to 8 entries.
- All fields are in English except "advisory".
- "advisory" must be written entirely in ${p.language}, in its native script, as one short spoken public announcement of 90 to 140 words. State the hazard, who must move, where to go, what to carry, and a calm closing instruction. Use plain sentences only: no markdown, no bullet points, no headings, no emojis.
- Do not use emojis or emoticons anywhere in the output.`;
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const Svg = ({ children, size = 18 }: { children: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const IconSpeaker = () => (<Svg><path d="M11 5 6 9H3v6h3l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></Svg>);
const IconStop = () => (<Svg><rect x="6" y="6" width="12" height="12" rx="1.5" /></Svg>);
const IconAlert = () => (<Svg size={20}><path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4" /><path d="M12 17h.01" /></Svg>);
const IconSpinner = () => (<svg className="dsu-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.2-8.55" /></svg>);

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function DisasterSimulatorUI() {
  const [disaster, setDisaster] = useState(DISASTER_TYPES[0]);
  const [zone, setZone] = useState("");
  const [severity, setSeverity] = useState(3);
  const [population, setPopulation] = useState(50000);
  const [languageTag, setLanguageTag] = useState<string>("ta-IN");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimResult | null>(null);
  const [resultLanguage, setResultLanguage] = useState<(typeof LANGUAGES)[number]>(LANGUAGES[0]);

  const [speaking, setSpeaking] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const speechSession = useRef(0);

  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  /* ---- Speech ---- */

  const stopBroadcast = useCallback(() => {
    speechSession.current += 1;
    if (ttsSupported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [ttsSupported]);

  const startBroadcast = useCallback(() => {
    if (!ttsSupported || !result) return;
    const synth = window.speechSynthesis;
    const plain = stripMarkdown(result.advisory);
    if (!plain) return;

    synth.cancel();
    const session = ++speechSession.current;
    const tag = resultLanguage.tag;
    const prefix = tag.split("-")[0].toLowerCase();
    const voices = synth.getVoices();
    const voice =
      voices.find((v) => v.lang.replace("_", "-").toLowerCase() === tag.toLowerCase()) ??
      voices.find((v) => v.lang.toLowerCase().startsWith(prefix));

    setVoiceNotice(
      voice
        ? null
        : `No installed ${resultLanguage.name} voice was found on this device. Playback may use a default voice or stay silent. Install a ${resultLanguage.name} (${tag}) voice in the operating system speech settings.`
    );

    const chunks = chunkForSpeech(plain);
    const speakAt = (i: number) => {
      if (session !== speechSession.current) return;
      if (i >= chunks.length) { setSpeaking(false); return; }
      const u = new SpeechSynthesisUtterance(chunks[i]);
      u.lang = tag;
      if (voice) u.voice = voice;
      u.rate = 0.95;
      u.onend = () => speakAt(i + 1);
      u.onerror = () => { if (session === speechSession.current) setSpeaking(false); };
      synth.speak(u);
    };
    setSpeaking(true);
    speakAt(0);
  }, [ttsSupported, result, resultLanguage]);

  // Voices load asynchronously in some browsers; touching getVoices early warms the list.
  useEffect(() => {
    if (!ttsSupported) return;
    window.speechSynthesis.getVoices();
    return () => { speechSession.current += 1; window.speechSynthesis.cancel(); };
  }, [ttsSupported]);

  /* ---- Generation ---- */

  const runSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    stopBroadcast();
    setError(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) {
      setError("Missing configuration. Set VITE_GEMINI_API_KEY in your .env file and restart the dev server.");
      return;
    }
    if (!zone.trim()) { setError("Enter a location zone to run the simulation."); return; }
    if (!Number.isFinite(population) || population <= 0) { setError("Enter an estimated affected population greater than zero."); return; }

    const lang = LANGUAGES.find((l) => l.tag === languageTag) ?? LANGUAGES[0];
    const sev = SEVERITIES.find((s) => s.level === severity)!;

    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
      });
      const response = await model.generateContent(
        buildPrompt({
          disaster, zone: zone.trim(), severity: `Level ${sev.level} (${sev.label}) on a five level scale`,
          population, language: lang.name,
        })
      );
      const parsed = normalize(parseModelJson(response.response.text()));
      if (!parsed.timeline.length || !parsed.advisory) {
        throw new Error("The model returned an incomplete simulation. Run it again.");
      }
      setResult(parsed);
      setResultLanguage(lang);
    } catch (err) {
      const message = err instanceof SyntaxError
        ? "The model response could not be read as structured data. Run the simulation again."
        : err instanceof Error ? err.message : "Simulation request failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* ---- Render ---- */

  return (
    <div className="dsu">
      <style>{CSS}</style>

      <header className="dsu-header">
        <div className="dsu-brand">
          <IconAlert />
          <div>
            <h1>Evacuation Simulator</h1>
            <p>Scenario planning with localized public advisories</p>
          </div>
        </div>
        <span className="dsu-model">Model: {MODEL_NAME}</span>
      </header>

      <div className="dsu-layout">
        <form className="dsu-panel dsu-form" onSubmit={runSimulation} noValidate>
          <h2>Scenario parameters</h2>

          <label className="dsu-field">
            <span>Disaster type</span>
            <select value={disaster} onChange={(e) => setDisaster(e.target.value)}>
              {DISASTER_TYPES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>

          <label className="dsu-field">
            <span>Location zone</span>
            <input type="text" value={zone} placeholder="Example: Cuddalore coastal belt, Tamil Nadu"
              onChange={(e) => setZone(e.target.value)} />
          </label>

          <fieldset className="dsu-field dsu-severity">
            <legend>Severity level</legend>
            <div className="dsu-seg" role="radiogroup" aria-label="Severity level">
              {SEVERITIES.map((s) => (
                <button type="button" key={s.level} role="radio" aria-checked={severity === s.level}
                  className={severity === s.level ? "on" : ""} onClick={() => setSeverity(s.level)}>
                  <b>{s.level}</b><i>{s.label}</i>
                </button>
              ))}
            </div>
          </fieldset>

          <label className="dsu-field">
            <span>Estimated affected population</span>
            <input type="number" min={1} step={500} value={Number.isFinite(population) ? population : ""}
              onChange={(e) => setPopulation(e.target.valueAsNumber)} />
          </label>

          <label className="dsu-field">
            <span>Advisory language</span>
            <select value={languageTag} onChange={(e) => setLanguageTag(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l.tag} value={l.tag}>{l.name} ({l.tag})</option>)}
            </select>
          </label>

          <button type="submit" className="dsu-primary" disabled={loading}>
            {loading ? <><IconSpinner /> Generating simulation</> : "Run simulation"}
          </button>

          {error && <div className="dsu-error" role="alert">{error}</div>}
        </form>

        <main className="dsu-results" aria-live="polite">
          {!result && !loading && (
            <div className="dsu-empty">
              <h2>No simulation yet</h2>
              <p>Set the scenario parameters and run the simulation. The timeline, evacuation routes, resource needs, and a spoken public advisory will appear here.</p>
            </div>
          )}

          {loading && (
            <div className="dsu-empty"><h2>Building the 24 hour plan</h2><p>This usually takes a few seconds.</p></div>
          )}

          {result && !loading && (
            <>
              <section className="dsu-panel dsu-advisory">
                <div className="dsu-advisory-head">
                  <div>
                    <h2>Public advisory in {resultLanguage.name}</h2>
                    <p className="dsu-sub">{disaster} at {zone.trim()}. {result.summary}</p>
                  </div>
                  {ttsSupported ? (
                    <button type="button" className={speaking ? "dsu-voice live" : "dsu-voice"}
                      onClick={speaking ? stopBroadcast : startBroadcast}>
                      {speaking ? <><IconStop /> Stop Broadcast</> : <><IconSpeaker /> Listen to Broadcast</>}
                    </button>
                  ) : (
                    <span className="dsu-sub">Speech playback is not supported in this browser.</span>
                  )}
                </div>
                <p className="dsu-advisory-text" lang={resultLanguage.tag}>{result.advisory}</p>
                <div className="dsu-status" role="status">
                  {speaking && `Broadcasting in ${resultLanguage.name} (${resultLanguage.tag})`}
                </div>
                {voiceNotice && <div className="dsu-warn">{voiceNotice}</div>}
              </section>

              <section className="dsu-panel">
                <h2>24 hour crisis timeline</h2>
                <ol className="dsu-timeline">
                  {result.timeline.map((t, i) => (
                    <li key={i}>
                      <span className="dsu-hour">T+{t.hour}h</span>
                      <div>
                        <h3>{t.phase}</h3>
                        <ul>{t.actions.map((a, j) => <li key={j}>{a}</li>)}</ul>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <div className="dsu-two">
                <section className="dsu-panel">
                  <h2>Evacuation corridors</h2>
                  {result.corridors.map((c, i) => (
                    <article className="dsu-item" key={i}>
                      <h3>{c.name}</h3>
                      <p>{c.route}</p>
                      <dl>
                        <dt>Capacity</dt><dd>{c.capacity}</dd>
                        <dt>Hazards</dt><dd>{c.hazards}</dd>
                      </dl>
                    </article>
                  ))}
                </section>

                <section className="dsu-panel">
                  <h2>High ground assembly points</h2>
                  {result.assemblyPoints.map((a, i) => (
                    <article className="dsu-item" key={i}>
                      <h3>{a.name}</h3>
                      <p>{a.location}</p>
                      <dl>
                        <dt>Capacity</dt><dd>{a.capacity}</dd>
                        <dt>Facilities</dt><dd>{a.facilities}</dd>
                      </dl>
                    </article>
                  ))}
                </section>
              </div>

              <section className="dsu-panel">
                <h2>Logistics and relief allocation</h2>
                <div className="dsu-table-wrap">
                  <table>
                    <thead><tr><th>Category</th><th>Items</th><th>Quantity</th><th>Priority</th></tr></thead>
                    <tbody>
                      {result.logistics.map((l, i) => (
                        <tr key={i}>
                          <td>{l.category}</td><td>{l.items}</td><td>{l.quantity}</td>
                          <td><span className={`dsu-pri ${l.priority.toLowerCase().split(" ")[0]}`}>{l.priority}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <p className="dsu-foot">
                Generated output is planning support only. Validate routes, sites, and quantities with the district disaster management authority before operational use.
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Styles (scoped under .dsu, no external dependencies)                */
/* ------------------------------------------------------------------ */

const CSS = `
.dsu{--bg:#0d141c;--panel:#142030;--panel2:#192a3d;--line:#25384d;--text:#e4eaf1;--muted:#8fa2b6;--accent:#5bb6c4;--accent-ink:#06222a;--alert:#e5674f;--warn:#e3a83f;
  min-height:100vh;background:var(--bg);color:var(--text);font:15px/1.55 "Segoe UI",system-ui,-apple-system,"Noto Sans","Noto Sans Tamil","Noto Sans Devanagari","Noto Sans Telugu","Noto Sans Malayalam",sans-serif;padding:0 0 48px}
.dsu *{box-sizing:border-box}
.dsu h1,.dsu h2,.dsu h3{margin:0;font-weight:600;letter-spacing:0}
.dsu-header{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 28px;border-bottom:1px solid var(--line);background:#0a1118}
.dsu-brand{display:flex;gap:12px;align-items:center;color:var(--alert)}
.dsu-brand h1{font-size:18px;color:var(--text)}
.dsu-brand p{margin:0;font-size:13px;color:var(--muted)}
.dsu-model{font-size:12.5px;color:var(--muted);border:1px solid var(--line);padding:4px 10px;border-radius:4px;white-space:nowrap}
.dsu-layout{display:grid;grid-template-columns:340px minmax(0,1fr);gap:24px;padding:24px 28px;max-width:1360px;margin:0 auto;align-items:start}
.dsu-panel{background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:20px}
.dsu-panel h2{font-size:16px;margin-bottom:14px}
.dsu-form{position:sticky;top:16px;display:flex;flex-direction:column;gap:16px}
.dsu-form h2{margin-bottom:0}
.dsu-field{display:flex;flex-direction:column;gap:6px;border:0;padding:0;margin:0;min-width:0}
.dsu-field>span,.dsu-field>legend{font-size:13px;color:var(--muted);padding:0}
.dsu input,.dsu select{width:100%;background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:4px;padding:10px 12px;font:inherit}
.dsu input::placeholder{color:#5f7388}
.dsu input:focus-visible,.dsu select:focus-visible,.dsu button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.dsu-seg{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.dsu-seg button{background:var(--bg);border:1px solid var(--line);border-radius:4px;color:var(--muted);padding:8px 2px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;font:inherit;transition:background .15s,border-color .15s}
.dsu-seg b{font-size:15px;color:var(--text)}
.dsu-seg i{font-style:normal;font-size:10.5px}
.dsu-seg button.on{background:#3a1f1d;border-color:var(--alert);color:#f3c4ba}
.dsu-primary{background:var(--accent);color:var(--accent-ink);border:0;border-radius:4px;padding:12px 16px;font:inherit;font-weight:600;cursor:pointer;display:flex;gap:8px;align-items:center;justify-content:center}
.dsu-primary:disabled{opacity:.65;cursor:progress}
.dsu-error{background:#3a1f1d;border:1px solid var(--alert);color:#f3c4ba;border-radius:4px;padding:10px 12px;font-size:13.5px}
.dsu-warn{background:#3a2d12;border:1px solid var(--warn);color:#f1d79b;border-radius:4px;padding:10px 12px;font-size:13px;margin-top:10px}
.dsu-results{display:flex;flex-direction:column;gap:20px;min-width:0}
.dsu-empty{border:1px dashed var(--line);border-radius:6px;padding:48px 28px;color:var(--muted)}
.dsu-empty h2{color:var(--text);font-size:17px;margin-bottom:6px}
.dsu-empty p{margin:0;max-width:56ch}
.dsu-advisory{border-left:3px solid var(--accent)}
.dsu-advisory-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap}
.dsu-advisory-head h2{margin-bottom:4px}
.dsu-sub{margin:0;color:var(--muted);font-size:13.5px;max-width:70ch}
.dsu-voice{display:flex;align-items:center;gap:8px;background:transparent;color:var(--accent);border:1px solid var(--accent);border-radius:4px;padding:9px 14px;font:inherit;font-weight:600;cursor:pointer;white-space:nowrap}
.dsu-voice.live{background:var(--alert);border-color:var(--alert);color:#fff}
.dsu-advisory-text{margin:16px 0 0;font-size:17px;line-height:1.8;max-width:72ch;background:var(--panel2);padding:16px 18px;border-radius:4px}
.dsu-status{min-height:20px;margin-top:8px;font-size:13px;color:var(--accent)}
.dsu-timeline{list-style:none;margin:0;padding:0}
.dsu-timeline>li{display:grid;grid-template-columns:64px 1fr;gap:16px;padding:0 0 18px;position:relative}
.dsu-timeline>li:not(:last-child)::before{content:"";position:absolute;left:31px;top:26px;bottom:0;width:1px;background:var(--line)}
.dsu-hour{font-variant-numeric:tabular-nums;font-weight:600;font-size:13px;color:var(--accent);background:var(--bg);border:1px solid var(--line);border-radius:4px;height:26px;display:flex;align-items:center;justify-content:center;position:relative;z-index:1}
.dsu-timeline h3{font-size:15px;margin-bottom:4px}
.dsu-timeline ul{margin:0;padding-left:18px;color:#c3cfdb}
.dsu-timeline ul li{margin:2px 0}
.dsu-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.dsu-item{padding:12px 0;border-top:1px solid var(--line)}
.dsu-item:first-of-type{border-top:0;padding-top:0}
.dsu-item h3{font-size:14.5px}
.dsu-item p{margin:2px 0 8px;color:#c3cfdb;font-size:14px}
.dsu-item dl{margin:0;display:grid;grid-template-columns:76px 1fr;gap:3px 10px;font-size:13px}
.dsu-item dt{color:var(--muted)}
.dsu-item dd{margin:0}
.dsu-table-wrap{overflow-x:auto}
.dsu table{width:100%;border-collapse:collapse;font-size:14px}
.dsu th{text-align:left;color:var(--muted);font-weight:500;font-size:13px;padding:8px 12px;border-bottom:1px solid var(--line)}
.dsu td{padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}
.dsu td:first-child{font-weight:600;white-space:nowrap}
.dsu-pri{display:inline-block;padding:2px 8px;border-radius:3px;font-size:12.5px;border:1px solid var(--line);color:var(--muted)}
.dsu-pri.immediate{color:#f3c4ba;border-color:var(--alert);background:#3a1f1d}
.dsu-pri.high{color:#f1d79b;border-color:var(--warn);background:#3a2d12}
.dsu-foot{margin:0;font-size:12.5px;color:var(--muted)}
.dsu-spin{animation:dsu-rot .9s linear infinite}
@keyframes dsu-rot{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.dsu-spin{animation:none}.dsu-seg button{transition:none}}
@media (max-width:980px){.dsu-layout{grid-template-columns:1fr;padding:16px}.dsu-form{position:static}.dsu-two{grid-template-columns:1fr}.dsu-header{padding:14px 16px}}
`;
