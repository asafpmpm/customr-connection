import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Step = {
  id: string;
  title: string;
  body: string;
  path: string;
  selector: string;
};

export function GuidedTour() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const steps: Step[] = useMemo(() => {
    const messagePath = customerId ? `/messages/new?customerId=${customerId}&category=birthday` : "/messages/new";
    return [
      {
        id: "dashboard",
        title: "תמונת מצב",
        body: "כך נראה הדשבורד עם KPI‑ים ומשימות מרכזיות.",
        path: "/",
        selector: "[data-tour='dashboard-kpis']",
      },
      {
        id: "customers",
        title: "רשימת לקוחות",
        body: "כאן מנהלים לקוחות, מסננים ומעדכנים פרטים.",
        path: "/customers",
        selector: "[data-tour='customers-table']",
      },
      {
        id: "composer",
        title: "יצירת הודעה",
        body: "בחר לקוח ותבנית, ערוך וראה תצוגה מקדימה.",
        path: messagePath,
        selector: "[data-tour='message-composer']",
      },
      {
        id: "daily",
        title: "משימות היום",
        body: "כל המשימות מרוכזות כאן — ימי הולדת, חגים, אירועים וקמפיינים.",
        path: "/daily",
        selector: "[data-tour='daily-actions']",
      },
    ];
  }, [customerId]);

  useEffect(() => {
    const start = () => {
      localStorage.removeItem("guidedTour");
      setActive(true);
      setStepIndex(0);
      setRect(null);
    };

    const flag = localStorage.getItem("guidedTour");
    if (flag === "start") start();

    const handler = () => start();
    window.addEventListener("guidedTourStart", handler);
    return () => window.removeEventListener("guidedTourStart", handler);
  }, []);

  useEffect(() => {
    if (!active || !user) return;
    const loadCustomer = async () => {
      const { data } = await supabase.from("customers").select("id").eq("user_id", user.id).limit(1);
      if (!data || data.length === 0) {
        toast({ title: "אין נתוני דמו", description: "אנא לחץ על 'טען דמו' קודם", variant: "destructive" });
        setActive(false);
        return;
      }
      setCustomerId(data[0].id);
    };
    loadCustomer();
  }, [active, user, toast]);

  useEffect(() => {
    if (!active) return;
    const step = steps[stepIndex];
    if (!step) return;
    if (location.pathname + location.search !== step.path) {
      navigate(step.path, { replace: true });
      return;
    }
    const timer = setTimeout(() => {
      const el = document.querySelector(step.selector) as HTMLElement | null;
      if (el) setRect(el.getBoundingClientRect());
    }, 250);
    return () => clearTimeout(timer);
  }, [active, stepIndex, steps, location.pathname, location.search, navigate]);

  if (!active || !steps[stepIndex] || !rect) return null;

  const step = steps[stepIndex];
  const tooltipStyle: CSSProperties = {
    position: "fixed",
    top: Math.min(window.innerHeight - 180, rect.top + rect.height + 12),
    left: Math.min(window.innerWidth - 320, rect.left),
    width: 300,
    zIndex: 60,
  };

  const highlightStyle: CSSProperties = {
    position: "fixed",
    top: rect.top - 8,
    left: rect.left - 8,
    width: rect.width + 16,
    height: rect.height + 16,
    borderRadius: 12,
    boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
    border: "2px solid hsl(var(--primary))",
    zIndex: 55,
    pointerEvents: "none",
  };

  const next = () => {
    if (stepIndex >= steps.length - 1) {
      setActive(false);
      setRect(null);
      return;
    }
    setRect(null);
    setStepIndex(stepIndex + 1);
  };

  const prev = () => {
    setRect(null);
    setStepIndex(Math.max(0, stepIndex - 1));
  };

  const stop = () => {
    setActive(false);
    setRect(null);
  };

  return (
    <>
      <div style={highlightStyle} />
      <div style={tooltipStyle} className="rounded-xl border bg-card p-4 shadow-xl">
        <div className="text-sm font-semibold mb-1">{step.title}</div>
        <div className="text-xs text-muted-foreground mb-3">{step.body}</div>
        <div className="flex justify-between">
          <Button size="sm" variant="ghost" onClick={stop}>סיים</Button>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={prev} disabled={stepIndex === 0}>הקודם</Button>
            <Button size="sm" onClick={next}>{stepIndex === steps.length - 1 ? "סיום" : "הבא"}</Button>
          </div>
        </div>
      </div>
    </>
  );
}
