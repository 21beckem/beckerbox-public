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