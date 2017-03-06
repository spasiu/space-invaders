(() => {
    const audioContext = new AudioContext();

    const isSameColumn = b1 => b2 => Math.abs(b1.center.x - b2.center.x) < b2.size.x;

    const playInvaderSound = () => {
        const audio = audioContext.createOscillator();
        audio.frequency.value = 1400;
        const interval = setInterval(() => audio.frequency.value -= 100, 25)
        setTimeout(() => clearInterval(interval), 250)
        audio.connect(audioContext.destination);
        audio.start();
        audio.stop(audioContext.currentTime + .250);
    }

    const playLaserSound = () => {
        const audio = audioContext.createOscillator();
        audio.frequency.value = 1000;
        const interval = setInterval(() => audio.frequency.value -= 50, 25)
        setTimeout(() => clearInterval(interval), 250)
        audio.connect(audioContext.destination);
        audio.start();
        audio.stop(audioContext.currentTime + .250);
    }

    const playPlayerSound = () => {
        const audio = audioContext.createOscillator();
        audio.frequency.value = 2000;
        const interval = setInterval(() => audio.frequency.value -= 100, 25)
        setTimeout(() => clearInterval(interval), 250)
        audio.connect(audioContext.destination);
        audio.start();
        audio.stop(audioContext.currentTime + .250);
    }

    const colliding = b1 => b2 => b1 !== b2 &&
        b1.center.x < b2.center.x + b2.size.x &&
       b1.center.x + b1.size.x > b2.center.x &&
       b1.center.y < b2.center.y + b2.size.y &&
       b1.size.y + b1.center.y > b2.center.y;

    const filterCollisions = bodies => bodies
        .filter(body => bodies.filter(colliding(body)).length === 0);

    const draw = (screen, body) => {
        const x = body.center.x / 2;
        const y = body.center.y / 2;
        screen.fillRect(x, y, body.size.x, body.size.y);
    };

    const getBullet = (game, center, velocity) => {
        const bullet = {
            game,
            center,
            velocity,
            size: { x: 3, y:3 },
            update() {
                this.center.x += this.velocity.x;
                this.center.y += this.velocity.y;
            },
            draw(screen) {
                draw(screen, this);
            }
        };
        game.bodies.push(bullet);
    };

    const getPlayer = (game) => {
        const player = {
            game,
            size: { x: 15, y:15 },
            center: { x: game.center.x, y:game.size.y - 15},
            update() {
                if (keyboard.isDown(keyboard.left)) {
                    this.center.x -= 2;
                }

                if (keyboard.isDown(keyboard.right)) {
                    this.center.x += 2;
                }

                if (keyboard.isDown(keyboard.shift)) {
                    getBullet(this.game, {
                        x: this.center.x,
                        y: this.center.y - this.size.x
                    }, {
                        x: 0,
                        y: -10
                    });
                    playLaserSound();
                }

                if (keyboard.isDown(keyboard.space)) {
                    getBullet(this.game, {
                        x: this.center.x,
                        y: this.center.y - this.size.x
                    }, {
                        x: 0,
                        y: -6
                    });
                    playPlayerSound();
                }
            },
            draw(screen) {
                draw(screen, this);
            }
        };

        game.bodies.push(player);
    };

    const getInvader = (game, center) => {
        const invader = {
            game,
            center,
            size: { x: 15, y:15 },
            patrolX: 0,
            speedX: .3,
            isInvader: true,
            allClearBelow() {
                return this.game.bodies
                    .filter(body => body.isInvader) // is invader
                    .filter(invader => invader.center.y > this.center.y) // is below
                    .filter(isSameColumn(this)) // is in same column
                    .length === 0;
            },
            update() {
                if (this.patrolX < 0 || this.patrolX > 40) {
                    this.speedX = -this.speedX;
                }

                this.center.x += this.speedX;
                this.patrolX += this.speedX;

                if (Math.random() > .995 && this.allClearBelow()) {
                    getBullet(this.game, {
                        x: this.center.x,
                        y: this.center.y + this.size.x
                    }, {
                        x: 0,
                        y: 2
                    });
                    playInvaderSound();
                }
            },
            draw(screen) {
                draw(screen, this);
            }
        };

        game.bodies.push(invader);
        // game.invaders.push(invader);
    };

    const keyboard = {
        left: 37,
        right: 39,
        space: 32,
        shift: 16,
        state: {},
        isDown(keyCode) {
            return this.state[keyCode] === true;
        }
    };

    window.addEventListener('keydown', e => {
        keyboard.state[e.keyCode] = true;
        if (e.keyCode === 32) {
            // is space
            requestAnimationFrame(() => keyboard.state[32] = false) // prevent beam
            e.preventDefault(); // prevent jumping inpage
        }
    });

    window.addEventListener('keyup', e => {
        keyboard.state[e.keyCode] = false;
    });

    const getGame = (canvasElement) => {
        const screen = canvasElement.getContext('2d');

        const game = {
            bodies: [],
            size: {
                x: screen.canvas.width,
                y: screen.canvas.height
            },
            center: {
                x: screen.canvas.width / 2,
                y: screen.canvas.height / 2
            },
            update() {
                this.bodies = filterCollisions(this.bodies);

                for(body of this.bodies) {
                    body.update()
                }
            },
            draw() {
                screen.clearRect(0, 0, this.size.x, this.size.y)
                for(body of this.bodies) {
                    body.draw(screen)
                }
            }
        }

        getPlayer(game);

        for (let i = 0; i < 24; i++) {
            getInvader(game, {
                x: 60 + i % 8 * 60,
                y: 60 + i % 3 * 60
            });
        }

        const tick = () => {
            game.update()
            game.draw(screen)
            requestAnimationFrame(tick)
        }

        tick();
    }

    getGame(document.getElementById('screen'));    
})();
