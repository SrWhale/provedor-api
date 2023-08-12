const { Collection } = require('@discordjs/collection');

class Game {
    constructor(client) {
        this.client = client;

        this.sessions = new Collection();
    }
}

module.exports = Game;