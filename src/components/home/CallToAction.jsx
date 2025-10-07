import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import WaitlistModal from "./WaitlistModal";

export default function CallToAction() {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Unlock Transaction Intelligence?
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            See our AI in action or contact our team to learn how ItemIQ can become a core part of your payment infrastructure.
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