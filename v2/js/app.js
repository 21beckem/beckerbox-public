import GoogleAnalytics from './google-an.js';
GoogleAnalytics.init();
import { Remote } from './remote.js';
import { startBeckerboxTour } from './tutorial.js';

window.remote = null;
window.refreshConnection = (code=null, force=true) => {
    if (force) return window.location.reload();
    window.remote?.destroy();
    window.remote = new Remote(code);
};
window.refreshConnection(null, false);
window.disconnectRemote = () => {
    window.remote?.destroy();
    window.remote = null;
};
startBeckerboxTour();