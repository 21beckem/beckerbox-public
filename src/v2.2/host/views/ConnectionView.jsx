/**
 * ConnectionView - default main ticket view.
 * Shows QR code + player slots. No footer (software info is Settings-only).
 */
import PlayerSlot from '../components/PlayerSlot';
import { For } from 'solid-js';
import * as Overlay from '../components/Overlay';

function onStartClick(e) {
  e.currentTarget.style.display = 'none';
  Overlay.setOpen(false);
  setTimeout(() => Overlay.setBlackBackdrop(false), 1500);
  window.electron.startWii();
}

function onHomeClick(e) {
  Overlay.setOpen(false);
  Overlay.setBlackBackdrop(true);
  setTimeout(() => Overlay.setBlackBackdrop(false), 1000);
  window.electron.goHome();
}

export default function ConnectionView(props) {
  return (
    <div style="display: flex; flex-direction: column; height: 100%; padding: 20px 40px 24px;">

      {/* ── HEADER ── */}
      <div style="text-align: center; padding-top: 16px; padding-bottom: 24px;">
        <h1 style="font-size: clamp(36px, 5vw, 48px); font-weight: 900; color: #1a6344; letter-spacing: -0.5px; line-height: 1;">
          BeckerBox
        </h1>
        <p style="font-size: clamp(18px, 2vw, 24px); font-weight: 600; color: #4a8a6a; margin-top: 8px;">
          Scan to connect your phone
        </p>
      </div>

      {/* ── QR CODE ── */}
      <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; border-radius: 20px; overflow: hidden; border: 6px solid white; box-shadow: 0 4px 20px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.05); width: min(280px, 32vw); height: min(280px, 32vw);">
          {props.qrCodeText ? (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(props.qrCodeText)}&size=220x220&margin=8`}
              alt="QR code to connect"
              style="width: 100%; height: 100%; object-fit: cover; display: block;"
              draggable={false}
            />
          ) : (
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f0f0f0;">
              <span style="font-size: 18px; color: #999;">Generating...</span>
            </div>
          )}
        </div>
      </div>


      {/* buttons */}
      <div style={`
        display: flex;
        width: 100%;
        flex-direction: row;
        gap: 16px;
      `}>
        <button
          style="
            display: block;
            margin: 0 auto 24px;
            padding: 12px 32px;
            font-size: 18px;
            font-weight: 700;
            color: white;
            background: #2d9a6b;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          "
          class="pointer-clickable"
          onClick={onStartClick}
        >
          Start
        </button>
        <button
          style="
            display: block;
            margin: 0 auto 24px;
            padding: 12px 32px;
            font-size: 18px;
            font-weight: 700;
            color: white;
            background: #2d9a6b;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          "
          class="pointer-clickable"
          onClick={onHomeClick}
        >
          Go Home
        </button>
      </div>

      {/* ── DIVIDER ── */}
      <div style="border-top: 2px dashed rgba(0,0,0,0.10); margin: 0 -8px;" />

      {/* ── PLAYER SLOTS ── */}
      <div style="display: flex; gap: 16px; padding: 24px 0;">
        <For each={props.playerSlots || []}>
          {(p) => (
            <PlayerSlot
              connected={p.connected}
              name={p.name}
              avatarSrc={p.avatarSrc}
              onDisconnect={() => props.onDisconnectPlayer?.(p.slot)}
            />
          )}
        </For>
      </div>

    </div>
  );
}