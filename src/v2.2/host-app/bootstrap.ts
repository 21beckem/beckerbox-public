import PlayerManager from './player-manager'
import scaleScreenToFit from './scale-screen'

window.DEMOMODE = !window.location.host.startsWith('localhost') && (!window.electron || window.electron.FAKE)

if (window.DEMOMODE) {
  const stamp = document.getElementById('demo-mode-stamp')
  if (stamp) stamp.style.display = 'block'
}

window.electron?.info.getVersions().then((versions: any) => {
  const version = document.getElementById('version')
  if (!version) return
  version.innerHTML = [`Remote: v${versions.remote}`, `Software: v${versions.software}`, `API: v${versions.api}`].join('<br>')
})

scaleScreenToFit()
window.electron?.init()
PlayerManager.init()
window.PlayerManager = PlayerManager

window.startWii = (startBtn: HTMLButtonElement) => {
  window.electron.startWii()
  startBtn.disabled = true
}

const gameMenu = window.GameMenu.create({
  games: [],
  mode: 'host',
  gamesSelectable: false,
  showGameNames: false,
  onImport: () => importNewGame(),
  onDelete: (game: any) => deleteGame(game?.gameId),
})

window.openGameMenu = async () => {
  await updateGames()
  gameMenu.open()
}

async function updateGames() {
  const games = await window.electron.gameManager.getGames()
  gameMenu.updateGames(games)
}

const importNewGame = async () => {
  const loader = document.querySelector('.loader-container') as HTMLElement
  const msg = document.querySelector('.loader-container .msg') as HTMLElement
  loader.classList.add('active')
  msg.innerText = ''

  try {
    const gameSelection = await window.electron.gameManager.selectGameFile()
    if (!gameSelection.success) return

    const installResult = await window.electron.gameManager.installNewGame(gameSelection.filePath, (status: string) => {
      msg.innerText = status
    })

    if (!installResult.success) {
      alert('Failed to install game. Please try again.')
      return
    }

    await updateGames()
  } catch {
    alert('An error occurred while importing the game. Please try again.')
  } finally {
    loader.classList.remove('active')
  }
}

const deleteGame = async (gameId?: string) => {
  if (!gameId) return

  const confirmed = await window.JSAlert.confirm(
    'Are you sure you want to delete this game?<br><br><b>Note:</b> Your progress will NOT be lost, but the game disc file itself will be deleted',
    'Delete Game',
    window.JSAlert.Icons.Warning,
  )
  if (!confirmed) return

  const result = await window.electron.gameManager.deleteGame(gameId)
  if (!result.success) {
    window.JSAlert.alert(result.error ?? 'Failed to delete game. Please try again.', 'Error')
    return
  }

  await updateGames()
}

void updateGames()
