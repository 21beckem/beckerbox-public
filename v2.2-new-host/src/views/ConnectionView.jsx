/**
 * ConnectionView - default main ticket view.
 * Shows QR code + player slots. No footer (software info is Settings-only).
 */
import PlayerSlot from '../components/PlayerSlot';

const PLAYER_1_AVATAR = 'https://api.dicebear.com/8.x/micah/svg?seed=beckerbox&backgroundColor=b6e3f4&radius=50';

const PLAYERS = [
  { id: 1, name: 'Player 1', connected: true,  avatarSrc: PLAYER_1_AVATAR },
  { id: 2, name: 'Player 2', connected: false, avatarSrc: null },
  { id: 3, name: 'Player 3', connected: false, avatarSrc: null },
  { id: 4, name: 'Player 4', connected: false, avatarSrc: null },
];

const QR_SRC = 'https://api.qrserver.com/v1/create-qr-code/?data=placeholder&size=220x220&margin=8';

export default function ConnectionView() {
  return (
    <div style="display: flex; flex-direction: column; height: 100%; padding: 20px 40px 24px;">

      {/* ── HEADER ── */}
      <div style="text-align: center; padding-top: 8px; padding-bottom: 12px;">
        <h1 style="font-size: clamp(22px, 3vw, 32px); font-weight: 900; color: #1a6344; letter-spacing: -0.5px; line-height: 1;">
          BeckerBox
        </h1>
        <p style="font-size: clamp(11px, 1.2vw, 14px); font-weight: 600; color: #4a8a6a; margin-top: 4px;">
          Scan to connect your phone
        </p>
      </div>

      {/* ── QR CODE ── */}
      <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; border-radius: 16px; overflow: hidden; border: 4px solid white; box-shadow: 0 4px 20px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.05); width: min(200px, 26vw); height: min(200px, 26vw);">
          <img
            src={QR_SRC}
            alt="QR code to connect"
            style="width: 100%; height: 100%; object-fit: cover; display: block;"
            draggable={false}
          />
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style="border-top: 1px dashed rgba(0,0,0,0.10); margin: 0 -8px;" />

      {/* ── PLAYER SLOTS ── */}
      <div style="display: flex; gap: 10px; padding-top: 14px; height: clamp(90px, 14vh, 120px);">
        {PLAYERS.map(p => (
          <PlayerSlot
            connected={p.connected}
            name={p.name}
            avatarSrc={p.avatarSrc}
          />
        ))}
      </div>

    </div>
  );
}