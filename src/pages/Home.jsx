import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

import Hero from "../components/home/Hero";
import HowItWorks from "../components/home/HowItWorks";
import Benefits from "../components/home/Benefits";
import CallToAction from "../components/home/CallToAction";
import TransactionExample from "../components/home/TransactionExample";

export default function Home() {
  return (
    <div className="bg-white text-slate-800">
      <Hero />
      <TransactionExample />
      <HowItWorks />
      <Benefits />
      <CallToAction />
    </div>
  );
}