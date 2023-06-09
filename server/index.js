import express from "express";
import http from "http";
import morgan from "morgan";
import { Server as SocketServer } from "socket.io";
import cors from "cors";

const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

io.on("connection", (socket) => {
  
   console.log("socket conectado", socket.id);

  socket.on("disconnect", () => {
    console.log("socket desconectado", socket.id);
    io.emit("socket_desconectado", {
      texto: "Socket desconectado.",
      id: socket.id,
    });
  });

  socket.on("chat:mensaje", (data) => {
    console.log(data);
    
     const clienteActual = socket.id;

    // Verificar el ID del cliente que envió el mensaje
    if (clienteActual !== data.clienteId) {
      // Emitir el mensaje a todos los demás clientes
      socket.broadcast.emit("chat:mensaje", data);
    }
  });

  socket.on("chat:global", ({ name, img, messaage }) => {
    console.log({ name, img, messaage });
    io.emit("chat:global", {
      name,
      src: img ?? "/img/user.png",
      messages: [messaage],
      main: false,
    });
  });
  socket.on("chat:escribiendo", (usuario) => {
    console.log(usuario);
    socket.broadcast.emit("chat:escribiendo", usuario);
  });
});

server.listen(PORT);
console.log(`server on port ${PORT}`);
