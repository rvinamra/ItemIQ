import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CreditCard, Receipt } from "lucide-react";

const CreditCardStatement = () => {
    const transactions = [
        { date: "03/15", merchant: "STARBUCKS STORE #2847", amount: "$12.47", type: "normal" },
        { date: "03/15", merchant: "WHOLEFDS #10217 AUSTIN TX", amount: "$37.45", type: "highlighted" },
        { date: "03/14", merchant: "AMAZON.COM*AMZN.COM/BILL", amount: "$89.99", type: "normal" },
        { date: "03/14", merchant: "SHELL OIL 57499238947", amount: "$45.20", type: "normal" },
        { date: "03/13", merchant: "TST* UBER TRIP", amount: "$18.50", type: "normal" },
        { date: "03/13", merchant: "PAYPAL *SPOTIFY USA", amount: "$9.99", type: "normal" },
        { date: "03/12", merchant: "MCDONALD'S F32847", amount: "$8.75", type: "normal" }
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden">
            {/* Credit Card Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        <span className="font-semibold">Chase Sapphire</span>
                    </div>
                    <span className="text-slate-300">**** 4829</span>
                </div>
            </div>
            
            {/* Statement Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-1">Recent Transactions</h4>
                <p className="text-sm text-slate-600">March 2024 Statement</p>
            </div>
            
            {/* Transactions List */}
            <div className="divide-y divide-slate-100">
                {transactions.map((transaction, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 text-sm font-mono transition-colors ${
                            transaction.type === "highlighted" 
                                ? "bg-blue-50 border-l-4 border-l-blue-500" 
                                : "hover:bg-slate-50"
                        }`}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-slate-500 w-10">{transaction.date}</span>
                                <span className={`flex-1 ${
                                    transaction.type === "highlighted" 
                                        ? "text-blue-900 font-semibold" 
                                        : "text-slate-700"
                                }`}>
                                    {transaction.merchant}
                                </span>
                            </div>
                            <span className={`font-bold ${
                                transaction.type === "highlighted" 
                                    ? "text-blue-600" 
                                    : "text-slate-900"
                            }`}>
                                {transaction.amount}
                            </span>
                        </div>
                        {transaction.type === "highlighted" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                transition={{ delay: 0.3 }}
                                className="mt-2 pl-13 text-xs text-blue-700 bg-blue-100 rounded p-2 ml-13"
                            >
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span>Processing with ItemIQ AI...</span>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>
            
            {/* Statement Footer */}
            <div className="p-4 bg-slate-50 text-sm text-slate-600">
                <div className="flex justify-between">
                    <span>Statement Balance</span>
                    <span className="font-semibold text-slate-900">$222.35</span>
                </div>
            </div>
        </div>
    );
};

const ItemizedReceipt = () => (
    <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-lg text-slate-800">Whole Foods Market</h4>
            <p className="font-bold text-lg text-slate-800">$37.45</p>
        </div>
        <div className="space-y-2 text-slate-700">
            <div className="flex justify-between"><span>Organic Avocados (x3)</span><span>$5.97</span></div>
            <div className="flex justify-between"><span>365 Almond Milk</span><span>$3.49</span></div>
            <div className="flex justify-between"><span>GT's Kombucha</span><span>$3.99</span></div>
            <div className="flex justify-between"><span>Pasture-Raised Eggs</span><span>$6.99</span></div>
            <div className="flex justify-between"><span>Organic Gala Apples</span><span>$4.21</span></div>
            <div className="flex justify-between"><span>Prepared Foods</span><span>$12.80</span></div>
        </div>
        <div className="border-t border-slate-200 mt-4 pt-2 flex justify-between font-bold text-slate-800">
            <span>Total</span>
            <span>$37.45</span>
        </div>
    </div>
);

export default function TransactionExample() {
    return (
        <div className="bg-slate-50 py-20">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">From Cryptic to Clear</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Our AI models transform meaningless transaction strings into rich, item-level data instantly.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-7 items-center gap-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} 
                        whileInView={{ opacity: 1, x: 0 }} 
                        viewport={{ once: true }} 
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        <CreditCard className="w-6 h-6 mb-2 text-slate-500"/>
                        <h3 className="font-semibold text-lg mb-2">Credit Card Statement</h3>
                        <CreditCardStatement />
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }} 
                        whileInView={{ opacity: 1, scale: 1 }} 
                        viewport={{ once: true }} 
                        transition={{ duration: 0.5, delay: 0.4 }} 
                        className="lg:col-span-1 text-center"
                    >
                        <ArrowRight className="w-12 h-12 text-teal-500 mx-auto hidden lg:block" />
                        <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto lg:hidden text-white">
                            <ArrowRight className="w-6 h-6 transform rotate-90" />
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} 
                        whileInView={{ opacity: 1, x: 0 }} 
                        viewport={{ once: true }} 
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="lg:col-span-3"
                    >
                        <Receipt className="w-6 h-6 mb-2 text-teal-600"/>
                        <h3 className="font-semibold text-lg mb-2">Itemized Intelligence</h3>
                        <ItemizedReceipt />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}