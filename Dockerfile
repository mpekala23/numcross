FROM node:18.12.1
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
COPY . .
RUN yarn
RUN yarn build
EXPOSE 3000
EXPOSE 3001
CMD [ "yarn", "serve" ]