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
      
      const widthMm = element.clientWidth * 0.264583;
      const heightMm = element.clientHeight * 0.264583;
      const orientation = widthMm >= heightMm ? "landscape" : "portrait";

      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: [widthMm, heightMm] 
      });

      pdf.addImage(imgData, "PNG", 0, 0, widthMm, heightMm);
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
        className="relative flex flex-col md:flex-row w-full max-w-[800px] md:h-[300px] bg-slate-900 text-white rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl transition-all"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Left Main Section */}
        <div className="relative w-full md:w-[550px] md:h-full flex flex-col justify-between p-6 sm:p-8 z-10 isolate min-h-[250px]">
          {/* Background Image overlay */}
          <div className="absolute inset-0 -z-10 bg-slate-900">
            {/* The image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
              style={{ backgroundImage: `url(${eventImage})` }}
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/60" />
            <div className="absolute inset-0 bg-slate-900/30" />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 md:mb-0">
            <div>
              <div className="text-emerald-400 font-bold tracking-widest text-xs md:text-sm mb-2 uppercase">
                Event Ticket
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase line-clamp-2 leading-tight">
                {eventTitle}
              </h1>
              <p className="text-slate-300 font-medium tracking-wider text-xs md:text-sm mt-1">
                UBUKWE HUB EXCLUSIVE
              </p>
            </div>
            {price && (
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2 rounded-xl shadow-lg border border-white/10 shrink-0">
                <span className="text-xl font-bold">{price} RWF</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-4 mt-auto">
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1">
                  Location
                </p>
                <p className="font-medium text-base sm:text-lg leading-snug sm:max-w-[200px] truncate">
                  {eventLocation}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1">
                  Date
                </p>
                <p className="font-medium text-sm sm:text-base">{formattedDate}</p>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 sm:text-right border-t border-slate-700 border-dashed sm:border-none pt-4 sm:pt-0">
              <div className="order-2 sm:order-1 sm:ml-auto">
                <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1 sm:mb-0">
                  Holder
                </p>
                <p className="font-medium max-w-[150px] truncate text-sm sm:text-base">{holderName}</p>
              </div>
              <div className="order-1 sm:order-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)] whitespace-nowrap">
                {ticketType}
              </div>
            </div>
          </div>
        </div>

        {/* Separator - Horizontal on Mobile, Vertical on MD */}
        <div className="relative flex-none w-full md:w-0 h-6 md:h-full flex flex-row md:flex-col justify-between items-center bg-slate-900 z-20">
          <div className="absolute -left-3 md:left-auto md:-top-4 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white hidden sm:block shadow-inner" />
          <div className="w-full md:w-0 h-0 md:h-full border-t-[2px] md:border-t-0 md:border-l-[3px] border-dashed border-slate-700/60" />
          <div className="absolute -right-3 md:right-auto md:-bottom-4 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white hidden sm:block shadow-inner" />
        </div>

        {/* Right Stub Section */}
        <div className="w-full md:w-[250px] md:h-full bg-[#1e2335] p-6 sm:p-8 flex flex-col sm:flex-row md:flex-col justify-center items-center gap-6 relative custom-stub">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-[#1e2335] pointer-events-none mix-blend-soft-light" />
          
          <div className="z-10 w-full flex flex-col sm:flex-row md:flex-col items-center justify-between sm:justify-center gap-6">
            <div className="bg-white p-2 rounded-xl shadow-lg shrink-0 transition-transform hover:scale-105">
              <canvas ref={canvasQRef} />
            </div>
            
            <div className="flex flex-col items-center gap-3 w-full">
              <p className="text-xs md:text-[10px] text-slate-400 font-mono tracking-widest text-center uppercase break-all px-2">
                {ticketNumber}
              </p>

              <div className="w-full max-w-[200px] bg-white px-2 py-1.5 flex flex-col items-center justify-center rounded-md shadow-sm">
                <svg ref={canvasBRef} className="max-w-full h-auto" preserveAspectRatio="xMidYMid meet"></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
