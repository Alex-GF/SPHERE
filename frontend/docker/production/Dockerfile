# Use an official Node.js runtime as the base image
FROM node:21.1-slim

ENV http_proxy http://proxy.int.local:3128
ENV https_proxy http://proxy.int.local:3128

# Set the working directory in the container
WORKDIR /usr/src/client

# Copy the rest of the application source code to the container
COPY . .

RUN npm config set proxy http://proxy.int.local:3128 && \
    npm config set https-proxy http://proxy.int.local:3128

# Install Node.js dependencies
RUN npm install

# RUN npm uninstall bcrypt

# RUN npm install bcrypt

# Build your application
RUN npm run build

# Install serve

RUN npm install -g serve

EXPOSE 5173

# Specify the command to start your React app
CMD [ "serve", "-s", "dist", "-l", "5173" ]
