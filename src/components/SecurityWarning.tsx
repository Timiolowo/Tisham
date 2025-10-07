import { Alert, AlertDescription } from "./ui/alert";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { isAuthenticationAllowed } from "../config/auth";

export function SecurityWarning() {
  // Only show warning on blocked ports
  if (typeof window !== 'undefined' && isAuthenticationAllowed()) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto">
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <strong>🚨 Security Notice:</strong> You're on the frontend-only port (5173). 
              Authentication and AI features are disabled for security. 
              Use <code className="bg-orange-100 px-1 rounded">netlify dev</code> for full functionality.
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('http://localhost:8888', '_blank')}
              className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Open Full Stack
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

