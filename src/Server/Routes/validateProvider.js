const { Route } = require('../../Structures');

const { get } = require('axios');

class validateProvider extends Route {
    constructor(server) {
        super(server, '/validateProvider', 'get')
    }

    async callback(req, res) {

        const { provider, access_token } = req.query;

        if (!provider) return res.json({ error: 'No provider provided' });

        if (!access_token) return res.json({ error: 'No access_token provided' });

        const providerUrl = this.client.providers[provider];

        if (!providerUrl) return res.json({ error: 'No provider found' });

        const check = await get(`${providerUrl.url}/${provider}/query`, {
            data: {
                access_token
            }
        }).catch(err => false);

        if (!check) return res.status(400).json({ error: 'Invalid access token' }).end();

        return res.json({ success: true }).end()
    }
}

module.exports = validateProvider