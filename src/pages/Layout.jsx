

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home,
  Zap,
  Linkedin,
  BarChart3,
  CreditCard
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Home", url: createPageUrl("Home"), icon: Home, description: "Product overview" },
  { title: "Statements (Demo)", url: createPageUrl("StatementsDemo"), icon: CreditCard, description: "Amex-style activity & insights" },
  { title: "Process Transactions", url: createPageUrl("ProcessTransactions"), icon: Zap, description: "Live AI normalization demo" },
  { title: "Survey Insights", url: createPageUrl("SurveyInsights"), icon: BarChart3, description: "Investor-ready consumer survey" },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    // One-time per session: if app opens on a non-Home page by default, redirect to Home
    const alreadyRedirected = sessionStorage.getItem("default_redirect_done");
    if (!alreadyRedirected && location.pathname !== createPageUrl("Home")) {
      const isAnyAppPage = navigationItems.some(item => item.url === location.pathname);
      if (isAnyAppPage) {
        sessionStorage.setItem("default_redirect_done", "1");
        navigate(createPageUrl("Home"), { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --sidebar-bg: #0a0f1a;
            --sidebar-bg-2: #0d1422;
            --sidebar-border: #1f2a3a;
            --text-strong: #e5eaf1;
            --text-muted: #a5b4c5;
            --item-hover: rgba(255,255,255,0.10);
            --pill-active: #374151;
          }
          .sb-bg {
            background: linear-gradient(180deg, var(--sidebar-bg) 0%, var(--sidebar-bg-2) 100%);
          }
          .sb-trigger {
            background: #0f172a;
            color: #e5e7eb;
            border: 1px solid #334155;
          }
          .sb-trigger:hover { background: #1e293b; }
          .sb-item:hover { background: var(--item-hover); }
          .sb-active { background: var(--pill-active); color: #fff; }
        `}
      </style>

      <div className="min-h-screen flex w-full bg-slate-50">
        {/* Sidebar */}
        <Sidebar className="sb-bg text-white border-r" style={{ borderColor: "var(--sidebar-border)" }}>
          {/* Header centered logo (no trigger here) */}
          <SidebarHeader className="px-4 py-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
            <div className="flex items-center justify-center">
              <Link to={createPageUrl("Home")} className="flex items-center">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68cb10678907e93d0710a15a/ef91f01b9_logo1.png"
                  alt="ItemIQ Logo"
                  className="h-7 w-auto"
                />
              </Link>
            </div>
          </SidebarHeader>

          {/* Menu */}
          <SidebarContent className="px-3 py-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider uppercase text-slate-300 px-2 py-2">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`w-full rounded-full border border-transparent transition-colors sb-item min-h-[52px] ${
                            isActive ? "sb-active ring-1 ring-white/15" : "text-slate-200"
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon
                              className={`w-5 h-5 flex-shrink-0 ${
                                isActive ? "text-white" : "text-slate-300"
                              }`}
                            />
                            <div className="min-w-0 leading-tight">
                              <div className="text-sm font-semibold truncate">{item.title}</div>
                              <div
                                className={`text-[12px] truncate ${
                                  isActive ? "text-slate-200/90" : "text-slate-400"
                                }`}
                              >
                                {item.description}
                              </div>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer (LinkedIn only, darker, copyright symbol) */}
          <SidebarFooter className="px-4 py-3 border-t bg-[#0c1220]" style={{ borderColor: "var(--sidebar-border)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <a
                  href="https://www.linkedin.com/company/itemiq"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-md text-slate-300 hover:text-slate-100 hover:bg-white/10 transition"
                  aria-label="ItemIQ on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              <div className="text-right text-slate-200 text-xs">
                © ItemIQ 2025
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Single persistent trigger to reopen on desktop */}
        <div className="hidden md:block fixed top-3 left-3 z-50">
          <SidebarTrigger className="sb-trigger px-3 py-2 rounded-lg shadow-lg" />
        </div>

        {/* Main content area */}
        <main className="flex-1 flex flex-col">
          {/* Mobile top bar with trigger (only on small screens) */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4 h-8">
              <SidebarTrigger className="p-2 rounded-lg bg-slate-900 text-white" />
              <Link to={createPageUrl("Home")}>
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68cb10678907e93d0710a15a/ef91f01b9_logo1.png"
                  alt="ItemIQ Logo"
                  className="h-8 w-auto"
                />
              </Link>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-slate-50">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

