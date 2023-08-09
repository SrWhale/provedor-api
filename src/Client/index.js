const { Collection } = require('@discordjs/collection');

const { readdirSync } = require('fs');

const Server = require('../Server');

class Client {
    constructor() {
        this.games = new Collection();

        this.sessions = new Collection();
    }

    async start() {
        this.startServer();

        this.loadGames();

        this.providerURL = 'http://localhost:3000'
    }

    async startServer() {
        this.server = new Server(this);

        this.server.start();
    }

    async loadGames() {
        readdirSync('./src/Games').forEach(async file => {
            const Game = require(`../Games/${file}`);

            const game = new Game(this);

            for (const route of game.customRoutes) {
                this.server.createCustomRoute(route);
            };

            game.start();

            this.games.set(game.id, game);
        })
    }
}

module.exports = Client