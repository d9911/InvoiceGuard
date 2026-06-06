FROM node:22-alpine AS backend-node

WORKDIR /app

# Copy package files from backend directory
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy all files from backend directory (including src, swagger.yaml, etc.)
COPY backend/ .

# Build the project
RUN npm run build

# The app loads swagger.yaml from path.join(__dirname, '../swagger.yaml')
# Since server.js will be in /app/dist/server.js, __dirname is /app/dist
# and ../swagger.yaml is /app/swagger.yaml. This is correct.

EXPOSE 3000

CMD ["npm", "start"]
