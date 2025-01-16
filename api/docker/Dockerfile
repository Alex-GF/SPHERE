# Use an official Node.js runtime as the base image
FROM node:21.1-slim

# Install MiniZinc CLI
RUN apt-get update && apt-get install -y minizinc

# Set the working directory in the container
WORKDIR /usr/src/server

# Copy the rest of the application source code to the container
COPY . .

# Install Node.js dependencies
RUN npm install

# RUN npm uninstall bcrypt

# RUN npm install bcrypt

CMD [ "npm", "run", "dev" ]

# # Build your application
# RUN npm run build

# EXPOSE 8080

# # Specify the command to start your React app
# CMD [ "node", "dist/backend.js" ]
