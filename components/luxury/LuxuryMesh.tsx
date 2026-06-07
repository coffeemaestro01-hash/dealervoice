/** Ambient background layers for premium dark sections */
export function LuxuryMesh({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0 luxury-noise opacity-[0.35]" />
      <div className="absolute inset-0 luxury-grid opacity-40" />
      <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse,rgba(251,101,20,0.18)_0%,transparent_70%)]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(251,101,20,0.08)_0%,transparent_70%)]" />
    </div>
  );
}
