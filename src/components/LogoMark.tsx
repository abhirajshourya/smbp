export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <clipPath id="logomark-clip">
        <rect x="0" y="0" width="64" height="64" rx="16" />
      </clipPath>
      <g clipPath="url(#logomark-clip)">
        <polygon points="0,0 64,0 0,64" fill="hsl(var(--primary))" />
        <polygon points="64,0 64,64 0,64" fill="hsl(var(--primary) / 0.55)" />
        <line
          x1="64"
          y1="0"
          x2="0"
          y2="64"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="1.5"
          strokeDasharray="3,3"
          opacity="0.85"
        />
      </g>
    </svg>
  );
}
