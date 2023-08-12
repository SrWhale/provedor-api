const { Route } = require('../../Structures');

const { get } = require('axios');

class validateProvider extends Route {
    constructor(server) {
        super(server, '/getUserData', 'get')

        this.providers = {
            'betgames': 'http://191.241.144.59:25566/webhooks'
        }
    }

    async callback(req, res) {

        const { provider, access_token } = req.query;

        if (!provider) return res.status(400).json({ error: 'No provider provided' });

        if (!access_token) return res.status(400).json({ error: 'No access_token provided' });

        const providerUrl = this.providers[provider];

        if (!providerUrl) return res.status(400).json({ error: 'No provider found' });

        const check = await get(`${providerUrl}/${provider}/query`, {
            data: {
                access_token
            }
        }, {

        }).catch(err => false);

        if (!check) return res.status(400).json({ error: 'Invalid access token' }).end();

        return res.json(check.data).end()
    }
}

module.exports = validateProvider