# Use an official Node.js runtime as the base image
FROM node:21.1-slim

# Set the working directory in the container
WORKDIR /usr/src/client

# Copy the rest of the application source code to the container
COPY . .

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
