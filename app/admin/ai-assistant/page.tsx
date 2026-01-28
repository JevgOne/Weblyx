"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Brain,
  Send,
  Loader2,
  Sparkles,
  BarChart3,
  FileText,
  Rocket,
  Lightbulb,
  RefreshCw,
  Copy,
  Check,
  User,
  Bot,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actions?: Array<{
    type: string;
    label: string;
    data: any;
  }>;
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  prompt: string;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    icon: <BarChart3 className="h-5 w-5" />,
    label: "Weekly Report",
    prompt: "Vytvoř týdenní report výkonu kampaní za posledních 7 dní",
    description: "Shrnutí výkonu všech kampaní",
  },
  {
    icon: <Target className="h-5 w-5" />,
    label: "Analyze Performance",
    prompt: "Analyzuj výkon kampaní a navrhni optimalizace",
    description: "AI analýza s doporučeními",
  },
  {
    icon: <Rocket className="h-5 w-5" />,
    label: "New Campaign",
    prompt: "Navrhni novou kampaň pro získání více leadů",
    description: "AI vytvoří strukturu kampaně",
  },
  {
    icon: <Lightbulb className="h-5 w-5" />,
    label: "Creative Ideas",
    prompt: "Navrhni nové kreativní koncepty pro reklamy",
    description: "Nápady na ad copy a vizuály",
  },
];

export default function AIAssistantPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Connection status
  const [connections, setConnections] = useState({
    google_ads: false,
    meta_ads: false,
    ga4: false,
    gsc: false,
  });

  useEffect(() => {
    const loadData = async () => {
      // Check connections
      const [googleAds, metaAds, ga4, gsc] = await Promise.all([
        fetch("/api/google-ads/test").then(r => r.json()).catch(() => ({ success: false })),
        fetch("/api/meta-ads/test").then(r => r.json()).catch(() => ({ success: false })),
        fetch("/api/analytics/overview?startDate=7daysAgo&endDate=today")
          .then(r => r.json()).catch(() => ({ success: false })),
        fetch("/api/search-console/overview?days=7")
          .then(r => r.json()).catch(() => ({ success: false })),
      ]);

      setConnections({
        google_ads: googleAds.success,
        meta_ads: metaAds.success,
        ga4: ga4.success,
        gsc: gsc.success,
      });

      // Initial greeting
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Ahoj! Jsem tvůj AI marketing tým. 🤖

**Dostupné datové zdroje:**
${googleAds.success ? "✅" : "❌"} Google Ads
${metaAds.success ? "✅" : "❌"} Meta Ads
${ga4.success ? "✅" : "❌"} Google Analytics 4
${gsc.success ? "✅" : "❌"} Search Console

S čím ti můžu pomoct?
• Analyzovat výkon kampaní
• Vytvořit reporty
• Navrhnout nové kampaně
• Napsat ad copy
• Optimalizovat rozpočty`,
          timestamp: new Date(),
        },
      ]);

      setLoading(false);
    };

    if (user) loadData();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (message?: string) => {
    const text = message || input;
    if (!text.trim() || sending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      // Use dedicated AI chat endpoint
      const config = JSON.parse(localStorage.getItem("weblyx-project-config") || "{}");
      const res = await fetch("/api/ai-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: {
            connections,
            config,
          },
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.success
          ? data.response
          : `Došlo k chybě: ${data.error}. Zkus to prosím znovu.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Omlouvám se, něco se pokazilo. Zkus to prosím znovu.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const formatAnalysisResponse = (data: any): string => {
    if (!data) return "Nemám dostatek dat pro odpověď.";

    let response = "";

    if (data.executive_summary) {
      response += `## Shrnutí\n${data.executive_summary}\n\n`;
    }

    if (data.alerts && data.alerts.length > 0) {
      response += `## Upozornění\n`;
      data.alerts.forEach((alert: any) => {
        const icon = alert.level === "critical" ? "🔴" : alert.level === "warning" ? "🟡" : "🔵";
        response += `${icon} **${alert.message}**\n   → ${alert.action}\n\n`;
      });
    }

    if (data.optimization_actions && data.optimization_actions.length > 0) {
      response += `## Doporučené akce\n`;
      data.optimization_actions.slice(0, 3).forEach((action: any, i: number) => {
        response += `${i + 1}. **${action.action}**\n   ${action.reason}\n   _Očekávaný dopad: ${action.expected_impact}_\n\n`;
      });
    }

    if (data.next_steps && data.next_steps.length > 0) {
      response += `## Další kroky\n`;
      data.next_steps.forEach((step: any) => {
        response += `• **${step.timeframe}:** ${step.action}\n`;
      });
    }

    return response || "Analýza dokončena. Zkontroluj Marketing dashboard pro detaily.";
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin/marketing")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  AI Marketing Assistant
                </h1>
                <p className="text-sm text-muted-foreground">
                  Tvůj AI marketing tým
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {Object.entries(connections).map(([key, connected]) => (
                <Badge
                  key={key}
                  variant={connected ? "default" : "secondary"}
                  className={connected ? "bg-green-500" : ""}
                >
                  {key.replace("_", " ").toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid gap-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <Card
                key={i}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSend(action.prompt)}
              >
                <CardContent className="pt-4 text-center">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-2">
                    {action.icon}
                  </div>
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chat Area */}
          <Card className="h-[500px] flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="p-2 bg-purple-100 rounded-full h-fit">
                        <Bot className="h-4 w-4 text-purple-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {message.content.split("\n").map((line, i) => {
                          if (line.startsWith("## ")) {
                            return (
                              <h3 key={i} className="font-bold text-base mt-4 mb-2">
                                {line.replace("## ", "")}
                              </h3>
                            );
                          }
                          if (line.startsWith("**") && line.endsWith("**")) {
                            return (
                              <p key={i} className="font-semibold">
                                {line.replace(/\*\*/g, "")}
                              </p>
                            );
                          }
                          if (line.startsWith("• ") || line.startsWith("- ")) {
                            return (
                              <p key={i} className="ml-4">
                                {line}
                              </p>
                            );
                          }
                          if (line.trim()) {
                            return <p key={i}>{line}</p>;
                          }
                          return <br key={i} />;
                        })}
                      </div>
                      {message.role === "assistant" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-6 text-xs"
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {copiedId === message.id ? (
                            <Check className="h-3 w-3 mr-1" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          Kopírovat
                        </Button>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="p-2 bg-primary/20 rounded-full h-fit">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                {sending && (
                  <div className="flex gap-3">
                    <div className="p-2 bg-purple-100 rounded-full h-fit">
                      <Bot className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">AI přemýšlí...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Napiš zprávu... (např. 'Analyzuj výkon kampaní')"
                  disabled={sending}
                  className="flex-1"
                />
                <Button type="submit" disabled={sending || !input.trim()}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend("Jaký je aktuální ROAS?")}
                >
                  Jaký je ROAS?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend("Které kampaně performují nejlépe?")}
                >
                  Top kampaně
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend("Navrhni optimalizace")}
                >
                  Optimalizace
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
