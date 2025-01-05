# Use an official Node.js runtime as the base image
FROM node:21.1-slim

# Set the working directory in the container
WORKDIR /usr/app

# Copy the rest of the application source code to the container
COPY . .

# Install Node.js dependencies
RUN npm install

# Define a default environment variable if not provided during runtime
RUN mv .env.example .env

# Build the application
RUN npm run build