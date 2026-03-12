"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, Share2, CheckCircle, Calendar, MapPin, Users, Ticket } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface TicketDownloadProps {
  ticketNumber: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  eventLocation: string;
  eventImage?: string;
  ticketType: string;
  holderName: string;
  holderEmail: string;
  price: number;
  qrCode: string; // Base64 encoded QR code
  barcode: string; // Base64 encoded barcode
  status: "confirmed" | "pending" | "used";
}

export function TicketDownload({
  ticketNumber,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventImage,
  ticketType,
  holderName,
  holderEmail,
  price,
  qrCode,
  barcode,
  status,
}: TicketDownloadProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`ticket-${ticketNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (!ticketRef.current) return;

    setIsPrinting(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const printWindow = window.open("", "", "height=600,width=800");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Ticket</title>
              <style>
                body { margin: 0; padding: 0; }
                img { width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${imgData}" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error("Error printing:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket for ${eventTitle}`,
          text: `I have a ticket for ${eventTitle} on ${eventDate}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const statusColors = {
    confirmed: "bg-green-100 text-green-800 border-green-300",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    used: "bg-slate-100 text-slate-800 border-slate-300",
  };

  const statusLabels = {
    confirmed: "Confirmed",
    pending: "Pending",
    used: "Used",
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your ticket has been successfully purchased! Download or print your ticket below.
        </AlertDescription>
      </Alert>

      {/* Ticket Preview */}
      <div
        ref={ticketRef}
        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200"
      >
        {/* Ticket Header with Event Image */}
        {eventImage && (
          <div className="relative h-48 overflow-hidden bg-slate-100">
            <img
              src={eventImage}
              alt={eventTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
          </div>
        )}

        {/* Ticket Content */}
        <div className="p-8 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{eventTitle}</h2>
              <p className="text-sm text-slate-500 mt-1">{ticketType}</p>
            </div>
            <Badge className={`${statusColors[status]} border`}>
              {statusLabels[status]}
            </Badge>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-200">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Date & Time</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{eventDate}</p>
                {eventTime && (
                  <p className="text-sm text-slate-600">{eventTime}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Location</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{eventLocation}</p>
              </div>
            </div>
          </div>

          {/* Holder Information - Hidden as per request */}
          {/* 
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase">Ticket Holder</p>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-lg font-bold text-slate-900">{holderName}</p>
              <p className="text-sm text-slate-600">{holderEmail}</p>
            </div>
          </div>
          */}

          {/* Codes Section */}
          <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-200">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">QR Code</p>
              <div className="bg-white border-2 border-slate-200 p-3 rounded-lg">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-32 h-32"
                />
              </div>
            </div>

            {/* Barcode */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">Barcode</p>
              <div className="bg-white border-2 border-slate-200 p-3 rounded-lg">
                <img
                  src={barcode}
                  alt="Barcode"
                  className="h-16 w-full"
                />
              </div>
            </div>
          </div>

          {/* Ticket Number and Price */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Ticket Number</p>
              <p className="text-lg font-mono font-bold text-slate-900 mt-1">
                {ticketNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500 uppercase">Price Paid</p>
              <p className="text-lg font-bold text-primary mt-1">
                {price.toLocaleString()} RWF
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Please present this ticket at the event entrance. Keep this ticket safe.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="gap-2"
          variant="default"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Downloading..." : "Download PDF"}
        </Button>

        <Button
          onClick={handlePrint}
          disabled={isPrinting}
          className="gap-2"
          variant="outline"
        >
          <Printer className="h-4 w-4" />
          {isPrinting ? "Printing..." : "Print"}
        </Button>

        <Button
          onClick={handleShare}
          className="gap-2"
          variant="outline"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      {/* Additional Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-blue-900">
            <p className="font-semibold">Important Information:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Arrive at least 30 minutes before the event starts</li>
              <li>Present this ticket at the entrance</li>
              <li>Keep your ticket safe - it cannot be replaced if lost</li>
              <li>Tickets are non-transferable unless stated otherwise</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
