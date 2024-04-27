"use strict"

const { Server } = require("socket.io");

const clientURLLocalhost = "http://localhost:3000"
const clientURLDeploy = "https://squid-games-pi-2024-1.vercel.app"
const port = 5000

const io = new Server({
    cors: {
        origin: [clientURLLocalhost, clientURLDeploy]
    },
});

let players = [];

// Handle socket connections
io.on('connection', (socket) => {
    console.log(
        "Player joined with ID",
        socket.id, ". There are " +
        io.engine.clientsCount +
    " player connected."
    );
    
    socket.on("player-connected", () => {
        players.push({
            id: socket.id,
            urlAvatar: "",
            position: null,
            rotation: null,
            animation: "Idle",
        });
        socket.emit("players-connected", players);
    });

    socket.on("moving-player", (valuesTransformPlayer) => {
        const player = players.find(player => player.id === socket.id)
        player.position = valuesTransformPlayer.position;
        player.rotation = valuesTransformPlayer.rotation;
        socket.broadcast.emit("updates-values-transform-player", player);
        console.log(valuesTransformPlayer);
    })

    socket.on("change-animation", (animation) => {
        const player = players.find(player => player.id === socket.id)
        player.animation = animation;
        socket.broadcast.emit("update-animation", player);
    })

    socket.on('disconnect', () => {
        players = players.filter(player => player.id !== socket.id);
        console.log(
            "Player disconnected with ID",
            socket.id, ". There are " +
            io.engine.clientsCount +
        " players disconnected");
    });


});

// Listen on a specific port
io.listen(port);


