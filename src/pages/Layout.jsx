


import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home,
  Zap,
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

  return (
    <SidebarProvider>
      <style>
        {`
          .sb-trigger {
            background: #f8fafc;
            color: #334155;
            border: 1px solid #e2e8f0;
          }
          .sb-trigger:hover { background: #f1f5f9; }
          .sb-item:hover { background: #f1f5f9; }
          .sb-active { background: #3b82f6 !important; color: #fff !important; }
          .sb-active .sb-title { color: #fff !important; }
          .sb-active .sb-icon { color: #fff !important; }
          .sb-active .sb-desc { color: rgba(255,255,255,0.8) !important; }
        `}
      </style>

      <div className="min-h-screen flex w-full bg-slate-50">
        {/* Sidebar */}
        <Sidebar className="border-r border-slate-200 bg-white">
          {/* Header centered logo */}
          <SidebarHeader className="px-4 py-3 border-b border-slate-200">
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
              <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 px-2 py-2">
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
                          className={`w-full rounded-full border border-transparent transition-all duration-150 sb-item min-h-[52px] ${
                            isActive ? "sb-active" : ""
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon
                              className={`w-5 h-5 flex-shrink-0 sb-icon ${
                                isActive ? "text-white" : "text-slate-500"
                              }`}
                            />
                            <div className="min-w-0 leading-tight">
                              <div className={`text-sm font-semibold truncate sb-title ${
                                isActive ? "text-white" : "text-slate-800"
                              }`}>{item.title}</div>
                              <div
                                className={`text-[12px] truncate sb-desc ${
                                  isActive ? "text-white/80" : "text-slate-500"
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

          {/* Footer */}
          <SidebarFooter className="px-4 py-3 border-t border-slate-200">
            <div className="text-center text-slate-500 text-xs">
              &copy; ItemIQ 2026
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Single persistent trigger to reopen on desktop */}
        <div className="hidden md:block fixed top-3 left-3 z-50">
          <SidebarTrigger className="sb-trigger px-3 py-2 rounded-lg shadow-sm" />
        </div>

        {/* Main content area */}
        <main className="flex-1 flex flex-col">
          {/* Mobile top bar with trigger (only on small screens) */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4 h-8">
              <SidebarTrigger className="p-2 rounded-lg bg-slate-100 text-slate-700" />
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
