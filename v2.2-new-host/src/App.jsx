import Overlay from './components/Overlay';

export default function App() {
  return (
    <div class="relative w-screen h-screen overflow-hidden select-none font-sans">
      {/* ── Wii-style green background ── */}
      <div
        class="absolute inset-0"
        style="background: radial-gradient(ellipse at 50% 40%, #7abf98 0%, #509e72 55%, #3a7a56 100%);"
      />

      {/* ── Subtle scanline / texture overlay ── */}
      <div
        class="absolute inset-0 pointer-events-none opacity-[0.04]"
        style="background-image: repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 3px);"
      />

      {/* ── Faux Wii channel grid in background ── */}
      <div class="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-4 p-8 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            class="rounded-2xl border border-white/10"
            style={`background: rgba(255,255,255,${0.04 + (i % 3) * 0.02});`}
          />
        ))}
      </div>

      {/* ── Wii bar at bottom ── */}
      <div class="absolute bottom-0 left-0 right-0 h-12 flex items-center px-6 gap-4"
           style="background: rgba(0,0,0,0.15); backdrop-filter: blur(4px);">
        <span class="text-white/60 text-sm font-bold tracking-wide">Wii</span>
        <div class="flex-1" />
        <span class="text-white/40 text-xs">Wed 29/10</span>
        <div class="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center">
          <svg viewBox="0 0 24 24" class="w-3 h-3 fill-white/50">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"/>
          </svg>
        </div>
      </div>

      {/* ── The overlay system ── */}
      <Overlay />
    </div>
  );
}
