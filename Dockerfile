FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY app/package.json app/yarn.lock ./

# Install dependencies
RUN npm install

# Copy source code
COPY app/ .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
