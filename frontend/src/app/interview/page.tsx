"use client";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import { useRouter } from "next/navigation";

import {
  Loader2,
  Volume2,
} from "lucide-react";

import { api } from "@/service/api";

import { useInterviewStore } from "@/store/interviewStore";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

const MAX_QUESTIONS = 10;

export default function InterviewPage() {
  const router = useRouter();
  

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] =
    useState(false);

  const [listening, setListening] =
    useState(false);

    const recognitionRef =
    useRef<any>(null);

    const recognitionActiveRef =
    useRef(false);

    const transcriptRef = useRef("");

    const audioRef =
    useRef<HTMLAudioElement | null>(
        null
    );

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

  useEffect(() => {
    if (
      typeof window === "undefined"
    )
      return;

    const SpeechRecognition =
      (
        window as any
      ).SpeechRecognition ||
      (
        window as any
      ).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn(
        "Speech Recognition not supported"
      );
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.onstart = () => {
        setListening(true);

        recognitionActiveRef.current =
            true;
    };

    recognition.onend = () => {
    setListening(false);

    recognitionActiveRef.current =
        false;
    };
    

    recognition.onerror = (
        error: any
        ) => {
        console.error(error);

        setListening(false);

        recognitionActiveRef.current =
            false;
    };

    recognition.onresult = (
  event: any
) => {
  let interimTranscript = "";
  let newFinalTranscript = "";

  for (
    let i = event.resultIndex;
    i < event.results.length;
    i++
  ) {
    if (event.results[i].isFinal) {
      newFinalTranscript += event.results[i][0].transcript + " ";
    } else {
      interimTranscript += event.results[i][0].transcript;
    }
  }

  if (newFinalTranscript) {
    transcriptRef.current += newFinalTranscript;
  }

  setAnswer(
    (transcriptRef.current + interimTranscript).trim()
  );
};

    recognitionRef.current =
      recognition;
  }, []);


  const speakQuestion = (
    question: string
  ) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(question);
        
        const voices = window.speechSynthesis.getVoices();
        const localVoice = voices.find((v: any) => v.lang.startsWith('en') && v.localService);
        if (localVoice) {
            utterance.voice = localVoice;
        }
        
        utterance.rate = 1.05;

        utterance.onend = () => {
          setTimeout(() => {
            startListening();
          }, 300);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          startListening();
        }, 300);
      }
    } catch (error) {
      console.error(
        "TTS Error:",
        error
      );
    }
  };


  const startListening = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  if (
    recognitionActiveRef.current
  ) {
    return;
  }

  try {
    recognitionRef.current?.start();
  } catch (error) {
    console.log(
      "Recognition already running"
    );
  }
};


  useEffect(() => {
  if (!currentQuestion)
    return;

  speakQuestion(
    currentQuestion
  );
}, [currentQuestion]);


    useEffect(() => {
    return () => {
        recognitionRef.current?.stop();

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };
    }, []);

  const handleSubmit =
    async () => {

        recognitionRef.current?.stop();
      if (!answer.trim()) return;

      setLoading(true);

      try {
        const updatedConversation =
          [
            ...conversation,
            {
              question:
                currentQuestion,

              answer,
            },
          ];

        addConversation(
          currentQuestion,
          answer
        );

        // ==================
        // Final Evaluation
        // ==================

        if (
          questionCount >=
          MAX_QUESTIONS
        ) {
          const reportResponse =
            await api.post(
              "/evaluate",
              {
                profile,

                qa_pairs:
                  updatedConversation,
              }
            );

          setReport(
            reportResponse.data
              .report
          );

          router.push(
            "/report"
          );

          return;
        }

        const response =
          await api.post(
            "/answer",
            {
              profile,

              previous_question:
                currentQuestion,

              candidate_answer:
                answer,

              conversation_history:
                updatedConversation,

              current_topic:
                currentTopic,

              topic_depth:
                topicDepth,
            }
          );

        setAnswer("");
        transcriptRef.current = "";

        setCurrentQuestion(
        response.data.next_question
        );

        incrementQuestionCount();

        incrementTopicDepth();

      } catch (error) {
        console.error(error);

        alert(
          "Failed to generate next question"
        );
      } finally {
        setLoading(false);
      }
    };

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

      <div className="flex items-center justify-center gap-3 mb-10 p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm max-w-2xl mx-auto text-zinc-600 font-medium">
        <span className="text-xl">🎙️</span>
        <p className="text-sm">Wait for the interviewer to finish speaking, then answer naturally.</p>
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

        <p className="text-2xl md:text-3xl font-semibold leading-tight text-zinc-800 tracking-tight">
          {currentQuestion}
        </p>
      </div>

      <div className="bg-zinc-50 border border-zinc-200 rounded-[2rem] p-6 md:p-8 min-h-[250px] shadow-inner max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
            Live Transcript
          </h3>

          {listening ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Listening
            </div>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-3 py-1 bg-white rounded-full border border-zinc-200">
              Waiting for speech
            </span>
          )}
        </div>

        <Textarea
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            transcriptRef.current = e.target.value;
          }}
          placeholder="Your answer will appear here as you speak..."
          className="min-h-[180px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 p-0 text-xl leading-relaxed text-zinc-700 placeholder:text-zinc-300 font-medium"
        />
      </div>

      <div className="flex justify-center mt-12 mb-8">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={loading || !answer.trim()}
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