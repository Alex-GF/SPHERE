# Node 21 ya no tiene soporte y causa conflictos.
FROM node:22-slim

# 2. Definimos las variables de entorno del proxy (Mayúsculas y minúsculas)
# Es buena práctica poner ambas para asegurar compatibilidad con todas las herramientas.
ENV http_proxy=http://proxy.int.local:3128
ENV https_proxy=http://proxy.int.local:3128
ENV HTTP_PROXY=http://proxy.int.local:3128
ENV HTTPS_PROXY=http://proxy.int.local:3128

WORKDIR /usr/src/client

# 3. Instalamos libvips a nivel de sistema operativo
# Esto es CRUCIAL. Al instalar esto, 'sharp' detectará que ya existe
# y NO intentará descargar el binario que está fallando en tu proxy.
RUN apt-get update && apt-get install -y \
    libvips-dev \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY . .

# Configuramos npm proxy también (aunque las ENV deberían bastar, esto refuerza)
RUN npm config set proxy http://proxy.int.local:3128 && \
    npm config set https-proxy http://proxy.int.local:3128

# 4. Instalamos dependencias
# --no-audit acelera la instalación detrás de proxys
RUN npm install --no-audit --build-from-source=sharp

# Build de la aplicación
RUN npm run build

# Instalar serve globalmente
RUN npm install -g serve

EXPOSE 5173

CMD [ "serve", "-s", "dist", "-l", "5173" ]