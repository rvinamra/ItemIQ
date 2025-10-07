import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProcessingSteps({ steps, currentStep, isProcessing }) {
  return (
    <Card className="h-fit shadow-lg border border-slate-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Processing Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!isProcessing && currentStep === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Ready to process transactions</p>
            <p className="text-sm mt-1">Enter a transaction to begin AI analysis</p>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isActive = isProcessing && index === currentStep;
              const isCompleted = !isProcessing || index < currentStep;
              const isPending = isProcessing && index > currentStep;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0.5 }}
                  animate={{ 
                    opacity: isActive || isCompleted ? 1 : 0.5,
                    scale: isActive ? 1.02 : 1
                  }}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    isActive 
                      ? 'border-purple-200 bg-purple-50 shadow-md'
                      : isCompleted 
                      ? 'border-green-200 bg-green-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : isActive ? (
                        <div className="w-5 h-5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                      ) : (
                        <Clock className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <h4 className="font-medium text-slate-900">{step.name}</h4>
                        <p className="text-sm text-slate-600">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        isCompleted ? 'default' : 
                        isActive ? 'secondary' : 
                        'outline'
                      }>
                        {isCompleted ? 'Complete' : 
                         isActive ? 'Processing' : 
                         'Pending'}
                      </Badge>
                    </div>
                  </div>
                  
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3"
                    >
                      <Progress value={75} className="h-1" />
                      <p className="text-xs text-slate-500 mt-1">
                        Processing... {step.duration}ms avg
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}