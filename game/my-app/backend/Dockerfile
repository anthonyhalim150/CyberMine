# Use a Node.js base image (Change this if using another backend)
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend files (folders remain intact)
COPY . .

# Expose the port your app runs on (default: 8080 for Cloud Run)
EXPOSE 8080

# Command to run your backend
CMD ["node", "server.js"]  
