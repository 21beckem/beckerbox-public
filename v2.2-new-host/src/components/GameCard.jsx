import { createSignal } from 'solid-js';
// import { PlayersIcon } from './Icons';

/**
 * GameCard
 *
 * Portrait-orientation game cover card for the Game Library carousel.
 * On focus/hover (ch: variant), it heavily scales up and shows metadata
 * overlay (title + player count).
 *
 * Props:
 *  title      – string
 *  coverSrc   – URL
 *  players    – string e.g. "1–4"
 *  index      – number (for stagger delay)
 */
export default function GameCard(props) {
  const [focused, setFocused] = createSignal(false);

  return (
    <div
      class={`
        relative flex-shrink-0 cursor-pointer select-none
        transition-all duration-250 ease-out
        ${focused() ? 'scale-[1.18] z-20' : 'scale-100 z-10'}
        ch:scale-[1.18] ch:z-20
      `}
      style="width: 110px;"
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
    >
      {/* Cover art – strictly portrait (2:3 ratio) */}
      <div
        class="rounded-xl overflow-hidden shadow-md transition-shadow duration-250"
        style={`
          width: 110px;
          height: 160px;
          box-shadow: ${focused()
            ? '0 12px 32px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.3)'
            : '0 4px 12px rgba(0,0,0,0.2)'};
        `}
      >
        <img
          src={props.coverSrc}
          alt={props.title}
          class="w-full h-full object-cover object-center"
          draggable={false}
        />
      </div>

      {/* Metadata overlay – only visible when focused */}
      <div
        class="absolute inset-0 rounded-xl flex flex-col justify-end overflow-hidden pointer-events-none"
        style={`
          opacity: ${focused() ? 1 : 0};
          transition: opacity 0.2s ease;
        `}
      >
        {/* Dark gradient scrim */}
        <div
          class="absolute inset-0 rounded-xl"
          style="background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);"
        />
        {/* Text */}
        <div class="relative z-10 p-2 pb-2.5">
          <p class="text-white text-[10px] font-black leading-tight line-clamp-2">
            {props.title}
          </p>
          <div class="flex items-center gap-1 mt-1">
            <span class="text-white/80 w-3 h-3 flex-shrink-0">
              {/* <PlayersIcon /> */}
            </span>
            <span class="text-white/80 text-[9px] font-bold">{props.players}</span>
          </div>
        </div>
      </div>

      {/* Selection ring */}
      <div
        class="absolute inset-0 rounded-xl ring-2 ring-[#2d9a6b] ring-offset-1 pointer-events-none transition-opacity duration-200"
        style={`opacity: ${focused() ? 1 : 0};`}
      />
    </div>
  );
}
