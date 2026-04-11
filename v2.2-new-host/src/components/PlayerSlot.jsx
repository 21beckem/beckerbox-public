// import { PersonIcon, CheckIcon } from './Icons';

/**
 * PlayerSlot
 *
 * Displays a single player's connection status.
 * Connected: green background, avatar, "READY!" label.
 * Disconnected: grey, translucent icon, "Scan to connect.." label.
 *
 * Uses the custom `ch:` variant for hover/controller-hover effects.
 */
export default function PlayerSlot(props) {
  // props.connected – boolean
  // props.name      – string e.g. "Player 1"
  // props.avatarSrc – optional image URL for connected state

  return (
    <div
      class={`
        flex flex-col items-center justify-center gap-1 rounded-xl
        px-2 py-2 cursor-pointer select-none
        transition-all duration-200
        ch:scale-105 ch:shadow-lg
        ${props.connected
          ? 'bg-[#d4f0e2] border-2 border-[#4dbb8a]'
          : 'bg-[#eeeeee] border-2 border-[#d5d5d5]'}
      `}
      style="flex: 1; min-width: 0;"
    >
      {/* Avatar / Icon area */}
      <div
        class={`
          w-10 h-10 rounded-full flex items-center justify-center overflow-hidden
          ${props.connected
            ? 'bg-[#a8dfc2] ring-2 ring-white'
            : 'bg-[#d8d8d8]'}
        `}
      >
        {props.connected && props.avatarSrc
          ? (
            <img
              src={props.avatarSrc}
              alt={props.name}
              class="w-full h-full object-cover"
              draggable={false}
            />
          )
          : (
            <div class={`w-6 h-6 ${props.connected ? 'text-[#2d8a60]' : 'text-[#b0b0b0]'}`}>
              {/* <PersonIcon /> */}
            </div>
          )
        }
      </div>

      {/* Name */}
      <span
        class={`text-[11px] font-bold leading-tight text-center truncate w-full text-center
          ${props.connected ? 'text-[#1a6344]' : 'text-[#888]'}`}
      >
        {props.name}
      </span>

      {/* Status */}
      {props.connected
        ? (
          <div class="flex items-center gap-0.5">
            <span class="text-[#22a06b] w-3 h-3 flex-shrink-0">
              {/* <CheckIcon /> */}
            </span>
            <span class="text-[10px] font-black text-[#22a06b] tracking-tight">READY!</span>
          </div>
        )
        : (
          <span class="text-[10px] font-semibold text-[#aaa] text-center leading-tight">
            Scan to connect..
          </span>
        )
      }
    </div>
  );
}
