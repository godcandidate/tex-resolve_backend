# Use a newer stable Node.js version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install 

# Copy source files
COPY . .

# Expose application port
EXPOSE 4000

# Start the application
CMD ["npm", "run", "dev"]

