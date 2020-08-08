FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN bash create-keys.sh
ENV PORT=3000
EXPOSE ${PORT}
CMD [ "node", "." ]

#Find IP of other container:
# docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 79ffb62d8222

# To test
# docker network create scoparella_net
# sudo docker container stop scoparella_api | docker container rm scoparella_api | docker build -t scoparella_api --network=docker_scoparella_net .
# dockers run --network=docker_scoparella_net --name scoparella_api -p 3000:3000 -e LOG_LEVEL=info -e TEST=1 -e HOST=0.0.0.0 -e DB_HOST=172.20.0.2 -e DB_PORT=1433 scoparella_api
