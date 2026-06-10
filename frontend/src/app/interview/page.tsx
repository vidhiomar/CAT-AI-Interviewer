"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Volume2, Mic } from "lucide-react";
import { api } from "@/service/api";
import { useInterviewStore } from "@/store/interviewStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

const MAX_QUESTIONS = 10;
const SILENCE_THRESHOLD = 0.02
const SILENCE_DURATION_MS = 3000;

export default function InterviewPage() {
  const router = useRouter(); 

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [displayedQuestion, setDisplayedQuestion] = useState("");

  const answerRef = useRef("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resolveFinalTranscriptionRef = useRef<(() => void) | null>(null);
  
  // MediaRecorder & Web Audio Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isSubmittingRef = useRef(false);
  const latestAutoSubmitRef = useRef<(() => void) | null>(null);

  const {
    profile,
    currentQuestion,
    setCurrentQuestion,
    conversation,
    addConversation,
    questionCount,
    incrementQuestionCount,
    currentTopic,
    topicDepth,
    incrementTopicDepth,
    setReport,
  } = useInterviewStore();

  const transcribeAudio = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "answer.webm");

      const res = await api.post("/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.transcript) {
        setAnswer(res.data.transcript);
        answerRef.current = res.data.transcript;
      }
    } catch (error) {
      console.error("Transcription error:", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      let chunkCount = 0;

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          // Removed continuous transcription to prevent 100% CPU lockup on backend
        }
      };

      recorder.onstop = async () => {
         const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
         await transcribeAudio(audioBlob);
         if (resolveFinalTranscriptionRef.current) {
             resolveFinalTranscriptionRef.current();
         }
      };

      // Silence Detection
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 512;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      
      let silenceStart = 0;
      let hasSpoken = false;

      const checkSilence = () => {
        analyser.getFloatTimeDomainData(dataArray);
        
        let sumSquares = 0.0;
        for (const amplitude of dataArray) {
          sumSquares += amplitude * amplitude;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);

        if (rms > SILENCE_THRESHOLD) {
          hasSpoken = true;
          silenceStart = 0; // Reset silence timer
        } else if (hasSpoken) {
          if (silenceStart === 0) {
            silenceStart = Date.now();
          } else if (Date.now() - silenceStart > SILENCE_DURATION_MS) {
            if (latestAutoSubmitRef.current) {
               latestAutoSubmitRef.current();
            }
            return; // Stop checking
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkSilence);
      };

      recorder.start(500); 
      setListening(true);
      checkSilence();

    } catch (error) {
      console.error("Microphone error:", error);
      alert("Please allow microphone access to answer questions.");
    }
  };

  const stopRecording = () => {
    setListening(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  const speakQuestion = async (question: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      setDisplayedQuestion(""); // Trigger loading state
      setAnswer(""); // Clear previous answer
      answerRef.current = "";

      const response = await api.post(
        "/speak",
        { text: question },
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(response.data);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        startRecording();
      };

      setDisplayedQuestion(question);
      await audio.play();
    } catch (error) {
      console.error("TTS Error:", error);
      setDisplayedQuestion(question);
      setTimeout(() => {
        startRecording();
      }, 300);
    }
  };

  useEffect(() => {
    if (!currentQuestion) return;
    speakQuestion(currentQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion]);

  useEffect(() => {
    return () => {
        stopRecording();
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    
    // Create a promise that resolves when the recorder.onstop transcription finishes
    const transcriptionPromise = new Promise<void>(resolve => {
        resolveFinalTranscriptionRef.current = resolve;
    });

    stopRecording();
    
    // Wait briefly for the final transcription API call from onstop to resolve (max 3 seconds)
    await Promise.race([
        transcriptionPromise,
        new Promise(resolve => setTimeout(resolve, 3000))
    ]);
    
    setLoading(true);

    const finalAnswer = answerRef.current.trim() || answer.trim() || "No verbal response recorded.";

    try {
      const updatedConversation = [
        ...conversation,
        {
          question: currentQuestion,
          answer: finalAnswer,
        },
      ];

      addConversation(currentQuestion, finalAnswer);

      if (questionCount >= MAX_QUESTIONS) {
        const reportResponse = await api.post("/evaluate", {
          profile,
          qa_pairs: updatedConversation,
        });

        setReport(reportResponse.data.report);
        router.push("/report");
        return;
      }

      const response = await api.post("/answer", {
        profile,
        previous_question: currentQuestion,
        candidate_answer: finalAnswer,
        conversation_history: updatedConversation,
        current_topic: currentTopic,
        topic_depth: topicDepth,
      });

      setCurrentQuestion(response.data.next_question);
      incrementQuestionCount();
      incrementTopicDepth();

    } catch (error) {
      console.error(error);
      alert("Failed to generate next question");
    } finally {
      setLoading(false);
    }
  };

  const autoSubmit = () => {
    if (!isSubmittingRef.current) {
      isSubmittingRef.current = true;
      handleSubmit().finally(() => {
        isSubmittingRef.current = false;
      });
    }
  };

  useEffect(() => {
    latestAutoSubmitRef.current = autoSubmit;
  });

  return (
  <div className="min-h-screen w-full bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-zinc-200 selection:text-zinc-900 flex flex-col justify-center items-center py-12">
    <div className="max-w-4xl w-full mx-auto px-6 md:px-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 mb-4">
          CAT MBA Interview
        </h1>
        <p className="text-lg text-zinc-500 font-medium max-w-xl mx-auto leading-relaxed">
          Speak naturally. Your responses are automatically transcribed and evaluated in real-time.
        </p>
      </div>

      <div className="mb-10 max-w-2xl mx-auto">
        <div className="flex justify-between items-end mb-3">
          <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
            Question {questionCount} of {MAX_QUESTIONS}
          </span>
          <span className="text-sm font-bold text-zinc-900">
            {Math.round((questionCount / MAX_QUESTIONS) * 100)}%
          </span>
        </div>
        <Progress
          value={(questionCount / MAX_QUESTIONS) * 100}
          className="h-2 bg-zinc-200 [&>div]:bg-zinc-900"
        />
      </div>

      <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 md:p-12 mb-8 shadow-sm max-w-3xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200" />
        
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
            <Volume2 className="h-5 w-5 text-zinc-700" />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">
            AI Interviewer
          </span>
        </div>

        <p className="text-2xl md:text-3xl font-semibold leading-tight text-zinc-800 tracking-tight min-h-[4rem]">
          {displayedQuestion || (
            <span className="text-zinc-400 animate-pulse flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              Generating audio...
            </span>
          )}
        </p>
      </div>

      <div className="bg-zinc-50 border border-zinc-200 rounded-[2rem] p-6 md:p-8 min-h-[250px] shadow-inner max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
            Transcription
          </h3>

          {listening ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200">
              <Mic className="h-3 w-3 animate-pulse" />
              Recording & Listening
            </div>
          ) : loading ? (
             <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200">
              <Loader2 className="h-3 w-3 animate-spin" />
              Evaluating
            </div>
          ) : (
             <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-3 py-1 bg-white rounded-full border border-zinc-200">
              Waiting for interviewer
            </span>
          )}
        </div>

        <Textarea
          value={answer}
          onChange={(e) => {
              setAnswer(e.target.value);
              answerRef.current = e.target.value;
          }}
          placeholder="Speak into your microphone. Faster Whisper will transcribe your audio automatically when you stop speaking."
          className="min-h-[180px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 p-0 text-xl leading-relaxed text-zinc-700 placeholder:text-zinc-300 font-medium"
        />

      </div>

      <div className="flex justify-center mt-12 mb-8">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={loading || !displayedQuestion}
          className="rounded-full px-10 py-7 text-lg font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {loading ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              Evaluating...
            </>
          ) : questionCount >= MAX_QUESTIONS ? (
            "Finish Interview"
          ) : (
            "Submit Answer"
          )}
        </Button>
      </div>
    </div>
  </div>
);
}