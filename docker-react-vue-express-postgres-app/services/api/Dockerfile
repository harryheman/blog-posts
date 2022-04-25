ARG NODE_VERSION=16.13.1

FROM aio350/docker-test_client AS client

FROM aio350/docker-test_admin AS admin

FROM node:$NODE_VERSION

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

COPY --from=client /client/build /app/client/build

COPY --from=admin /admin/dist /app/admin/dist

EXPOSE 5000

CMD ["yarn", "start"]
