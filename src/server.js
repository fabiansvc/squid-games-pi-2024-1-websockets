"use strict"
/**
 * Module dependencies.
 */
const { Server } = require("socket.io");
/**
 * Load environment variables from .env file.
 */
const clientURLLocalhost = process.env.CLIENT_URL_LOCALHOST
const clientURLDeploy = process.env.CLIENT_URL_DEPLOY
const port = process.env.PORT
/**
 * Create a WebSocket server using Socket.IO.
 * Configured with CORS policy to allow connections from specified origins.
 */
const io = new Server({
    cors: {
        origin: [clientURLLocalhost, clientURLDeploy]
    },
});
/**
 * Array to store information about connected players.
 */
let players = [];
/**
 * Listen for incoming connections.
 */
io.on('connection', (socket) => {
    /**
     * Log the ID of the player connected.
     */
    console.log(
        "Player joined with ID",
        socket.id, ". There are " +
        io.engine.clientsCount +
    " player connected."
    );
    /**
     * Handle a new player connection.
     * Emit the list of players to the newly connected player.
     */
    socket.on("player-connected", () => {
        const player = players.find((player) => player.id === socket.id);

        if (!player) {
            players.push({
                id: socket.id,
                urlAvatar: "",
                position: null,
                rotation: null,
                animation: "Idle",
            });
            socket.emit("players-connected", players);
        }
    });
    /**
     * Handle a player's movement.
     * Broadcast the updated position and rotation to other players.
     */
    socket.on("moving-player", (valuesTransformPlayer) => {
        const player = players.find(player => player.id === socket.id)
        player.position = valuesTransformPlayer.position;
        player.rotation = valuesTransformPlayer.rotation;
        socket.broadcast.emit("updates-values-transform-player", player);
    })
    /**
     * Handle a player changing their animation.
     * Broadcast the updated animation state to other players.
     */
    socket.on("change-animation", (animation) => {
        const player = players.find(player => player.id === socket.id)
        player.animation = animation;
        socket.broadcast.emit("update-animation", player);
    })
    /**
     * Handle player disconnection.
     * Remove the disconnected player from the list.
     */
    socket.on('disconnect', () => {
        players = players.filter(player => player.id !== socket.id);
        console.log(
            "Player disconnected with ID",
            socket.id, ". There are " +
            io.engine.clientsCount +
        " players disconnected");
    });
});
/**
 * Start listening on the specified port.
 */
io.listen(port);


