const { Collection } = require('@discordjs/collection');

const { readdirSync } = require('fs');

const Server = require('../Server');

const { MongoClient } = require('mongodb');

class Client {
    constructor() {
        this.games = new Collection();

        this.sessions = new Collection();

        this.providers = {
            'betgames': {
                url: 'http://191.241.144.59:25566/webhooks'
            }
        }
    }

    async start() {
        this.startServer();

        this.loadGames();

        this.startDatabase();

        this.loadModules();

        this.providerURL = 'http://191.241.144.59:3000'
    }

    async loadModules() {
        readdirSync('./src/Modules').forEach(async file => {
            const Module = require(`../Modules/${file}`);

            const module = new Module(this);

            module.start();
        })
    };

    async startDatabase() {
        const client = new MongoClient('mongodb+srv://paulo:74zMDoVU7IzB4Byv@cluster0.6mwguxi.mongodb.net/', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        client.connect();

        this.database = client;
    };

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