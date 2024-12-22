
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the application files
COPY . .

# Expose port 3000
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]

