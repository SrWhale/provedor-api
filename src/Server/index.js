const express = require('express');

const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json());

const { readdirSync } = require('fs');

const { Collection } = require('@discordjs/collection');

const { Route } = require('../Structures');

const http = require('http');

class Server {
    constructor(client) {
        this.port = 3000;

        this.routes = new Collection();

        this.client = client;

        this.app = http.createServer(app)
    }

    async start() {

        this.loadRoutes();

        this.app.listen(25565, () => {
            console.log('Server is running on port 25565');
        });

        this.routes.forEach(route => {
            app[route.method](route.path, (req, res) => {
                route.callback(req, res);
            })
        })
    }

    createCustomRoute(data) {
        const route = new Route(this, data.path, data.method);

        route.callback = data.callback;

        app[route.method](route.path, (req, res) => {
            route.callback(req, res);
        })

        return route;
    };

    async loadRoutes() {
        readdirSync('./src/Server/Routes').forEach(async file => {
            const CustomRoute = require(`./Routes/${file}`);

            const route = new CustomRoute(this);

            this.routes.set(route.path, route)
        })
    }
}

module.exports = Server;