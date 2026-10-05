<p align="center">
  <img src="https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
</p>

<h1 align="center">🛡️ SAHAYai (PredictAid)</h1>
<h3 align="center">Vernacular AI Disaster Management & Emergency Response Platform for India</h3>

<p align="center">
  <em>A state-of-the-art disaster intelligence platform that aggregates real-time telemetry — weather, seismic activity, air quality — and synthesizes life-saving operational response across 9 Indian languages.</em>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-ai-ml--dl-architecture">AI/ML Architecture</a> •
  <a href="#-generative-ai--nlp-engine">GenAI & NLP</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-lead--contributor">Project Owner</a>
</p>

---

## 🌟 Overview

**SAHAYai (PredictAid)** is a real-time, AI-driven command center for predicting, detecting, and managing natural disasters in India. It integrates:
- **Neural Disaster Prediction**: Client-side TensorFlow.js Deep MLPs for Hydrological Inundation (96.4% Accuracy) and Seismic Risk (83.5% Accuracy).
- **RAG-Grounded Crisis Copilot (Saarthi AI)**: Context-injected reasoning powered by Google Gemini Flash LLM and NDMA 2026 guidelines.
- **Multimodal Damage Assessment**: Computer vision image analysis for field damage assessment and emergency protocols.
- **Vernacular Cell Broadcast Engine**: Synthesizes 30-character micro-alerts and native script text-to-speech across 9 Indian languages.
- **Resilient Offline Architecture**: IndexedDB map caching and fallback execution for low-connectivity disaster zones.

---

## 🧠 AI, ML & DL Architecture

### 1. Classical Machine Learning & Mathematical Models
- **Z-Score Feature Normalization**: Standardizes multi-sensor weather and terrain parameters ($z = \frac{x - \mu}{\sigma}$) in [`src/utils/mlModels.ts`](src/utils/mlModels.ts) to guarantee unbiased neural activation.
- **Haversine Geodesic Indexing**: Calculates spherical distance between user coordinates and high-ground shelters/DEOC units in [`src/utils/mapTileCache.ts`](src/utils/mapTileCache.ts).
- **Multi-Factor Disaster Risk Matrix Engine**: Integrates live precipitation, wind velocity, humidity, and soil saturation to compute real-time alert levels in [`src/utils/earlyAlertsLogic.ts`](src/utils/earlyAlertsLogic.ts).

### 2. Deep Learning Neural Networks
- **Hydrological Inundation Neural Network**: 3-layer Dense MLP ($12 \rightarrow 16 \rightarrow 8 \rightarrow 1$) built with TensorFlow.js in [`src/utils/mlModels.ts`](src/utils/mlModels.ts), achieving **96.4% accuracy** (0.99 AUC-ROC).
- **Seismic Hazard Risk Neural Network**: 2-layer Dense MLP ($4 \rightarrow 8 \rightarrow 1$) evaluating magnitude, focal depth, and epicenter proximity (**83.5% accuracy**).
- **Client-Side GPU Execution**: Accelerated via WebGL/WASM tensor pipelines with strict tensor memory cleanup (`tensor.dispose()`).

---

## 💬 Generative AI, Transformers & NLP Engine

### 1. RAG-Grounded Crisis Copilot (Saarthi AI)
- Grounded in `disasterKnowledgeBase.json` and `shelterRegistry.json` in [`src/services/ragService.ts`](src/services/ragService.ts).
- Dynamically injects NDMA 2026 standard ratios (3.5L–15L water/person/day, 500g dry rations/person/day, trauma kits) into Gemini Flash LLM system prompts in [`src/services/geminiRAG.ts`](src/services/geminiRAG.ts).

### 2. Multimodal Vision Damage Assessor
- Powered by Gemini Flash Vision in [`src/services/imageAnalyzer.ts`](src/services/imageAnalyzer.ts).
- Converts disaster photos into structured JSON reports containing `hazardType`, `severityRating`, `fieldProtocols[]`, and public warnings.

### 3. Vernacular Micro-Alert Broadcast Synthesizer
- Generates high-urgency civil defense warnings strictly under 30 characters in native scripts across **9 Indian languages** (Hindi, Malayalam, Tamil, Telugu, Gujarati, Marathi, Assamese, Bengali, English) in [`src/utils/vernacularAlertSynthesizer.ts`](src/utils/vernacularAlertSynthesizer.ts).
- Implements Few-Shot Exemplar Prompting and Regex Unicode sanitization.

### 4. Natural Language Victim SOS Triage
- On-device Transformer pipeline using quantized `Xenova/mobilebert-uncased-mnli` in [`src/components/VolunteerHub.tsx`](src/components/VolunteerHub.tsx).
- Zero-Shot Natural Language Inference (NLI) classifies unstructured victim text into operational urgency categories (`Life Threatening SOS`, `Medical`, `Rescue`, `Supplies`, `General`).

---

## ✨ Key Features

- **🗺️ Live Heatmap & Interactive GIS**: Real-time Leaflet maps with OpenStreetMap tiles, dark-mode styling, and offline caching.
- **📢 Civil Radio & Voice Advisories**: Native script Web Speech API TTS for illiterate or visually impaired citizens.
- **📦 Relief Resource Calculator**: Itemized supply logistics calculation for food, water, and trauma kits during floods and landslides.
- **📱 Offline-First PWA**: Progressive Web App with service workers for uninterrupted field operations.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Shadcn UI
- **AI & Deep Learning**: Google Gemini Flash API (`@google/generative-ai`), TensorFlow.js (`@tensorflow/tfjs`), Transformers.js (`@xenova/transformers`)
- **Mapping & GIS**: Leaflet.js, OpenStreetMap
- **State & Database**: Supabase Client, LocalStorage, IndexedDB

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/navyaranjan264/VernacularAI-DisasterManagement.git
   cd VernacularAI-DisasterManagement
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. Start the Development Server:
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:8080/`.

---

## 👤 Project Owner & Lead Developer

<table>
<tr>
<td align="center">
  <a href="https://github.com/navyaranjan264">
    <img src="https://avatars.githubusercontent.com/u/navyaranjan264" width="120px;" alt="Navya Ranjan" style="border-radius: 50%;" /><br />
    <sub><b>Navya Ranjan</b></sub>
  </a>
  <br />
  <span>Lead Developer & Project Owner</span>
</td>
</tr>
</table>

---

<p align="center">
  <em>Developed for Indian Emergency Response & Civil Defense (NDMA / SDMA).</em>
</p>
