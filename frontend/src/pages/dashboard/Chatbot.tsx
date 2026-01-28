import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, FileText, Send, Loader2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // FastAPI backend
});

// attach JWT automatically (important!)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  metadata?: {
    clause_id: number;
    risk_label: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  }[];

}

const Chatbot = () => {
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [isIndexing, setIsIndexing] = useState(false);
  const [isIndexed, setIsIndexed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [documents, setDocuments] = useState<
    { id: number; filename: string }[]
  >([]);
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get("/documents");

        // ✅ SAFETY CHECK
        if (Array.isArray(res.data)) {
          setDocuments(res.data);
        } else if (Array.isArray(res.data.documents)) {
          setDocuments(res.data.documents);
        } else {
          console.error("Unexpected documents response:", res.data);
          setDocuments([]);
        }
      } catch (err) {
        console.error("Failed to fetch documents", err);
        setDocuments([]);
      }
    };

    fetchDocs();
  }, []);




  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleIndex = async () => {
    if (!selectedDocument) return;

    setIsIndexing(true);
    try {
      await api.post(`/chatbot/index/${selectedDocument}`);
      setIsIndexed(true);
      setMessages([
        {
          id: "init",
          type: "ai",
          content: "Document indexed successfully. You can now ask questions.",
        },
      ]);
    } catch {
      alert("Indexing failed");
    } finally {
      setIsIndexing(false);
    }
  };


  const handleSend = async () => {
    if (!input.trim() || !isIndexed) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post(`/chatbot/ask/${selectedDocument}`, {
        question: userMessage.content,
      });

      const aiMessage: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: res.data.answer,
        metadata: res.data.why_this_answer,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "err",
          type: "ai",
          content: "Sorry, I couldn’t answer that question.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  const getRiskColor = (risk: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (risk) {
      case 'HIGH':
        return 'text-destructive';
      case 'MEDIUM':
        return 'text-warning';
      case 'LOW':
        return 'text-success';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chatbot Assistant</h1>
        <p className="text-muted-foreground mt-2">
          Ask questions about your contracts and get AI-powered answers with source references.
        </p>
      </div>

      {/* Document Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Document</CardTitle>
          <CardDescription>Choose a document to chat about</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select
              value={selectedDocument}
              onValueChange={(value) => {
                setSelectedDocument(value);
                setIsIndexed(false);
                setMessages([]);
              }}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a document" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(documents) && documents.map((doc) => (
                  <SelectItem key={doc.id} value={String(doc.id)}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {doc.filename}
                    </div>
                  </SelectItem>
                ))}

              </SelectContent>
            </Select>
            <Button
              onClick={handleIndex}
              disabled={!selectedDocument || isIndexing || isIndexed}
            >
              {isIndexing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Indexing...
                </>
              ) : isIndexed ? (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ready to Chat
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Start Chat
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isIndexed && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a document and click "Start Chat" to begin
                  </p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%]',
                    message.type === 'user'
                      ? 'chat-bubble-user'
                      : 'chat-bubble-ai'
                  )}
                >
                  <p>{message.content}</p>

                  {/* AI Metadata */}
                  {message.type === 'ai' &&
                    message.metadata &&
                    message.metadata.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Info className="h-3 w-3" />
                          <span>Why this answer?</span>
                        </div>

                        {message.metadata.map((m) => (
                          <div
                            key={m.clause_id}
                            className="bg-background/50 rounded-lg p-3 space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                                Clause {m.clause_id}
                              </span>

                              <span
                                className={cn(
                                  'text-xs font-medium flex items-center gap-1',
                                  getRiskColor(m.risk_label)
                                )}
                              >
                                <AlertTriangle className="h-3 w-3" />
                                {m.risk_label} RISK
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground">
                              {m.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="chat-bubble-ai flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
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
                placeholder={
                  isIndexed
                    ? 'Ask a question about your contract...'
                    : 'Select and index a document first'
                }
                disabled={!isIndexed || isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!isIndexed || !input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default Chatbot;
