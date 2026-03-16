import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { ArrowClockwise } from "@phosphor-icons/react";

export function ErrorFallback({ error, resetErrorBoundary }: { error: unknown; resetErrorBoundary: () => void }) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            <pre className="mt-2 text-sm whitespace-pre-wrap">
              {errorMessage}
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
