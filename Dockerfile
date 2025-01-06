# Usa una imagen oficial de Node.js como base
FROM node:18

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos de dependencia
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto del servidor (puerto WebSocket y HTTP)
EXPOSE 3009

# Comando para iniciar el servidor
CMD ["node", "app.js"]
