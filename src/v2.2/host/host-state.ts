/**
 * Host State Bridge
 *
 * Bridges the existing host runtime (PlayerManager, Player, Heartbeat)
 * with the new Solid UI by exposing:
 * - QR code text (peer ID)
 * - Player slots with connection state and avatars
 * - Game list data
 * - Settings persistence stubs
 * - Action handlers (import/delete game, disconnect player, etc.)
 */

import { createSignal } from 'solid-js'
import PlayerManager from './player-manager'

// ─────────────────────────────────────────────────────────────────────
// Signals for UI reactivity
// ─────────────────────────────────────────────────────────────────────

export const [qrCodeText, setQrCodeText] = createSignal<string>('')
export const [playerSlots, setPlayerSlots] = createSignal<Array<{
  id: number
  slot: number
  name: string
  connected: boolean
  health: 'healthy' | 'sick' | 'dead'
  avatarSrc: string | null
}>>([
  { id: 1, slot: 0, name: 'Player 1', connected: false, health: 'dead', avatarSrc: null },
  { id: 2, slot: 1, name: 'Player 2', connected: false, health: 'dead', avatarSrc: null },
  { id: 3, slot: 2, name: 'Player 3', connected: false, health: 'dead', avatarSrc: null },
  { id: 4, slot: 3, name: 'Player 4', connected: false, health: 'dead', avatarSrc: null },
])

export const [gameList, setGameList] = createSignal<any[]>([])
export const [remoteVersions, setRemoteVersions] = createSignal<{ remote?: string; software?: string; api?: string }>({})
export const [videoQuality, setVideoQuality] = createSignal<number>(2) // 0-3
export const [audioLevel, setAudioLevel] = createSignal<number>(75) // 0-100

// ─────────────────────────────────────────────────────────────────────
// Initialize host state bridge
// ─────────────────────────────────────────────────────────────────────

export function initializeHostState() {
  // Load versions from window global (set by bootstrap.ts)
  const versionElem = document.getElementById('version')
  if (versionElem?.textContent) {
    const lines = versionElem.textContent.split('<br>')
    setRemoteVersions({
      remote: lines[0]?.match(/v([\d.]+)/)?.[1],
      software: lines[1]?.match(/v([\d.]+)/)?.[1],
      api: lines[2]?.match(/v([\d.]+)/)?.[1],
    })
  }

  // Patch PlayerManager to notify us of QR code changes
  const originalSetQrCode = (PlayerManager as any).setQrCode
  if (originalSetQrCode) {
    (PlayerManager as any).setQrCode = function (id: string | false) {
      if (id) {
        let url = new URL(`../?id=${id}`, location.href)
        url.host = 'r.box.beckersuite.com'
        url.port = ''
        console.log('Setting QR code URL to:', url.href);
        setQrCodeText(url.href)
      }
      return originalSetQrCode.call(this, id)
    }
  }

  // Load initial game list
  loadGames()
}

// ─────────────────────────────────────────────────────────────────────
// Player slot management
// ─────────────────────────────────────────────────────────────────────

export function setPlayerSlot(slot: number, data: {
    slot: number
    name?: string
    connected?: boolean
    health?: 'healthy' | 'sick' | 'dead'
    avatarSrc?: string | null
}) {
  setPlayerSlots((prev) =>
    prev.map((s) => (s.slot === slot ? { ...s, ...data } : s))
  )
}

// ─────────────────────────────────────────────────────────────────────
// Game management
// ─────────────────────────────────────────────────────────────────────

export async function loadGames() {
  try {
    const games = await window.electron?.gameManager?.getGames?.()
    if (games) {
      setGameList(games)
    }
  } catch (e) {
    console.error('Failed to load games:', e)
  }
}

export async function deleteGame(gameId: string) {
  const confirmed = await window.JSAlert?.confirm?.(
    'Are you sure you want to delete this game?<br><br><b>Note:</b> Your progress will NOT be lost, but the game disc file itself will be deleted',
    'Delete Game',
    window.JSAlert?.Icons?.Warning,
  )
  if (!confirmed) return

  const result = await window.electron?.gameManager?.deleteGame?.(gameId)
  if (!result?.success) {
    window.JSAlert?.alert?.(result?.error ?? 'Failed to delete game. Please try again.', 'Error')
    return
  }

  await loadGames()
}

export async function importGame() {
  const loader = document.querySelector('.loader-container') as HTMLElement
  const msg = document.querySelector('.loader-container .msg') as HTMLElement
  if (loader) loader.classList.add('active')
  if (msg) msg.innerText = ''

  try {
    const gameSelection = await window.electron?.gameManager?.selectGameFile?.()
    if (!gameSelection?.success) return

    const installResult = await window.electron?.gameManager?.installNewGame?.(
      gameSelection.filePath,
      (status: string) => {
        if (msg) msg.innerText = status
      },
    )

    if (!installResult?.success) {
      alert('Failed to install game. Please try again.')
      return
    }

    await loadGames()
  } catch {
    alert('An error occurred while importing the game. Please try again.')
  } finally {
    if (loader) loader.classList.remove('active')
  }
}

export async function launchGame(gameId: string) {
  // Trigger the game menu's game launch action
  const gameMenu = window.GameMenu
  if (gameMenu && gameMenu.launch) {
    gameMenu.launch(gameId)
  }
}

// ─────────────────────────────────────────────────────────────────────
// Settings persistence stubs (placeholders for now)
// ─────────────────────────────────────────────────────────────────────

export async function saveSettings() {
  // TODO: persist to window.electron or local storage
  // For now, just keep in memory signals
}

export async function loadSettings() {
  // TODO: load from window.electron or local storage
  // For now, use defaults
}

// ─────────────────────────────────────────────────────────────────────
// Player action handlers
// ─────────────────────────────────────────────────────────────────────

export function disconnectPlayer(slot: number) {
  const player = (PlayerManager as any).players?.[slot]
  if (player) {
    (PlayerManager as any).removePlayer(slot)
  }
}
