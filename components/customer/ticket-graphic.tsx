"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { format } from "date-fns";

export interface TicketGraphicProps {
  ticketNumber: string;
  ticketType: string;
  holderName: string;
  eventTitle: string;
  eventLocation: string;
  eventDate: string;
  eventImage?: string;
  price?: number;
}

export function TicketGraphic({
  ticketNumber,
  ticketType,
  holderName,
  eventTitle,
  eventLocation,
  eventDate,
  eventImage = "https://images.unsplash.com/photo-1540039155732-613894451b75?q=80&w=1000&auto=format&fit=crop",
  price,
}: TicketGraphicProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const canvasQRef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<SVGSVGElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Parse date safely
  let formattedDate = eventDate;
  try {
    const d = new Date(eventDate);
    if (!isNaN(d.getTime())) {
      formattedDate = format(d, "dd MMMM yyyy, HH:mm a");
    }
  } catch (e) {
    // Keep original
  }

  // Generate QR and Barcode on mount
  React.useEffect(() => {
    if (canvasQRef.current) {
      QRCode.toCanvas(canvasQRef.current, ticketNumber, {
        width: 120,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      });
    }
    if (canvasBRef.current) {
      JsBarcode(canvasBRef.current, ticketNumber, {
        format: "CODE128",
        width: 1.2,
        height: 35,
        displayValue: true,
        fontSize: 10,
        margin: 0,
      });
    }
  }, [ticketNumber]);

  const handleDownload = async () => {
    if (!ticketRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const element = ticketRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High quality
        useCORS: true, // Allow external images
        allowTaint: true,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [ticketRef.current.clientWidth * 0.264583, ticketRef.current.clientHeight * 0.264583] // Convert px to mm strictly
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ubukwe-ticket-${ticketNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto my-8">
      {/* Download Button */}
      <div className="w-full flex justify-end">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full font-medium transition-all"
        >
          {isDownloading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          {isDownloading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>

      {/* Actual Ticket graphic to be captured */}
      <div
        ref={ticketRef}
        className="relative flex flex-col sm:flex-row w-[800px] h-[300px] bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Left Main Section */}
        <div className="relative w-[550px] h-full flex flex-col justify-between p-8 z-10 isolate">
          {/* Background Image overlay */}
          <div className="absolute inset-0 -z-10">
            {/* The image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${eventImage})` }}
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40" />
            <div className="absolute inset-0 bg-slate-900/40" />
          </div>

          <div className="flex justify-between items-start">
            <div>
              <div className="text-emerald-400 font-bold tracking-widest text-sm mb-2 uppercase">
                Event Ticket
              </div>
              <h1 className="text-4xl font-extrabold uppercase line-clamp-2 leading-tight">
                {eventTitle}
              </h1>
              <p className="text-slate-300 font-medium tracking-wider text-sm mt-1">
                UBUKWE HUB EXCLUSIVE
              </p>
            </div>
            {price && (
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2 rounded-xl shadow-lg border border-white/10">
                <span className="text-xl font-bold">{price} RWF</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Location
                </p>
                <p className="font-medium text-lg leading-snug max-w-[200px] truncate">
                  {eventLocation}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Date
                </p>
                <p className="font-medium">{formattedDate}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 text-right">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Holder
                </p>
                <p className="font-medium max-w-[150px] truncate">{holderName}</p>
              </div>
              <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-5 py-2 rounded-full font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                {ticketType}
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="relative w-0 h-full flex flex-col justify-between items-center bg-slate-900 z-20">
          <div className="absolute -top-4 w-8 h-8 rounded-full bg-[#f3f4f6]" />
          <div className="w-[2px] h-full border-l-2 border-dashed border-slate-700 mx-auto" />
          <div className="absolute -bottom-4 w-8 h-8 rounded-full bg-[#f3f4f6]" />
        </div>

        {/* Right Stub Section */}
        <div className="w-[250px] h-full bg-[#1e2335] p-6 flex flex-col justify-center items-center relative custom-stub">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-[#1e2335] pointer-events-none" />
          
          <div className="z-10 w-full flex flex-col items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <canvas ref={canvasQRef} />
            </div>
            
            <p className="text-xs text-slate-400 font-mono tracking-widest text-center uppercase">
              {ticketNumber}
            </p>

            <div className="w-full max-w-[200px] bg-white px-2 py-1 flex flex-col items-center justify-center rounded">
              <svg ref={canvasBRef} className="max-w-full h-auto" preserveAspectRatio="xMidYMid meet"></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
