import React from "react";
import { motion } from "framer-motion";
import { Banknote, Shield, LineChart, UserCheck } from "lucide-react";

const benefits = [
    {
        icon: Shield,
        title: "Smarter Fraud Prevention",
        description: "Detect anomalous purchases at the item-level, not just the transaction-level, to stop fraud before it scales."
    },
    {
        icon: Banknote,
        title: "Reduced Support Costs",
        description: "Give customers and support agents full purchase clarity, eliminating costly 'what was this charge?' inquiries."
    },
    {
        icon: UserCheck,
        title: "Enhanced Consumer Apps",
        description: "Build the next generation of financial tools—from intelligent budgeting to automated expense reporting."
    },
    {
        icon: LineChart,
        title: "Valuable Network Effects",
        description: "Our shared-benefit model rewards all participants, creating an ecosystem where data quality improves with every transaction."
    }
];

export default function Benefits() {
  return (
    <div className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">An Essential Infrastructure Layer</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            By normalizing data at the source, ItemIQ unlocks value across the entire payments ecosystem.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex items-start gap-6"
            >
                <div className="w-12 h-12 bg-white rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-200 shadow-sm">
                    <benefit.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{benefit.title}</h3>
                    <p className="text-slate-600">{benefit.description}</p>
                </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}