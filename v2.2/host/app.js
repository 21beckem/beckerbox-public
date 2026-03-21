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


window.openGameMenu = () => {
    const games = [
        {
            name: 'Wii Sports',
            gameId: 'RSPE01',
            coverUrl: 'https://art.gametdb.com/wii/cover3D/US/RSPE01.png'
        },
        {
            name: 'Wii Sports Resort',
            gameId: 'RZTE01',
            coverUrl: 'https://art.gametdb.com/wii/cover3D/US/RZTE01.png'
        }
    ];
    const menu = GameMenu.create({
        games,
        mode: 'host',
        gamesSelectable: false,
        showGameNames: false,
        onImport: () => importNewGame()
    });

    menu.open();
}


const importNewGame = async () => {
    document.querySelector('.loader-container').classList.add('active');
    document.querySelector('.loader-container .msg').innerText = '';

    try {
        let gameSelection = await window.electron.gameManager.selectGameFile();
        if (!gameSelection.success) {
            alert('Failed to select game file. Please try again.');
            return;
        }
        const { filePath } = gameSelection;
        document.querySelector('.loader-container .msg').innerText = '';

        let installResult = await window.electron.gameManager.installNewGame(filePath, (status) => {
            document.querySelector('.loader-container .msg').innerText = status;
        });
        if (!installResult.success) {
            alert('Failed to install game. Please try again.');
            return;
        }
    } catch (error) {
        console.error('Error occurred while importing new game:', error);
        alert('An error occurred while importing the game. Please try again.');
    }
    finally {
        document.querySelector('.loader-container').classList.remove('active');
    }

    alert('Game installed successfully!');
}