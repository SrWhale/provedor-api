const { Game } = require('../Structures');

const { Collection } = require('@discordjs/collection');

const { Server } = require('ws');

const express = require('express');

const app = express();

class Double extends Game {
    constructor(client) {
        super(client);

        this.name = 'Double';

        this.displayName = "double";

        this.id = "2";

        this.socket = new Server({ path: '/double', server: this.client.server.app });

        this.history = [];

        this.dices = [];

        this.state = 'stopped';

        this.now = null;
    }

    async start() {
        this.listen();

        this.startRoll()
    };

    async loadDices() {
        this.dices = [];

        for (let i = 0; i < 20; i++) {
            const obj = { number: i, color: 'red' };

            const obj2 = { number: i, color: 'black' };

            this.dices.push(obj, obj2);
        };

        for (let i = 0; i < 4; i++) {
            const obj = { number: 0, color: 'white' };

            this.dices.push(obj);
        };

        this.dices = this.dices.sort(() => Math.random() - 0.5);
    }

    async startRoll() {
        this.loadDices();

        this.doRoll();
    }

    async doRoll() {
        let rollDuration = 10000;

        this.state = 'rolling';

        const rollInterval = setInterval(() => {
            if (rollDuration <= 0) {
                clearInterval(rollInterval);

                this.state = 'stopped';

                this.history.unshift(this.dices[this.now]);

                this.broadCast(JSON.stringify({
                    state: this.state,
                    now: this.dices[this.now],
                }));

                this.now = null;

                let stoppedTimeout = 5000;

                const stoppedInterval = setInterval(() => {
                    if (stoppedTimeout <= 0) {
                        clearInterval(stoppedInterval);

                        this.state = 'waiting';

                        let waitTimeout = 15000;

                        const waitInterval = setInterval(() => {
                            if (waitTimeout <= 0) {
                                clearInterval(waitInterval);

                                this.startRoll();
                            } else {
                                waitTimeout -= 200;

                                this.broadCast(JSON.stringify({
                                    state: this.state,
                                    waitTimeout
                                }))
                            }

                        }, 200)
                    } else {
                        stoppedTimeout -= 200;

                        this.broadCast(JSON.stringify({
                            state: this.state,
                            now: this.history[0]
                        }))
                    }
                }, 200)
            } else {
                rollDuration -= 200;

                this.now = this.dices[this.now + 1] ? this.now + 1 : 0;

                this.broadCast(JSON.stringify({
                    state: this.state,
                    now: this.dices[this.now]
                }));
            }
        }, 100)
    }

    async broadCast(data) {
        this.socket.clients.forEach(client => {
            client.send(data);
        })
    }

    async listen() {
        this.socket.on('connection', (ws) => {
            let lastPing = Date.now();

            ws.on('message', (message) => {
                const data = JSON.parse(message);

                if (data.type === 'ping') {
                    ws.send(JSON.stringify({
                        type: 'pong'
                    }));

                    lastPing = Date.now();
                }
            })
            setInterval(() => {
                if (Date.now() - lastPing > 60000 * 6) {
                    ws.send(JSON.stringify({
                        type: 'close'
                    }))
                    ws.terminate()
                }
            }, 60000 * 5);

            ws.send(JSON.stringify({
                type: 'history',
                data: this.history
            }));

            ws.send(JSON.stringify({
                type: 'dices',
                data: this.dices
            }))
        })
    }

    get customRoutes() {
        return []
    }
}

module.exports = Double