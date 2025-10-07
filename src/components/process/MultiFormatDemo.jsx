import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MultiFormatRow from "./MultiFormatRow";
import { Brain, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Deterministic helpers (no randomness across publishes)
function canonicalizeFlavor(raw) {
  const s = String(raw || "").toLowerCase();
  if (/\b(trilogy|tri)\b/.test(s)) return "Trilogy";
  if (/\b(ginger|gingerberry|gng)\b/.test(s)) return "Ginger";
  if (/\b(classic|original|orig)\b/.test(s)) return "Classic";
  if (/\b(guava)\b/.test(s)) return "Guava";
  return "";
}
function detectSizeOz(raw) {
  const s = String(raw || "").toLowerCase();
  const m = s.match(/(\d{1,2}(\.\d)?)\s?oz/);
  if (m) return Math.round(parseFloat(m[1]));
  // default canonical size
  return 16;
}
function titleCase(str) {
  return String(str || "")
    .toLowerCase()
    .split(/\s+/)
    .map(w => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}
function detectMerchant(raw) {
  const s = String(raw || "").toUpperCase();
  if (s.includes("WHOLEFDS") || s.includes("WHOLE FOODS")) return "Whole Foods Market";
  if (s.includes("TRADER JOE")) return "Trader Joe's";
  if (s.includes("KROGER")) return "Kroger";
  if (s.includes("SAFEWAY")) return "Safeway";
  if (s.includes("TARGET")) return "Target";
  if (s.includes("WAL-MART") || s.includes("WALMART")) return "Walmart";
  if (s.includes("7-ELEVEN") || s.includes("7ELEVEN")) return "7-Eleven";
  if (s.includes("AMAZON")) return "Amazon.com";
  return "Merchant";
}
function detectPOS(raw) {
  const s = String(raw || "").toUpperCase();
  if (s.includes("WHOLEFDS")) return "Whole Foods POS";
  if (s.includes("TRADER JOE")) return "Square POS v2.1";
  if (s.includes("KROGER")) return "Kroger POS";
  if (s.includes("SAFEWAY")) return "NCR POS";
  if (s.includes("TARGET")) return "Target POS";
  if (s.includes("WAL-") || s.includes("WALMART")) return "Walmart POS";
  if (s.includes("7-ELEVEN") || s.includes("7ELEVEN")) return "Verifone";
  if (s.includes("AMAZON")) return "Amazon Payments";
  return "POS";
}
function normalizeItem(raw) {
  const s = String(raw || "").toLowerCase();
  const isKombucha = /\b(kombucha|gts|synergy)\b/.test(s);
  if (isKombucha) {
    const flavor = canonicalizeFlavor(s);
    const size = detectSizeOz(s);
    const name = `GT's Kombucha${flavor ? `, ${flavor}` : ""} (${size} oz)`;
    let conf = 0.92;
    if (/\bgts\b|\bgt's\b|\bsynergy\b/.test(s)) conf += 0.04;
    if (/\b16\s?oz\b|\b15\.2\s?oz\b/.test(s)) conf += 0.02;
    conf = Math.min(0.99, conf);
    return { name, flavor, size, category: "beverages", confidence: conf };
  }
  // fallback
  return { name: titleCase(raw.slice(0, 32)), flavor: "", size: detectSizeOz(s), category: "beverages", confidence: 0.65 };
}

const SAMPLES = [
  { raw: "WHOLEFDS #10217 AUSTIN TX SYNERGY GINGERBERRY 16OZ", price: 3.99 },
  { raw: "TRADER JOE'S #545 NEW YORK NY GTS KOMBU 16OZ TRILOGY", price: 3.49 },
  { raw: "KROGER 456 DOWNTOWN GT KOMBUCHA CLASSIC 16 OZ", price: 3.29 },
  { raw: "SAFEWAY #2234 SYNERGY KOMBUCHA GINGER 15.2OZ", price: 3.59 },
  { raw: "TARGET T-1245 MANHATTAN NY GTS KOMBUCHA ORIG 16oz", price: 3.79 },
  { raw: "WAL-MART #2354 BROOKLYN NY GT'S KOMBUCHA TRILOGY 16 OZ", price: 3.39 },
  { raw: "7-ELEVEN 4025 NEW YORK NY KOMBUCHA GTs GINGER 16OZ", price: 4.49 },
  { raw: "AMAZON.COM* AMZN MKTP SYNERGY KOMBUCHA CLASSIC 16OZ", price: 3.69 },
];

export default function MultiFormatDemo() {
  const [running, setRunning] = React.useState(false);
  const [results, setResults] = React.useState(Array(SAMPLES.length).fill(null));

  const reset = () => {
    setRunning(false);
    setResults(Array(SAMPLES.length).fill(null));
  };

  const run = async () => {
    setRunning(true);
    // Sequential, deterministic "pipeline"
    for (let i = 0; i < SAMPLES.length; i++) {
      await new Promise(r => setTimeout(r, 180)); // short animation delay
      const sample = SAMPLES[i];
      const merch = detectMerchant(sample.raw);
      const pos = detectPOS(sample.raw);
      const norm = normalizeItem(sample.raw);
      setResults(prev => {
        const next = [...prev];
        next[i] = {
          normalized_item: norm.name,
          flavor: norm.flavor,
          size_oz: norm.size,
          category: norm.category,
          confidence: norm.confidence,
          price: sample.price,
          merchant: merch,
          pos
        };
        return next;
      });
    }
    setRunning(false);
  };

  return (
    <Card className="border border-slate-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Normalization Across POS Formats
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between">
          <div className="text-slate-600 text-sm">
            Watch the engine recognize the same item across different merchants and POS formats.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset} disabled={running}>Reset</Button>
            <Button onClick={run} disabled={running} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Run Normalization
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 px-3 py-2 text-[12px] text-slate-500 border-y bg-slate-50">
          <div className="col-span-4">Raw Description • Merchant • POS</div>
          <div className="col-span-5">Normalized Item</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        <div>
          {SAMPLES.map((s, idx) => (
            <MultiFormatRow
              key={idx}
              sample={{ ...s, merchantHint: detectMerchant(s.raw), posHint: detectPOS(s.raw) }}
              result={results[idx]}
              isRunning={running}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}