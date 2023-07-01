# Use the official Node.js 16 image as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy all the TypeScript files to the container
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the WebSocket port
EXPOSE 4000

# Command to start the server
CMD ["npm", "start"]
