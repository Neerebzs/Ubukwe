"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: HTMLElement,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
    onHcaptchaLoad?: () => void;
  }
}

interface CaptchaStatus {
  enabled: boolean;
  site_key: string;
}

interface HCaptchaFieldProps {
  onToken: (token: string | null) => void;
}

function unwrapData<T>(response: { data?: T } | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

export function HCaptchaField({ onToken }: HCaptchaFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const { data: status } = useQuery({
    queryKey: ["captcha-status"],
    queryFn: async () => unwrapData(await apiClient.public.getCaptchaStatus<CaptchaStatus>()),
    staleTime: 5 * 60 * 1000,
  });

  const renderWidget = useCallback(() => {
    if (!status?.enabled || !status.site_key || !containerRef.current || !window.hcaptcha) return;
    if (widgetIdRef.current !== null) return;
    widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
      sitekey: status.site_key,
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
    });
  }, [status, onToken]);

  useEffect(() => {
    if (!status?.enabled) {
      onToken(null);
      return;
    }
    if (window.hcaptcha) {
      renderWidget();
      return;
    }
    window.onHcaptchaLoad = renderWidget;
    if (!document.getElementById("hcaptcha-script")) {
      const script = document.createElement("script");
      script.id = "hcaptcha-script";
      script.src = "https://js.hcaptcha.com/1/api.js?onload=onHcaptchaLoad&render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [status, renderWidget, onToken]);

  if (!status?.enabled) return null;
  return <div ref={containerRef} className="flex justify-center" />;
}

export function useCaptchaEnabled() {
  const { data: status } = useQuery({
    queryKey: ["captcha-status"],
    queryFn: async () => unwrapData(await apiClient.public.getCaptchaStatus<CaptchaStatus>()),
    staleTime: 5 * 60 * 1000,
  });
  return status?.enabled ?? false;
}
