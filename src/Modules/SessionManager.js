const { Session } = require('../Structures');

class SessionManager {
    constructor(client) {
        this.client = client
    }

    async start() {
        const sessions = await this.client.database.db('provedor').collection('sessions').find({}).toArray();

        for (const s of sessions) {

            const game = this.client.games.find(g => g.displayName === s.gameName);

            new Session(game, s.access_token, s.provider, true, s.uuid, s.createdAt, s.game, s.apostData);
        }
    }
}

module.exports = SessionManager