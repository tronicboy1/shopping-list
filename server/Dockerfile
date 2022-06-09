FROM node:16.14.2-slim AS build
WORKDIR /app
COPY package.json .
COPY yarn.lock .

RUN yarn install
COPY . .
RUN yarn build

FROM node:16.14.2-slim AS runner
WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY package.json .
COPY yarn.lock .
RUN yarn install --production

ENV NODE_ENV=production
EXPOSE 8080

CMD [ "yarn", "start" ]
