window.DEMOMODE = !window.location.host.startsWith('localhost') && (!window.electron || window.electron.FAKE);

if (window.DEMOMODE) {
    console.warn('Running in demo mode. This is not intended for production use and may not work as expected.');
    document.getElementById('demo-mode-stamp').style.display = 'block';
}

// set version info
window.electron && window.electron.info.getVersions().then(versions => {
    document.getElementById('version').innerHTML = [
        'Remote: v' + versions.remote,
        'Software: v' + versions.software,
        'API: v' + versions.api
    ].join('<br>');
});


import PlayerManager from './player_manager.js';
import scaleScreenToFit from './scale-screen.js';
scaleScreenToFit();


window.electron?.init();
PlayerManager.init();


window.PlayerManager = PlayerManager;

window.startWii = (startBtn) => {
    window.electron.startWii();
    startBtn.disabled = true;
};

let gamesList = [];

const gameMenu = GameMenu.create({
    games: gamesList,
    mode: 'host',
    gamesSelectable: false,
    showGameNames: false,
    onImport: () => importNewGame(),
    onDelete: (game) => deleteGame(game?.gameId)
});
await updateGames();

window.openGameMenu = async () => {
    await updateGames();
    gameMenu.open();
}

async function updateGames() {
    let games = await electron.gameManager.getGames();
    gameMenu.updateGames(games);
}


const importNewGame = async () => {
    document.querySelector('.loader-container').classList.add('active');
    document.querySelector('.loader-container .msg').innerText = '';

    try {
        let gameSelection = await window.electron.gameManager.selectGameFile();
        if (!gameSelection.success)
            return;
        
        const { filePath } = gameSelection;
        document.querySelector('.loader-container .msg').innerText = '';

        let installResult = await window.electron.gameManager.installNewGame(filePath, (status) => {
            document.querySelector('.loader-container .msg').innerText = status;
        });
        if (!installResult.success) {
            alert('Failed to install game. Please try again.');
            return;
        }
        
        await updateGames();
    } catch (error) {
        console.error('Error occurred while importing new game:', error);
        alert('An error occurred while importing the game. Please try again.');
    }
    finally {
        document.querySelector('.loader-container').classList.remove('active');
    }
}
const deleteGame = async (gameId) => {
    if (!gameId) {
        console.error('Invalid game ID');
        return;
    }
    let confirmed = await JSAlert.confirm('Are you sure you want to delete this game?<br><br><b>Note:</b> Your progress will NOT be lost, but the game disc file itself will be deleted', 'Delete Game', JSAlert.Icons.Warning);
    if (!confirmed) return;

    let result = await window.electron.gameManager.deleteGame(gameId);

    if (!result.success) {
        JSAlert.alert(result.error ?? 'Failed to delete game. Please try again.', 'Error');
        return;
    }
    await updateGames();
}