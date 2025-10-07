import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import WaitlistModal from "./WaitlistModal";

export default function Hero() {
  const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68cb10678907e93d0710a15a/ef91f01b9_logo1.png";

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative w-[300px] h-auto mx-auto mb-6">
              {/* Base layer (all white) */}
              <img 
                src={logoUrl}
                alt="" 
                aria-hidden="true"
                className="w-full h-auto"
                style={{
                  filter: 'grayscale(1) brightness(0) invert(1)',
                }}
              />
              {/* Top layer (original color, clipped to show 'IQ') */}
              <img 
                src={logoUrl} 
                alt="ItemIQ Logo" 
                className="absolute top-0 left-0 w-full h-auto"
                style={{
                  clipPath: 'inset(0 0 0 60%)',
                }}
              />
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            The Universal API for
            <span className="block text-teal-400 mt-2">Transaction Intelligence</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-300 mb-10">
            ItemIQ's AI infrastructure turns cryptic payment data into detailed,
            itemized receipts in real-time, enabling the next generation of
            AI-powered financial services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("ProcessTransactions")}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white shadow-lg">
                  <Zap className="w-5 h-5 mr-2" />
                  See It In Action
                </Button>
              </motion.div>
            </Link>
            <Link to={createPageUrl("StatementsDemo")}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 shadow-lg">
                  Demo
                </Button>
              </motion.div>
            </Link>
            <WaitlistModal>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="w-full sm:w-auto bg-slate-800 border-2 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500 transition-all">
                  Join Waitlist
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </WaitlistModal>
          </div>
        </motion.div>
      </div>
    </div>
  );
}