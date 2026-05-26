/**
 * ConnectionView - default main ticket view.
 * Shows QR code + player slots. No footer (software info is Settings-only).
 */
import { For, Switch, Match } from 'solid-js';
import PlayerSlot from '../components/PlayerSlot';
import * as Overlay from '../components/Overlay';
import Button from '../components/Button';

async function onStartClick(e) {
  window.PlayerManager.setMenuOpen(false);
}

async function goHome() {
  window.electron.goHome();
  window.PlayerManager.setMenuOpen(false);
}

async function powerOff() {
  window.PlayerManager.powerOff();
}

export default function ConnectionView(props) {
  return (
    <div style="display: flex; flex-direction: column; height: calc(100% - 24px); padding: 20px 40px 24px;">

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
        <div style="background: white; border-radius: 20px; overflow: hidden; border: 6px solid white; box-shadow: 0 4px 20px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.05); aspect-ratio: 1; height: min(450px, 30vh);">
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
        justify-content: space-around;
        gap: 16px;
        transform: translateY(8px);
      `}>
        <Switch>
          <Match when={!Overlay.hasBeenClosed()}>
            <Button onClick={onStartClick}>
                Start
            </Button>
          </Match>
          <Match when={Overlay.hasBeenClosed()}>
            <Button
                onClick={() => Overlay.openAlert({
                    title: 'Power Off Console?',
                    message: 'This will power off the host console.',
                    buttons: [
                        { label: 'Cancel', onClick: Overlay.closeAlert },
                        { label: 'Power Off', onClick: () => { Overlay.closeAlert(); powerOff(); } },
                    ],
                })}
            >
                Power Off
            </Button>
            <Button
                onClick={() => Overlay.openAlert({
                    title: 'Go Home?',
                    message: 'This will return to the home screen.',
                    buttons: [
                        { label: 'Cancel', onClick: Overlay.closeAlert },
                        { label: 'Go Home', onClick: () => { Overlay.closeAlert(); goHome(); } },
                    ],
                })}
            >
                Go Home
            </Button>
          </Match>
        </Switch>
      </div>

      {/* ── DIVIDER ── */}
      {/* <div style="border-top: 2px dashed rgba(0,0,0,0.10); margin: 0 -8px;" /> */}

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
