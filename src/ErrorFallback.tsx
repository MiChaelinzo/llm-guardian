import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Warning, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "./components/ui/button";
import type { FallbackProps } from "react-error-boundary";

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-4">
        <Alert variant="destructive">
          <Warning className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            <pre className="mt-2 text-sm whitespace-pre-wrap">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </pre>
          </AlertDescription>
        </Alert>
        
        <Button
          onClick={resetErrorBoundary} 
          className="gap-2"
        >
          <ArrowClockwise className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
