FROM --platform=linux/arm64 arm64v8/node:22-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json .
COPY package-lock.json .
RUN npm install

# Set environment variables
COPY .env.example .env.production
RUN --mount=type=secret,id=zerion_api_key \
    sed -i "s/ZERION_API_KEY=/ZERION_API_KEY=$(cat /run/secrets/zerion_api_key)/" .env.production

# Bundle app source
COPY . .

# Expose the default port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
