import { create } from "zustand";

interface QAPair {
  question: string;
  answer: string;
}

interface InterviewState {
  profile: any;

  currentQuestion: string;

  questionCount: number;

  conversation: QAPair[];

  currentTopic: string;

  topicDepth: number;

  report: any;

  setProfile: (profile: any) => void;

  setCurrentQuestion: (
    question: string
  ) => void;

  addConversation: (
    question: string,
    answer: string
  ) => void;

  incrementQuestionCount: () => void;

  resetInterview: () => void;

  setCurrentTopic: (
    topic: string
  ) => void;

  incrementTopicDepth: () => void;

  resetTopicDepth: () => void;

  setReport: (report: any) => void;
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
      set({
        report,
      }),

    resetInterview: () =>
      set({
        currentQuestion: "",
        questionCount: 1,
        conversation: [],
        currentTopic: "",
        topicDepth: 0,
        report: null,
      }),
  }));