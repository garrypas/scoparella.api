#! /bin/bash
{
  # Give MS SQL some time to setup
  sleep 20
  # Lack of pre-build hooks or anything of the like in docker-compose makes this sort of thing necessary...
  export SCOPARELLA_DB_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' scoparella_db)
  echo "Database IP is ${SCOPARELLA_DB_IP}"
  docker-compose -f ./src/__tests__/docker/app/docker-compose.yml up &
  # ...also give this container time to spin up
  sleep 5
} || {
  unset SCOPARELLA_DB_IP
}
