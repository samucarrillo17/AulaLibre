FROM node:18-alpine

# Crear y definir el directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto
EXPOSE 3001

# Comando de inicio predeterminado
CMD ["npm", "run", "start:dev"]