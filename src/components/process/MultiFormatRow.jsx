import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Sparkles } from "lucide-react";

export default function MultiFormatRow({ sample, result, isRunning }) {
  const status = isRunning && !result ? "processing" : result ? "done" : "idle";

  return (
    <div className="grid grid-cols-12 items-center gap-3 py-3 px-3 border-b last:border-b-0">
      <div className="col-span-4">
        <div className="font-mono text-xs text-slate-700 truncate">{sample.raw}</div>
        <div className="flex gap-2 mt-1">
          <Badge variant="outline" className="text-xs">{sample.merchantHint}</Badge>
          <Badge variant="outline" className="text-xs">{sample.posHint}</Badge>
        </div>
      </div>

      <div className="col-span-5">
        {!result ? (
          <div className="text-slate-400 text-sm">{status === "processing" ? "Analyzing..." : "—"}</div>
        ) : (
          <div>
            <div className="font-medium">{result.normalized_item}</div>
            <div className="text-xs text-slate-500">
              {result.category} • {result.size_oz} oz{result.flavor ? ` • ${result.flavor}` : ""} • {(result.confidence * 100).toFixed(1)}% confidence
            </div>
          </div>
        )}
      </div>

      <div className="col-span-2 text-right font-semibold">
        {result ? `$${result.price.toFixed(2)}` : "—"}
      </div>

      <div className="col-span-1 flex justify-end">
        {status === "processing" && (
          <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        )}
        {status === "done" && <CheckCircle className="w-5 h-5 text-emerald-600" />}
        {status === "idle" && <Sparkles className="w-5 h-5 text-slate-400" />}
      </div>
    </div>
  );
}