import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Sparkles, Copy, Download, Loader2 } from "lucide-react";
import { SharedLayout } from "./SharedLayout";
import { simplifyContent } from "../lib/groq";
import { toast } from "sonner";

interface SimplifyTranslateProps {
  onNavigate: (page: any, role?: any) => void;
}

export function SimplifyTranslate({ onNavigate }: SimplifyTranslateProps) {
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [inputText, setInputText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('yoruba');
  const [selectedLevel, setSelectedLevel] = useState('simple');
  const [activeTab, setActiveTab] = useState('simplify');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setProcessed(false);
    setSimplifiedText('');
    setTranslatedText('');
  };

  const handleProcess = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to process");
      return;
    }

    setProcessing(true);
    try {
      if (activeTab === 'simplify') {
        const result = await simplifyContent(inputText, selectedLevel as 'simple' | 'very-simple' | 'advanced');
        setSimplifiedText(result);
      } else {
        const result = await simplifyContent(inputText, 'translate', selectedLanguage);
        setTranslatedText(result);
      }
      setProcessed(true);
      toast.success("Content processed successfully!");
    } catch (error) {
      console.error('Processing error:', error);
      toast.error("Failed to process content. Please check your API key configuration.");
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadAsText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  return (
    <SharedLayout 
      onNavigate={onNavigate}
      userRole="teacher"
      title="Simplify & Translate"
      subtitle="Simplify and translate content"
      hideHeaderIcons={true}
      activeMenu="simplify"
    >

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 rounded-2xl">
            <TabsTrigger value="simplify" className="rounded-xl">Simplify</TabsTrigger>
            <TabsTrigger value="translate" className="rounded-xl">Translate</TabsTrigger>
          </TabsList>

          <TabsContent value="simplify" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Input Text</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inputSimplify">Paste or type your content</Label>
                    <Textarea
                      id="inputSimplify"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="rounded-xl min-h-[200px] text-sm"
                      placeholder="Enter your text here..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetLevel">Target Reading Level</Label>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger id="targetLevel" className="rounded-xl">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple (Ages 13-15)</SelectItem>
                        <SelectItem value="very-simple">Very Simple (Ages 10-12)</SelectItem>
                        <SelectItem value="advanced">Advanced (Ages 16+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full rounded-2xl"
                    size="lg"
                    onClick={handleProcess}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Simplifying...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Simplify Text
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output */}
              <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Simplified Text</CardTitle>
                  {processed && (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-lg"
                        onClick={() => copyToClipboard(simplifiedText)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-lg"
                        onClick={() => downloadAsText(simplifiedText, 'simplified-text.txt')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {!processed && !processing && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Simplified text will appear here</p>
                    </div>
                  )}

                  {processing && (
                    <div className="text-center py-12">
                      <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                      <p className="text-muted-foreground">Processing your text...</p>
                    </div>
                  )}

                  {processed && (
                    <div className="bg-muted/50 p-4 rounded-xl">
                      <p className="whitespace-pre-wrap text-sm">{simplifiedText}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="translate" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Input Text</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inputTranslate">Text to translate</Label>
                    <Textarea
                      id="inputTranslate"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="rounded-xl min-h-[200px] text-sm"
                      placeholder="Enter your text here..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetLang">Target Language</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger id="targetLang" className="rounded-xl">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yoruba">🇳🇬 Yoruba</SelectItem>
                        <SelectItem value="hausa">🇳🇬 Hausa</SelectItem>
                        <SelectItem value="igbo">🇳🇬 Igbo</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full rounded-2xl"
                    size="lg"
                    onClick={handleProcess}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Translate Text
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output */}
              <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Translation</CardTitle>
                  {processed && (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-lg"
                        onClick={() => copyToClipboard(translatedText)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-lg"
                        onClick={() => downloadAsText(translatedText, `translation-${selectedLanguage}.txt`)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {!processed && !processing && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Translation will appear here</p>
                    </div>
                  )}

                  {processing && (
                    <div className="text-center py-12">
                      <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                      <p className="text-muted-foreground">Translating your text...</p>
                    </div>
                  )}

                  {processed && (
                    <div className="bg-muted/50 p-4 rounded-xl">
                      <p className="whitespace-pre-wrap text-sm">{translatedText}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </SharedLayout>
  );
}
