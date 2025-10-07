import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, ExternalLink, Key, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { runtimeEnv } from '../lib/runtime-env';

// Check if Groq API key is configured
const isApiKeyConfigured = () => {
  const env = runtimeEnv.getEnv();
  const apiKey = env.VITE_GROQ_API_KEY;
  return !!(apiKey && apiKey !== '' && apiKey !== 'your_groq_api_key_here' && !apiKey.includes('placeholder'));
};

export function ApiKeySetup() {
  return (
    <Card className="rounded-3xl glass-card border-2 border-primary/20 max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-6 h-6 text-primary" />
          Groq API Key Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            To use AI-powered features, you need to configure your Groq API key. It's free and takes less than 2 minutes!
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Quick Setup:</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-xs">
                1
              </span>
              <div>
                <p className="font-medium">Get your free API key</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => window.open('https://console.groq.com/keys', '_blank')}
                >
                  https://console.groq.com/keys
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-xs">
                2
              </span>
              <div>
                <p className="font-medium">Create a <code className="bg-muted px-1 rounded">.env</code> file in your project root</p>
                <p className="text-muted-foreground text-xs">Same folder as App.tsx</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-xs">
                3
              </span>
              <div>
                <p className="font-medium">Add this line to .env:</p>
                <code className="block bg-muted p-2 rounded-lg mt-1 text-xs break-all">
                  VITE_GROQ_API_KEY=gsk_your_actual_key_here
                </code>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-xs">
                4
              </span>
              <div>
                <p className="font-medium">Restart your dev server</p>
                <code className="block bg-muted p-2 rounded-lg mt-1 text-xs">
                  npm run dev
                </code>
              </div>
            </div>
          </div>
        </div>

        <Alert className="rounded-2xl bg-accent/10 border-accent/20">
          <AlertDescription className="text-xs">
            <strong>Note:</strong> The free tier includes 30 requests/minute and 14,400 requests/day - perfect for classroom use!
          </AlertDescription>
        </Alert>

        <div className="pt-2">
          <Button
            onClick={() => window.open('https://console.groq.com', '_blank')}
            className="w-full rounded-2xl gradient-primary"
          >
            Get Your Free API Key
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
