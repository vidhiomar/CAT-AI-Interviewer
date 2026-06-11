"use client";

import { useInterviewStore } from "@/store/interviewStore";
import { Progress } from "@/components/ui/progress";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from "recharts";
import { 
  Trophy, Target, CheckCircle2, AlertCircle, TrendingUp, MessageSquare,
  Briefcase, Users, Lightbulb, Wrench, BookOpen, Shield, ShieldAlert,
  Clock, FileText, ChevronRight
} from "lucide-react";
import React, { useState } from "react";

export default function ReportPage() {
  const { report, proctorEvents, conversation } = useInterviewStore();
  const [activeTab, setActiveTab] = useState<"overview" | "proctoring" | "transcript">("overview");

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-4 text-zinc-400">
          <FileText className="h-16 w-16 opacity-50" />
          <p className="text-xl font-medium">No report available. Complete an interview first.</p>
        </div>
      </div>
    );
  }

  const getReadinessLabel = (score: number) => {
    if (score >= 85) return "Excellent Candidate";
    if (score >= 70) return "Strong Candidate";
    if (score >= 55) return "Average Candidate";
    return "Needs Improvement";
  };

  const getReadinessColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500 text-emerald-700 border-emerald-200";
    if (score >= 70) return "bg-blue-500 text-blue-700 border-blue-200";
    if (score >= 55) return "bg-amber-500 text-amber-700 border-amber-200";
    return "bg-rose-500 text-rose-700 border-rose-200";
  };

  const getIntegrityColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 70) return "text-amber-500";
    return "text-rose-600";
  };

  const scoreData = [
    { subject: "Communication", score: report.communication_score, fullMark: 10, color: "#3b82f6" },
    { subject: "Leadership", score: report.leadership_score, fullMark: 10, color: "#10b981" },
    { subject: "Problem Solving", score: report.problem_solving_score, fullMark: 10, color: "#f59e0b" },
    { subject: "Technical", score: report.technical_skills_score, fullMark: 10, color: "#f43f5e" },
    { subject: "Experience", score: report.experience_score, fullMark: 10, color: "#6366f1" },
    { subject: "Alignment", score: report.alignment_score, fullMark: 10, color: "#8b5cf6" },
  ];

  const integrityScore = report.integrity_score ?? 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8 bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm w-max mx-auto">
          {(["overview", "proctoring", "transcript"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === tab 
                  ? "bg-zinc-900 text-white shadow-md" 
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Score */}
              <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <Trophy className="h-10 w-10 text-blue-500 mb-4" />
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Overall Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black text-zinc-900">{report.overall_score}</span>
                  <span className="text-2xl font-bold text-zinc-400">/10</span>
                </div>
                <div className="mt-4 px-4 py-1.5 bg-zinc-50 rounded-full border border-zinc-200 text-sm font-bold text-zinc-600">
                  {report.final_recommendation}
                </div>
              </div>

              {/* MBA Readiness */}
              <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                <Target className="h-10 w-10 text-emerald-500 mb-4" />
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">MBA Readiness</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black text-zinc-900">{report.mba_readiness}</span>
                  <span className="text-2xl font-bold text-zinc-400">%</span>
                </div>
                <div className={`mt-4 px-4 py-1.5 rounded-full border text-sm font-bold bg-opacity-20 ${getReadinessColor(report.mba_readiness)}`}>
                  {getReadinessLabel(report.mba_readiness)}
                </div>
              </div>

              {/* Integrity Score */}
              <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${integrityScore >= 90 ? "bg-emerald-500" : integrityScore >= 70 ? "bg-amber-500" : "bg-rose-500"}`} />
                {integrityScore >= 90 ? <Shield className="h-10 w-10 text-emerald-500 mb-4" /> : <ShieldAlert className="h-10 w-10 text-rose-500 mb-4" />}
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Integrity Score</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-6xl font-black ${getIntegrityColor(integrityScore)}`}>{integrityScore}</span>
                  <span className="text-2xl font-bold text-zinc-400">%</span>
                </div>
                <button onClick={() => setActiveTab("proctoring")} className="mt-4 px-4 py-1.5 bg-zinc-50 hover:bg-zinc-100 rounded-full border border-zinc-200 text-sm font-bold text-zinc-600 transition-colors">
                  View Proctor Log →
                </button>
              </div>
            </div>

            {/* Assessment Summary */}
            <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm">
              <h3 className="text-lg font-black text-zinc-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-indigo-500" /> Executive Summary
              </h3>
              <p className="text-lg text-zinc-600 leading-relaxed font-medium">
                {report.overall_assessment}
              </p>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm flex flex-col">
                <h3 className="text-lg font-black text-zinc-900 mb-6 text-center">Skill Balance</h3>
                <div className="flex-1 min-h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={scoreData}>
                      <PolarGrid stroke="#e4e4e7" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#52525b', fontSize: 13, fontWeight: 700 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                      <Radar name="Candidate" dataKey="score" stroke="#4f46e5" strokeWidth={3} fill="#6366f1" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm flex flex-col">
                <h3 className="text-lg font-black text-zinc-900 mb-6 text-center">Competency Scores</h3>
                <div className="flex-1 min-h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                      <XAxis type="number" domain={[0, 10]} hide />
                      <YAxis dataKey="subject" type="category" width={120} axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 13, fontWeight: 600 }} />
                      <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={24}>
                        {scoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Qualitative Feedback */}
            <div className="grid md:grid-cols-3 gap-6">
              <FeedbackCard title="Strengths" items={report.strengths} icon={<TrendingUp className="w-6 h-6 text-emerald-500" />} bgColor="bg-emerald-50" borderColor="border-emerald-100" />
              <FeedbackCard title="Areas for Improvement" items={report.areas_for_improvement} icon={<Target className="w-6 h-6 text-amber-500" />} bgColor="bg-amber-50" borderColor="border-amber-100" />
              <FeedbackCard title="Weaknesses" items={report.weaknesses} icon={<AlertCircle className="w-6 h-6 text-rose-500" />} bgColor="bg-rose-50" borderColor="border-rose-100" />
            </div>
          </div>
        )}

        {/* --- PROCTORING TAB --- */}
        {activeTab === "proctoring" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm text-center">
              {integrityScore >= 90 ? <Shield className="h-16 w-16 text-emerald-500 mx-auto mb-4" /> : <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto mb-4" />}
              <h2 className="text-3xl font-black text-zinc-900 mb-2">Proctoring Report</h2>
              <p className="text-lg text-zinc-500 font-medium max-w-2xl mx-auto mb-8">
                {report.proctoring_summary || "The candidate's interview session was monitored for integrity violations."}
              </p>
              
              <div className="flex justify-center gap-12 border-t border-zinc-100 pt-8">
                <div>
                  <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Violations</p>
                  <p className="text-4xl font-black text-zinc-900">{proctorEvents.length}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Integrity Score</p>
                  <p className={`text-4xl font-black ${getIntegrityColor(integrityScore)}`}>{integrityScore}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm">
              <h3 className="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-zinc-400" /> Event Timeline
              </h3>
              
              {proctorEvents.length === 0 ? (
                <div className="text-center py-12 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3 opacity-80" />
                  <p className="text-lg font-bold text-emerald-800">Perfect Integrity</p>
                  <p className="text-emerald-600 font-medium">No violations were recorded during the interview.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {proctorEvents.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-100">
                      <div className="bg-white p-2 rounded-xl shadow-sm">
                        <AlertCircle className="h-5 w-5 text-rose-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-rose-900 text-sm">{event.type.replace(/_/g, " ")}</h4>
                          <span className="text-xs font-bold text-rose-400 font-mono bg-white px-2 py-1 rounded-md shadow-sm">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-rose-700 mt-1">
                          {event.type === "TAB_SWITCH" && "Candidate switched to another browser tab."}
                          {event.type === "WINDOW_BLUR" && "Interview window lost focus."}
                          {event.type === "FULLSCREEN_EXIT" && "Candidate exited fullscreen mode."}
                          {event.type === "FACE_MISSING" && "No face was detected on camera for >5 seconds."}
                          {event.type === "MULTIPLE_FACES" && "Multiple faces were detected on camera."}
                          {event.type === "LOOKING_AWAY" && "Candidate was detected looking away from the screen."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TRANSCRIPT TAB --- */}
        {activeTab === "transcript" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-zinc-100">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-zinc-900">Interview Transcript</h2>
                  <p className="text-zinc-500 font-medium">{conversation.length} questions answered</p>
                </div>
              </div>

              <div className="space-y-10">
                {conversation.map((qa, i) => (
                  <div key={i} className="relative pl-8 md:pl-0">
                    {/* Q */}
                    <div className="flex gap-4 mb-4">
                      <div className="hidden md:flex flex-col items-center pt-1">
                        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                          Q{i+1}
                        </div>
                      </div>
                      <div className="flex-1 bg-blue-50/50 rounded-2xl rounded-tl-none md:rounded-tl-2xl border border-blue-100 p-5">
                        <span className="md:hidden absolute left-0 top-1 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {i+1}
                        </span>
                        <p className="text-zinc-800 font-bold leading-relaxed">{qa.question}</p>
                      </div>
                    </div>
                    {/* A */}
                    <div className="flex gap-4">
                      <div className="hidden md:flex flex-col items-center pt-1">
                        <div className="h-8 w-8 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-sm">
                          A
                        </div>
                      </div>
                      <div className="flex-1 bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm relative">
                        <span className="md:hidden absolute -left-8 top-1 h-6 w-6 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-xs">
                          A
                        </span>
                        <p className="text-zinc-600 font-medium leading-relaxed whitespace-pre-wrap">{qa.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function FeedbackCard({ title, items, icon, bgColor, borderColor }: { title: string, items: string[], icon: React.ReactNode, bgColor: string, borderColor: string }) {
  if (!items || items.length === 0) return null;
  
  return (
    <div className={`rounded-3xl p-6 md:p-8 border shadow-sm h-full flex flex-col ${bgColor} ${borderColor}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-white rounded-xl shadow-sm">
          {icon}
        </div>
        <h3 className="font-black text-xl text-zinc-900">{title}</h3>
      </div>
      <ul className="space-y-4 flex-1">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-3 text-zinc-800 font-medium leading-relaxed text-sm">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${title === "Strengths" ? "bg-emerald-500" : title === "Weaknesses" ? "bg-rose-500" : "bg-amber-500"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}