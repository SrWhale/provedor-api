const { Route, Session } = require('../../Structures');

class StartGame extends Route {
    constructor(server) {
        super(server, '/startGame', 'get')
    }

    async callback(req, res) {

        const { id, user, access_token } = req.query;

        if (!id) return res.json({ error: 'No id provided' });

        if (!user) return res.json({ error: 'No user provided' });

        if (!access_token) return res.json({ error: 'No access token provided' });

        const game = this.client.games.get(id);

        if (!game) return res.json({ error: 'No game founde' });

        const check = game.sessions.find(s => s.user === user && s.access_token === access_token);

        if (check) return res.json({ error: 'User already in game' });

        const session = new Session(game, user, access_token);

        session.start();

        game.sessions.set(user, session);

        const params = new URLSearchParams({ user, access_token });

        const url = `${this.client.providerURL}/${game.displayName}?${params}`;

        return res.json({ success: true, url });
    }
}

module.exports = StartGame;