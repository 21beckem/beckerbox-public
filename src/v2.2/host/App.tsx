/**
 * Host App - New Solid UI
 *
 * Integrates:
 * - New Solid layout (Overlay, ConnectionView, GameLibraryView, SettingsView)
 * - Host runtime (PlayerManager, Player, Heartbeat)
 * - State bridge (QR code, player slots, game list)
 * - Controller/gamepad input support
 */

import { onMount } from 'solid-js'
import type { Component } from 'solid-js'
import { initializeHostState, qrCodeText, playerSlots, gameList, remoteVersions, videoQuality, audioLevel, setVideoQuality, setAudioLevel, deleteGame, importGame, launchGame, saveSettings, disconnectPlayer } from './host-state'

// Import UI components
import Overlay from './components/Overlay'

const App: Component = () => {
  onMount(() => {
    // Initialize the host state bridge after the DOM is ready
    initializeHostState()
  })

  return (
    <>
      {/* ── Root container with wii background ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          'background-color': `transparent`,
          'background-size': '100% 4px, 100% 100%',
          overflow: 'hidden',
          'font-family': 'Nunito, sans-serif',
        }}
      >
        {/* ── Overlay with all views and side panels ── */}
        <Overlay
          qrCodeText={qrCodeText}
          playerSlots={playerSlots}
          gameList={gameList}
          remoteVersions={remoteVersions}
          videoQuality={videoQuality}
          audioLevel={audioLevel}
          onVideoQualityChange={(v: number) => {
            setVideoQuality(v)
            saveSettings()
          }}
          onAudioLevelChange={(a: number) => {
            setAudioLevel(a)
            saveSettings()
          }}
          onDeleteGame={deleteGame}
          onImportGame={importGame}
          onLaunchGame={launchGame}
          onDisconnectPlayer={disconnectPlayer}
        />
      </div>

      {/* ── Loader for game imports ── */}
      <div class="loader-container">
        <div class="loader-wave"></div>
        <div class="msg"></div>
      </div>
    </>
  )
}

export default App
