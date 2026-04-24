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
 *  game       – Game object with images.cover.uri/url
 *  players    – string e.g. "1–4"
 *  index      – number (for stagger delay)
 */
export default function GameCard(props) {
  const [focused, setFocused] = createSignal(false);

  return (
    <div
      style={`
        position: relative;
        flex-shrink: 0;
        cursor: pointer;
        user-select: none;
        width: 220px;
        transform: scale(${focused() ? 1.14 : 1});
        z-index: ${focused() ? 20 : 10};
        transition: transform 0.25s ease-out, z-index 0.25s ease-out;
      `}
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
    >
      {/* Cover art – strictly portrait (2:3 ratio) */}
      <div
        style={`
          width: 220px;
          height: 320px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: ${focused()
            ? '0 12px 32px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.3)'
            : '0 4px 12px rgba(0,0,0,0.2)'};
          transition: box-shadow 0.25s ease;
        `}
      >
        <img
          src={props.game?.images?.cover?.uri || props.game?.images?.cover?.url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="220" height="320"%3E%3Crect fill="%23ccc" width="220" height="320"/%3E%3C/svg%3E'}
          alt={props.game?.name || 'Game cover'}
          style="width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;"
          draggable={false}
        />
      </div>

      {/* Metadata overlay – only visible when focused */}
      <div
        style={`
          position: absolute;
          inset: 0;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
          pointer-events: none;
          opacity: ${focused() ? 1 : 0};
          transition: opacity 0.2s ease;
        `}
      >
        {/* Dark gradient scrim */}
        <div
          style="position: absolute; inset: 0; border-radius: 12px; background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);"
        />
        {/* Text */}
        <div style="position: relative; z-index: 10; padding: 16px 16px 16px 16px;">
          <p style="color: white; font-size: 18px; font-weight: 900; line-height: 1.25; margin: 0 0 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            {props.game?.name}
          </p>
          <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
            <span style="color: rgba(255,255,255,0.5); width: 12px; height: 12px; flex-shrink: 0;">
              {/* <PlayersIcon /> */}
            </span>
            <span style="color: rgba(255,255,255,0.5); font-size: 16px; font-weight: 700;">{props.players}</span>
          </div>
        </div>
      </div>

      {/* Selection ring */}
      <div
        style={`
          position: absolute;
          inset: 0;
          border-radius: 12px;
          border: 2px solid #2d9a6b;
          outline: 1px solid rgba(255,255,255,0.6);
          outline-offset: 3px;
          pointer-events: none;
          opacity: ${focused() ? 1 : 0};
          transition: opacity 0.2s ease;
        `}
      />
    </div>
  );
}
