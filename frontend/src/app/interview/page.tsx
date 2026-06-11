"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Volume2, Mic, AlertTriangle,
  Shield, ShieldOff, ShieldCheck, Camera,
  CheckCircle2, XCircle, ChevronRight
} from "lucide-react";
import { api } from "@/service/api";
import { useInterviewStore, ProctorEvent } from "@/store/interviewStore";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const MAX_QUESTIONS = 10;
const SILENCE_THRESHOLD = 0.015;
const SILENCE_DURATION_MS = 3000;
const TARGET_SR = 16000;
const FACE_CHECK_INTERVAL_MS = 2000;
const FACE_MISSING_GRACE_MS = 5000;

// ─── WAV encoder ──────────────────────────────────────────────────────────────
function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const str = (off: number, s: string) =>
    [...s].forEach((c, i) => v.setUint8(off + i, c.charCodeAt(0)));
  str(0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true);
  str(8, "WAVE"); str(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, 1, true); v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true); v.setUint16(32, 2, true);
  v.setUint16(34, 16, true); str(36, "data");
  v.setUint32(40, samples.length * 2, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: "audio/wav" });
}

async function resampleToWav(chunks: Float32Array[], nativeSR: number): Promise<Blob> {
  const totalLen = chunks.reduce((s, c) => s + c.length, 0);
  if (totalLen === 0) return new Blob([], { type: "audio/wav" });
  const flat = new Float32Array(totalLen);
  let off = 0;
  for (const c of chunks) { flat.set(c, off); off += c.length; }
  const offline = new OfflineAudioContext(1, Math.ceil((totalLen / nativeSR) * TARGET_SR), TARGET_SR);
  const srcBuf = offline.createBuffer(1, totalLen, nativeSR);
  srcBuf.getChannelData(0).set(flat);
  const src = offline.createBufferSource();
  src.buffer = srcBuf; src.connect(offline.destination); src.start(0);
  const rendered = await offline.startRendering();
  return encodeWAV(rendered.getChannelData(0), TARGET_SR);
}

// ─── Pre-interview Setup Screen ───────────────────────────────────────────────
type PermStatus = "idle" | "requesting" | "granted" | "denied";

interface SetupScreenProps {
  onReady: (camStream: MediaStream) => void;
}

function SetupScreen({ onReady }: SetupScreenProps) {
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const [micStatus, setMicStatus] = useState<PermStatus>("idle");
  const [camStatus, setCamStatus] = useState<PermStatus>("idle");
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const requestPermissions = async () => {
    setMicStatus("requesting");
    setCamStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 320, height: 240, facingMode: "user" },
      });
      setMicStatus("granted");
      setCamStatus("granted");
      setCamStream(stream);
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.play();
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicStatus("denied");
        setCamStatus("denied");
      } else {
        // Try mic only
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicStatus("granted");
          setCamStatus("denied");
        } catch {
          setMicStatus("denied");
          setCamStatus("denied");
        }
      }
    }
  };

  const handleBegin = async () => {
    setIsStarting(true);
    try {
      await document.documentElement.requestFullscreen();
    } catch (_) { /* fullscreen optional */ }
    onReady(camStream!);
  };

  const allReady = micStatus === "granted";

  const StatusIcon = ({ status }: { status: PermStatus }) => {
    if (status === "granted") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    if (status === "denied") return <XCircle className="h-5 w-5 text-red-500" />;
    if (status === "requesting") return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    return <div className="h-5 w-5 rounded-full border-2 border-zinc-300" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <Shield className="h-4 w-4" />
            Proctored Interview
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 mb-4">
            Ready to Begin?
          </h1>
          <p className="text-lg text-zinc-500 max-w-lg mx-auto leading-relaxed">
            We need access to your microphone and camera to start your CAT MBA Interview session.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Camera preview */}
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="bg-zinc-50 border-b border-zinc-100 px-5 py-3 flex items-center gap-2">
              <Camera className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-bold text-zinc-600">Camera Preview</span>
            </div>
            <div className="relative aspect-video bg-zinc-100 flex items-center justify-center">
              <video
                ref={previewRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                style={{ display: camStatus === "granted" ? "block" : "none" }}
              />
              {camStatus !== "granted" && (
                <div className="text-center text-zinc-400 p-8">
                  <Camera className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">
                    {camStatus === "denied" ? "Camera access denied" : "Camera preview will appear here"}
                  </p>
                </div>
              )}
              {camStatus === "granted" && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 text-white rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Camera Active
                </div>
              )}
            </div>
          </div>

          {/* Permissions & checklist */}
          <div className="flex flex-col gap-4">
            {/* Permission items */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-5">
                Required Permissions
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Mic className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-800">Microphone</p>
                      <p className="text-xs text-zinc-400">For voice transcription</p>
                    </div>
                  </div>
                  <StatusIcon status={micStatus} />
                </div>

                <div className="h-px bg-zinc-100" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Camera className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-800">Camera</p>
                      <p className="text-xs text-zinc-400">For proctoring & face detection</p>
                    </div>
                  </div>
                  <StatusIcon status={camStatus} />
                </div>
              </div>

              {micStatus === "idle" && (
                <Button
                  onClick={requestPermissions}
                  className="w-full mt-5 rounded-2xl py-6 bg-zinc-900 text-white hover:bg-zinc-800 font-bold text-sm"
                >
                  Grant Access
                </Button>
              )}

              {(micStatus === "denied" || camStatus === "denied") && (
                <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700">
                  <p className="font-semibold mb-1">Permission denied</p>
                  <p className="text-xs">Please allow access in your browser settings and refresh the page.</p>
                </div>
              )}
            </div>

            {/* Interview rules */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">
                Interview Rules
              </h3>
              <ul className="space-y-2.5">
                {[
                  "Stay in fullscreen throughout the session",
                  "Do not switch tabs or windows",
                  "Keep your face clearly visible",
                  "Speak clearly — answers auto-submit after 3s of silence",
                  "Violations are recorded in your integrity report",
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Begin button */}
            <Button
              onClick={handleBegin}
              disabled={!allReady || isStarting}
              className="rounded-2xl py-7 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {isStarting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Starting Interview…</>
              ) : (
                <>Begin Interview <ChevronRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Interview Component ─────────────────────────────────────────────────
export default function InterviewPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<"setup" | "interview">("setup");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [displayedQuestion, setDisplayedQuestion] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [faceStatus, setFaceStatus] = useState<"ok" | "missing" | "multiple" | "away">("ok");
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);

  const answerRef = useRef("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const capturedChunksRef = useRef<Float32Array[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSubmittingRef = useRef(false);
  const latestSubmitRef = useRef<(() => Promise<void>) | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const faceMissingStartRef = useRef<number>(0);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const faceApiRef = useRef<any>(null);

  const {
    profile, currentQuestion, setCurrentQuestion,
    conversation, addConversation,
    questionCount, incrementQuestionCount,
    currentTopic, topicDepth, incrementTopicDepth,
    setReport, proctorEvents, addProctorEvent,
  } = useInterviewStore();

  // ─── Warning helper ──────────────────────────────────────────────────────
  const pushWarning = useCallback((msg: string) => {
    setWarnings(prev => [msg, ...prev].slice(0, 4));
    setTimeout(() => setWarnings(prev => prev.filter(w => w !== msg)), 5000);
  }, []);

  const logEvent = useCallback((type: ProctorEvent["type"], msg: string) => {
    addProctorEvent(type);
    pushWarning(msg);
  }, [addProctorEvent, pushWarning]);

  // ─── Proctoring events ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "interview") return;
    const onHide = () => logEvent("TAB_SWITCH", "⚠ Tab switch detected");
    const onBlur = () => logEvent("WINDOW_BLUR", "⚠ Window focus lost");
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("blur", onBlur);
    };
  }, [phase, logEvent]);

  useEffect(() => {
    const onFS = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        if (phase === "interview") logEvent("FULLSCREEN_EXIT", "⚠ Fullscreen exited");
      } else setIsFullscreen(true);
    };
    document.addEventListener("fullscreenchange", onFS);
    return () => document.removeEventListener("fullscreenchange", onFS);
  }, [phase, logEvent]);

  // ─── Face detection ───────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const faceapi = await import("face-api.js");
        faceApiRef.current = faceapi;
        const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        setFaceApiLoaded(true);
      } catch (e) { console.warn("face-api.js failed to load:", e); }
    };
    load();
  }, []);

  const startFaceDetection = useCallback((stream: MediaStream) => {
    cameraStreamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
    if (!faceApiLoaded) return;

    faceIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !faceApiRef.current) return;
      try {
        const dets = await faceApiRef.current.detectAllFaces(
          videoRef.current,
          new faceApiRef.current.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
        ).withFaceLandmarks(true);

        if (dets.length === 0) {
          if (faceMissingStartRef.current === 0) faceMissingStartRef.current = Date.now();
          else if (Date.now() - faceMissingStartRef.current > FACE_MISSING_GRACE_MS) {
            setFaceStatus("missing");
            logEvent("FACE_MISSING", "⚠ Face not detected for 5+ seconds");
            faceMissingStartRef.current = 0;
          }
        } else if (dets.length > 1) {
          faceMissingStartRef.current = 0;
          setFaceStatus("multiple");
          logEvent("MULTIPLE_FACES", "⚠ Multiple faces detected");
        } else {
          faceMissingStartRef.current = 0;
          const l = dets[0].landmarks;
          const lEye = l.getLeftEye(), rEye = l.getRightEye(), nose = l.getNose();
          const cx = (lEye[0].x + rEye[3].x) / 2;
          const ew = Math.abs(rEye[3].x - lEye[0].x);
          if (Math.abs(nose[3].x - cx) > ew * 0.35) {
            setFaceStatus("away");
            logEvent("LOOKING_AWAY", "⚠ Looking away detected");
          } else setFaceStatus("ok");
        }
      } catch (_) { /* silent */ }
    }, FACE_CHECK_INTERVAL_MS);
  }, [faceApiLoaded, logEvent]);

  const stopCamera = () => {
    if (faceIntervalRef.current) clearInterval(faceIntervalRef.current);
    cameraStreamRef.current?.getTracks().forEach(t => t.stop());
    cameraStreamRef.current = null;
  };

  // ─── Called when setup is complete ───────────────────────────────────────
  const handleSetupReady = useCallback((camStream: MediaStream) => {
    cameraStreamRef.current = camStream;
    setPhase("interview");
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    if (phase === "interview" && cameraStreamRef.current) {
      startFaceDetection(cameraStreamRef.current);
    }
  }, [phase, startFaceDetection]);

  // ─── Audio / countdown helpers ────────────────────────────────────────────
  const clearCountdown = () => {
    if (countdownTimerRef.current) { clearTimeout(countdownTimerRef.current); countdownTimerRef.current = null; }
    setCountdown(null);
  };

  const startCountdown = () => {
    clearCountdown();
    let n = 3; setCountdown(n);
    const tick = () => {
      n -= 1;
      if (n <= 0) {
        setCountdown(null);
        if (!isSubmittingRef.current && latestSubmitRef.current) {
          isSubmittingRef.current = true;
          latestSubmitRef.current().finally(() => { isSubmittingRef.current = false; });
        }
      } else { setCountdown(n); countdownTimerRef.current = setTimeout(tick, 1000); }
    };
    countdownTimerRef.current = setTimeout(tick, 1000);
  };

  const transcribeAudio = async (wavBlob: Blob) => {
    if (wavBlob.size < 200) return;
    try {
      const form = new FormData();
      form.append("audio", wavBlob, "answer.wav");
      const res = await api.post("/transcribe", form, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.transcript) { setAnswer(res.data.transcript); answerRef.current = res.data.transcript; }
    } catch (err) { console.error("Transcription error:", err); }
  };

  const stopRecording = () => {
    setListening(false);
    processorRef.current?.disconnect(); processorRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null;
    if (audioCtxRef.current?.state !== "closed") audioCtxRef.current?.close();
    audioCtxRef.current = null;
  };

  const startRecording = async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = micStream;
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC() as AudioContext;
      audioCtxRef.current = ctx;
      const nativeSR = ctx.sampleRate;
      const source = ctx.createMediaStreamSource(micStream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      capturedChunksRef.current = [];
      let hasSpoken = false, silenceStart = 0, triggered = false;

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        capturedChunksRef.current.push(new Float32Array(input));
        let sumSq = 0;
        for (const a of input) sumSq += a * a;
        const rms = Math.sqrt(sumSq / input.length);
        if (rms > SILENCE_THRESHOLD) {
          hasSpoken = true; silenceStart = 0; clearCountdown();
        } else if (hasSpoken && !triggered) {
          if (silenceStart === 0) silenceStart = Date.now();
          if (Date.now() - silenceStart >= SILENCE_DURATION_MS) {
            triggered = true;
            processor.disconnect(); source.disconnect();
            startCountdown();
            const chunks = [...capturedChunksRef.current];
            resampleToWav(chunks, nativeSR).then(transcribeAudio).catch(console.error);
          }
        }
      };
      source.connect(processor);
      processor.connect(ctx.destination);
      setListening(true);
    } catch (err) {
      console.error("Microphone error:", err);
    }
  };

  // ─── TTS ──────────────────────────────────────────────────────────────────
  const speakQuestion = async (question: string) => {
    stopRecording(); clearCountdown();
    if (audioRef.current) audioRef.current.pause();
    setDisplayedQuestion(""); setAnswer(""); answerRef.current = "";
    try {
      const res = await api.post("/speak", { text: question }, { responseType: "blob" });
      const audio = new Audio(URL.createObjectURL(res.data));
      audioRef.current = audio;
      audio.onended = () => startRecording();
      setDisplayedQuestion(question);
      await audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      setDisplayedQuestion(question);
      setTimeout(startRecording, 300);
    }
  };

  useEffect(() => {
    if (phase !== "interview" || !currentQuestion) return;
    speakQuestion(currentQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, phase]);

  useEffect(() => {
    return () => {
      stopRecording(); clearCountdown(); stopCamera();
      audioRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    stopRecording(); clearCountdown(); setLoading(true);
    const finalAnswer = answerRef.current.trim() || answer.trim() || "No verbal response recorded.";
    try {
      const updated = [...conversation, { question: currentQuestion, answer: finalAnswer }];
      addConversation(currentQuestion, finalAnswer);
      if (questionCount >= MAX_QUESTIONS) {
        const r = await api.post("/evaluate", { profile, qa_pairs: updated, proctor_events: proctorEvents });
        setReport(r.data.report);
        router.push("/report");
        return;
      }
      const r = await api.post("/answer", {
        profile, previous_question: currentQuestion, candidate_answer: finalAnswer,
        conversation_history: updated, current_topic: currentTopic, topic_depth: topicDepth,
      });
      setCurrentQuestion(r.data.next_question);
      incrementQuestionCount();
      incrementTopicDepth();
    } catch (err) {
      console.error(err);
      alert("Failed to generate next question.");
    } finally { setLoading(false); }
  };

  useEffect(() => { latestSubmitRef.current = handleSubmit; });

  // ─── Render ───────────────────────────────────────────────────────────────
  if (phase === "setup") return <SetupScreen onReady={handleSetupReady} />;

  const violationCount = proctorEvents.length;
  const integrityColor = violationCount === 0 ? "text-emerald-600" : violationCount <= 2 ? "text-amber-600" : "text-red-600";
  const integrityBg = violationCount === 0 ? "bg-emerald-50 border-emerald-200" : violationCount <= 2 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
  const IntegrityIcon = violationCount === 0 ? ShieldCheck : violationCount <= 2 ? Shield : ShieldOff;

  const faceColor = faceStatus === "ok" ? "bg-emerald-500" : "bg-red-500";
  const faceLabel = { ok: "Face OK", missing: "No Face", multiple: "Multi-Face", away: "Looking Away" }[faceStatus];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 font-sans">
      {/* Warning toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
        {warnings.map((w, i) => (
          <div key={i} className="flex items-start gap-2.5 bg-white border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium shadow-xl">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
            {w}
          </div>
        ))}
      </div>

      {/* Fullscreen banner */}
      {!isFullscreen && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-amber-500 text-white text-center py-2.5 text-sm font-bold flex items-center justify-center gap-3 shadow-md">
          <AlertTriangle className="h-4 w-4" />
          Fullscreen mode required.
          <button
            onClick={() => document.documentElement.requestFullscreen()}
            className="underline font-black ml-1 hover:no-underline"
          >
            Return to Fullscreen →
          </button>
        </div>
      )}

      <div className={`max-w-6xl mx-auto px-6 py-8 ${!isFullscreen ? "pt-16" : ""}`}>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">CAT MBA Interview</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Auto-submits after 3 seconds of silence</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Face status */}
            {faceApiLoaded && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${faceStatus === "ok" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                <div className={`h-2 w-2 rounded-full ${faceColor} ${faceStatus !== "ok" ? "animate-pulse" : ""}`} />
                {faceLabel}
              </div>
            )}
            {/* Integrity */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${integrityBg} ${integrityColor}`}>
              <IntegrityIcon className="h-3.5 w-3.5" />
              {violationCount === 0 ? "Clean" : `${violationCount} violation${violationCount > 1 ? "s" : ""}`}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">
            <span>Question {questionCount} of {MAX_QUESTIONS}</span>
            <span>{Math.round((questionCount / MAX_QUESTIONS) * 100)}%</span>
          </div>
          <Progress value={(questionCount / MAX_QUESTIONS) * 100} className="h-1.5 bg-zinc-200 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Q + Answer */}
          <div className="lg:col-span-2 space-y-5">
            {/* Question card */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Volume2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/80">AI Interviewer</span>
              </div>
              <div className="p-7">
                <p className="text-xl md:text-2xl font-semibold leading-snug text-zinc-800 tracking-tight min-h-[3.5rem]">
                  {displayedQuestion || (
                    <span className="text-zinc-400 flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="text-base">Generating question…</span>
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Answer card */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col items-center justify-center min-h-[280px] relative">
              {loading ? (
                <div className="flex flex-col items-center gap-4 text-blue-600 animate-in fade-in zoom-in duration-300">
                  <Loader2 className="h-10 w-10 animate-spin" /> 
                  <span className="font-bold text-lg tracking-tight">Evaluating Answer...</span>
                </div>
              ) : countdown !== null ? (
                <div className="flex flex-col items-center gap-4 text-amber-600 animate-in fade-in zoom-in duration-300">
                  <div className="h-12 w-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
                  <span className="font-bold text-lg tracking-tight">Submitting in {countdown}...</span>
                </div>
              ) : listening ? (
                <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
                    <div className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center relative z-10 shadow-xl shadow-emerald-200">
                       <Mic className="h-10 w-10 text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 bg-emerald-400 rounded-full animate-pulse"
                        style={{
                          height: `${12 + Math.random() * 16}px`,
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: `0.8s`,
                        }}
                      />
                    ))}
                    <span className="ml-3 font-bold text-xl text-emerald-600 tracking-tight">Recording your answer...</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-zinc-400 animate-in fade-in zoom-in duration-300">
                  <Volume2 className="h-12 w-12 opacity-50" />
                  <span className="font-bold text-lg tracking-tight">Listen to the question...</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Camera + Proctor log */}
          <div className="space-y-5">
            {/* Camera */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="bg-zinc-50 border-b border-zinc-100 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Proctoring</span>
                </div>
                {faceApiLoaded ? (
                  <div className={`h-2 w-2 rounded-full ${faceColor} ${faceStatus !== "ok" ? "animate-pulse" : ""}`} />
                ) : (
                  <Loader2 className="h-3 w-3 text-zinc-400 animate-spin" />
                )}
              </div>
              <div className="relative aspect-[4/3] bg-zinc-100">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                {faceStatus !== "ok" && (
                  <div className="absolute inset-0 border-2 border-red-400 rounded-none pointer-events-none" />
                )}
                {faceStatus !== "ok" && (
                  <div className="absolute bottom-2 left-2 right-2 bg-red-600 text-white text-xs font-bold py-1.5 px-3 rounded-xl text-center">
                    {faceLabel}
                  </div>
                )}
              </div>
            </div>

            {/* Proctor log */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-5">
              <div className={`flex items-center gap-2 mb-4 pb-3 border-b border-zinc-100`}>
                <IntegrityIcon className={`h-4 w-4 ${integrityColor}`} />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Integrity Log</span>
                {violationCount > 0 && (
                  <span className={`ml-auto text-xs font-black px-2 py-0.5 rounded-full ${violationCount <= 2 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    {violationCount}
                  </span>
                )}
              </div>
              {proctorEvents.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  No violations
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {[...proctorEvents].reverse().map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-50 last:border-0">
                      <span className="font-semibold text-red-600">{e.type.replace(/_/g, " ")}</span>
                      <span className="text-zinc-400 tabular-nums">{new Date(e.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}