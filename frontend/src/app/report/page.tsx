"use client";

import { useInterviewStore } from "@/store/interviewStore";

export default function ReportPage() {
  const { report } = useInterviewStore();

  if (!report) {
    return (
      <div className="p-8">
        No report available.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">
        Interview Report
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border rounded-xl p-4">
          <h2 className="font-semibold">
            Overall Score
          </h2>

          <p className="text-3xl font-bold">
            {report.overall_score}/10
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <h2 className="font-semibold">
            Recommendation
          </h2>

          <p className="text-xl font-bold">
            {report.final_recommendation}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border rounded-xl p-4">
          Communication:
          {report.communication_score}/10
        </div>

        <div className="border rounded-xl p-4">
          Leadership:
          {report.leadership_score}/10
        </div>

        <div className="border rounded-xl p-4">
          Experience:
          {report.experience_score}/10
        </div>

        <div className="border rounded-xl p-4">
          Problem Solving:
          {report.problem_solving_score}/10
        </div>

        <div className="border rounded-xl p-4">
          Technical Skills:
          {report.technical_skills_score}/10
        </div>

        <div className="border rounded-xl p-4">
          MBA Alignment:
          {report.alignment_score}/10
        </div>
      </div>

      <div className="border rounded-xl p-6 mb-6">
        <h2 className="font-bold text-xl mb-4">
          Strengths
        </h2>

        <ul className="list-disc pl-6">
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

      <div className="border rounded-xl p-6 mb-6">
        <h2 className="font-bold text-xl mb-4">
          Weaknesses
        </h2>

        <ul className="list-disc pl-6">
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

      <div className="border rounded-xl p-6 mb-6">
        <h2 className="font-bold text-xl mb-4">
          Areas For Improvement
        </h2>

        <ul className="list-disc pl-6">
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

      <div className="border rounded-xl p-6">
        <h2 className="font-bold text-xl mb-4">
          Overall Assessment
        </h2>

        <p>
          {report.overall_assessment}
        </p>
      </div>
    </div>
  );
}