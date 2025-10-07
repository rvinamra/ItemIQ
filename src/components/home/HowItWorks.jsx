import React from "react";
import { motion } from "framer-motion";
import { Layers, BrainCircuit, Combine, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Layers,
    title: "1. Ingest Data",
    description: "ItemIQ connects to any payment processor to receive raw, unstructured transaction data in real-time."
  },
  {
    icon: BrainCircuit,
    title: "2. AI Normalization",
    description: "Our transformer models and GNNs parse, identify, and categorize every detail with 95%+ accuracy."
  },
  {
    icon: Combine,
    title: "3. Itemize & Enrich",
    description: "We reconstruct the full, itemized receipt and enrich it with merchant logos, locations, and categories."
  },
  {
    icon: ShieldCheck,
    title: "4. Deliver Intelligence",
    description: "Clean, structured data is delivered via API, powering everything from fraud prevention to financial apps."
  }
];

export default function HowItWorks() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our purpose-built AI infrastructure is the engine for universal transaction intelligence.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="p-8 bg-slate-50 rounded-xl border border-slate-200"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-teal-100 to-blue-100 rounded-lg flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}