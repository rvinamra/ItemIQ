
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Target, Users, CreditCard, DollarSign, TrendingUp, BarChart3 } from "lucide-react";

export default function SurveyInsights() {
  // UPDATED: add colors for interestData to support legend + colored bars
  const interestData = [
    { label: "Extremely", value: 20, color: "#0ea5e9" },
    { label: "Very", value: 36, color: "#10b981" },
    { label: "Moderately", value: 29, color: "#8b5cf6" },
    { label: "Slightly", value: 10, color: "#f59e0b" },
    { label: "Not", value: 4, color: "#94a3b8" },
  ];

  const useCaseData = [
    { name: "Spending analysis", value: 64, color: "#0ea5e9" },
    { name: "Fraud detection", value: 49, color: "#10b981" },
    { name: "Recall purchases", value: 47, color: "#8b5cf6" },
    { name: "Returns & warranties", value: 37, color: "#f59e0b" },
  ];

  const cardImpact = [
    { name: "Deal-breaker", value: 1, color: "#ef4444" },
    { name: "Major", value: 25, color: "#22c55e" },
    { name: "Moderate", value: 42, color: "#60a5fa" },
    { name: "Minor", value: 26, color: "#a78bfa" },
    { name: "No impact", value: 6, color: "#94a3b8" },
  ];

  const FADE = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={FADE} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:// UPDATED: N = 1,0004xl font-bold text-slate-900">Consumer Survey Insights</h1>
              <p className="text-slate-600">Investor-ready highlights from 1,000 affluent US consumers (Sep 2025).</p>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div initial="hidden" animate="visible" variants={FADE} transition={{ delay: 0.05 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* UPDATED: Positive Interest to 86% */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Positive Interest</p>
                  <p className="text-3xl font-bold text-slate-900">86%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-slate-600 mt-3">Broad appeal across affluent consumers.</p>
            </CardContent>
          </Card>

          {/* UPDATED subtitle: would use regularly */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">High-Intent Users</p>
                  <p className="text-3xl font-bold text-slate-900">56%</p>
                </div>
                <Target className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-sm text-slate-600 mt-3">Would use regularly.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Daily Use Intent</p>
                  <p className="text-3xl font-bold text-slate-900">20%</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm text-slate-600 mt-3">Daily habit potential—rare in fintech.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Problem-Solution Fit</p>
                  <p className="text-3xl font-bold text-slate-900">99%</p>
                </div>
                <DollarSign className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-sm text-slate-600 mt-3">Multiple use cases per user (avg 2.0).</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Card Choice Impact</p>
                  <p className="text-3xl font-bold text-slate-900">67%</p>
                </div>
                <CreditCard className="w-8 h-8 text-rose-600" />
              </div>
              <p className="text-sm text-slate-600 mt-3">Feature influences issuer selection.</p>
            </CardContent>
          </Card>

          {/* REPLACED: Rejection Rate -> Avg Problems Solved */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Avg Problems Solved</p>
                  <p className="text-3xl font-bold text-slate-900">2.0</p>
                </div>
                <BarChart3 className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-sm text-slate-600 mt-3">Per respondent across use cases.</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Interest chart with more room for legend */}
          <motion.div initial="hidden" animate="visible" variants={FADE} transition={{ delay: 0.1 }}>
            <Card className="shadow-lg h-full">
              <CardHeader>
                <CardTitle>Interest Level Distribution</CardTitle>
              </CardHeader>
              {/* UPDATED: reduce chart height, tighten spacing, move legend up */}
              <CardContent className="h-72 pb-1">
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={interestData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" stroke="#64748b" tick={false} axisLine={false} />
                      <YAxis stroke="#64748b" tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v) => [`${v}%`, "Respondents"]} />
                      <Bar dataKey="value">
                        {interestData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-1 justify-center">
                  {interestData.map(d => (
                    <Badge key={d.label} className="gap-2" style={{ backgroundColor: `${d.color}22`, color: "#0f172a" }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                      {d.label}: {d.value}%
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Use Cases with more room for legend */}
          <motion.div initial="hidden" animate="visible" variants={FADE} transition={{ delay: 0.15 }}>
            <Card className="shadow-lg h-full">
              <CardHeader>
                <CardTitle>Top Use Cases</CardTitle>
              </CardHeader>
              {/* UPDATED: reduce chart height, tighten spacing, move legend up */}
              <CardContent className="h-72 pb-1">
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={useCaseData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" tick={false} axisLine={false} />
                      <YAxis stroke="#64748b" tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v, n) => [`${v}%`, n]} />
                      <Bar dataKey="value">
                        {useCaseData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-1 justify-center">
                  {useCaseData.map(c => (
                    <Badge key={c.name} className="gap-2" style={{ backgroundColor: `${c.color}22`, color: "#0f172a" }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></span>
                      {c.name}: {c.value}%
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Impact on Card Choice pie with legend pulled up */}
          <motion.div initial="hidden" animate="visible" variants={FADE} transition={{ delay: 0.2 }}>
            <Card className="shadow-lg h-full">
              <CardHeader>
                <CardTitle>Impact on Card Choice</CardTitle>
              </CardHeader>
              <CardContent className="pb-1">
                {/* UPDATED: slightly reduced chart height for more legend room */}
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cardImpact}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {cardImpact.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v}%`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-1 justify-start">
                  {cardImpact.map((c) => (
                    <Badge key={c.name} className="gap-2" style={{ backgroundColor: `${c.color}22`, color: "#0f172a" }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></span>
                      {c.name}: {c.value}%
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Demographics */}
        <motion.div initial="hidden" animate="visible" variants={FADE} transition={{ delay: 0.35 }} className="mt-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Sample & Demographics</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {/* UPDATED: N badge to 1,000 */}
              <Badge className="bg-slate-900 text-white">N = 1,000</Badge>
              <Badge variant="outline">Income ≥ $70k</Badge>
              <Badge variant="outline">Avg age 41.3</Badge>
              <Badge variant="outline">99% online banking</Badge>
              <Badge variant="outline">Survey: Sep 2025</Badge>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
