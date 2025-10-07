
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Apple, Cookie } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HealthScore({ metrics, isLoading }) {
  // UPDATED: finer grade scale with +/- bands
  const getHealthGrade = (score) => {
    // Ensure number
    const s = Number(score || 0);
    if (s >= 90) return { grade: 'A', color: 'text-green-700', bgColor: 'bg-green-100' };
    if (s >= 85) return { grade: 'A-', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (s >= 80) return { grade: 'B+', color: 'text-blue-700', bgColor: 'bg-blue-100' };
    if (s >= 67) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (s >= 60) return { grade: 'B-', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (s >= 53) return { grade: 'C+', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    if (s >= 47) return { grade: 'C', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    if (s >= 40) return { grade: 'C-', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    return { grade: 'D', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const score = Number(metrics.healthScore || 0);
  const healthySpent = Number(metrics.healthySpent || 0);
  const neutralSpent = Number(metrics.neutralSpent || 0);
  const unhealthySpent = Number(metrics.unhealthySpent || 0);
  const totalSpent = Number(metrics.totalSpent || 0);

  const healthGrade = getHealthGrade(score);

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Health Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${healthGrade.bgColor} mb-2`}>
                <span className={`text-3xl font-bold ${healthGrade.color}`}>
                  {healthGrade.grade}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{score}%</p>
              <p className="text-sm text-slate-600">Overall Health Score</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Score</span>
                <span>{score}%</span>
              </div>
              <Progress value={score} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <Apple className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-600">
                  ${healthySpent.toFixed(0)}
                </p>
                <p className="text-xs text-slate-600">Healthy</p>
              </div>
              
              <div className="p-3 bg-amber-50 rounded-lg text-center">
                <span className="text-amber-600 mx-auto mb-1 block font-bold">~</span>
                <p className="text-lg font-bold text-amber-600">
                  ${neutralSpent.toFixed(0)}
                </p>
                <p className="text-xs text-slate-600">Neutral</p>
              </div>

              <div className="p-3 bg-red-50 rounded-lg text-center">
                <Cookie className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-red-600">
                  ${unhealthySpent.toFixed(0)}
                </p>
                <p className="text-xs text-slate-600">Less Healthy</p>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                {metrics.healthyItems || 0} healthy items vs {metrics.unhealthyItems || 0} less healthy items
              </p>
              {totalSpent > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  Based on item categories and simple name heuristics
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
