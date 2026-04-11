import Player from './player.js';

// manage players
const PlayerManager = new (class PlayerManager {
    #backendActivatedPlayers = [false, false, false, false];
    constructor() {
        this.players = [null, null, null, null];

        this.pointerClicks = [false, false, false, false];
    }
    #setQrCode(id, selector='#qrcode') {
        document.querySelector(selector).innerHTML = '<div class="loader"></div>';
        if (id === false) return;

        let el = document.querySelector(selector);
        if (!el)
            return console.error('Could not find QR code element with selector', selector);

        const {width, height} = el.getBoundingClientRect();

        new QRCode(document.querySelector(selector), {
            text: new URL('../?id='+id, location.href).href,
            width: width,
            height: height,
            colorDark : '#000000',
            colorLight : '#ffffff',
            correctLevel : QRCode.CorrectLevel.H
        });
        console.log('Set QR code with ID:', id);
    }
    init() {
        // tell the backend that we are ready
        window.electron?.init();

        this.#managePeerServer();
    }
    #managePeerServer() {
        // reconnect function
        let reconnectCount = 5;
        const reconnect = (reconnectIn=3000) => {
            console.warn('disconnected from and/or can\'t connect to peer server.');
            // if haven't tried reconnecting enough times, do that
            if (reconnectCount > 0) {
                console.log('attempting "reconnect" ' + reconnectCount);
                
                reconnectCount--;
                this.peer.reconnect();
                return;
            }

            // can't re-connect. Just restart the connection
            clearInterval(subIntervalFunction);
            this.peer?.destroy();

            setTimeout(() => this.#managePeerServer(), reconnectIn);
        }
        console.log('connecting to peer server...');
        this.#setQrCode(false);
        
        
        const serverDisconnectTimeout = 10000;
        let currentDisconnectTimeout = serverDisconnectTimeout;

        // setup peer
        this.peer = new Peer(null, {
            host: 'peerjs.beckersuite.com',
            secure: true
        });
        this.peer.on('error', () => reconnect());
        this.peer.on('open', (id) => {
            this.#setQrCode(id);
            this.alertNewCode(id);

            // for now on...
            let onMessage = this.peer._socket._socket.onmessage
            this.peer._socket._socket.onmessage = (e) => {
                onMessage(e);
                currentDisconnectTimeout = serverDisconnectTimeout;
            }
        });
        this.peer.on('disconnect', () => reconnect());
        this.peer.on('connection', (conn) => this.#addNewPhone(conn) );

        let subIntervalFunction;
        let subIntervalTimeout = 1000;

        subIntervalFunction = setInterval(() => {

            currentDisconnectTimeout -= subIntervalTimeout;
            if (currentDisconnectTimeout > 0) return;

            // the connection has timed out
            reconnect(1);

        }, subIntervalTimeout)
    }
    async #addNewPhone(conn) {
        let slot = null;
        
        // check if this peer id is already in use
        let existing = this.players.find(p => p && p.conn.peer == conn.peer);
        if (existing) {
            this.removePlayer(existing.slot);
            slot = existing.slot;
        } else {
            // ask peer if it has a preferred slot
            let preferredSlot = await this.#getResultFromConnection(conn, { getPreferredSlot: true }).catch(() => null);
            console.log('Preferred slot from peer', conn.peer, ':', preferredSlot);

            // check if preferred slot is available and activated by backend
            if (
                (this.players[preferredSlot] === null || this.players[preferredSlot] === undefined || this.players[preferredSlot].health === 'sick' || this.players[preferredSlot].health === 'dead') &&
                (this.#backendActivatedPlayers[preferredSlot] === true)
            ) {
                this.removePlayer(preferredSlot);
                slot = preferredSlot;
            }
        }
        
        
        // if no slot assigned yet, ask backend for available slot
        if (slot === null || slot === undefined) {
            slot = await window.electron?.addPlayer();

            // mark slot as activated by backend
            if (slot !== null && slot !== undefined)
                this.#backendActivatedPlayers[slot] = true;
        }

        // if still null or undefined, no slots are available
        if (slot === null || slot === undefined) {
            slot = null;
            console.log('All slots taken');
            setTimeout(() => conn.send({slot: slot}), 500);
            return;
        }

        console.log(`Connecting peer ${conn.peer} to slot ${slot}`);
        // console.log(conn);
        this.players[slot] = new Player(slot, conn, this);
        conn.on('close', () => this.removePlayer(slot));
        // console.log(this.players);
    }
    removePlayer(slot) {
        this.players[slot]?.remove();
        this.players[slot] = null;
        window.electron?.removePlayer(slot);

        // mark slot as deactivated by backend
        this.#backendActivatedPlayers[slot] = false;
    }
    alertPowerOff() {
        this.players.forEach(p => p?.alertPowerOff());
    }
    alertNewCode(code) {
        this.players.forEach(p => p?.alertNewCode(code));
    }

    
	async #getResultFromConnection(conn, toSend, timeout=2000) {
        // wait until connection is open
        await new Promise(resolve => {
            if (conn.open) resolve();
            else conn.on('open', resolve);
        });

        // send request and wait for result
		return new Promise((resolve, reject) => {
			let gotData = false;
			const handleData = (data) => {
				if (data.result===undefined) return;
				gotData = true;
				conn.off('data', handleData);
				resolve(data.result);
			}
			conn.send(toSend);
			conn.on('data', handleData);

			setTimeout(() => {
				if (gotData) return;
				conn.off('data', handleData);
				reject(false);
			}, timeout);
		});
	}
})();

export default PlayerManager;