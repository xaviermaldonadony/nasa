FROM node:lts-alpine

WORKDIR /app
# copy source to destination the (docker image) app folder just created 
# creates a layer that saves the state of the image afte that command is done
# this layer will only be updated when either the root package.json or the client package.json have changed, if we change anything in the client or server source code that doesn't add any new dependecies the cached version of this layer would be used. Less work to buidl this docker file
COPY package*.json ./

COPY client/package*.json client/
COPY client/yarn.lock client/
RUN yarn run install-client --prod

COPY server/package*.json server/
COPY server/yarn.lock server/
RUN yarn run install-server --prod

# will only run if the content of the client folder or any of the layers before that have changed 
COPY client/ client/
RUN cd client && yarn run build 

COPY server/ server/

USER node

CMD [ "yarn", "start" ]

EXPOSE 8000