(() => {
	let joy;
	function removeJoystick() {
		if (joy) {
			joy.destroy();
			joy = null;
		}
	}
	const dPad = {
		upBtn: document.querySelector('remote.layout-2 .dpad [data-key="PadN"]'),
		leftBtn: document.querySelector('remote.layout-2 .dpad [data-key="PadW"]'),
		rightBtn: document.querySelector('remote.layout-2 .dpad [data-key="PadE"]'),
		downBtn: document.querySelector('remote.layout-2 .dpad [data-key="PadS"]'),
		applyPattern: function(pattern) {
			this.up(pattern[0]);
			this.left(pattern[1]);
			this.right(pattern[2]);
			this.down(pattern[3]);
		},
		up: function(press) {
			if (press && !this.upBtn.classList.contains('pressed'))
				this.upBtn.dispatchEvent(new Event('touchstart'));
			else if (!press && this.upBtn.classList.contains('pressed'))
				this.upBtn.dispatchEvent(new Event('touchend'));
		},
		left: function(press) {
			if (press && !this.leftBtn.classList.contains('pressed'))
				this.leftBtn.dispatchEvent(new Event('touchstart'));
			else if (!press && this.leftBtn.classList.contains('pressed'))
				this.leftBtn.dispatchEvent(new Event('touchend'));
		},
		right: function(press) {
			if (press && !this.rightBtn.classList.contains('pressed'))
				this.rightBtn.dispatchEvent(new Event('touchstart'));
			else if (!press && this.rightBtn.classList.contains('pressed'))
				this.rightBtn.dispatchEvent(new Event('touchend'));
		},
		down: function(press) {
			if (press && !this.downBtn.classList.contains('pressed'))
				this.downBtn.dispatchEvent(new Event('touchstart'));
			else if (!press && this.downBtn.classList.contains('pressed'))
				this.downBtn.dispatchEvent(new Event('touchend'));
		}
	};
	const patternGetter = (() => {
		const degreesFor1ButtonOnly = 65; // must be 0 < x < 90

		// shouldn't have to edit anything below this line when changing the above variable
		const angleOptions = {
			right: [0,0,1,0],
			rightUp: [1,0,1,0],
			up: [1,0,0,0],
			upLeft: [1,1,0,0],
			left: [0,1,0,0],
			leftDown: [0,1,0,1],
			down: [0,0,0,1],
			downRight: [0,0,1,1],
		};
		let a = -(degreesFor1ButtonOnly/2);
		let arr = Object.keys(angleOptions).map((key, i) => {
			a += (i%2 === 0 ? degreesFor1ButtonOnly : (90 - degreesFor1ButtonOnly))
			return {
				angle: a,
				pattern: angleOptions[key]
			}
		});
		// add the first option to the end so that the loop can be simpler
		arr.push({ angle: 360, pattern: angleOptions.right });

		return function(data) {
			if (data.distance < 30 || !data.angle || !data.angle.degree) return [0,0,0,0];
			
			let angle = data.angle.degree;
			if (angle < 0) angle += 360;
			for (let i = 0; i < arr.length; i++) {
				if (angle < arr[i].angle) {
					return arr[i].pattern;
				}
			}
		};
	})();
	function makeJoystick() {
		removeJoystick();
		joy = nipplejs.create({
			zone: document.querySelector('remote.layout-2 .dpad'),
			mode: 'static',
			position: {left: '50%', top: '50%'},
			color: 'gray'
		});

		joy.on('move', (evt, data) => {
			dPad.applyPattern(patternGetter(data));
		});
		joy.on('end', (evt, data) => {
			dPad.applyPattern([0,0,0,0]);
		});
	}
	const remote = document.querySelector('remote.layout-2');
	function restartJoystick() {
		if (remote.checkVisibility()) {
			makeJoystick();
		} else {
			removeJoystick();
		}
	}
	window.addEventListener('resize', restartJoystick);
	let lastVisible = true;
	setInterval(() => {
		if (lastVisible !== remote.checkVisibility()) {
			lastVisible = remote.checkVisibility();
			restartJoystick();
		}
	}, 10);
})();