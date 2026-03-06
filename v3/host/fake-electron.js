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
        getDiscList: () => {
            return Promise.resolve([
                {
                    name: 'Name of Game Here',
                    path: ''
                },
                {
                    name: 'Name of Game Here',
                    path: ''
                },
                {
                    name: 'Name of Game Here',
                    path: ''
                },
                {
                    name: 'Name of Game Here',
                    path: ''
                },
                {
                    name: 'You get the idea...',
                    path: ''
                }
            ]);
        },
        changeDisc: (path) => {
            a('Change Disc', 'After purchasing BeckerBox, this would change the current disc to what you just selected.');
        },
        powerOff: () => {
            a('Power Off', 'After purchasing BeckerBox, this would power off BeckerBox, and any running software.');
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