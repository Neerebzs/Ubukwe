"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">{error?.message || "An unexpected error occurred."}</p>
        <button onClick={reset} className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90">
          Try again
        </button>
      </div>
    </div>
  );
}


