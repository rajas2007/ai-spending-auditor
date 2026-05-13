import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import React from "react";
import { createRoot } from "react-dom/client";
import { PdfReportLayout } from "@/components/report/pdf-report-layout";
import type { StoredAudit } from "@/types/stored-audit";

/**
 * Exports an audit report to a professional, branded PDF.
 * Uses an isolated iframe to prevent html2canvas from crashing on modern CSS colors in the main document.
 */
export async function exportAuditToPDF(audit: StoredAudit, companyName?: string) {
  // Create a hidden iframe for isolated rendering
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = "800px";
  iframe.style.height = "1200px"; // Initial height, will be captured
  iframe.style.border = "none";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    throw new Error("Unable to create export sandbox.");
  }

  // Set up the iframe document with basic safe styles
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
          body { margin: 0; padding: 0; font-family: sans-serif; background: #09090b; color: #fafafa; overflow: hidden; }
          svg { display: block; }
        </style>
      </head>
      <body>
        <div id="render-root"></div>
      </body>
    </html>
  `);
  iframeDoc.close();

  const renderRoot = iframeDoc.getElementById("render-root");
  if (!renderRoot) throw new Error("Sandbox root not found.");

  const root = createRoot(renderRoot);
  
  try {
    // Render the dedicated PDF layout in the sandbox
    root.render(
      <React.StrictMode>
        <PdfReportLayout audit={audit} companyName={companyName} />
      </React.StrictMode>
    );

    // Wait for React to mount and Recharts to render the SVG content
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Capture the iframe's body
    // Since the iframe has NO global stylesheets, html2canvas will only see the safe styles we injected.
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      backgroundColor: "#09090b",
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdfWidth = canvas.width / 2;
    const pdfHeight = canvas.height / 2;
    
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    pdf.save(`Aethra-Audit-${audit.id.substring(0, 8)}.pdf`);
    
  } catch (error) {
    console.error("Isolated PDF Export failed:", error);
    throw error;
  } finally {
    // Cleanup
    root.unmount();
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
}
