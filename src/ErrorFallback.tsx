import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Warning, ArrowClockwise } from "@phosph
import { Warning, ArrowClockwise } from "@phosphor-icons/react";

export function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-4">
        <div className="bg-card borde
            {error.message}
          </pre>

          onClick={resetErrorBoundary} 
          className="gap-2"
          <Arrow
        
    </div>
}














    </div>
  );
}
