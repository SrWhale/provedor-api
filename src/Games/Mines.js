const { Game } = require('../Structures');

const { Collection } = require('@discordjs/collection');

const { Session } = require('../Structures');

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

    async create(req, res) {

        const { user, access_token } = req.query;

        const session = this.sessions.find(s => s.user === user && s.access_token === access_token);

        if (session) return res.json({ error: 'Game alreads exist' });

        const newS = new Session(this, user, access_token);

        this.sessions.set(user, newS);

        return true
    }

    async createGame(req, res) {
        const { user, mines, access_token } = req.query;

        const session = this.sessions.find(s => s.user === user && s.access_token === access_token);

        if (!session) return res.json({ error: 'Invalid access token' });

        if (session.game) return res.json({ error: 'User already in game', lastGrid: session.game.grid.reduce((a, b) => a.concat(b), []).map(g => g.open ? 1 : 0) });

        const grid = await this.generateMine({
            rows: 5,
            columns: 5,
            mines: mines
        });

        session.game = { grid, user, access_token };

        return res.json({ success: true });
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
            }
        ]
    }

    async openMine(req, res) {
        const { user, row, column, access_token } = req.query;

        const session = this.sessions.find(s => s.user === user && s.access_token === access_token);

        if (!session) return res.json({ error: 'Invalid access token' });

        if (!session.game) return res.json({ error: 'No game found' });

        const game = session.game;

        if (!game.grid[row]) return res.json({ error: 'No row found' });

        if (!game.grid[row][column]) return res.json({ error: 'No column found' });

        const grid = game.grid[row][column];

        if (grid.open) return res.json({ error: 'Mine already open' });

        grid.open = true;

        if (grid.number === 1) session.game = null;

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