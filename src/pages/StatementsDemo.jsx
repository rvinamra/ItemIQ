
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Transaction } from "@/api/entities";
import { Warranty } from "@/api/entities/Warranty";
import { ReturnRequest } from "@/api/entities/ReturnRequest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Filter,
  Download,
  Printer,
  Tag as TagIcon,
  Search,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart as RBarChart,
  Bar,
  PieChart as RPieChart,
  Pie,
  Cell,
  LineChart as RLineChart,
  Line
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import HealthScore from "../components/itemiq_analytics/HealthScore";

function fmtCurrency(n) {
  const v = Number(n || 0);
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
function formatDate(iso) {
  try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch { return "—"; }
}
// UPDATED: safer merchant derivation (never "Unknown")
function titleCase(s) {
  return String(s || "").toLowerCase().split(/\s+/).map(w => w ? w[0].toUpperCase() + w.slice(1) : "").join(" ");
}
function deriveMerchant(raw) {
  const cleaned = String(raw || "").replace(/[^A-Za-z\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "Recent Purchase";
  const words = cleaned.split(" ").slice(0, 3).join(" ");
  return titleCase(words || "Recent Purchase");
}
function isGenericMerchant(name) {
  const n = String(name || "").trim().toLowerCase();
  if (!n) return true;
  return /\bunknown\b/.test(n) || ["unknown merchant","merchant","store","unknown store", "recent purchase"].includes(n);
}
function displayMerchant(tx) {
  const nm = String(tx?.normalized_merchant || "").trim();
  if (!isGenericMerchant(nm)) return nm;
  const derived = deriveMerchant(tx?.raw_description);
  if (!isGenericMerchant(derived)) return derived;
  const city = titleCase(tx?.location?.city || "");
  const cat = prettyCat(tx?.merchant_category || "");
  return city ? `${city} • ${cat}` : (cat || "Recent Purchase");
}
// NEW: robust date parser for consistent sorting
function txTime(tx) {
  const ds = tx?.transaction_date || tx?.created_date;
  const t = Date.parse(ds);
  return Number.isFinite(t) ? t : 0;
}

// NEW: prettier category labels
function prettyCat(c) {
  const map = {
    retail: "Retail",
    restaurant: "Restaurant",
    gas_station: "Gas Station",
    grocery: "Grocery",
    pharmacy: "Pharmacy",
    entertainment: "Entertainment",
    travel: "Travel",
    subscription: "Subscription",
    other: "Other"
  };
  const key = String(c || "other").toLowerCase();
  return map[key] || key.replace(/_/g, " ").replace(/\b\w/g, ch => ch.toUpperCase());
}

// NEW: deterministic pseudo-random generator from a string seed (stable across sessions)
function seededRandom(seed) {
  const s = String(seed || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0; // keep 32-bit
  }
  const u = (h >>> 0) % 10000; // 0..9999
  return u / 10000; // 0..1
}

// UPDATED: use deterministic jitter keyed by merchant+item+month so prices don’t drift
function seasonalPrice(base, monthIndex, seedKey) {
  const season = [1.04,1.03,1.02,1.00,0.98,0.96,0.97,0.99,1.01,1.02,1.03,1.05][monthIndex % 12];
  const r = seededRandom(seedKey);
  const jitter = 1 + ((r - 0.5) * 0.06); // ±3% deterministic jitter
  return round2(Number(base || 0) * season * jitter);
}
function round2(n) { return Math.round(Number(n || 0) * 100) / 100; }


// Basic eligibility (aligns with WarrantyReturns heuristics)
const NON_RETURNABLE_ITEM_CATEGORIES = new Set(["food", "beverages", "prepared", "dessert", "service", "tax", "parking", "lodging", "hotel", "ride", "subscription"]);
const NON_RETURNABLE_MERCHANT_CATEGORIES = new Set(["restaurant", "travel", "subscription"]);
const isReturnEligible = (tx) => {
  if (!tx.transaction_date) return false;
  const now = new Date();
  const d = new Date(tx.transaction_date);
  d.setHours(0, 0, 0, 0); now.setHours(0, 0, 0, 0);
  const diff = Math.ceil(Math.abs(now - d) / (1000 * 60 * 60 * 24));
  return diff >= 0 && diff <= 30;
};
const isItemReturnEligible = (tx, item) => {
  if (!isReturnEligible(tx)) return false;
  const cat = String(item.category || "").toLowerCase();
  const merchCat = String(tx.merchant_category || "").toLowerCase();
  if (NON_RETURNABLE_ITEM_CATEGORIES.has(cat)) return false;
  if (NON_RETURNABLE_MERCHANT_CATEGORIES.has(merchCat)) return false;
  return true;
};
const isWarrantyEligible = (item) => {
  const name = (item.name || "").toLowerCase();
  const cat = (item.category || "").toLowerCase();
  const keywords = ["tv","phone","laptop","computer","headphone","camera","console","appliance","washer","dryer","fridge","microwave","router","monitor","keyboard","speaker","audio","tool","drill","saw"];
  const allowedCats = ["electronics","appliance","audio","computer","device","hardware","tools"];
  if (allowedCats.includes(cat)) return true;
  return keywords.some(k => name.includes(k));
};

export default function StatementsDemo() {
  const [txs, setTxs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Seed a diverse set of demo transactions once per session if variety is low
  const ensureVariety = useCallback(async (existingTxs) => {
    try {
      if (sessionStorage.getItem("statements_demo_seeded")) return;
      const uniqMerchants = new Set(
        (existingTxs || []).map(t => String(t.normalized_merchant || "").toLowerCase())
      );
      const TARGET_UNIQUE_MERCHANTS = 22; // increased from 14
      const need = TARGET_UNIQUE_MERCHANTS - uniqMerchants.size;
      if (need <= 0) return;

      const pool = [
        {
          name: "Walmart",
          category: "retail",
          pos: "Walmart POS",
          raw: "WAL-MART #2354 BROOKLYN NY",
          location: { address: "503 Fulton St", city: "Brooklyn", state: "NY", zip: "11201" },
          items: () => ([
            { name: "Great Value 2% Milk (1 gal)", category: "grocery", quantity: 1, unit_price: 4.19, total_price: 4.19 },
            { name: "LED Bulbs (4-pack)", category: "home", quantity: 1, unit_price: 9.49, total_price: 9.49 },
            { name: "Paper Towels (6 rolls)", category: "home", quantity: 1, unit_price: 8.99, total_price: 8.99 },
          ])
        },
        {
          name: "Target",
          category: "retail",
          pos: "Target POS",
          raw: "TARGET T-1245 MANHATTAN NY",
          location: { address: "1863 Broadway", city: "New York", state: "NY", zip: "10023" },
          items: () => ([
            { name: "Office Paper (500ct)", category: "office", quantity: 1, unit_price: 7.99, total_price: 7.99 },
            { name: "Hand Soap", category: "home", quantity: 2, unit_price: 3.49, total_price: 6.98 },
            { name: "Batteries AA (8ct)", category: "electronics", quantity: 1, unit_price: 10.99, total_price: 10.99 },
          ])
        },
        {
          name: "Best Buy",
          category: "retail",
          pos: "NCR POS",
          raw: "BEST BUY #442 SECAUCUS NJ",
          location: { address: "3 Mill Creek Dr", city: "Secaucus", state: "NJ", zip: "07094" },
          items: () => ([
            { name: "USB-C Hub", category: "electronics", quantity: 1, unit_price: 39.99, total_price: 39.99 },
            { name: "HDMI Cable 6ft", category: "electronics", quantity: 1, unit_price: 12.99, total_price: 12.99 },
          ])
        },
        {
          name: "Costco Wholesale",
          category: "grocery",
          pos: "Costco POS",
          raw: "COSTCO WHSE #1042 JERSEY CITY NJ",
          location: { address: "465 Marin Blvd", city: "Jersey City", state: "NJ", zip: "07302" },
          items: () => ([
            { name: "Rotisserie Chicken", category: "prepared", quantity: 1, unit_price: 6.49, total_price: 6.49 },
            { name: "Kirkland Paper Towels (12)", category: "home", quantity: 1, unit_price: 23.99, total_price: 23.99 },
            { name: "Organic Eggs (24ct)", category: "grocery", quantity: 1, unit_price: 8.99, total_price: 8.99 },
          ])
        },
        {
          name: "Trader Joe's",
          category: "grocery",
          pos: "Square POS v2.1",
          raw: "TRADER JOE'S #545 NEW YORK NY",
          location: { address: "142 E 14th St", city: "New York", state: "NY", zip: "10003" },
          items: () => ([
            { name: "Organic Bananas (2 lbs)", category: "produce", quantity: 1, unit_price: 1.38, total_price: 1.38 },
            { name: "Everything Bagel Seasoning", category: "grocery", quantity: 1, unit_price: 2.49, total_price: 2.49 },
            { name: "Dark Chocolate Almonds", category: "grocery", quantity: 1, unit_price: 4.99, total_price: 4.99 },
          ])
        },
        {
          name: "Shell",
          category: "gas_station",
          pos: "Verifone",
          raw: "SHELL OIL 1234 NEWARK NJ",
          location: { address: "101 Market St", city: "Newark", state: "NJ", zip: "07102" },
          items: () => ([
            { name: "Regular Gas (9.8 gal)", category: "fuel", quantity: 1, unit_price: 3.59, total_price: 35.18 }
          ])
        },
        {
          name: "Chipotle",
          category: "restaurant",
          pos: "Toast POS",
          raw: "CHIPOTLE #331 NYC NY",
          location: { address: "620 9th Ave", city: "New York", state: "NY", zip: "10036" },
          items: () => ([
            { name: "Chicken Burrito Bowl", category: "food", quantity: 1, unit_price: 10.95, total_price: 10.95 },
            { name: "Chips & Guac", category: "food", quantity: 1, unit_price: 4.50, total_price: 4.50 },
          ])
        },
        {
          name: "Starbucks",
          category: "restaurant",
          pos: "Star POS",
          raw: "STARBUCKS #9921 NEW YORK NY",
          location: { address: "5th Ave & 42nd St", city: "New York", state: "NY", zip: "10018" },
          items: () => ([
            { name: "Grande Latte", category: "beverages", quantity: 1, unit_price: 5.25, total_price: 5.25 },
            { name: "Blueberry Muffin", category: "food", quantity: 1, unit_price: 3.25, total_price: 3.25 }
          ])
        },
        {
          name: "CVS Pharmacy",
          category: "pharmacy",
          pos: "NCR POS",
          raw: "CVS/PHARMACY #10422 BROOKLYN NY",
          location: { address: "395 Flatbush Ave", city: "Brooklyn", state: "NY", zip: "11238" },
          items: () => ([
            { name: "Ibuprofen (200mg)", category: "pharmacy", quantity: 1, unit_price: 7.99, total_price: 7.99 },
            { name: "Head & Shoulders Shampoo", category: "personal_care", quantity: 1, unit_price: 8.49, total_price: 8.49 },
          ])
        },
        {
          name: "Home Depot",
          category: "retail",
          pos: "Home Depot POS",
          raw: "HOMEDEPOT.COM ATLANTA GA",
          location: { address: "2455 Paces Ferry Rd", city: "Atlanta", state: "GA", zip: "30339" },
          items: () => ([
            { name: "Deck Screws (1 lb)", category: "hardware", quantity: 1, unit_price: 9.99, total_price: 9.99 },
            { name: "Pine Board 1x6 (8 ft)", category: "hardware", quantity: 2, unit_price: 6.49, total_price: 12.98 },
          ])
        },
        {
          name: "Nike",
          category: "retail",
          pos: "Adyen",
          raw: "NIKE FACTORY STORE 334 JERSEY GARDENS NJ",
          location: { address: "651 Kapkowski Rd", city: "Elizabeth", state: "NJ", zip: "07201" },
          items: () => ([
            { name: "Nike Running Shoes", category: "apparel", quantity: 1, unit_price: 89.99, total_price: 89.99 }
          ])
        },
        {
          name: "Delta Air Lines",
          category: "travel",
          pos: "Airline GDS",
          raw: "DELTA TICKET 006 NYC NY",
          location: { address: "JFK Int'l Airport", city: "Jamaica", state: "NY", zip: "11430" },
          items: () => ([
            { name: "Main Cabin Fare", category: "travel", quantity: 1, unit_price: 219.00, total_price: 219.00 }
          ])
        },
        {
          name: "Marriott",
          category: "travel",
          pos: "Hotel PMS",
          raw: "MARRIOTT HOTEL BOSTON MA",
          location: { address: "110 Huntington Ave", city: "Boston", state: "MA", zip: "02116" },
          items: () => ([
            { name: "Room Charge", category: "lodging", quantity: 1, unit_price: 189.00, total_price: 189.00 },
            { name: "City Tax", category: "tax", quantity: 1, unit_price: 18.90, total_price: 18.90 },
          ])
        },
        {
          name: "Apple.com/bill",
          category: "subscription",
          pos: "Apple Billing",
          raw: "APPLE.COM/BILL 866-712-7753 CA",
          location: { address: "1 Apple Park Way", city: "Cupertino", state: "CA", zip: "95014" },
          items: () => ([
            { name: "iCloud+ 200GB", category: "subscription", quantity: 1, unit_price: 2.99, total_price: 2.99 }
          ])
        },
        {
          name: "Lyft",
          category: "travel",
          pos: "Lyft App",
          raw: "LYFT RIDE 8PM NEW YORK NY",
          location: { address: "Multiple", city: "New York", state: "NY", zip: "10001" },
          items: () => ([
            { name: "Ride NYC", category: "ride", quantity: 1, unit_price: 23.75, total_price: 23.75 }
          ])
        },
        {
          name: "Whole Foods Market",
          category: "grocery",
          pos: "Whole Foods POS",
          raw: "WHOLEFDS #10217 AUSTIN TX",
          location: { address: "525 N Lamar Blvd", city: "Austin", state: "TX", zip: "78703" },
          items: () => ([
            { name: "Organic Avocados (x3)", category: "produce", quantity: 1, unit_price: 5.97, total_price: 5.97 },
            { name: "365 Almond Milk", category: "dairy-alternative", quantity: 1, unit_price: 3.49, total_price: 3.49 },
            { name: "GT's Kombucha", category: "beverages", quantity: 1, unit_price: 3.99, total_price: 3.99 },
          ])
        },
        {
          name: "Amazon.com",
          category: "retail",
          pos: "AMZN",
          raw: "AMAZON.COM*MD6Y7X900",
          location: { address: "Online", city: "Seattle", state: "WA", zip: "98109" },
          items: () => ([
            { name: "USB Charging Cable", category: "electronics", quantity: 1, unit_price: 14.99, total_price: 14.99 },
            { name: "Books", category: "books", quantity: 1, unit_price: 19.99, total_price: 19.99 },
          ])
        },
        {
          name: "Sephora",
          category: "retail",
          pos: "Adyen",
          raw: "SEPHORA #123 SAN FRANCISCO CA",
          location: { address: "330 Stockton St", city: "San Francisco", state: "CA", zip: "94108" },
          items: () => ([
            { name: "Facial Cleanser", category: "beauty", quantity: 1, unit_price: 28.00, total_price: 28.00 }
          ])
        },
        {
          name: "T-Mobile",
          category: "utilities",
          pos: "TMOBILE.COM",
          raw: "T-MOBILE BILL PAYMENT",
          location: { address: "Online", city: "Bellevue", state: "WA", zip: "98006" },
          items: () => ([
            { name: "Monthly Service", category: "subscription", quantity: 1, unit_price: 70.00, total_price: 70.00 }
          ])
        },
        {
          name: "Etsy",
          category: "retail",
          pos: "ETSY.COM",
          raw: "ETSY.COM NYC NY",
          location: { address: "Online", city: "Brooklyn", state: "NY", zip: "11201" },
          items: () => ([
            { name: "Handmade Necklace", category: "jewelry", quantity: 1, unit_price: 45.00, total_price: 45.00 }
          ])
        },
        {
          name: "Uber",
          category: "travel",
          pos: "UBER TRIP",
          raw: "UBER TRIP M8J5H NEW YORK NY",
          location: { address: "Multiple", city: "New York", state: "NY", zip: "10001" },
          items: () => ([
            { name: "Ride to Airport", category: "ride", quantity: 1, unit_price: 55.00, total_price: 55.00 }
          ])
        },
        {
          name: "Blue Bottle Coffee",
          category: "restaurant",
          pos: "Toast POS",
          raw: "BLUE BOTTLE COFFEE LAX",
          location: { address: "3750 W Century Blvd", city: "Inglewood", state: "CA", zip: "90303" },
          items: () => ([
            { name: "Cold Brew", category: "beverages", quantity: 1, unit_price: 5.50, total_price: 5.50 }
          ])
        },
      ];

      const toCreate = [];
      for (let i = 0, added = 0; i < pool.length && added < need; i++) {
        const p = pool[i];
        if (uniqMerchants.has(p.name.toLowerCase())) continue;
        const items = p.items();
        const amount = items.reduce((s, it) => s + Number(it.total_price || 0), 0);
        const d = new Date();
        // UPDATED: spread across past months (not days) for seasonality
        d.setMonth(d.getMonth() - (added % 12));
        const dateStr = d.toISOString().slice(0, 10);
        toCreate.push({
          raw_description: p.raw,
          normalized_merchant: p.name,
          merchant_category: p.category,
          transaction_amount: Number(amount.toFixed(2)),
          transaction_date: dateStr,
          pos_format: p.pos,
          confidence_score: 0.964,
          items,
          location: p.location,
          fraud_risk_score: Math.round(Math.random() * 20) / 100, // 0..0.20
          processing_time_ms: 47 + Math.round(Math.random() * 12),
          status: "processed"
        });
        added++;
      }

      if (toCreate.length) {
        await Transaction.bulkCreate(toCreate);
        sessionStorage.setItem("statements_demo_seeded", "1");
      }
    } catch (e) {
      // ignore; demo seeding is best-effort
      console.warn("Failed to seed demo data:", e);
    }
  }, []);

  // UPDATED: monthly recurring grocery purchases with deterministic pricing
  const seedMonthlyGroceries = useCallback(async (existingTxs) => {
    if (sessionStorage.getItem("statements_demo_monthlies_seeded")) return;

    const existingSig = new Set(
      (existingTxs || []).map(t => {
        const m = (t.normalized_merchant || "").toLowerCase();
        const d = String(t.transaction_date || "").slice(0,10);
        const a = String(Number(t.transaction_amount || 0).toFixed(2));
        return `${m}|${d}|${a}`;
      })
    );

    const grocers = [
      {
        merchant: "Whole Foods Market",
        raw: "WHOLEFDS #10217 AUSTIN TX",
        pos: "Whole Foods POS",
        location: { address: "525 N Lamar Blvd", city: "Austin", state: "TX", zip: "78703" },
        baseItems: [
          { name: "Organic Avocados (x3)", category: "produce", base: 5.97 },
          { name: "365 Almond Milk", category: "dairy-alternative", base: 3.49 },
          { name: "GT's Kombucha", category: "beverages", base: 3.99 },
        ]
      },
      {
        merchant: "Trader Joe's",
        raw: "TRADER JOE'S #545 NEW YORK NY",
        pos: "Square POS v2.1",
        location: { address: "142 E 14th St", city: "New York", state: "NY", zip: "10003" },
        baseItems: [
          { name: "Organic Bananas (2 lbs)", category: "produce", base: 1.38 },
          { name: "Everything Bagel Seasoning", category: "grocery", base: 2.49 },
          { name: "Dark Chocolate Almonds", category: "grocery", base: 4.99 },
        ]
      }
    ];

    const toCreate = [];
    const now = new Date();
    for (const g of grocers) {
      for (let m = 0; m < 12; m++) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - m);
        d.setDate(12); // stable day-of-month
        const monthIdx = d.getMonth(); // 0..11
        const year = d.getFullYear();
        const items = g.baseItems.map(it => {
          const seedKey = `${g.merchant}|${it.name}|${year}-${monthIdx + 1}`;
          const unit = seasonalPrice(it.base, monthIdx, seedKey);
          // quantity small integers (1..2) for realism
          const qty = 1;
          return { name: it.name, category: it.category, quantity: qty, unit_price: unit, total_price: round2(unit * qty) };
        });
        const amount = round2(items.reduce((s, i) => s + Number(i.total_price || 0), 0));
        const dateStr = d.toISOString().slice(0, 10);
        const sig = `${g.merchant.toLowerCase()}|${dateStr}|${amount.toFixed(2)}`;
        if (existingSig.has(sig)) continue; // skip duplicates
        existingSig.add(sig);

        toCreate.push({
          raw_description: g.raw,
          normalized_merchant: g.merchant,
          merchant_category: "grocery",
          transaction_amount: amount,
          transaction_date: dateStr,
          pos_format: g.pos,
          confidence_score: 0.97,
          items,
          location: g.location,
          fraud_risk_score: Math.round(Math.random() * 10) / 100, // low risk
          processing_time_ms: 50,
          status: "processed"
        });
      }
    }

    if (toCreate.length) {
      await Transaction.bulkCreate(toCreate);
      sessionStorage.setItem("statements_demo_monthlies_seeded", "1");
    }
  }, []);

  // NEW: Seed extra featured merchants (Best Buy, Lululemon, Williams Sonoma) with realistic items
  const seedFeaturedMerchants = useCallback(async (existingTxs) => {
    if (sessionStorage.getItem("statements_demo_featured_seeded")) return;

    // Build signature set to prevent duplicates: merchant|date|amount
    const existingSig = new Set(
      (existingTxs || []).map(t => {
        const m = (t.normalized_merchant || "").toLowerCase();
        const d = String(t.transaction_date || "").slice(0,10);
        const a = String(Number(t.transaction_amount || 0).toFixed(2));
        return `${m}|${d}|${a}`;
      })
    );

    const retailers = [
      {
        merchant: "Best Buy",
        raw: "BEST BUY #442 SECAUCUS NJ",
        pos: "NCR POS",
        category: "retail",
        location: { address: "3 Mill Creek Dr", city: "Secaucus", state: "NJ", zip: "07094" },
        txs: [
          { monthOffset: 0, items: [
            { name: "Wireless Mouse", category: "electronics", quantity: 1, unit_price: 24.99, total_price: 24.99 }
          ]},
          { monthOffset: 2, items: [
            { name: "Portable SSD 1TB", category: "electronics", quantity: 1, unit_price: 109.99, total_price: 109.99 }
          ]},
          { monthOffset: 5, items: [
            { name: "HDMI Cable 6ft", category: "electronics", quantity: 1, unit_price: 11.99, total_price: 11.99 },
            { name: "USB-A to USB-C Adapter", category: "electronics", quantity: 1, unit_price: 8.99, total_price: 8.99 }
          ]}
        ]
      },
      {
        merchant: "Lululemon",
        raw: "LULULEMON #274 SOHO NEW YORK NY",
        pos: "Adyen",
        category: "retail",
        location: { address: "125 Prince St", city: "New York", state: "NY", zip: "10012" },
        txs: [
          { monthOffset: 1, items: [
            { name: "ABC Jogger 30\"", category: "apparel", quantity: 1, unit_price: 128.00, total_price: 128.00 }
          ]},
          { monthOffset: 4, items: [
            { name: "Metal Vent Tech Tee", category: "apparel", quantity: 1, unit_price: 78.00, total_price: 78.00 }
          ]},
          { monthOffset: 7, items: [
            { name: "Surge Short 6\"", category: "apparel", quantity: 1, unit_price: 68.00, total_price: 68.00 }
          ]}
        ]
      },
      {
        merchant: "Williams Sonoma",
        raw: "WILLIAMS SONOMA #512 SAN FRANCISCO CA",
        pos: "Adyen",
        category: "retail",
        location: { address: "340 Post St", city: "San Francisco", state: "CA", zip: "94108" },
        txs: [
          { monthOffset: 0, items: [
            { name: "Nonstick Skillet 10\"", category: "home", quantity: 1, unit_price: 59.95, total_price: 59.95 }
          ]},
          { monthOffset: 3, items: [
            { name: "Chef's Knife 8\"", category: "home", quantity: 1, unit_price: 129.95, total_price: 129.95 }
          ]},
          { monthOffset: 6, items: [
            { name: "Dish Towels (Set of 4)", category: "home", quantity: 1, unit_price: 24.95, total_price: 24.95 }
          ]}
        ]
      }
    ];

    const toCreate = [];
    const now = new Date();

    for (const r of retailers) {
      for (const t of r.txs) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - t.monthOffset);
        d.setDate(5); // stable day-of-month
        const dateStr = d.toISOString().slice(0,10);
        const amount = t.items.reduce((s, i) => s + Number(i.total_price || 0), 0);
        const sig = `${r.merchant.toLowerCase()}|${dateStr}|${amount.toFixed(2)}`;
        if (existingSig.has(sig)) continue;
        existingSig.add(sig);

        toCreate.push({
          raw_description: r.raw,
          normalized_merchant: r.merchant,
          merchant_category: r.category,
          transaction_amount: Number(amount.toFixed(2)),
          transaction_date: dateStr,
          pos_format: r.pos,
          confidence_score: 0.97,
          items: t.items,
          location: r.location,
          fraud_risk_score: 0.04,
          processing_time_ms: 45 + Math.round(Math.random() * 10),
          status: "processed"
        });
      }
    }

    if (toCreate.length) {
      await Transaction.bulkCreate(toCreate);
      sessionStorage.setItem("statements_demo_featured_seeded", "1");
    }
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    let list = await Transaction.list("-created_date", 150); // Increased limit

    const MIN_TX_THRESHOLD = 50; // Expecting about 50+ transactions after full seeding

    // If transactions are few, it's likely a fresh start, so seed.
    // Use sessionStorage to prevent seeding on every single page load, just once per session.
    if (list.length < MIN_TX_THRESHOLD && !sessionStorage.getItem('demo_seeded_v3')) {
      // Set flag immediately to prevent parallel runs
      sessionStorage.setItem('demo_seeded_v3', 'true'); 
      
      // Pass the currently loaded (but small) list to the seeders so they can avoid duplicates
      await ensureVariety(list);
      await seedMonthlyGroceries(list);
      await seedFeaturedMerchants(list);
      
      // Reload data after seeding to get a full list
      list = await Transaction.list("-created_date", 150); 
    }
    
    setTxs(list);
    setIsLoading(false);
  }, [ensureVariety, seedMonthlyGroceries, seedFeaturedMerchants]);

  useEffect(() => { load(); }, [load]);

  // After loading, sanitize any false-positive fraud flags (low risk)
  useEffect(() => {
    (async () => {
      if (!txs.length) return;
      if (sessionStorage.getItem("fraud_sanitized")) return;
      const mis = txs.filter(t => t.fraud_flagged && Number(t.fraud_risk_score || 0) < 0.5);
      if (mis.length) {
        await Promise.all(mis.slice(0, 20).map(t => Transaction.update(t.id, { fraud_flagged: false })));
      }
      sessionStorage.setItem("fraud_sanitized", "1");
    })();
  }, [txs]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return txs;
    return txs.filter(t => {
      const m = (t.normalized_merchant || "").toLowerCase();
      const d = (t.raw_description || "").toLowerCase();
      const anyItem = (t.items || []).some(i => (i.name || "").toLowerCase().includes(q));
      return m.includes(q) || d.includes(q) || anyItem;
    });
  }, [txs, query]);

  // UPDATED: strict newest->oldest and remove exact duplicate rows (same merchant+date+amount)
  const rows = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => txTime(b) - txTime(a));
    const mapped = sorted.map((t, idx) => {
      const pseudoPending = (idx % 7 === 0);
      return { ...t, _status: pseudoPending ? "Pending" : "Posted" };
    });
    const seen = new Set();
    const unique = [];
    for (const r of mapped) {
      const key = [
        String(displayMerchant(r)).toLowerCase(),
        String(r.transaction_date || r.created_date).slice(0,10),
        Number(r.transaction_amount || 0).toFixed(2),
        String(r.raw_description || "").slice(0,40) // partial raw as tie-breaker for duplicates
      ].join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(r);
    }
    return unique;
  }, [filtered]);

  // NEW: limit the Activity tab to the 40 most recent rows (more variety)
  const rowsLimited = useMemo(() => rows.slice(0, 40), [rows]);

  const metrics = useMemo(() => {
    const pending = rows.filter(r => r._status === "Pending");
    const posted = rows.filter(r => r._status !== "Pending");
    const pendingAmt = pending.reduce((s, r) => s + Number(r.transaction_amount || 0), 0);
    const postedAmt = posted.reduce((s, r) => s + Number(r.transaction_amount || 0), 0);
    const totalBal = pendingAmt + postedAmt;
    return { pendingAmt, postedAmt, totalBal };
  }, [rows]);

  const onToggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  // Actions
  const flagFraud = async (tx) => {
    await Transaction.update(tx.id, { fraud_flagged: true, fraud_risk_score: Math.max(Number(tx.fraud_risk_score || 0), 0.88) });
    load();
  };
  const unflagFraud = async (tx) => {
    await Transaction.update(tx.id, { fraud_flagged: false, fraud_risk_score: 0.0 });
    load();
  };
  const startReturn = async (tx, itemIndex = 0) => {
    const items = tx.items || [];
    if (!items.length) return;
    const candidateIdx = items.findIndex(i => isItemReturnEligible(tx, i));
    const idx = candidateIdx >= 0 ? candidateIdx : itemIndex;
    const it = items[idx] || items[0];
    const purchase = tx.transaction_date || new Date().toISOString().slice(0,10);
    const deadline = (() => {
      const d = new Date(purchase); d.setDate(d.getDate() + 30); return d.toISOString().slice(0,10);
    })();
    await ReturnRequest.create({
      item_name: it.name,
      merchant: tx.normalized_merchant || "Unknown",
      purchase_date: purchase,
      return_deadline: deadline,
      status: "requested",
      rma_number: "",
      refund_amount: Number(it.total_price || 0),
      reason: "Initiated from Statements Demo",
      method: "mail",
      transaction_id: String(tx.id),
      item_index: idx,
      notes: ""
    });
    load();
  };
  const trackWarranty = async (tx, itemIndex = 0) => {
    const items = tx.items || [];
    if (!items.length) return;
    const idx = items.findIndex(isWarrantyEligible);
    const pick = idx >= 0 ? idx : itemIndex;
    const it = items[pick] || items[0];
    const purchase = tx.transaction_date || new Date().toISOString().slice(0,10);
    const expiry = (() => { const d = new Date(purchase); d.setMonth(d.getMonth() + 12); return d.toISOString().slice(0,10); })();
    await Warranty.create({
      item_name: it.name,
      serial_number: "",
      merchant: tx.normalized_merchant ? displayMerchant(tx) : "Unknown", // Use displayMerchant for better name
      purchase_date: purchase,
      warranty_provider: tx.normalized_merchant ? `${displayMerchant(tx)} / Manufacturer` : "Manufacturer", // Use displayMerchant for better name
      policy_url: "",
      warranty_months: 12,
      warranty_expiry_date: expiry,
      receipt_transaction_id: String(tx.id),
      item_index: pick,
      status: "active",
      notes: "Tracked from Statements Demo"
    });
    load();
  };

  // Analytics data
  // UPDATED: Spend by Merchant - filter out any generic/unknown names from insights
  const byMerchant = useMemo(() => {
    const map = {};
    rows.forEach(r => {
      const nameRaw = displayMerchant(r);
      if (isGenericMerchant(nameRaw)) return; // skip generic/unknown
      map[nameRaw] = (map[nameRaw] || 0) + Number(r.transaction_amount || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // was 6, now 10
  }, [rows]);

  // NEW: dynamic chart height for merchants list (fits all without clipping)
  const merchantBarHeight = useMemo(
    () => Math.min(380, Math.max(220, byMerchant.length * 36)),
    [byMerchant.length]
  );

  const byCategory = useMemo(() => {
    const map = {};
    rows.forEach(r => { const c = prettyCat(r.merchant_category || "other"); map[c] = (map[c] || 0) + Number(r.transaction_amount || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [rows]);

  // UPDATED: Recent Spend Trend — aggregate by month for last 12 months
  const trend = useMemo(() => {
    const now = new Date();
    // Build last 12 months scaffold with zeroed amounts
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7); // YYYY-MM
      const label = d.toLocaleString(undefined, { month: "short" });
      months.push({ key, label, amount: 0 });
    }
    const idx = new Map(months.map((m, i) => [m.key, i]));
    rows.forEach(r => {
      const ds = r.transaction_date || r.created_date;
      const t = Date.parse(ds);
      if (!Number.isFinite(t)) return;
      const d = new Date(t);
      const key = d.toISOString().slice(0, 7);
      if (idx.has(key)) {
        months[idx.get(key)].amount += Number(r.transaction_amount || 0);
      }
    });
    return months;
  }, [rows]);

  // Item-level analytics (with realism filters)
  const allItems = useMemo(() => {
    return rows.flatMap(r => (r.items || []).map(i => ({
      ...i,
      date: r.transaction_date || r.created_date,
      merchant: r.normalized_merchant
    })));
  }, [rows]);

  // UPDATED: filter out unrealistic high-ticket electronics and require at least 2 purchases
  const topItemsAvg = useMemo(() => {
    const banned = /(oled|tv|soundbar|macbook|iphone|console|gift\s*card)/i;
    const m = {};
    allItems.forEach(i => {
      if (!i || !i.name) return;
      const price = Number(i.unit_price ?? i.total_price ?? 0);
      if (!isFinite(price) || price <= 0) return;
      if (banned.test(i.name) || price > 200) return; // realistic everyday items
      const key = i.name;
      if (!m[key]) m[key] = { name: key, purchases: 0, sumPrice: 0 };
      m[key].purchases += 1;
      m[key].sumPrice += price;
    });
    let arr = Object.values(m)
      .filter(v => v.purchases >= 2)
      .map(v => ({ ...v, avgPrice: v.sumPrice / v.purchases }))
      .sort((a, b) => b.purchases - a.purchases)
      .slice(0, 6);

    // fallback if too strict
    if (arr.length === 0) {
      const alt = {};
      allItems.forEach(i => {
        const price = Number(i.unit_price ?? i.total_price ?? 0);
        if (!i?.name || !isFinite(price) || price <= 0) return;
        const key = i.name;
        if (!alt[key]) alt[key] = { name: key, purchases: 0, sumPrice: 0 };
        alt[key].purchases += 1;
        alt[key].sumPrice += price;
      });
      arr = Object.values(alt).map(v => ({ ...v, avgPrice: v.sumPrice / v.purchases }))
        .sort((a, b) => b.purchases - a.purchases).slice(0, 6);
    }
    return arr;
  }, [allItems]);

  // FIX: Seasonality average inflated due to wrong count increment
  const seasonality = useMemo(() => {
    const buckets = {};
    allItems.forEach(i => {
      if (!i?.name || !i?.date) return;
      const d = new Date(i.date);
      if (isNaN(d)) return;
      const month = d.getMonth() + 1;
      const name = i.name;
      const price = Number(i.unit_price ?? i.total_price ?? 0);
      if (!price) return;
      buckets[name] = buckets[name] || { sumByMonth: {}, countByMonth: {}, all: [] };
      buckets[name].sumByMonth[month] = (buckets[name].sumByMonth[month] || 0) + price;
      // UPDATED: increment by 1 (was defaulting to 1 without increment)
      buckets[name].countByMonth[month] = (buckets[name].countByMonth[month] || 0) + 1;
      buckets[name].all.push(price);
    });

    const result = Object.entries(buckets).map(([name, d]) => {
      const monthly = [];
      let total = 0, n = 0;
      for (let m = 1; m <= 12; m++) {
        const sum = d.sumByMonth[m] || 0;
        const c = d.countByMonth[m] || 0;
        const avg = c ? sum / c : null;
        if (avg !== null) { total += sum; n += c; }
        monthly.push({ month: m, avg });
      }
      const observed = monthly.filter(x => x.avg !== null);
      if (observed.length < 2) return null;
      const avgPrice = n ? total / n : 0;
      const minAvg = Math.min(...observed.map(x => x.avg));
      const bestMonths = observed.filter(x => x.avg === minAvg).map(x => x.month);
      const savingsPct = avgPrice ? Math.max(0, (avgPrice - minAvg) / avgPrice) : 0;
      return { name, monthly, avgPrice, bestMonths, savingsPct, samples: n };
    }).filter(Boolean)
      .sort((a, b) => b.samples - a.samples || b.savingsPct - a.savingsPct)
      .slice(0, 6);

    return result;
  }, [allItems]);

  const CAT_COLORS = ["#0ea5e9","#10b981","#f59e0b","#8b5cf6","#ef4444","#14b8a6","#64748b"];

  // UPDATED: Organic groceries health metrics — blended score (70% item count, 30% spend), capped to B- ceiling
  const organicHealth = useMemo(() => {
    const items = allItems || [];
    let healthySpent = 0;
    let neutralSpent = 0;
    let unhealthySpent = 0;

    let healthyItems = 0;
    let neutralItems = 0;
    let unhealthyItems = 0;

    const UNHEALTHY_CATS = new Set(["dessert", "candy", "soda"]);

    // Count WF/TJ presence from item level
    let wfTjCount = 0;

    items.forEach(i => {
      const name = String(i.name || "").toLowerCase();
      const cat = String(i.category || "").toLowerCase();
      const merch = String(i.merchant || "").toLowerCase();
      const price = Number(i.total_price ?? i.unit_price ?? 0) || 0;

      const isWFOrTJ = merch.includes("whole foods") || merch.includes("trader joe");
      if (isWFOrTJ) wfTjCount += 1;

      const isGroceryish = ["grocery","produce","dairy","dairy-alternative","beverages","food","prepared"].includes(cat);
      const isOrganicByName = name.includes("organic");
      const isHealthyBeverage = cat === "beverages" && (name.includes("kombucha") || name.includes("tea") || name.includes("water") || name.includes("sparkling"));
      const isHealthyByCatAtWF_TJ = isWFOrTJ && (cat === "produce" || cat === "dairy-alternative" || isHealthyBeverage);

      const isHealthy = (isGroceryish && isOrganicByName) || isHealthyByCatAtWF_TJ || isHealthyBeverage;
      
      if (isHealthy) {
        healthySpent += price;
        healthyItems += 1;
      } else if (UNHEALTHY_CATS.has(cat)) {
        unhealthySpent += price;
        unhealthyItems += 1;
      } else {
        neutralSpent += price;
        neutralItems += 1;
      }
    });

    const totalSpent = healthySpent + neutralSpent + unhealthySpent;
    const totalItems = healthyItems + neutralItems + unhealthyItems;

    const spendRatio = totalSpent ? (healthySpent / totalSpent) : 0;      // 0..1
    const countRatio = totalItems ? (healthyItems / totalItems) : 0;      // 0..1

    // Blend counts (dominant) with spend to better reflect many healthy items
    let baseScore = Math.round(((countRatio * 0.70) + (spendRatio * 0.30)) * 100);

    // Gentle boost reflecting many WF/TJ healthy items; cap to B- (<=66)
    if (wfTjCount >= 12) {
      baseScore = Math.min(66, baseScore + 8);
    } else if (wfTjCount >= 6) {
      baseScore = Math.min(66, baseScore + 6);
    } else if (wfTjCount >= 3) {
      baseScore = Math.min(66, baseScore + 4);
    }

    return {
      healthScore: baseScore,
      healthySpent,
      neutralSpent,
      unhealthySpent,
      totalSpent,
      healthyItems,
      unhealthyItems,
      neutralItems
    };
  }, [allItems]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Top banner */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-6">
          <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 rounded-sm bg-white/90 flex items-center justify-center shadow">
                <CreditCard className="w-5 h-5 text-sky-700" />
              </div>
              <div>
                <div className="text-sm uppercase tracking-wide opacity-90">Platinum Card® (Demo)</div>
                <div className="text-xs opacity-90">•••• 55002 • Statements & Activity</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-white/20">Go to PDF Statements</Button>
            </div>
          </div>

          {/* Toolbar + Metrics */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex flex-col md:flex-row md::items-center md:justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by description..." className="pl-8 w-64" />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filter
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Print
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <TagIcon className="w-4 h-4" /> Tag
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-slate-500">Pending Charges</div>
                  <div className="text-lg font-semibold">{fmtCurrency(metrics.pendingAmt)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Posted Charges</div>
                  <div className="text-lg font-semibold">{fmtCurrency(metrics.postedAmt)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Total Balance</div>
                  <div className="lg:text-lg text-md font-semibold">{fmtCurrency(metrics.totalBal)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Activity / Insights */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {isLoading ? (
                    [...Array(10)].map((_, i) => (
                      <div key={i} className="px-4 py-3 flex items-center gap-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-24" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    ))
                  ) : rowsLimited.length > 0 ? (
                    rowsLimited.map((tx) => {
                      const isOpen = !!expanded[tx.id];
                      return (
                        <div key={tx.id} className="hover:bg-slate-50">
                          {/* Row */}
                          <div className="px-4 py-3 flex items-center gap-3">
                            <input type="checkbox" className="accent-sky-600" />
                            <div className="w-24 text-slate-600">{formatDate(tx.transaction_date || tx.created_date)}</div>
                            <div className="w-24">
                              {tx._status === "Pending" ? (
                                <Badge variant="outline" className="border-amber-300 text-amber-700">Pending</Badge>
                              ) : (
                                <Badge variant="outline" className="border-emerald-300 text-emerald-700">Posted</Badge>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">
                                {displayMerchant(tx)}
                                {tx.fraud_flagged && Number(tx.fraud_risk_score || 0) >= 0.5 && (
                                  <span className="inline-flex items-center gap-1 text-red-600 text-xs ml-2">
                                    <AlertTriangle className="w-3 h-3" /> Fraud flagged
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-mono truncate">{tx.raw_description}</div>
                            </div>
                            <div className="w-28 text-right font-semibold">{fmtCurrency(tx.transaction_amount)}</div>
  
                            {/* Row actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="ml-2">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => onToggle(tx.id)}>View details</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem disabled>Start return</DropdownMenuItem>
                                <DropdownMenuItem disabled>Track warranty</DropdownMenuItem>
                                {!tx.fraud_flagged || Number(tx.fraud_risk_score || 0) < 0.5 ? ( // allow flagging if not flagged OR if risk is low
                                  <DropdownMenuItem onClick={() => flagFraud(tx)} className="text-red-600">Flag as fraud</DropdownMenuItem>
                                ) : ( // allow unflagging only if currently flagged AND risk is high
                                  <DropdownMenuItem onClick={() => unflagFraud(tx)} className="text-emerald-600">Mark not fraud</DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
  
                            <Button variant="ghost" size="icon" onClick={() => onToggle(tx.id)}>
                              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </Button>
                          </div>
  
                          {/* Expanded details */}
                          {isOpen && (
                            <div className="bg-slate-50/60 border-t px-6 py-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-500">
                                  POS: {tx.pos_format || "—"} • Category: {prettyCat(tx.merchant_category || "other")} • Confidence: {((tx.confidence_score || 0) * 100).toFixed(1)}%
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="border-sky-300 text-sky-700">Details</Badge>
                                </div>
                              </div>
  
                              {/* Items list */}
                              <div className="rounded-lg bg-white border divide-y">
                                {(tx.items || []).map((it, i) => (
                                  <div key={i} className="px-4 py-3 flex items-center">
                                    <div className="flex-1">
                                      <div className="font-medium">{it.name}</div>
                                      <div className="text-xs text-slate-500 capitalize">{it.category} • {it.quantity} × {fmtCurrency(it.unit_price)}</div>
                                    </div>
                                    <div className="w-28 text-right font-semibold">{fmtCurrency(it.total_price)}</div>
                                    {/* Per-item dropdown */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="ml-2">
                                          <MoreVertical className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuItem disabled>Return / Replace</DropdownMenuItem>
                                        <DropdownMenuItem disabled>Claim Warranty</DropdownMenuItem>
                                        {!tx.fraud_flagged || Number(tx.fraud_risk_score || 0) < 0.5 ? (
                                          <DropdownMenuItem onClick={() => flagFraud(tx)} className="text-red-600">
                                            Flag as Fraud
                                          </DropdownMenuItem>
                                        ) : (
                                          <DropdownMenuItem onClick={() => unflagFraud(tx)} className="text-emerald-600">
                                            Mark Not Fraud
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                ))}
                                {(tx.items || []).length === 0 && (
                                  <div className="px-4 py-3 text-sm text-slate-500">No itemized breakdown for this transaction.</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                     <div className="p-8 text-center text-slate-500">
                        <p>No transactions found.</p>
                     </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spend by Merchant with visible names via vertical bars */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-sky-600" />
                    Spend by Merchant
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ height: merchantBarHeight }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RBarChart data={byMerchant} layout="vertical" margin={{ left: 8, right: 10, top: 8, bottom: 8 }}>
                      <CartesianGrid stroke="#e5e7eb" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={140}
                      />
                      <Tooltip formatter={(v) => [fmtCurrency(v), "Spend"]} />
                      <Bar dataKey="value" fill="#0ea5e9" />
                    </RBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Breakdown with prettier names */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-emerald-600" />
                    Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height={220}>
                    <RPieChart>
                      <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                        {byCategory.map((e, i) => <Cell key={e.name} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [fmtCurrency(v), n]} />
                    </RPieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {byCategory.map((c, i) => (
                      <Badge key={c.name} variant="outline" className="gap-2" style={{ borderColor: `${CAT_COLORS[i % CAT_COLORS.length]}55` }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                        {c.name}: {fmtCurrency(c.value)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Items — Average Cost */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Most Purchased Items — Avg Cost</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topItemsAvg.map((it, idx) => (
                    <div key={it.name} className="flex items-center justify-between text-sm p-2 rounded bg-slate-50">
                      <div className="truncate">
                        <span className="font-medium">{idx + 1}. {it.name}</span>
                        <span className="text-slate-500 ml-2">{it.purchases} purchases</span>
                      </div>
                      <div className="font-semibold">{fmtCurrency(it.avgPrice)}</div>
                    </div>
                  ))}
                  {topItemsAvg.length === 0 && <div className="text-slate-500 text-sm">Not enough itemized data yet.</div>}
                </CardContent>
              </Card>

              {/* UPDATED: Seasonality grid with connectNulls true for full-year line */}
              <Card className="shadow-sm lg:col-span-1">
                <CardHeader>
                  <CardTitle>Seasonality — Price by Month</CardTitle>
                </CardHeader>
                <CardContent>
                  {seasonality.length === 0 ? (
                    <div className="text-slate-500 text-sm">We’ll show item seasonality once we have enough monthly samples.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {seasonality.map((s) => (
                        <div key={s.name} className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium truncate">{s.name}</div>
                            <Badge variant="outline" className="text-xs">Save {Math.round(s.savingsPct * 100)}%</Badge>
                          </div>
                          <div className="h-28">
                            <ResponsiveContainer width="100%" height="100%">
                              <RLineChart data={s.monthly}>
                                <CartesianGrid stroke="#e5e7eb" />
                                <XAxis dataKey="month" tickFormatter={(m) => ["","J","F","M","A","M","J","J","A","S","O","N","D"][m]} />
                                <YAxis tickFormatter={(v) => v == null ? "" : `$${Number(v).toFixed(0)}`} width={30} />
                                <Tooltip
                                  formatter={(v) => v == null ? ["—", "Avg price"] : [`$${Number(v).toFixed(2)}`, "Avg price"]}
                                  labelFormatter={(m) => `Month ${m}`}
                                />
                                <Line type="monotone" dataKey="avg" stroke="#8b5cf6" strokeWidth={2} dot={false} connectNulls={true} />
                              </RLineChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            Best month{(s.bestMonths || []).length > 1 ? "s" : ""}: {(s.bestMonths || []).map(m => ["J","F","M","A","M","J","J","A","S","O","N","D"][m]).filter(Boolean).join(", ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* REPLACED: Recent Spend Trend -> Organic Health Score */}
              <div className="lg:col-span-2">
                <HealthScore metrics={organicHealth} isLoading={false} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
