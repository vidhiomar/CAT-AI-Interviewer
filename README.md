# 🎓 CAT AI Interviewer

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![Python](https://img.shields.io/badge/Python-3.11-yellow)

**CAT AI Interviewer** is an advanced, fully-automated, proctored mock interview platform designed specifically for CAT/MBA aspirants. It conducts rigorous, dynamic, conversational interviews using state-of-the-art AI, while enforcing strict integrity checks through client-side proctoring.

---

## ✨ Features

- **🧠 Dynamic IIM-Style Interviewing**: Powered by **Groq / Llama 3**, the system asks highly contextual, probing questions based on the candidate's resume, pivoting to new topics dynamically.
- **🗣️ Real-time Voice Interaction**: High-speed offline transcription using **Faster Whisper** and instant Text-To-Speech integration.
- **🛡️ Advanced Live Proctoring**: 
  - Face detection & tracking via `face-api.js`
  - Tab switch detection
  - Window focus tracking
  - Fullscreen enforcement
- **📊 Comprehensive Analytics Dashboard**: Beautiful, multi-tabbed evaluation reports featuring radar charts, competency scoring, proctor logs, and a full interview transcript.

---

## 🏗️ System Architecture

The application is built on a decoupled architecture, separating the real-time client interface from the heavy AI processing backend.

```mermaid
graph TD
    subgraph Frontend [Next.js Client]
        UI[React UI Components]
        Audio[Audio Context / PCM Capture]
        Video[WebRTC Camera Feed]
        Face[face-api.js Face Tracker]
        State[Zustand Store]
    end

    subgraph Backend [FastAPI Server]
        API[REST Endpoints]
        STT[Faster Whisper STT]
        LLM[Groq Llama 3 API]
        EVAL[Evaluation Agent]
    end

    UI <--> |State| State
    Video --> Face
    Audio --> |WAV Audio| API
    
    API --> STT
    API --> LLM
    API --> EVAL
    
    Face -.-> |Proctor Events| State
    State -.-> |Final Submission| API
```

---

## 🔄 Interview Workflow

The candidate experiences a seamless, automated flow from hardware setup to final evaluation.

```mermaid
sequenceDiagram
    actor Candidate
    participant UI as Frontend
    participant AI as Backend AI
    participant Proctor as Proctor System

    Candidate->>UI: Start Interview Setup
    UI->>Candidate: Request Mic/Cam Permissions
    Proctor->>UI: Begin continuous monitoring
    
    loop Interview Loop (Max N questions)
        AI->>UI: TTS Question Audio
        UI->>Candidate: Play Audio
        Candidate->>UI: Speak Answer
        UI->>AI: Send Audio (WAV)
        AI->>AI: Whisper STT & Llama 3 Inference
    end
    
    UI->>AI: Submit All Q&A + Proctor Logs
    AI->>AI: Generate Holistic Evaluation
    AI->>UI: Return Final Report
    UI->>Candidate: Display Dashboard & Charts
```

---

## 🛡️ Proctoring State Machine

The integrity of the interview is maintained strictly on the client side, logging violations to be factored into the final **Integrity Score**.

```mermaid
stateDiagram-v2
    [*] --> Setup
    Setup --> Monitoring : Permissions Granted & Fullscreen
    
    state Monitoring {
        [*] --> Clear
        
        Clear --> TabSwitch : document.hidden
        TabSwitch --> Clear : Return
        
        Clear --> FocusLost : window.blur
        FocusLost --> Clear : window.focus
        
        Clear --> FaceMissing : Face not detected > 5s
        FaceMissing --> Clear : Face returns
        
        Clear --> MultiFace : > 1 face detected
        MultiFace --> Clear : 1 face detected
        
        Clear --> LookingAway : Landmark yaw threshold exceeded
        LookingAway --> Clear : Face centered
    }
    
    Monitoring --> Evaluation : Interview Complete
    Evaluation --> [*]
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Groq API Key

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

Set up your environment variables:
Create a `.env` file in the `backend` directory:
```env
GROQ_API_KEY=your_api_key_here
```

Run the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🎨 Design Philosophy

- **No Dark Mode**: The UI is explicitly designed in a clean, professional, premium light-theme utilizing Tailwind's `zinc`, `blue`, and `emerald` color palettes to simulate a formal examination environment.
- **Micro-interactions**: Extensive use of pulsing animations, gradient borders, and smooth transitions to keep the candidate engaged and aware of the system's state (e.g., listening, evaluating, speaking).

---

Made with ❤️ for MBA Aspirants.
