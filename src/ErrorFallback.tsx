import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
export function ErrorFallback({ error, resetErro

        <Alert variant="destructive">
          
            <pre className="mt-2 text-sm whitespace-pre-wrap">
            </pre>
        </Alert>
        <Button
          className="gap-2"
          <ArrowClockwise cl
        </Button>
    </div>
}

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
