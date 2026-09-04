export function BackgroundEffects() {
  return <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <div className="hero-glow absolute left-1/2 top-[-18rem] h-[42rem] w-[65rem] -translate-x-1/2 rounded-full" />
    <div className="light-streak absolute left-[12%] top-[32rem] h-px w-[36rem] rotate-[18deg]" />
    <div className="light-streak absolute right-[-8rem] top-[58rem] h-px w-[32rem] -rotate-[20deg]" />
    <div className="grid-overlay absolute inset-0 opacity-50" />
  </div>;
}