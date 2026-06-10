"use client";

import { useInterviewStore } from "@/store/interviewStore";
import { Progress } from "@/components/ui/progress";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { 
  Trophy, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  MessageSquare,
  Briefcase,
  Users,
  Lightbulb,
  Wrench,
  BookOpen
} from "lucide-react";
import React from "react";

export default function ReportPage() {
  const { report } = useInterviewStore();

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <p className="text-xl font-medium text-zinc-500">
          No report available. Please complete an interview first.
        </p>
      </div>
    );
  }

  const getReadinessLabel = (score: number) => {
    if (score >= 85) return "Excellent MBA Candidate";
    if (score >= 70) return "Strong MBA Candidate";
    if (score >= 55) return "Average MBA Candidate";
    return "Needs Improvement";
  };

  const getReadinessColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 55) return "bg-amber-500";
    return "bg-rose-500";
  };

  const radarData = [
    { subject: "Communication", A: report.communication_score, fullMark: 10 },
    { subject: "Leadership", A: report.leadership_score, fullMark: 10 },
    { subject: "Problem Solving", A: report.problem_solving_score, fullMark: 10 },
    { subject: "Technical", A: report.technical_skills_score, fullMark: 10 },
    { subject: "Experience", A: report.experience_score, fullMark: 10 },
    { subject: "Alignment", A: report.alignment_score, fullMark: 10 },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 py-12 px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header / Hero Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-bold uppercase tracking-wider border border-blue-200">
                <CheckCircle2 className="w-4 h-4" />
                Interview Complete
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900">
                MBA Evaluation Report
              </h1>
              <p className="text-lg text-zinc-500 font-medium leading-relaxed">
                {report.overall_assessment}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-2xl border border-zinc-200 min-w-[240px]">
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Overall Score</p>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black text-zinc-900">{report.overall_score}</span>
                <span className="text-2xl font-bold text-zinc-400">/10</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-zinc-200 shadow-sm">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-zinc-700">{report.final_recommendation}</span>
              </div>
            </div>
          </div>
          
          {/* MBA Readiness Bar in Hero */}
          <div className="mt-10 p-6 bg-zinc-50 rounded-2xl border border-zinc-200">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  MBA Readiness
                </h3>
                <p className="text-sm font-medium text-zinc-500 mt-1">{getReadinessLabel(report.mba_readiness)}</p>
              </div>
              <span className="text-3xl font-black text-zinc-900">{report.mba_readiness}%</span>
            </div>
            <Progress 
              value={report.mba_readiness} 
              className="h-3 bg-zinc-200"
              indicatorClassName={getReadinessColor(report.mba_readiness)}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Radar Chart */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-sm border border-zinc-200 flex flex-col">
            <h3 className="font-bold text-xl text-zinc-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Skill Profile
            </h3>
            <div className="flex-1 min-h-[300px] -ml-6 -mr-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e4e4e7" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#52525b', fontSize: 12, fontWeight: 600 }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar
                    name="Candidate"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            <ScoreCard 
              title="Communication" 
              score={report.communication_score} 
              icon={<MessageSquare className="w-5 h-5 text-blue-500" />} 
              colorClass="bg-blue-500" 
            />
            <ScoreCard 
              title="Leadership" 
              score={report.leadership_score} 
              icon={<Users className="w-5 h-5 text-emerald-500" />} 
              colorClass="bg-emerald-500" 
            />
            <ScoreCard 
              title="Problem Solving" 
              score={report.problem_solving_score} 
              icon={<Lightbulb className="w-5 h-5 text-amber-500" />} 
              colorClass="bg-amber-500" 
            />
            <ScoreCard 
              title="Technical Skills" 
              score={report.technical_skills_score} 
              icon={<Wrench className="w-5 h-5 text-rose-500" />} 
              colorClass="bg-rose-500" 
            />
            <ScoreCard 
              title="Experience" 
              score={report.experience_score} 
              icon={<Briefcase className="w-5 h-5 text-indigo-500" />} 
              colorClass="bg-indigo-500" 
            />
            <ScoreCard 
              title="MBA Alignment" 
              score={report.alignment_score} 
              icon={<BookOpen className="w-5 h-5 text-purple-500" />} 
              colorClass="bg-purple-500" 
            />
          </div>
        </div>

        {/* Text Feedback Sections */}
        <div className="grid md:grid-cols-3 gap-6">
          <FeedbackCard 
            title="Strengths" 
            items={report.strengths} 
            icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
            bgColor="bg-emerald-50"
            borderColor="border-emerald-100"
          />
          <FeedbackCard 
            title="Weaknesses" 
            items={report.weaknesses} 
            icon={<AlertCircle className="w-6 h-6 text-rose-500" />}
            bgColor="bg-rose-50"
            borderColor="border-rose-100"
          />
          <FeedbackCard 
            title="Areas for Improvement" 
            items={report.areas_for_improvement} 
            icon={<Target className="w-6 h-6 text-amber-500" />}
            bgColor="bg-amber-50"
            borderColor="border-amber-100"
          />
        </div>

      </div>
    </div>
  );
}

function ScoreCard({ title, score, icon, colorClass }: { title: string, score: number, icon: React.ReactNode, colorClass: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="font-bold text-zinc-700">{title}</h4>
        </div>
        <span className="font-black text-xl text-zinc-900">{score}</span>
      </div>
      <Progress 
        value={score * 10} 
        className="h-2 bg-zinc-100" 
        indicatorClassName={colorClass}
      />
    </div>
  );
}

function FeedbackCard({ title, items, icon, bgColor, borderColor }: { title: string, items: string[], icon: React.ReactNode, bgColor: string, borderColor: string }) {
  if (!items || items.length === 0) return null;
  
  return (
    <div className={`rounded-3xl p-8 border shadow-sm ${bgColor} ${borderColor}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-white rounded-xl shadow-sm">
          {icon}
        </div>
        <h3 className="font-black text-xl text-zinc-900">{title}</h3>
      </div>
      <ul className="space-y-4">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-3 text-zinc-700 font-medium leading-relaxed">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}