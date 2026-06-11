import { create } from "zustand";

interface QAPair {
  question: string;
  answer: string;
}

export interface ProctorEvent {
  type: "TAB_SWITCH" | "WINDOW_BLUR" | "FULLSCREEN_EXIT" | "FACE_MISSING" | "MULTIPLE_FACES" | "LOOKING_AWAY";
  timestamp: string;
}

interface InterviewState {
  profile: any;
  currentQuestion: string;
  questionCount: number;
  conversation: QAPair[];
  currentTopic: string;
  topicDepth: number;
  report: any;
  proctorEvents: ProctorEvent[];

  setProfile: (profile: any) => void;
  setCurrentQuestion: (question: string) => void;
  addConversation: (question: string, answer: string) => void;
  incrementQuestionCount: () => void;
  resetInterview: () => void;
  setCurrentTopic: (topic: string) => void;
  incrementTopicDepth: () => void;
  resetTopicDepth: () => void;
  setReport: (report: any) => void;
  addProctorEvent: (type: ProctorEvent["type"]) => void;
  resetProctorEvents: () => void;
}

export const useInterviewStore =
  create<InterviewState>((set) => ({
    profile: null,

    currentQuestion: "",
    questionCount: 1,
    conversation: [],
    currentTopic: "",
    topicDepth: 0,
    report: null,
    proctorEvents: [],

    setProfile: (profile) =>
      set({ profile }),

    setCurrentQuestion: (question) =>
      set({
        currentQuestion: question,
      }),

    addConversation: (
      question,
      answer
    ) =>
      set((state) => ({
        conversation: [
          ...state.conversation,
          {
            question,
            answer,
          },
        ],
      })),

    incrementQuestionCount: () =>
      set((state) => ({
        questionCount:
          state.questionCount + 1,
      })),

    setCurrentTopic: (topic) =>
      set({
        currentTopic: topic,
      }),

    incrementTopicDepth: () =>
      set((state) => ({
        topicDepth:
          state.topicDepth + 1,
      })),

    resetTopicDepth: () =>
      set({
        topicDepth: 0,
      }),

    setReport: (report) =>
      set({ report }),

    addProctorEvent: (type) =>
      set((state) => ({
        proctorEvents: [
          ...state.proctorEvents,
          { type, timestamp: new Date().toISOString() },
        ],
      })),

    resetProctorEvents: () => set({ proctorEvents: [] }),

    resetInterview: () =>
      set({
        currentQuestion: "",
        questionCount: 1,
        conversation: [],
        currentTopic: "",
        topicDepth: 0,
        report: null,
        proctorEvents: [],
      }),
  }));