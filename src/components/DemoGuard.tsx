import { ReactNode } from "react";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DemoGuardProps {
  children: ReactNode;
}

const DemoGuard = ({ children }: DemoGuardProps) => {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) return <>{children}</>;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* This wrapper captures the hover for the tooltip, but blocks interactions with the child */}
          <div className="inline-block cursor-not-allowed" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <div className="opacity-50 pointer-events-none">
              {children}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-destructive text-destructive-foreground font-medium">
          <p>מצב צפייה בלבד 🔒</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DemoGuard;