import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { Warning, ArrowClockwise } from "@phosphor-icons/react";

export function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-4">
        <Alert variant="destructive">
          <Warning size={20} />
          <AlertTitle>This spark has encountered a runtime error</AlertTitle>
          <AlertDescription>
            An unexpected error occurred. Please try refreshing the page or resetting the application state.
          </AlertDescription>
        </Alert>
        
        <div className="bg-card border rounded-lg p-4 mb-6">
          <pre className="text-xs text-muted-foreground overflow-auto max-h-96 whitespace-pre-wrap break-words">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </div>

        <Button 
          onClick={resetErrorBoundary} 
          variant="outline"
          className="gap-2"
        >
          <ArrowClockwise size={16} />
          Try Again
        </Button>
      </div>
    </div>
  );
}
