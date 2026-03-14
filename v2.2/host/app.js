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
            name: 'Super Mario Odyssey',
            gameId: 'sm64o',
        },
        {
            name: 'The Legend of Zelda: Breath of the Wild',
            gameId: 'botw',
        }
    ];
    const menu = GameMenu.create(null, games, {
        mode: 'host',
    });
    // menu.destroy();
}


window.importNewGame = async (importBtn) => {
    importBtn.disabled = true;
    document.querySelector('.loader-container').classList.add('active');
    document.querySelector('.loader-container .msg').innerText = '';

    try {
        let gameSelection = await window.electron.gameManager.selectGameFile();
        if (!gameSelection.success) {
            alert('Failed to select game file. Please try again.');
            return;
        }
        const { filePath } = gameSelection;
        document.querySelector('.loader-container .msg').innerText = 'Installing game...';

        let installResult = await window.electron.gameManager.installNewGame(filePath);
        if (!installResult.success) {
            alert('Failed to install game. Please try again.');
            return;
        }
    } catch (error) {
        console.error('Error occurred while importing new game:', error);
        alert('An error occurred while importing the game. Please try again.');
    }
    finally {
        importBtn.disabled = false;
        document.querySelector('.loader-container').classList.remove('active');
    }

    alert('Game installed successfully!');
}