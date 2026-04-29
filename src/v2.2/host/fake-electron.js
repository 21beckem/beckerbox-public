if (window.electron === undefined) {
    let a = (title, message) => JSAlert.alert(message, title);
    window.electron = {
        FAKE: true, // used to detect if we're running in fake electron mode
        init: () => {
            return true;
        },
        openGamesFolder: () => {
            a('Open Games Folder', 'After purchasing BeckerBox, this would open the games folder on your computer.');
        },
        addPlayer: () => {
            return PlayerManager.players.indexOf(null);
        },
        removePlayer: (slot) => {
            // do nothing
        },
        sendPacket: (slot, data) => {
            // do nothing
        },
        startWii: () => {
            a('Start Wii', 'After purchasing BeckerBox, this would launch the Wii Menu\u2122. <p style="font-family: sans-serif; font-size:0.8em;">"Wii" is a registered Nintendo trademark. BeckerBox is not affiliated with or endorsed by Nintendo.</p>');
        },
        goHome: () => {
            // do nothing
        },
        changeDisc: (path) => {
            a('Change Disc', 'After purchasing BeckerBox, this would change the current disc to what you just selected.');
        },
        powerOff: () => {
            a('Power Off', 'After purchasing BeckerBox, this would power off BeckerBox, and any running software.');
        },
        gameManager: {
            getGames: () => {
                return [];
            }
        },
        info: {
            getVersions: () => {
                return Promise.resolve({
                    remote: 'X.X.X',
                    software: 'X.X.X',
                    api: 'X.X.X'
                });
            },
            getRemoteHost: () => {
                return Promise.resolve('https://21beckem.github.io/beckerbox-public');
            }
        }
    }
}