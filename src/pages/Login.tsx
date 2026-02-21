import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, Mail, Lock } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 relative overflow-hidden">
      {/* Decorative blurred circles */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-fade-in" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-fade-in stagger-2" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-110">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Customer Connection</h1>
          <p className="text-muted-foreground mt-2">ניהול קשרי לקוחות חכם</p>
        </div>

        <Card className="shadow-2xl border-0 animate-fade-in-up stagger-2 glass-effect">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">{isSignUp ? "הרשמה" : "התחברות"}</CardTitle>
            <CardDescription>
              {isSignUp ? "צור חשבון חדש" : "התחבר לחשבון שלך"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 animate-fade-in-up stagger-3">
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
              <div className="space-y-2 animate-fade-in-up stagger-4">
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
              <Button type="submit" className="w-full btn-hover shadow-md shadow-primary/20 animate-fade-in-up stagger-5" disabled={loading}>
                {loading ? "מעבד..." : isSignUp ? "הרשמה" : "התחברות"}
              </Button>
            </form>
            <div className="mt-4 text-center animate-fade-in stagger-6">
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
  );
};

export default Login;
