"use client";

import { useInterviewStore } from "@/store/interviewStore";
import { Progress } from "@/components/ui/progress";

export default function ReportPage() {
  const { report } = useInterviewStore();

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">
          No report available.
        </p>
      </div>
    );
  }

  const getReadinessLabel = (
    score: number
  ) => {
    if (score >= 85)
      return "Excellent MBA Candidate";

    if (score >= 70)
      return "Strong MBA Candidate";

    if (score >= 55)
      return "Average MBA Candidate";

    return "Needs Improvement";
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}

      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Interview Completed 🎉
        </h1>

        <p className="text-muted-foreground mt-2">
          Here's your detailed CAT MBA
          interview assessment.
        </p>
      </div>

      {/* Summary Cards */}

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="border rounded-xl p-6">
          <p className="text-sm text-muted-foreground">
            Overall Score
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {report.overall_score}/10
          </h2>
        </div>

        <div className="border rounded-xl p-6">
          <p className="text-sm text-muted-foreground">
            MBA Readiness
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {report.mba_readiness}/100
          </h2>
        </div>

        <div className="border rounded-xl p-6">
          <p className="text-sm text-muted-foreground">
            Recommendation
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {
              report.final_recommendation
            }
          </h2>
        </div>
      </div>

      {/* MBA Readiness */}

      <div className="border rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-lg mb-3">
          MBA Readiness Score
        </h2>

        <Progress
          value={report.mba_readiness}
        />

        <p className="mt-3 text-sm text-muted-foreground">
          {getReadinessLabel(
            report.mba_readiness
          )}
        </p>
      </div>

      {/* Score Dashboard */}

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            Communication
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {
              report.communication_score
            }
          </h3>
        </div>

        <div className="border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            Leadership
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {report.leadership_score}
          </h3>
        </div>

        <div className="border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            Experience
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {report.experience_score}
          </h3>
        </div>

        <div className="border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            Problem Solving
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {
              report.problem_solving_score
            }
          </h3>
        </div>

        <div className="border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            Technical Skills
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {
              report.technical_skills_score
            }
          </h3>
        </div>

        <div className="border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            MBA Alignment
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {report.alignment_score}
          </h3>
        </div>
      </div>

      {/* Strengths */}

      <div className="border rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">
          💪 Strengths
        </h2>

        <ul className="list-disc pl-5 space-y-2">
          {report.strengths?.map(
            (
              strength: string,
              index: number
            ) => (
              <li key={index}>
                {strength}
              </li>
            )
          )}
        </ul>
      </div>

      {/* Weaknesses */}

      <div className="border rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">
          ⚠ Weaknesses
        </h2>

        <ul className="list-disc pl-5 space-y-2">
          {report.weaknesses?.map(
            (
              weakness: string,
              index: number
            ) => (
              <li key={index}>
                {weakness}
              </li>
            )
          )}
        </ul>
      </div>

      {/* Improvements */}

      <div className="border rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">
          📈 Areas For Improvement
        </h2>

        <ul className="list-disc pl-5 space-y-2">
          {report.areas_for_improvement?.map(
            (
              item: string,
              index: number
            ) => (
              <li key={index}>
                {item}
              </li>
            )
          )}
        </ul>
      </div>

      {/* Assessment */}

      <div className="border rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">
          Overall Assessment
        </h2>

        <p className="leading-relaxed">
          {
            report.overall_assessment
          }
        </p>
      </div>
    </div>
  );
}