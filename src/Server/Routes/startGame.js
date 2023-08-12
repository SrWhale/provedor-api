const { Route, Session } = require('../../Structures');

class StartGame extends Route {
    constructor(server) {
        super(server, '/startGame', 'get')
    }

    async callback(req, res) {

        const { id, access_token, provider } = req.query;

        if (!id) return res.status(400).json({ error: 'No id provided' });

        if (!provider) return res.status(400).json({ error: 'No provider provided' });

        if (!access_token) return res.status(400).json({ error: 'No access token provided' });

        const game = this.client.games.get(id);

        if (!game) return res.status(400).json({ error: 'No game founde' });

        const check = game.sessions.find(s => s.provider === provider && s.access_token === access_token);

        const params = new URLSearchParams({ access_token, provider });

        const url = `${this.client.providerURL}/${game.displayName}?${params}`;

        if (check) return res.json({ success: true, url: url, always: true });

        const session = new Session(game, access_token, provider);

        game.sessions.set(session.uuid, session);

        return res.json({ success: true, url });
    }
}

module.exports = StartGame;