/**
 * Overlay - orchestrates the full UI:
 *  • Main ticket (always centered, 70vw × 80vh)
 *  • Settings panel (slides in from LEFT, 44vw × 80vh, notch on right)
 *  • Library panel  (slides in from RIGHT, 44vw × 80vh, notch on left)
 *  • Side buttons   (fixed to left/right screen edges, vertically centered)
 *
 * When a side panel is open:
 *  - Main ticket scales to 92% and darkens via an inner overlay div
 *  - Side panel slides in front from off-screen
 *
 * Nothing is ever added/removed from the DOM — only transforms & opacity change.
 */
import { createSignal, onMount } from 'solid-js';
import TicketWrapper from './TicketWrapper';
import SideButton from './SideButton';
import { GearIcon, LibraryIcon } from './Icons';
import ConnectionView from '../views/ConnectionView';
import SettingsView from '../views/SettingsView';
import GameLibraryView from '../views/GameLibraryView';

const [isOpen, setIsOpen] = createSignal(false);
// 'main' | 'settings' | 'library'
const [activeView, setActiveView] = createSignal('main');

export const goBack = () => setActiveView('main');
export const setOpen = (open) => {
  if (typeof open === 'function') {
    setOpen(open(isOpen()));
    return;
  }
  goBack();
  setIsOpen(open);
};

export default function Overlay(props) {

  onMount(() => {
    const t = setTimeout(() => setIsOpen(true), 1000);
    return () => clearTimeout(t);
  });

  const sideOpen = () => activeView() !== 'main';

  const toggleView = (view) => {
    setActiveView(prev => prev === view ? 'main' : view);
  };


  return (
    /* ── Backdrop ──────────────────────────────────────────────────────── */
    <div
      style={`
        position: fixed; inset: 0;
        display: flex; align-items: center; justify-content: center;
        transition: background-color 700ms ease, backdrop-filter 700ms ease, -webkit-backdrop-filter 700ms ease;
        background-color: ${isOpen() ? 'rgba(0,0,0,0.40)' : 'rgba(0,0,0,0)'};
        backdrop-filter: blur(${isOpen() ? '5px' : '0px'});
        -webkit-backdrop-filter: blur(${isOpen() ? '5px' : '0px'});
      `}
    >

      {/* ── MAIN TICKET ──────────────────────────────────────────────────── */}
      <div
        style={`
          position: relative;
          width: 70vw;
          height: 80vh;
          z-index: 20;
          transition: transform 500ms cubic-bezier(0.34, 1.05, 0.64, 1), opacity 700ms ease;
          transform: scale(${isOpen() ? (sideOpen() ? 0.92 : 1) : 0.95});
          opacity: ${isOpen() ? 1 : 0};
        `}
      >
        <TicketWrapper notchSide="both">
          <ConnectionView qrCodeText={props.qrCodeText()} playerSlots={props.playerSlots()} onDisconnectPlayer={props.onDisconnectPlayer} />
        </TicketWrapper>

        {/* Dark overlay that fades in when a side panel is active */}
        <div
          style={`
            position: absolute; inset: 0; z-index: 50; pointer-events: none;
            background: rgba(0,0,0,0.38);
            border-radius: 20px;
            transition: opacity 400ms ease;
            opacity: ${sideOpen() ? 1 : 0};
          `}
        />
      </div>

      {/* ── SETTINGS PANEL — slides from the LEFT ──────────────────────── */}
      <div
        style={`
          position: fixed;
          top: 50%;
          left: 0;
          width: 44vw;
          height: 80vh;
          z-index: 30;
          transition: transform 480ms cubic-bezier(0.34, 1.1, 0.64, 1);
          transform: translateY(-50%) translateX(${activeView() === 'settings' && isOpen() ? '0px' : 'calc(-100% - 20px)'});
          filter: drop-shadow(6px 0 28px rgba(0,0,0,0.42));
        `}
      >
        <TicketWrapper notchSide="right">
          <div style="opacity: 0; pointer-events: none; position: absolute; inset: 0;" aria-hidden={activeView() !== 'settings'} />
          <div
            style={`
              position: relative; width: 100%; height: 100%;
              opacity: ${activeView() === 'settings' ? 1 : 0};
              pointer-events: ${activeView() === 'settings' ? 'auto' : 'none'};
              transition: opacity 200ms ease;
            `}
          >
            <SettingsView onBack={goBack} videoQuality={props.videoQuality} audioLevel={props.audioLevel} onVideoQualityChange={props.onVideoQualityChange} onAudioLevelChange={props.onAudioLevelChange} remoteVersions={props.remoteVersions} />
          </div>
        </TicketWrapper>
      </div>

      {/* ── LIBRARY PANEL — slides from the RIGHT ─────────────────────── */}
      <div
        style={`
          position: fixed;
          top: 50%;
          right: 0;
          width: 44vw;
          height: 80vh;
          z-index: 30;
          transition: transform 480ms cubic-bezier(0.34, 1.1, 0.64, 1);
          transform: translateY(-50%) translateX(${activeView() === 'library' && isOpen() ? '0px' : 'calc(100% + 20px)'});
          filter: drop-shadow(-6px 0 28px rgba(0,0,0,0.42));
        `}
      >
        <TicketWrapper notchSide="left">
          <div
            style={`
              position: relative; width: 100%; height: 100%;
              opacity: ${activeView() === 'library' ? 1 : 0};
              pointer-events: ${activeView() === 'library' ? 'auto' : 'none'};
              transition: opacity 200ms ease;
            `}
          >
            <GameLibraryView onBack={goBack} gameList={props.gameList} onDeleteGame={props.onDeleteGame} onImportGame={props.onImportGame} onLaunchGame={props.onLaunchGame} />
          </div>
        </TicketWrapper>
      </div>

      {/* ── LEFT SIDE BUTTON (Settings) — fixed, vertically centered ───── */}
      <div style="position: fixed; left: 0; top: 50%; transform: translateY(-50%); z-index: 40;">
        <SideButton
          side="left"
          isActive={activeView() === 'settings'}
          onClick={() => toggleView('settings')}
        >
          <GearIcon />
        </SideButton>
      </div>

      {/* ── RIGHT SIDE BUTTON (Library) — fixed, vertically centered ───── */}
      <div style="position: fixed; right: 0; top: 50%; transform: translateY(-50%); z-index: 40;">
        <SideButton
          side="right"
          isActive={activeView() === 'library'}
          onClick={() => toggleView('library')}
        >
          <LibraryIcon />
        </SideButton>
      </div>

    </div>
  );
}