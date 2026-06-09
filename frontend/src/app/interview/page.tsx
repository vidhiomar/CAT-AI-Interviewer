"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/service/api";

import { useInterviewStore } from "@/store/interviewStore";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

const MAX_QUESTIONS = 10;

export default function InterviewPage() {
  const router = useRouter();

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setLoading(true);

    try {
      const updatedConversation = [
        ...conversation,
        {
          question: currentQuestion,
          answer: answer,
        },
      ];

      addConversation(
        currentQuestion,
        answer
      );

      if (questionCount >= MAX_QUESTIONS) {
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
          reportResponse.data.report
        );

        router.push("/report");

        return;
      }

      const response = await api.post(
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

      setCurrentQuestion(
        response.data.next_question
      );

      incrementQuestionCount();

      incrementTopicDepth();

      setAnswer("");
    } catch (error) {
      console.error(error);

      alert(
        "Failed to generate next question"
      );
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">
        CAT AI Interviewer
      </h1>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
            Question {questionCount} of {MAX_QUESTIONS}
            </span>

            <span>
            {Math.round(
                (questionCount / MAX_QUESTIONS) * 100
            )}
            %
            </span>
        </div>

        <Progress
            value={
            (questionCount / MAX_QUESTIONS) * 100
            }
        />
        </div>

      <p className="text-sm text-muted-foreground mb-6">
        Current Topic:{" "}
        {currentTopic ||
          "Resume Discussion"}
      </p>

      <div className="border rounded-xl p-6 mb-6 bg-card shadow-sm">
            <p className="text-sm text-muted-foreground mb-2">
                AI Interviewer
            </p>

            <p className="text-lg leading-relaxed font-medium">
                {currentQuestion}
            </p>
        </div>

      <Textarea
        placeholder="Type your answer here..."
        value={answer}
        onChange={(e) =>
          setAnswer(e.target.value)
        }
        className="min-h-[200px]"
      />

      <Button
        className="mt-4"
        onClick={handleSubmit}
        disabled={loading}
        >
        {loading ? (
            <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            AI is thinking...
            </>
        ) : questionCount >= MAX_QUESTIONS ? (
            "Finish Interview"
        ) : (
            "Submit Answer"
        )}
        </Button>
    </div>
  );
}