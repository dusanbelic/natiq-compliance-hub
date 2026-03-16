import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const POSTS = [
  {
    slug: 'how-nitaqat-works',
    title: 'How Nitaqat Actually Works: A Plain-English Guide for HR Directors in 2025',
    author: 'NatIQ Team',
    date: 'March 2026',
    readTime: '8 min',
    category: 'Saudi Arabia',
    categoryColor: 'bg-primary text-primary-foreground',
    gradient: 'from-primary/80 to-[#1B3A5C]',
    published: true,
  },
  {
    slug: 'uae-emiratisation-guide',
    title: 'The Complete Guide to UAE Emiratisation in 2025 and 2026',
    author: 'NatIQ Team',
    date: 'Coming Soon',
    readTime: '10 min',
    category: 'UAE',
    categoryColor: 'bg-amber text-white',
    gradient: 'from-amber/80 to-[#1B3A5C]',
    published: false,
  },
];

export default function Resources() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { toast.error('Please enter a valid email'); return; }
    setSubscribing(true);
    try {
      const { error } = await supabase.from('resource_subscribers' as any).insert({
        email, source: 'uae-emiratisation-guide',
      });
      if (error?.message?.includes('duplicate')) { toast.info('You\'re already subscribed!'); setSubscribed(true); }
      else if (error) throw error;
      else { setSubscribed(true); toast.success('Subscribed! We\'ll notify you when it\'s published.'); }
    } catch { toast.error('Something went wrong, please try again.'); }
    setSubscribing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-jetbrains font-bold text-sm">N</span>
            </div>
            <span className="font-sora font-bold text-xl text-foreground">NatIQ</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild><Link to="/login">Sign In</Link></Button>
            <Button size="sm" asChild><Link to="/#apply">Apply for Early Access</Link></Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16" style={{ background: '#1B3A5C' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-sora font-bold text-3xl sm:text-4xl text-white mb-4">GCC Compliance Resources</h1>
          <p className="text-lg" style={{ color: '#CBD5E1' }}>
            Guides, analysis, and regulatory updates for HR teams operating in the Gulf.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {POSTS.map((post) => (
              <Card key={post.slug} className="overflow-hidden shadow-card hover:shadow-elevated transition-shadow">
                {/* Gradient image placeholder */}
                <div className={`h-48 bg-gradient-to-br ${post.gradient} flex items-end p-6`}>
                  <Badge className={post.categoryColor}>{post.category}</Badge>
                  {!post.published && (
                    <Badge className="bg-amber text-white ml-2">Coming Soon</Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="font-sora font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>{post.date}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                  </div>
                  {post.published ? (
                    <Button variant="link" className="p-0 h-auto text-primary" asChild>
                      <Link to={`/resources/${post.slug}`}>Read More <ArrowRight className="w-4 h-4 ml-1" /></Link>
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Get notified when this guide is published</p>
                      {subscribed ? (
                        <p className="text-sm text-primary font-medium">✓ Subscribed</p>
                      ) : (
                        <form onSubmit={handleSubscribe} className="flex gap-2">
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1"
                          />
                          <Button type="submit" size="sm" disabled={subscribing}>
                            {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">© 2025 NatIQ. All rights reserved.</p>
          <Link to="/" className="text-sm text-primary hover:underline">← Back to Home</Link>
        </div>
      </footer>
    </div>
  );
}
