import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User, Sparkles, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SAMPLE_QUESTIONS = [
  "What is Nitaqat?",
  "How is compliance ratio calculated?",
  "What are the penalties for non-compliance?",
  "How do I improve my Emiratisation ratio?",
];

const COMPLIANCE_KNOWLEDGE: Record<string, string> = {
  "nitaqat": `**Nitaqat** is Saudi Arabia's Saudisation program that classifies companies into color bands based on their Saudi national employment ratio:

• **Platinum** (>28%): Premium benefits, fast visa processing
• **Green** (15-28%): Standard operations allowed
• **Yellow** (10-15%): Restricted hiring, limited renewals
• **Red** (<10%): Cannot hire, no visa renewals

The target varies by industry sector and company size.`,
  
  "emiratisation": `**Emiratisation** (Nafis) is the UAE's nationalization program requiring private sector companies with 50+ employees to maintain a minimum ratio of Emirati nationals:

• **Current target**: 10% (as of 2025)
• **Annual increase**: 2% per year
• **Penalties**: AED 96,000+ per missing Emirati
• **Benefits**: Salary subsidies up to AED 9,000/month per Emirati hire`,

  "qatarisation": `**Qatarisation** is Qatar's workforce nationalization initiative:

• **Oil & Gas**: 30% minimum
• **Other sectors**: 20% minimum
• **Banking**: 50% minimum for customer-facing roles
• **Quarterly reporting** required via ADLSA portal`,

  "omanisation": `**Omanisation** requires private sector companies to employ Omani nationals:

• **Hospitality**: 30% minimum
• **General sectors**: 20% minimum
• **Banking/Finance**: 45% minimum
• **Annual targets** set by Ministry of Labour`,

  "calculate": `**Compliance ratio** is calculated as:

\`Ratio = (Qualifying Nationals ÷ Total Qualifying Workforce) × 100\`

**What counts:**
✓ Full-time nationals (100% weight)
✓ Part-time nationals (50% weight typically)
✗ Contract workers <90 days
✗ Employees on unpaid leave

The exact rules vary by country and program.`,

  "penalties": `**Non-compliance penalties vary by country:**

🇸🇦 **Saudi (Nitaqat)**:
• Block on visa services
• Cannot renew work permits
• Business license restrictions

🇦🇪 **UAE (Emiratisation)**:
• AED 96,000/year per missing Emirati (2024)
• Increasing to AED 108,000 (2025)

🇶🇦 **Qatar**:
• Work permit suspension
• Government contract exclusion

🇴🇲 **Oman**:
• Fines and license restrictions`,

  "improve": `**To improve your compliance ratio:**

1. **Hire nationals** — Post on local job portals (Jadara, Tawteen)
2. **Reclassify** — Convert part-time nationals to full-time
3. **Review contracts** — Convert qualifying contractors to employees
4. **Reduce non-qualifying staff** — Natural attrition of expat roles
5. **Training programs** — Enroll nationals in government programs for credits

Each 1 national hire typically adds 0.5-1.5% to your ratio depending on company size.`,
};

function findAnswer(question: string): string {
  const q = question.toLowerCase();
  
  if (q.includes('nitaqat') || q.includes('saudi') || q.includes('saudisation')) {
    return COMPLIANCE_KNOWLEDGE.nitaqat;
  }
  if (q.includes('emirat') || q.includes('uae') || q.includes('nafis')) {
    return COMPLIANCE_KNOWLEDGE.emiratisation;
  }
  if (q.includes('qatar')) {
    return COMPLIANCE_KNOWLEDGE.qatarisation;
  }
  if (q.includes('oman')) {
    return COMPLIANCE_KNOWLEDGE.omanisation;
  }
  if (q.includes('calculat') || q.includes('ratio') || q.includes('formula')) {
    return COMPLIANCE_KNOWLEDGE.calculate;
  }
  if (q.includes('penalt') || q.includes('fine') || q.includes('non-complian')) {
    return COMPLIANCE_KNOWLEDGE.penalties;
  }
  if (q.includes('improve') || q.includes('increase') || q.includes('boost') || q.includes('raise')) {
    return COMPLIANCE_KNOWLEDGE.improve;
  }
  
  return `I can help you with questions about GCC nationalization programs:

• **Nitaqat** (Saudi Arabia)
• **Emiratisation** (UAE)
• **Qatarisation** (Qatar)
• **Omanisation** (Oman)

Try asking about specific programs, compliance calculations, penalties, or how to improve your ratio.`;
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your NatIQ compliance assistant. I can answer questions about Nitaqat, Emiratisation, Qatarisation, and Omanisation. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && !minimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, minimized]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const answer = findAnswer(text);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  if (minimized) {
    return (
      <div
        className="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-lg cursor-pointer z-50 flex items-center gap-2"
        onClick={() => setMinimized(false)}
      >
        <Bot className="w-5 h-5" />
        <span className="text-sm font-medium">NatIQ Assistant</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-card border rounded-xl shadow-elevated z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">NatIQ Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary/80" onClick={() => setMinimized(true)}>
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary/80" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-2',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'rounded-lg px-3 py-2 max-w-[80%] text-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Questions */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-1">
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about compliance..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
