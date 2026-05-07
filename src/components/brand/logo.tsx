import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: number;
}

export function Logo({ className, showWordmark = true, size = 28 }: LogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_12px_oklch(0.66_0.22_295/0.55)]"
        aria-label="Aethra"
      >
        <defs>
          <linearGradient id="aethra-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <path d="M16 3L29 28H22.5L16 14.5L9.5 28H3L16 3Z" fill="url(#aethra-grad)" />
        <path d="M16 17.5L19 23H13L16 17.5Z" fill="#09090B" />
      </svg>
      {showWordmark ? (
        <span className="text-[1.05rem] font-semibold tracking-tight text-foreground">Aethra</span>
      ) : null}
    </div>
  );
}
