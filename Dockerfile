    FROM node:20-alpine

    # Set the working directory
    WORKDIR /app
    
    # Copy package files and install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy all source code
    COPY . .
 
    EXPOSE 3000
    
    # Start the app in development mode
    CMD ["npm", "run", "dev"]
    
