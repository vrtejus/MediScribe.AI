# Use Node.js 16 as the base image for building
FROM node:16 as builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Use Node.js 16 as the base image for the actual container
FROM node:16

# Set the working directory
WORKDIR /app

# Copy the built JavaScript files from the previous stage
COPY --from=builder /app/dist ./dist

# Install production-only dependencies
RUN npm install --production

# Expose the WebSocket port
EXPOSE 3002

# Start the server
CMD ["node", "dist/server.js"]
