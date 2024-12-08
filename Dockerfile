# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the application source code to the container
COPY . ./

# Build the application
RUN npm run build

# Set the correct working directory for the compiled files
WORKDIR /app/dist

# Expose the port the app runs on
EXPOSE 9999

# Set environment variables
ENV NODE_ENV=development
ENV PORT=9999
ENV LOG_LEVEL=debug
ENV DATABASE_URL=file:dev.db
ENV JWT_SECRET=secretkey
ENV JWT_ACCESS_EXPIRATION=900 
ENV JWT_REFRESH_EXPIRATION=2592000 


# Start the application
CMD ["node", "./src/index.js"]
