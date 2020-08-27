#!/bin/bash -e
if [ -z "${ENV}" ]
then
  echo "ENV environment variable not specified. Exiting..."
  exit 1
fi

template() {
  cp $1 _$1
  envsubst < "_$1" > "$1"
  cat $1
  kubectl apply -f ./$1
  mv _$1 $1
}

export DB_HOST=$(az sql server show --resource-group "$ENV-scoparella-resource-group" --name "$ENV-scoparella-database-instance" --query fullyQualifiedDomainName -otsv)
export DB_PORT="1433"

az aks get-credentials --overwrite-existing --resource-group "$RESOURCE_GROUP" --name "${ENV}-scoparella-aks1"

template "app.yaml"
template "app-lb.yaml"
# cp app.yaml _app.yaml
# envsubst < "_app.yaml" > "app.yaml"
# cat app.yaml
# # kubectl apply -f ./app.yaml
# mv _app.yaml app.yaml

# cp app-lb.yaml _app-lb.yaml
# envsubst < "_app-lb.yaml" > "app-lb.yaml"
# cat app-lb.yaml
# # kubectl apply -f ./app-lb.yaml
# mv _app-lb.yaml app-lb.yaml
