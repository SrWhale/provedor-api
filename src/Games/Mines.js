const { Game } = require('../Structures');

const { Collection } = require('@discordjs/collection');

const { Session } = require('../Structures');

const { post } = require('axios');

class Mines extends Game {
    constructor(client) {
        super(client);

        this.name = 'Mines';

        this.displayName = "mines";

        this.id = "1";

        this.games = new Collection();

        this.sessions = new Collection();
    }

    async start() {

    }

    async createGame(req, res) {
        const { mines, access_token, provider, value, multiplier } = req.query;

        const session = this.sessions.find(s => s.provider === provider && s.access_token === access_token);

        if (!session) return res.json({ error: 'Invalid access token' });

        if (session.game) return res.json({ error: 'User already in game', lastGrid: session.game.grid.reduce((a, b) => a.concat(b), []).map(g => g.open ? 1 : 0) });

        post(`${this.client.providers[provider].url}/${provider}/apost`, {
            access_token,
            amount: Number(value),
        }).then(async (request) => {
            const grid = await this.generateMine({
                rows: 5,
                columns: 5,
                mines: mines
            });

            session.game = { grid, access_token };

            session.apostData = {
                value,
                mines,
                id: request.data.operator_tx_id
            };

            session.save();

            return res.json({ success: true, newBalance: request.data.new_balance });
        }).catch(err => {
            console.log(err)
            return res.json({ error: err.response.data.message });
        })
    };

    get customRoutes() {
        return [
            {
                path: '/mines/openMine',
                method: 'get',
                callback: this.openMine.bind(this)
            }, {
                path: '/mines/newGame',
                method: 'get',
                callback: this.createGame.bind(this)
            }, {
                path: '/mines/checkGame',
                method: 'get',
                callback: this.checkGame.bind(this)
            }, {
                path: '/mines/endGame',
                method: 'get',
                callback: this.endGame.bind(this)
            }
        ]
    }

    async endGame(req, res) {
        const { access_token, provider } = req.query;

        const session = this.sessions.find(s => s.provider === provider && s.access_token === access_token);

        if (!session) return res.json({ error: 'Invalid access token' });

        if (!session.game) return res.json({ error: 'No game found' });

        const game = session.game;

        const providerUrl = this.client.providers[provider]
        console.log(session.apostData.mines)
        const PROBABILITY = (25 - Number(session.apostData.mines)) / 25;

        const opennedMines = game.grid.reduce((a, b) => a.concat(b), []).filter(g => g.open).length;

        const multiplier = 0.97 / Math.pow(PROBABILITY, opennedMines);
        console.log(multiplier, PROBABILITY, opennedMines, session.apostData.value)
        const valueToReceive = Number(session.apostData.value) * multiplier;
        console.log(valueToReceive)
        post(`${providerUrl.url}/${provider}/rewards`, {
            access_token: access_token,
            transaction_id: session.apostData.id,
            amount: valueToReceive
        }).then(() => {
            session.game = null;

            session.apostData = null;

            session.save();

            return res.json({ success: true, grid: game.grid, receivedValue: valueToReceive });
        }).catch(err => {
            console.log(err)
            return res.json({ error: err.response.data.message });
        })
    }

    async checkGame(req, res) {
        const { access_token, provider } = req.query;

        const session = this.sessions.find(s => s.provider === provider && s.access_token === access_token)

        if (!session) return res.json({ status: false });

        if (!session.game) return res.json({ status: false });

        return res.json({ status: true, game: session.game.grid.reduce((a, b) => a.concat(b), []).map(g => g.open ? 1 : 0) }).end()
    }

    async openMine(req, res) {
        const { row, column, access_token, provider } = req.query;

        const session = this.sessions.find(s => s.provider === provider && s.access_token === access_token);

        if (!session) return res.json({ error: 'Invalid access token' });

        if (!session.game) return res.json({ error: 'No game found' });

        const game = session.game;

        if (!game.grid[row]) return res.json({ error: 'No row found' });

        if (!game.grid[row][column]) return res.json({ error: 'No column found' });

        const grid = game.grid[row][column];

        if (grid.open) return res.json({ error: 'Mine already open' });

        game.grid[row][column].open = true;

        if (grid.number === 1) {
            session.game = null;

            const providerUrl = this.client.providers[provider]

            post(`${providerUrl.url}/${provider}/loses`, {
                access_token: access_token,
                transaction_id: session.apostData.id
            });

            session.apostData = null;
        }

        session.save();

        return res.json({
            result: grid.number === 1 ? 'Mine' : "Win",
            grid: grid.number === 1 ? game.grid : []
        })
    }

    async generateMine({ rows, columns, mines }) {
        const grid = [];

        for (let i = 0; i < rows; i++) {
            grid.push([]);
            for (let j = 0; j < columns; j++) {
                grid[i].push({
                    number: 0,
                    open: false
                });
            }
        };

        for (let i = 0; i < Number(mines); i++) {
            const row = Math.floor(Math.random() * rows);

            const column = Math.floor(Math.random() * columns);

            if (grid[row][column].number === 0) {
                grid[row][column] = {
                    number: 1,
                    open: false
                };
            } else {
                i--;
            }
        };

        return grid
    }
}

module.exports = Mines