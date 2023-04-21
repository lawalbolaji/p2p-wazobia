FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY nodemon.json ./nodemon.json
COPY tsconfig.json ./tsconfig.json

# need to bind src in docker container to local volume @ ./src in docker run
# can do this in docker run or in the docker-compose definition
# -v $(pwd)/src:/app/src

CMD ["npm", "run", "start:dev"]