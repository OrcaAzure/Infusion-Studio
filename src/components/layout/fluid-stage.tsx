import { cn } from "@/lib/utils";

type FluidStageProps = {
  children: React.ReactNode;
  className?: string;
  /** Skip inner padding (e.g. full-bleed wave canvas inside the frame). */
  bleed?: boolean;
};

/** Rounded showcase frame — fluid portfolio-style container (web alchemy theme). */
export function FluidStage({ children, className, bleed }: FluidStageProps) {
  return (
    <div className={cn("fluid-stage", className)}>
      {bleed ? children : <div className="fluid-stage-inner">{children}</div>}
    </div>
  );
}

type FluidCanvasProps = {
  children: React.ReactNode;
  className?: string;
};

/** Outer viewport padding — content floats inside the page like a showcase. */
export function FluidCanvas({ children, className }: FluidCanvasProps) {
  return <div className={cn("fluid-canvas", className)}>{children}</div>;
}
