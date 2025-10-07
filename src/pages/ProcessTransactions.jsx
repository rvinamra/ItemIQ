
import React, { useState } from "react";
import { Transaction } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Upload, 
  CheckCircle, 
  Clock, 
  Brain,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import TransactionInput from "../components/process/TransactionInput";
import ProcessingSteps from "../components/process/ProcessingSteps";
import NormalizedResult from "../components/process/NormalizedResult";
import MultiFormatDemo from "../components/process/MultiFormatDemo"; // NEW IMPORT

export default function ProcessTransactions() {
  const [rawInput, setRawInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [normalizedData, setNormalizedData] = useState(null);
  const [processingSteps] = useState([
    { name: "Transaction Parse", description: "Extracting payment data", duration: 800 },
    { name: "Merchant Recognition", description: "Identifying merchant from POS format", duration: 1200 },
    { name: "Item Breakdown", description: "Analyzing purchase details", duration: 1500 },
    { name: "Fraud Analysis", description: "Risk assessment & validation", duration: 600 }
  ]);

  const sampleTransactions = [
    "AMZN*MKTP US*RT4DLKJ92 AMAZON.COM WA",
    "WHOLEFDS #10217 AUSTIN TX",
    "SQ *COFFEE SHOP NYC New York NY",
    "PAYPAL *SPOTIFY USA 4029357733 CA",
    "TST* UBER TRIP HELP.UBER.COM CA",
    "MCDONALD'S F32847 DENVER CO"
  ];

  const simulateProcessing = async () => {
    if (!rawInput.trim()) return;
    
    setIsProcessing(true);
    setProcessingStep(0);
    setNormalizedData(null);

    // Simulate AI processing steps
    for (let i = 0; i < processingSteps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, processingSteps[i].duration));
    }

    // Generate items first and calculate the total
    const items = generateMockItems(rawInput);
    const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0);

    // Generate mock normalized data with the correct total
    const mockNormalizedData = {
      raw_description: rawInput,
      normalized_merchant: getMockMerchant(rawInput),
      merchant_category: getMockCategory(rawInput),
      transaction_amount: parseFloat(totalAmount.toFixed(2)), // FIXED: Use calculated total and format
      transaction_date: new Date().toISOString().split('T')[0],
      pos_format: getMockPOSFormat(rawInput),
      confidence_score: parseFloat((0.95 + Math.random() * 0.04).toFixed(4)),
      items: items,
      location: {
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001"
      },
      fraud_risk_score: parseFloat((Math.random() * 0.3).toFixed(4)),
      processing_time_ms: 47 + Math.round(Math.random() * 20),
      status: "processed"
    };

    setNormalizedData(mockNormalizedData);
    setIsProcessing(false);
  };

  const getMockMerchant = (input) => {
    if (input.includes('AMZN')) return 'Amazon';
    if (input.includes('WHOLEFDS')) return 'Whole Foods Market';
    if (input.includes('COFFEE')) return 'Local Coffee Shop';
    if (input.includes('SPOTIFY')) return 'Spotify';
    if (input.includes('UBER')) return 'Uber';
    if (input.includes('MCDONALD')) return "McDonald's";
    return 'Generic Merchant';
  };

  const getMockCategory = (input) => {
    if (input.includes('AMZN')) return 'retail';
    if (input.includes('WHOLEFDS')) return 'grocery';
    if (input.includes('COFFEE')) return 'restaurant';
    if (input.includes('SPOTIFY')) return 'subscription';
    if (input.includes('UBER')) return 'travel';
    if (input.includes('MCDONALD')) return 'restaurant';
    return 'other';
  };

  const getMockPOSFormat = (input) => {
    const formats = ['Square POS v2.1', 'Amazon Payments', 'PayPal Checkout', 'Stripe Terminal', 'Toast POS'];
    return formats[Math.floor(Math.random() * formats.length)];
  };

  const generateMockItems = (input) => {
    if (input.includes('WHOLEFDS')) {
      return [
        { name: "Organic Avocados (x3)", category: "produce", quantity: 1, unit_price: 5.97, total_price: 5.97 },
        { name: "365 Almond Milk", category: "dairy-alternative", quantity: 1, unit_price: 3.49, total_price: 3.49 },
        { name: "GT's Kombucha", category: "beverages", quantity: 1, unit_price: 3.99, total_price: 3.99 },
        { name: "Pasture-Raised Eggs", category: "dairy", quantity: 1, unit_price: 6.99, total_price: 6.99 },
        { name: "Organic Gala Apples (1.5lb)", category: "produce", quantity: 1, unit_price: 4.21, total_price: 4.21 },
        { name: "Prepared Foods Hot Bar", category: "prepared", quantity: 1, unit_price: 12.80, total_price: 12.80 },
      ];
    }
    if (input.includes('COFFEE')) {
      return [
        { name: "Large Cappuccino", category: "beverages", quantity: 1, unit_price: 4.50, total_price: 4.50 },
        { name: "Blueberry Muffin", category: "food", quantity: 1, unit_price: 3.25, total_price: 3.25 }
      ];
    }
    if (input.includes('MCDONALD')) {
      return [
        { name: "Big Mac Meal", category: "food", quantity: 1, unit_price: 8.99, total_price: 8.99 },
        { name: "Apple Pie", category: "dessert", quantity: 1, unit_price: 1.29, total_price: 1.29 }
      ];
    }
    return [
      { name: "Sample Item", category: "misc", quantity: 1, unit_price: 10.00, total_price: 10.00 }
    ];
  };

  const saveTransaction = async () => {
    if (normalizedData) {
      await Transaction.create(normalizedData);
      setRawInput('');
      setNormalizedData(null);
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              AI Transaction Processor
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto">
            Transform cryptic payment descriptions into detailed, itemized transaction intelligence.
            Our AI processes 127 POS formats with 95%+ accuracy in real-time.
          </p>
        </motion.div>

        {/* Sample Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Sparkles className="w-5 h-5 text-teal-500" />
                Try These Sample Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sampleTransactions.map((sample, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRawInput(sample)}
                    className="p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors duration-200"
                  >
                    <code className="text-sm text-slate-700 font-mono">{sample}</code>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Processing Area */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TransactionInput
              rawInput={rawInput}
              setRawInput={setRawInput}
              onProcess={simulateProcessing}
              isProcessing={isProcessing}
            />
          </motion.div>

          {/* Processing Steps */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ProcessingSteps
              steps={processingSteps}
              currentStep={processingStep}
              isProcessing={isProcessing}
            />
          </motion.div>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {normalizedData && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <NormalizedResult
                data={normalizedData}
                onSave={saveTransaction}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* NEW: Multi-format normalization demo */}
        <div className="mt-10">
          <MultiFormatDemo />
        </div>
      </div>
    </div>
  );
}
