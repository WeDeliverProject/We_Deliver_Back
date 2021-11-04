FROM node:14-alpine
WORKDIR /SERVER
COPY package*.json /SERVER/
RUN yarn
COPY . /SERVER/
CMD ["yarn", "start"]
EXPOSE 3000
