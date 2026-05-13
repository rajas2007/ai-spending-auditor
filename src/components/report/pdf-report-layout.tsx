"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import type { StoredAudit } from "@/types/stored-audit";
import { TOOL_LABELS } from "@/data/tool-options";

interface PdfReportLayoutProps {
  audit: StoredAudit;
  companyName?: string;
}

export function PdfReportLayout({ audit, companyName }: PdfReportLayoutProps) {
  const { result } = audit;
  
  // Prepare data for charts
  const trendData = createTrendData(result.totalMonthlySpendUsd, result.estimatedMonthlySavingsUsd);
  const breakdownData = result.toolBreakdown.map((tool, index) => ({
    name: TOOL_LABELS[tool.toolId] || tool.toolId,
    value: tool.computedMonthlyCostUsd,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <div id="pdf-export-container" style={{
      width: "800px",
      padding: "40px",
      backgroundColor: "#09090b",
      color: "#fafafa",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      lineHeight: "1.5",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "40px",
        borderBottom: "1px solid #27272a",
        paddingBottom: "24px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #A78BFA, #8B5CF6)", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", position: "relative" }}>
              <div style={{ width: "10px", height: "8px", background: "#09090b", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", position: "absolute", top: "60%", left: "50%", transform: "translate(-50%, -50%)" }}></div>
            </div>
            <span style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.025em" }}>Aethra</span>
          </div>
          <div style={{ fontSize: "14px", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Spend Optimization Audit</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "12px", color: "#a1a1aa", marginBottom: "4px" }}>Audit Timestamp</div>
          <div style={{ fontSize: "14px", fontWeight: "600" }}>{new Date(audit.createdAt).toLocaleString()}</div>
          <div style={{ fontSize: "12px", color: "#71717a", marginTop: "4px" }}>ID: {audit.id.substring(0, 13)}...</div>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "8px", letterSpacing: "-0.025em" }}>Efficiency Report</h1>
        {companyName && (
          <p style={{ fontSize: "18px", color: "#8b5cf6", fontWeight: "500" }}>Prepared for {companyName}</p>
        )}
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
        <KpiCard label="Monthly Spend" value={`$${result.totalMonthlySpendUsd.toFixed(2)}`} />
        <KpiCard label="Annual Spend" value={`$${result.totalAnnualSpendUsd.toFixed(2)}`} />
        <KpiCard label="Monthly Savings" value={`$${result.estimatedMonthlySavingsUsd.toFixed(2)}`} highlight="#10b981" />
        <KpiCard label="Efficiency Score" value={`${result.optimizationScore}%`} highlight="#8b5cf6" />
      </div>

      {/* Executive Summary */}
      <div style={{ 
        backgroundColor: "rgba(139, 92, 246, 0.05)", 
        border: "1px solid rgba(139, 92, 246, 0.2)", 
        borderRadius: "16px", 
        padding: "24px", 
        marginBottom: "40px" 
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "12px", color: "#c4b5fd" }}>Executive Summary</h2>
        <p style={{ fontSize: "15px", color: "#d4d4d8", lineHeight: "1.7", margin: 0 }}>
          {result.personalizedSummary || "This audit provides a comprehensive analysis of your current AI software stack and identifies immediate opportunities for cost reduction and workflow optimization."}
        </p>
      </div>

      {/* Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", marginBottom: "40px" }}>
        <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#a1a1aa", marginBottom: "20px", textTransform: "uppercase" }}>Spend Trajectory</h3>
          <AreaChart width={420} height={200} data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pdfCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="pdfOptimized" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
            <Area type="monotone" dataKey="current" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#pdfCurrent)" isAnimationActive={false} />
            <Area type="monotone" dataKey="optimized" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#pdfOptimized)" isAnimationActive={false} />
          </AreaChart>
          <div style={{ display: "flex", gap: "16px", marginTop: "16px", fontSize: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#8b5cf6" }}></div>
              <span style={{ color: "#a1a1aa" }}>Current</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#10b981" }}></div>
              <span style={{ color: "#a1a1aa" }}>Optimized</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#a1a1aa", marginBottom: "20px", textTransform: "uppercase" }}>Tool Split</h3>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PieChart width={200} height={200}>
              <Pie
                data={breakdownData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                stroke="#18181b"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {breakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Prioritized Optimization Roadmap</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {result.recommendations.map((rec, idx) => (
            <div key={rec.id} style={{ 
              backgroundColor: "#18181b", 
              border: "1px solid #27272a", 
              borderRadius: "16px", 
              padding: "20px",
              position: "relative"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", color: "#8b5cf6", fontWeight: "700" }}>#{idx + 1}</span>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>{rec.title}</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "#a1a1aa", margin: 0 }}>{rec.currentSituation}</p>
                </div>
                <div style={{ 
                  backgroundColor: rec.priority === "high" ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
                  color: rec.priority === "high" ? "#f87171" : "#fbbf24",
                  fontSize: "10px",
                  fontWeight: "700",
                  padding: "4px 10px",
                  borderRadius: "99px",
                  textTransform: "uppercase",
                  border: "1px solid currentColor"
                }}>
                  {rec.priority} Priority
                </div>
              </div>
              <div style={{ borderTop: "1px solid #27272a", paddingTop: "12px", marginTop: "12px" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#10b981", marginBottom: "4px" }}>
                  Action: {rec.suggestedAction}
                </div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#fafafa" }}>
                  Est. Savings: ${rec.estimatedMonthlySavingsUsd.toFixed(2)}/mo
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "60px", borderTop: "1px solid #27272a", paddingTop: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "12px", color: "#71717a", marginBottom: "8px" }}>
          &copy; {new Date().getFullYear()} Aethra AI Spend Auditor. All rights reserved.
        </div>
        <div style={{ fontSize: "14px", color: "#a1a1aa", fontWeight: "500" }}>aethra.ai</div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "16px", textAlign: "center" }}>
      <div style={{ fontSize: "11px", fontWeight: "600", color: "#71717a", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: "800", color: highlight || "#fafafa" }}>{value}</div>
    </div>
  );
}

const CHART_COLORS = [
  "#8b5cf6", // Primary Purple
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#f59e0b", // Amber
  "#ef4444", // Red
];

function createTrendData(monthly: number, savings: number) {
  const optimized = Math.max(0, monthly - savings);
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return monthLabels.map((month, index) => {
    const growth = 1 + index * 0.04;
    return {
      month,
      current: Number((monthly * growth).toFixed(0)),
      optimized: Number((optimized * growth).toFixed(0)),
    };
  });
}
