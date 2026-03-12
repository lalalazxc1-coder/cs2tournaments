# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and install dependencies
# We use npm ci for predictable installs
COPY package*.json ./
RUN npm ci

# Copy application files and build
COPY . .
# We must pass the correct API URL during build time
ENV VITE_API_URL=/
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
