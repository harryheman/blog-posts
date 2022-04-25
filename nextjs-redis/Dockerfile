ARG NODE_VERSION=16.13.1

FROM node:${NODE_VERSION}

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

CMD ["yarn", "start"]