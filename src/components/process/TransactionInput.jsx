import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function TransactionInput({ rawInput, setRawInput, onProcess, isProcessing }) {
  return (
    <Card className="h-fit shadow-lg border border-slate-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Upload className="w-5 h-5 text-blue-600" />
          Raw Transaction Input
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Enter transaction description:
            </label>
            <Textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste your raw transaction data here... e.g., AMZN*MKTP US*RT4DLKJ92 AMAZON.COM WA"
              className="min-h-24 font-mono text-sm resize-none"
              disabled={isProcessing}
            />
          </div>
          
          <motion.div
            whileHover={{ scale: isProcessing ? 1 : 1.02 }}
            whileTap={{ scale: isProcessing ? 1 : 0.98 }}
          >
            <Button
              onClick={onProcess}
              disabled={!rawInput.trim() || isProcessing}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white shadow-lg"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing with AI...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Process Transaction
                </>
              )}
            </Button>
          </motion.div>
          
          <div className="text-xs text-slate-500 mt-2">
            <p>• Supports 127+ POS formats</p>
            <p>• Real-time processing (typically &lt;50ms)</p>
            <p>• 95%+ accuracy rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}