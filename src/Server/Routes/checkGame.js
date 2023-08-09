const { Route } = require('../../Structures');

class StartGame extends Route {
    constructor(server) {
        super(server, '/checkGame', 'get')
    }

    async callback(req, res) {

        const { id, user, access_token } = req.query;

        if (!id) return res.json({ error: 'No id provided' });

        if (!user) return res.json({ error: 'No user provided' });

        const game = this.client.games.get(id);

        if (!game) return res.json({ error: 'No game founde' });

        if (!game.users.has(user)) return res.json({ status: false });

        return res.json({ status: true });
    }
}

module.exports = StartGame;