import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Mail, Lock, CheckCircle, MessageSquare, Target,
  BarChart3, Calendar, Sparkles, ArrowLeft
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "ניהול לקוחות מתקדם",
    description: "תצוגת לקוחות מלאה עם פרופילים, ציר זמן ומעקב אחר כל אינטראקציה.",
  },
  {
    icon: MessageSquare,
    title: "תבניות הודעה חכמות",
    description: "יצירת תבניות מותאמות אישית עם placeholders אוטומטיים לכל לקוח.",
  },
  {
    icon: Target,
    title: "קמפיינים ממוקדים",
    description: "שליחת הודעות ממוקדות ומעקב אחר ביצועים בזמן אמת.",
  },
];

const stats = [
  { value: "500+", label: "לקוחות מרוצים" },
  { value: "10K+", label: "הודעות נשלחו" },
  { value: "98%", label: "שביעות רצון" },
];

const bullets = [
  { icon: BarChart3, text: "דשבורד חכם עם תובנות בזמן אמת" },
  { icon: Calendar, text: "מעקב אוטומטי אחר ימי הולדת וחגים" },
  { icon: Sparkles, text: "יוצר הודעות עם Preview חי" },
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({
          title: "נרשמת בהצלחה!",
          description: "נשלח אליך מייל אימות. אנא אשר את כתובת המייל שלך.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-foreground">Customer Connection</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 md:px-12 py-8 md:py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content Side */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="space-y-4 animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                ניהול קשרי לקוחות
                <span className="block text-primary mt-1">בצורה חכמה</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                המערכת שתעזור לך לשמור על קשר אישי עם כל לקוח — 
                מעקב אוטומטי, תבניות חכמות וקמפיינים ממוקדים.
              </p>
            </div>

            {/* Bullet points */}
            <div className="space-y-4 animate-fade-in-up stagger-2">
              {bullets.map((b, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary/10">
                    <b.icon className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <span className="text-foreground font-medium">{b.text}</span>
                </div>
              ))}
            </div>

            {/* Floating stats */}
            <div className="flex gap-6 md:gap-10 animate-fade-in-up stagger-3">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{s.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Login Form Side */}
          <div className="order-1 lg:order-2 animate-fade-in-up stagger-2">
            <Card className="shadow-2xl border-0 glass-effect max-w-md mx-auto lg:mx-0 lg:mr-auto">
              <CardHeader className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-3 mx-auto shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-110">
                  <Users className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl">{isSignUp ? "הרשמה" : "התחברות"}</CardTitle>
                <CardDescription>
                  {isSignUp ? "צור חשבון חדש והתחל לנהל לקוחות" : "התחבר לחשבון שלך"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">אימייל</Label>
                    <div className="relative group">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-10 transition-shadow duration-200 focus:shadow-md focus:shadow-primary/10"
                        required
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">סיסמה</Label>
                    <div className="relative group">
                      <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10 transition-shadow duration-200 focus:shadow-md focus:shadow-primary/10"
                        required
                        dir="ltr"
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full btn-hover shadow-md shadow-primary/20 gap-2" disabled={loading}>
                    {loading ? "מעבד..." : isSignUp ? "הרשמה" : (
                      <>
                        התחברות
                        <ArrowLeft className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-primary hover:underline transition-colors duration-200"
                  >
                    {isSignUp ? "כבר יש לך חשבון? התחבר" : "אין לך חשבון? הירשם"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">למה Customer Connection?</h2>
            <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
              כל הכלים שאתה צריך לניהול קשרי לקוחות מקצועי — במקום אחד
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {features.map((f, i) => (
              <Card key={i} className={`card-hover border-0 shadow-lg animate-fade-in-up stagger-${i + 2}`}>
                <CardContent className="pt-8 pb-6 px-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <f.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Customer Connection — כל הזכויות שמורות
        </p>
      </footer>
    </div>
  );
};

export default Login;
