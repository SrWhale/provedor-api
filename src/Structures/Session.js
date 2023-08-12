const uuid = require('uuid').v4;

class Session {
    constructor(client, access_token, provider, loaded = false, oldUuid = false, created = false, game, apostData) {
        this.gameManager = client;;

        this.uuid = oldUuid ? oldUuid : uuid();

        this.access_token = access_token;

        this.game = game ? game : null;

        this.createdAt = created ? created : Date.now();

        this.provider = provider;

        this.loaded = loaded;

        this.apostData = apostData ? apostData : null;

        this.start();
    }

    async save() {
        this.gameManager.client.database.db('provedor').collection('sessions').updateOne({
            uuid: this.uuid
        }, {
            $set: {
                uuid: this.uuid,
                access_token: this.access_token,
                provider: this.provider,
                createdAt: this.createdAt,
                game: this.game,
                gameName: this.gameManager.displayName,
                apostData: this.apostData
            }
        })
    }
    async start() {
        if (Date.now() >= this.createdAt + 60000 * 60 * 24) return this.gameManager.sessions.delete(this.uuid);

        if (!this.loaded) {
            this.gameManager.client.database.db('provedor').collection('sessions').insertOne({
                uuid: this.uuid,
                access_token: this.access_token,
                provider: this.provider,
                createdAt: this.createdAt,
                game: this.game,
                gameName: this.gameManager.displayName,
                apostData: this.apostData
            });
        } else {
            console.log("SDALVANDO")
            this.gameManager.sessions.set(this.uuid, this)
            console.log(this)
        }
        setTimeout(() => {
            const find = this.gameManager.sessions.find(s => s.provider === this.provider && s.access_token === this.access_token);

            if (find) {
                this.gameManager.sessions.delete(find);

                this.gameManager.client.database.db('provedor').collection('sessions').deleteOne({
                    uuid: this.uuid
                })
            }
        }, this.createdAt + 60000 * 60 * 24 - Date.now())
    }
}

module.exports = Session;