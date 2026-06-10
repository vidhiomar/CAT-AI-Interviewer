"use client";

import { Loader2 } from "lucide-react";

export default function CompletedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin mb-6" />

      <h1 className="text-3xl font-bold mb-2">
        Congratulations! Interview Completed!
      </h1>

      <p className="text-muted-foreground">
        Generating your AI assessment...
      </p>
    </div>
  );
}