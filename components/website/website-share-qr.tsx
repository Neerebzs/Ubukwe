"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { QrCode, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WebsiteShareQr({ url, coupleName }: { url: string; coupleName?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !url) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 180,
      margin: 2,
      color: { dark: "#0d182a", light: "#ffffff" },
    }).then(() => setReady(true)).catch(() => setReady(false));
  }, [url]);

  const downloadQr = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `wedding-qr-${coupleName?.replace(/\s+/g, "-").toLowerCase() || "site"}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Share & QR Code
        </CardTitle>
        <CardDescription>Print or share a QR code linking to your wedding site</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-center gap-6">
        <canvas ref={canvasRef} className="rounded-lg border shadow-sm" />
        <div className="space-y-3 text-center sm:text-left">
          <p className="text-sm text-slate-600 break-all max-w-xs">{url}</p>
          <Button variant="outline" onClick={downloadQr} disabled={!ready}>
            <Download className="h-4 w-4 mr-2" /> Download QR
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
