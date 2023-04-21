FROM node:16-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci

# we need these to run the build and tests
COPY tsconfig.json ./tsconfig.json
COPY jest.config.json ./jest.config.json
ADD src ./src
ADD tests ./tests
ADD scripts ./scripts

RUN npm run test

RUN npm run build

RUN rm -rf node_modules

RUN npm ci --production

# production container
FROM node:16-alpine as production

WORKDIR /app

#set the env var to production so node runs in production
ENV NODE_ENV="production"

#copy package.json, we may not need it, but good practice for other scripts that do.
COPY --from=development /app/package.json ./

COPY --from=development /app/dist ./dist

#copy over the (production) node modules dev container
COPY --from=development /app/node_modules ./node_modules

EXPOSE 3100

CMD ["node", "./dist/index.js"]