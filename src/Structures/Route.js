class Route {
    constructor(server, path, method) {

        this.server = server;

        this.client = server.client;

        this.path = path;

        this.method = method;
    }
}

module.exports = Route