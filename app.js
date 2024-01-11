const express = require('express')
const app = express()
const apiRoutes = require('./routes/apiRoutes')
const cors = require('cors')
const port = process.env.PORT || 3009

app.use(cors())
app.use(express.json())
app.use(express.static('public'));
app.use('/api', apiRoutes)

app.listen(port, () => {
    console.log('listen multiverse in port 3009')
})
const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const clientesConectados = new Map();
function crearListaClientes() {
    return Array.from(clientesConectados.values()).map(cliente => ({
        clientId: cliente.clientId,
        userName: cliente.userName
    }));
}
function enviarListaClientesATodos() {
    const listaClientes = crearListaClientes();

    clientesConectados.forEach((cliente) => {
        if (cliente.ws.readyState === WebSocket.OPEN) {
            cliente.ws.send(JSON.stringify({ tipo: 'listaClientes', listaClientes }));
        }
    });
}
wss.on('connection', (ws) => {
    console.log('Cliente conectado');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.tipo === 'conexion' && data.clientId && data.userName) {
            const clientId = data.clientId;
            const userName = data.userName;

            // Almacena la conexión, el identificador del cliente y el nombre de usuario
            clientesConectados.set(clientId, { ws, userName, clientId });

            // Envia la lista de clientes conectados al nuevo cliente
            const listaClientes = Array.from(clientesConectados.keys());
            ws.send(JSON.stringify({ tipo: 'listaClientes', listaClientes }));

            console.log(`Cliente ${userName} identificado con clientId ${clientId}`);
            enviarListaClientesATodos()
        }
        if (data.type === "challenge") {
            enviarMensajeACliente(data.id,"challenge",data.clientId)
        }
        console.log(`Mensaje recibido del cliente: ${message}`);

    });


    ws.on('close', () => {
        // Identifica al cliente por el identificador único y obtén el nombre de usuario
        const clienteDesconectado = Array.from(clientesConectados).find(([clientId, cliente]) => cliente.ws === ws);
        const nombreUsuarioDesconectado = clienteDesconectado ? clienteDesconectado[1].userName : "Desconocido";

        console.log(`Cliente ${nombreUsuarioDesconectado} desconectado`);

        // Elimina la conexión del conjunto cuando se cierra
        clientesConectados.delete(clienteDesconectado[0]);
        enviarListaClientesATodos()
    });
});
function enviarMensajeATodos(mensaje) {
    clientesConectados.forEach((cliente) => {
        if (cliente.ws.readyState === WebSocket.OPEN) {
            cliente.ws.send(mensaje);
        }
    });
}
function enviarMensajeACliente(clientId, type,id) {
    const cliente = clientesConectados.get(clientId);
  
    if (cliente && cliente.ws && cliente.ws.readyState === WebSocket.OPEN) {
      cliente.ws.send(JSON.stringify({ tipo: type, id }));
    }
  }
server.listen(3020, () => {
    console.log('Servidor WebSocket escuchando en el puerto 3020');
});
