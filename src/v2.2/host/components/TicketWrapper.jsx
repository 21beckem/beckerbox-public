/**
 * TicketWrapper - scalable ticket shape via ResizeObserver + SVG clipPath.
 * notchSide: 'both' | 'left' | 'right' | 'none'
 */
import { createSignal, onMount, onCleanup, createUniqueId } from 'solid-js';

function buildPath(w, h, notchSide = 'both') {
  if (!w || !h) return 'M 0 0 Z';
  const r   = 20;
  const nd  = Math.min(32, w * 0.048);
  const ny1 = h * 0.40;
  const ny2 = h * 0.60;
  const nt  = nd * 0.55;
  const hasL = notchSide === 'both' || notchSide === 'left';
  const hasR = notchSide === 'both' || notchSide === 'right';
  let d = `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} `;
  if (hasR) d += `L ${w} ${ny1} L ${w - nd} ${ny1 + nt} L ${w - nd} ${ny2 - nt} L ${w} ${ny2} `;
  d += `L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h} L ${r} ${h} Q 0 ${h} 0 ${h - r} `;
  if (hasL) d += `L 0 ${ny2} L ${nd} ${ny2 - nt} L ${nd} ${ny1 + nt} L 0 ${ny1} `;
  d += `L 0 ${r} Q 0 0 ${r} 0 Z`;
  return d;
}

export default function TicketWrapper(props) {
  const clipId = `tc-${createUniqueId()}`;
  let contentRef;
  const [dims, setDims] = createSignal({ w: 0, h: 0 });

  onMount(() => {
    const ro = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(contentRef);
    onCleanup(() => ro.disconnect());
  });

  return (
    <div style={`
      position: relative;
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 12px 40px rgba(0,0,0,0.35)) drop-shadow(0 2px 8px rgba(0,0,0,0.18));
      transition: opacity 200ms ease;
      opacity: ${props.OverlayOpen ? 1 : 0};
    `}>
      <svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden; pointer-events: none;">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d={buildPath(dims().w, dims().h, props.notchSide ?? 'both')} />
          </clipPath>
        </defs>
      </svg>
      <div
        ref={contentRef}
        style={`position: relative; width: 100%; height: 100%; clip-path: url(#${clipId}); background: white; overflow: hidden;`}
      >
        <div style="position: absolute; inset: 0; pointer-events: none; z-index: 0; background: radial-gradient(ellipse at 25% 18%, rgba(195,235,215,0.55) 0%, transparent 55%), radial-gradient(ellipse at 75% 82%, rgba(185,228,208,0.40) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(220,245,232,0.25) 0%, transparent 70%);" />
        <div style={`position: absolute; left: 0; right: 0; border-top: 1px dashed rgba(0,0,0,0.07); top: 40%; pointer-events: none; z-index: 1; display: ${props.notchSide === 'none' ? 'none' : 'block'};`} />
        <div style={`position: absolute; left: 0; right: 0; border-top: 1px dashed rgba(0,0,0,0.07); top: 60%; pointer-events: none; z-index: 1; display: ${props.notchSide === 'none' ? 'none' : 'block'};`} />
        <div style="position: relative; z-index: 2; width: 100%; height: 100%;">
          {props.children}
        </div>
      </div>
    </div>
  );
}