"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { useVerifyInspector, useCheckInByInspector } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader, CheckCircle, XCircle, Camera, Keyboard, ArrowLeft, LogOut, Ticket } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckInPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"login" | "scanning" | "feedback">("login");
  const [idNumber, setIdNumber] = useState("");
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [inspectorInfo, setInspectorInfo] = useState<any>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; ticket?: any } | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualTicketNumber, setManualTicketNumber] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const verifyMutation = useVerifyInspector();
  const checkInMutation = useCheckInByInspector();

  // Prevent SSR issues
  useEffect(() => {
    setMounted(true);
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error("Scanner stop error:", err));
      }
    };
  }, []);

  // Handle Inspector Login
  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (isDemoMode) {
      setEventInfo({ title: "Demo Event" });
      setInspectorInfo({ name: "Demo Staff" });
      setStep("scanning");
      toast.info("Demo Mode: Access Bypassed");
      return;
    }

    if (!idNumber.trim()) return;

    try {
      const result = await verifyMutation.mutateAsync(idNumber);
      setEventInfo(result.event);
      setInspectorInfo(result.inspector);
      setStep("scanning");
    } catch (error) {
      toast.error("Invalid ID Number");
    }
  };

  // Scanner Hook
  useEffect(() => {
    if (!mounted || step !== "scanning" || isManualEntry) return;

    // Small delay to ensure the DOM is ready for 'reader'
    const timer = setTimeout(() => {
      const startScanner = async () => {
        try {
          const html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;
          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: 250 },
            (text) => handleCheckIn(text),
            () => {} // silent scan
          );
        } catch (err) {
          console.error("Scanner failed:", err);
          setIsManualEntry(true);
        }
      };
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [step, isManualEntry, mounted]);

  if (!mounted) return null;

  // Handle Check-in logic
  const handleCheckIn = async (ticketNumber: string) => {
    if (isDemoMode) {
      setScanResult({ 
        success: true, 
        message: "Demo: Ticket Verified!", 
        ticket: { holder_name: "John Doe", ticket_number: ticketNumber } 
      });
      setStep("feedback");
      return;
    }

    if (scannerRef.current) {
      scannerRef.current.pause();
    }

    try {
      const result = await checkInMutation.mutateAsync({
        ticket_number: ticketNumber,
        identification_number: idNumber
      });
      setScanResult({ success: true, message: "Ticket Checked In Successfully!", ticket: result.ticket });
      setStep("feedback");
    } catch (error: any) {
      setScanResult({ success: false, message: error.message || "Failed to check in ticket" });
      setStep("feedback");
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setManualTicketNumber("");
    setStep("scanning");
    if (scannerRef.current && scannerRef.current.isPaused) {
      scannerRef.current.resume();
    }
  };

  const handleLogout = () => {
    setStep("login");
    setIdNumber("");
    setEventInfo(null);
    setInspectorInfo(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center p-4 md:p-8 overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {step === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md mt-16 sm:mt-24"
          >
            <div className="text-center mb-12">
              <div className="inline-block p-4 bg-gradient-to-tr from-[#668c65] to-[#8fb38e] rounded-[2rem] mb-6 shadow-lg shadow-[#668c65]/20">
                <Ticket className="w-10 h-10 text-white" />
              </div>
              <h1 className="font-serif text-4xl italic mb-3">Ubukwe Hub</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Security & Access</p>
            </div>

            <Card className="rounded-[3rem] border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl p-8 sm:p-12 space-y-8">
              <form onSubmit={handleLogin} className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Inspector ID</label>
                    <button 
                      type="button"
                      onClick={() => setIsDemoMode(!isDemoMode)}
                      className={cn(
                        "text-[8px] font-black uppercase px-2 py-1 rounded-full transition-all",
                        isDemoMode ? "bg-[#668c65] text-white" : "bg-white/5 text-slate-500"
                      )}
                    >
                      Demo Mode {isDemoMode ? "ON" : "OFF"}
                    </button>
                  </div>
                  <Input
                    placeholder="000000"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="h-20 rounded-[2rem] border-white/10 bg-black/40 text-center text-3xl font-bold tracking-[0.4em] text-white placeholder:text-white/10"
                  />
                </div>
                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="h-16 w-full rounded-[2rem] bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-xl"
                  >
                    Verify Access
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => window.location.href = "/"}
                    className="h-12 w-full rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home Page
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {step === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col items-center max-w-lg space-y-6"
          >
            {/* Minimal Mobile Header */}
            <div className="w-full flex items-center justify-between p-4 px-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/5 mt-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#668c65] rounded-xl flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif italic text-white text-base">{eventInfo?.title}</h3>
                  <p className="text-[9px] font-black text-[#668c65] uppercase tracking-widest">{inspectorInfo?.name}</p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="ghost" size="icon" className="rounded-2xl text-white/20 hover:text-white">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>

            {/* Viewfinder Container */}
            <div className="relative w-full aspect-square max-h-[60vh] rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl">
              {!isManualEntry ? (
                <>
                  <div id="reader" className="w-full h-full object-cover scale-110" />
                  {/* Viewfinder Overlay Layers */}
                  <div className="absolute inset-0 border-[60px] border-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-dashed border-white/40 rounded-3xl backdrop-blur-[2px]" />
                  </div>
                  {/* Moving Line Animation */}
                  <motion.div 
                    animate={{ top: ["25%", "75%", "25%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-1/2 -translate-x-1/2 w-64 h-0.5 bg-[#668c65] shadow-[0_0_15px_#668c65] z-10"
                  />
                </>
              ) : (
                <div className="w-full h-full bg-black/80 flex flex-col items-center justify-center p-8 space-y-8">
                   <div className="text-center space-y-2">
                    <Keyboard className="w-8 h-8 text-[#668c65] mx-auto mb-2" />
                    <h4 className="font-serif text-2xl italic">Manual Input</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ticket Number Required</p>
                  </div>
                  <Input
                    placeholder="TKT-000000"
                    value={manualTicketNumber}
                    onChange={(e) => setManualTicketNumber(e.target.value.toUpperCase())}
                    className="h-16 rounded-2xl border-white/10 bg-white/5 text-center text-xl font-bold tracking-widest text-white"
                  />
                  <Button
                    onClick={() => handleCheckIn(manualTicketNumber)}
                    className="h-14 w-full rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em]"
                  >
                    Confirm Check-In
                  </Button>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="flex gap-4 w-full">
              <Button
                onClick={() => setIsManualEntry(!isManualEntry)}
                className="flex-1 h-16 rounded-[2rem] bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
              >
                {isManualEntry ? <><Camera className="w-4 h-4 mr-2" /> Use Scanner</> : <><Keyboard className="w-4 h-4 mr-2" /> Manual</>}
              </Button>
            </div>
          </motion.div>
        )}

        {step === "feedback" && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm mt-12 bg-[#121214] rounded-[4rem] p-10 border border-white/5 shadow-2xl text-center"
          >
            <div className="mb-8">
              {scanResult?.success ? (
                <motion.div 
                  initial={{ scale: 0.5 }} 
                  animate={{ scale: 1 }}
                  className="w-32 h-32 bg-[#668c65] rounded-full mx-auto flex items-center justify-center overflow-hidden"
                >
                  <CheckCircle className="w-16 h-16 text-white" />
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ rotate: -10 }} 
                  animate={{ rotate: 10 }}
                  transition={{ repeat: 5, repeatType: "reverse", duration: 0.1 }}
                  className="w-32 h-32 bg-rose-500 rounded-full mx-auto flex items-center justify-center"
                >
                  <XCircle className="w-16 h-16 text-white" />
                </motion.div>
              )}
            </div>

            <h2 className="font-serif text-3xl italic mb-4">
              {scanResult?.success ? "Verified" : "Invalid Ticket"}
            </h2>
            <p className="text-slate-400 text-sm mb-10 px-4 leading-relaxed">
              {scanResult?.message}
            </p>

            {scanResult?.ticket && (
              <div className="bg-black/40 rounded-3xl p-6 mb-10 text-left border border-white/5">
                <p className="text-[7px] font-black text-[#668c65] uppercase tracking-widest mb-1">Holder Name</p>
                <p className="font-serif italic text-xl mb-4">{scanResult.ticket.holder_name}</p>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                  <span className="text-[8px] font-black text-slate-500 uppercase">Ticket ID</span>
                  <span className="font-mono text-xs">{scanResult.ticket.ticket_number}</span>
                </div>
              </div>
            )}

            <Button
              onClick={resetScanner}
              className={cn(
                "h-20 w-full rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all",
                scanResult?.success ? "bg-[#668c65] hover:bg-[#5a7b59]" : "bg-rose-500 hover:bg-rose-600"
              )}
            >
              Scan Next
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 text-center sm:fixed sm:bottom-8 sm:w-full">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
          Ubukwe Hub <span className="mx-2 text-slate-200">|</span> Standard Security v2.0
        </p>
      </div>
    </div>
  );
}
