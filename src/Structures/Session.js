class Session {
    constructor(client, user, access_token) {
        this.client = client;;

        this.user = user;

        this.access_token = access_token;

        this.game = null;

        this.createdAt = Date.now()
    }

    async start() {
        setTimeout(() => {
            const find = this.client.sessions.find(s => s.user === this.user && s.access_token === this.access_token);

            if (find) {
                this.client.sessions.delete(find);
            }
        }, 60000 * 60 * 24)
    }
}

module.exports = Session;