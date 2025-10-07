import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  MapPin, 
  Clock, 
  Shield,
  Save,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

export default function NormalizedResult({ data, onSave }) {
  return (
    <Card className="shadow-xl border border-slate-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Sparkles className="w-5 h-5 text-green-600" />
          Normalized Transaction Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Main Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {data.normalized_merchant}
                </h3>
                <p className="text-slate-600 font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                  {data.raw_description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">
                  ${data.transaction_amount.toFixed(2)}
                </p>
                <Badge className="bg-green-100 text-green-800 border-green-200 mt-1">
                  {data.merchant_category?.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700">Confidence</span>
                </div>
                <p className="text-lg font-bold text-slate-900">
                  {(data.confidence_score * 100).toFixed(1)}%
                </p>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-slate-700">Processing Time</span>
                </div>
                <p className="text-lg font-bold text-slate-900">
                  {data.processing_time_ms}ms
                </p>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-slate-700">Fraud Risk</span>
                </div>
                <p className={`text-lg font-bold ${data.fraud_risk_score > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                  {(data.fraud_risk_score * 100).toFixed(1)}%
                </p>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-slate-700">Location</span>
                </div>
                <p className="text-sm font-medium text-slate-900">
                  {data.location?.city}, {data.location?.state}
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-slate-900 mb-2">POS System Detected</h4>
              <p className="text-sm text-slate-700">{data.pos_format}</p>
            </div>
          </motion.div>

          {/* Itemized Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-slate-900 text-lg">Itemized Breakdown</h4>
            
            {data.items && data.items.length > 0 ? (
              <div className="space-y-3">
                {data.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500 capitalize">{item.category}</p>
                      <p className="text-xs text-slate-400">
                        {item.quantity} × ${item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      ${item.total_price.toFixed(2)}
                    </p>
                  </motion.div>
                ))}
                
                <div className="border-t border-slate-200 pt-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="font-bold text-lg text-slate-900">
                      ${data.items.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-100 rounded-lg text-center">
                <p className="text-slate-600">No itemized breakdown available for this transaction type</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-6 border-t border-slate-200"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Transaction successfully normalized</span>
            </div>
            <Button
              onClick={onSave}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white shadow-lg"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Save to Database
            </Button>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}