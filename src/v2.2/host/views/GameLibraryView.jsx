/**
 * GameLibraryView
 *
 * Two view modes toggled by a button in the top-right:
 *   • Carousel – horizontal row, left/right arrow buttons (no mouse scroll)
 *   • Grid     – 3-column grid, up/down arrow buttons
 *
 * All navigation is via arrow buttons only (no mouse/touch scroll).
 */
import { createSignal } from 'solid-js';
import {
  ChevronLeftIcon, ChevronRightIcon,
  ChevronUpIcon, ChevronDownIcon,
  GridIcon, CarouselIcon, PlayersIcon
} from '../components/Icons';

const COVER = 'https://art.gametdb.com/wii/cover3D/US/RSPE01.png';

const GAMES = [
  { id: 1,  title: 'Super Mario Galaxy',            players: '1–2' },
  { id: 2,  title: 'Wii Sports Resort',             players: '1–4' },
  { id: 3,  title: 'Mario Kart Wii',                players: '1–4' },
  { id: 4,  title: 'The Legend of Zelda: TP',       players: '1'   },
  { id: 5,  title: 'Super Smash Bros. Brawl',       players: '1–4' },
  { id: 6,  title: 'New Super Mario Bros. Wii',     players: '1–4' },
  { id: 7,  title: 'Metroid Prime 3: Corruption',   players: '1'   },
  { id: 8,  title: 'Donkey Kong Country Returns',   players: '1–2' },
  { id: 9,  title: 'Kirby\'s Epic Yarn',            players: '1–2' },
  { id: 10, title: 'Pikmin 2',                      players: '1'   },
  { id: 11, title: 'Fire Emblem: Radiant Dawn',     players: '1'   },
  { id: 12, title: 'Xenoblade Chronicles',          players: '1'   },
];

// ── Back button (shared) ──────────────────────────────────────────────────
function BackButton(props) {
  return (
    <button
      onClick={props.onClick}
      style="
        display: inline-flex; align-items: center; gap: 8px;
        padding: 6px 14px 6px 8px;
        background: rgba(0,0,0,0.06); border: none; border-radius: 10px;
        cursor: pointer; transition: background 150ms ease;
        font-family: inherit;
      "
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.12)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
    >
      <span style="
        width: 22px; height: 22px; border-radius: 50%;
        background: #cc3333; display: flex; align-items: center; justify-content: center;
        color: white; font-size: 11px; font-weight: 900; flex-shrink: 0;
      ">B</span>
      <span style="font-size: 13px; font-weight: 700; color: #1a6344;">Back</span>
    </button>
  );
}

// ── Arrow nav button ──────────────────────────────────────────────────────
function NavArrow(props) {
  // props: onClick, disabled, children (icon)
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      style={`
        width: 36px; height: 36px; border-radius: 50%; border: none;
        display: flex; align-items: center; justify-content: center;
        background: ${props.disabled ? 'rgba(0,0,0,0.05)' : 'rgba(26,99,68,0.12)'};
        color: ${props.disabled ? '#ccc' : '#1a6344'};
        cursor: ${props.disabled ? 'not-allowed' : 'pointer'};
        transition: background 150ms ease, transform 100ms ease;
        flex-shrink: 0;
        font-family: inherit;
      `}
      onMouseEnter={e => { if (!props.disabled) e.currentTarget.style.background = 'rgba(26,99,68,0.22)'; }}
      onMouseLeave={e => { if (!props.disabled) e.currentTarget.style.background = 'rgba(26,99,68,0.12)'; }}
    >
      <div style="width: 18px; height: 18px;">{props.children}</div>
    </button>
  );
}

// ── GameCard ──────────────────────────────────────────────────────────────
function GameCard(props) {
  const [hovered, setHovered] = createSignal(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={`
        position: relative; flex-shrink: 0;
        width: ${props.cardW}px;
        cursor: pointer;
        transition: transform 220ms cubic-bezier(0.34,1.3,0.64,1), z-index 0ms;
        transform: scale(${hovered() ? 1.14 : 1});
        z-index: ${hovered() ? 10 : 1};
      `}
    >
      {/* Cover — portrait 2:3 ratio */}
      <div style={`
        width: ${props.cardW}px; height: ${Math.round(props.cardW * 1.48)}px;
        border-radius: 10px; overflow: hidden;
        box-shadow: ${hovered()
          ? '0 12px 30px rgba(0,0,0,0.45), 0 4px 10px rgba(0,0,0,0.3)'
          : '0 4px 12px rgba(0,0,0,0.22)'};
        transition: box-shadow 220ms ease;
      `}>
        <img src={COVER} alt={props.title} style="width: 100%; height: 100%; object-fit: cover; display: block;" draggable={false} />
      </div>

      {/* Hover metadata overlay */}
      <div style={`
        position: absolute; inset: 0; border-radius: 10px; overflow: hidden; pointer-events: none;
        opacity: ${hovered() ? 1 : 0}; transition: opacity 180ms ease;
      `}>
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);" />
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 8px 7px;">
          <p style="color: white; font-size: 10px; font-weight: 800; line-height: 1.25; margin: 0 0 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            {props.title}
          </p>
          <div style="display: flex; align-items: center; gap: 3px;">
            <div style="width: 10px; height: 10px; color: rgba(255,255,255,0.7);"><PlayersIcon /></div>
            <span style="font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.7);">{props.players}</span>
          </div>
        </div>
      </div>

      {/* Selection ring */}
      <div style={`
        position: absolute; inset: 0; border-radius: 10px;
        box-shadow: 0 0 0 2px #2d9a6b, 0 0 0 3px rgba(255,255,255,0.6);
        pointer-events: none; opacity: ${hovered() ? 1 : 0}; transition: opacity 180ms ease;
      `} />
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────
const CAROUSEL_VISIBLE = 3;
const GRID_COLS        = 3;
const GRID_ROWS_VISIBLE = 2;

export default function GameLibraryView(props) {
  const [viewMode, setViewMode] = createSignal('carousel'); // 'carousel' | 'grid'
  const [carouselIdx, setCarouselIdx] = createSignal(0);
  const [gridRow, setGridRow] = createSignal(0);

  const totalRows = Math.ceil(GAMES.length / GRID_COLS);

  // Carousel
  const canLeft  = () => carouselIdx() > 0;
  const canRight = () => carouselIdx() + CAROUSEL_VISIBLE < GAMES.length;
  const visibleCarousel = () => GAMES.slice(carouselIdx(), carouselIdx() + CAROUSEL_VISIBLE);

  // Grid
  const canUp   = () => gridRow() > 0;
  const canDown = () => gridRow() + GRID_ROWS_VISIBLE < totalRows;
  const visibleGrid = () => GAMES.slice(gridRow() * GRID_COLS, (gridRow() + GRID_ROWS_VISIBLE) * GRID_COLS);

  const toggleView = () => {
    setViewMode(m => m === 'carousel' ? 'grid' : 'carousel');
    setCarouselIdx(0);
    setGridRow(0);
  };

  // Card dimensions — fixed px so they're always portrait and look sharp
  const CARD_W_CAROUSEL = 112;
  const CARD_W_GRID     = 108;

  return (
    <div style="display: flex; flex-direction: column; height: 100%; padding: 20px 28px 20px; overflow: hidden;">

      {/* ── HEADER ── */}
      <div style="display: flex; align-items: center; gap: 10px; padding-bottom: 14px; flex-shrink: 0;">
        <BackButton onClick={props.onBack} />
        <h1 style="flex: 1; font-size: clamp(16px, 2vw, 22px); font-weight: 900; color: #1a6344; letter-spacing: -0.4px; margin: 0;">
          Game Library
        </h1>
        {/* View toggle */}
        <button
          onClick={toggleView}
          title={viewMode() === 'carousel' ? 'Switch to grid' : 'Switch to carousel'}
          style="
            width: 34px; height: 34px; border: none; border-radius: 8px;
            background: rgba(26,99,68,0.10); color: #1a6344;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: background 150ms ease; flex-shrink: 0;
            font-family: inherit;
          "
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,99,68,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(26,99,68,0.10)'}
        >
          <div style="width: 18px; height: 18px;">
            {viewMode() === 'carousel' ? <GridIcon /> : <CarouselIcon />}
          </div>
        </button>
      </div>

      {/* ── DIVIDER ── */}
      <div style="border-top: 1px solid rgba(0,0,0,0.07); flex-shrink: 0;" />

      {/* ══ CAROUSEL MODE ══════════════════════════════════════════════════ */}
      <div style={`
        flex: 1; display: ${viewMode() === 'carousel' ? 'flex' : 'none'};
        flex-direction: column; justify-content: center; overflow: hidden;
      `}>
        <div style="display: flex; align-items: center; gap: 10px;">
          {/* Left arrow */}
          <NavArrow onClick={() => setCarouselIdx(i => i - 1)} disabled={!canLeft()}>
            <ChevronLeftIcon />
          </NavArrow>

          {/* Cards area */}
          <div style="flex: 1; display: flex; justify-content: center; align-items: flex-end; gap: 18px; padding: 24px 0;">
            {visibleCarousel().map(game => (
              <GameCard key={game.id} title={game.title} players={game.players} cardW={CARD_W_CAROUSEL} />
            ))}
          </div>

          {/* Right arrow */}
          <NavArrow onClick={() => setCarouselIdx(i => i + 1)} disabled={!canRight()}>
            <ChevronRightIcon />
          </NavArrow>
        </div>

        {/* Pagination dots */}
        <div style="display: flex; justify-content: center; gap: 5px; padding-top: 10px;">
          {Array.from({ length: GAMES.length - CAROUSEL_VISIBLE + 1 }).map((_, i) => (
            <div style={`
              width: ${i === carouselIdx() ? 18 : 6}px; height: 6px; border-radius: 3px;
              background: ${i === carouselIdx() ? '#2d9a6b' : '#ddd'};
              transition: width 200ms ease, background 200ms ease;
              cursor: pointer;
            `}
              onClick={() => setCarouselIdx(i)}
            />
          ))}
        </div>
      </div>

      {/* ══ GRID MODE ══════════════════════════════════════════════════════ */}
      <div style={`
        flex: 1; display: ${viewMode() === 'grid' ? 'flex' : 'none'};
        flex-direction: column; overflow: hidden;
      `}>
        {/* Up arrow */}
        <div style="display: flex; justify-content: center; padding: 10px 0 6px; flex-shrink: 0;">
          <NavArrow onClick={() => setGridRow(r => r - 1)} disabled={!canUp()}>
            <ChevronUpIcon />
          </NavArrow>
        </div>

        {/* Grid of cards */}
        <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
          <div style={`
            display: grid;
            grid-template-columns: repeat(${GRID_COLS}, ${CARD_W_GRID}px);
            gap: 18px;
          `}>
            {visibleGrid().map(game => (
              <GameCard key={game.id} title={game.title} players={game.players} cardW={CARD_W_GRID} />
            ))}
          </div>
        </div>

        {/* Down arrow */}
        <div style="display: flex; justify-content: center; padding: 6px 0 10px; flex-shrink: 0;">
          <NavArrow onClick={() => setGridRow(r => r + 1)} disabled={!canDown()}>
            <ChevronDownIcon />
          </NavArrow>
        </div>

        {/* Row indicator */}
        <div style="text-align: center; font-size: 10px; font-weight: 600; color: #bbb; padding-bottom: 4px;">
          {gridRow() + 1}–{Math.min(gridRow() + GRID_ROWS_VISIBLE, totalRows)} of {totalRows} rows
        </div>
      </div>

    </div>
  );
}