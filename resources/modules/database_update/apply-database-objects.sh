#!/bin/bash
PASSWORD=$(az keyvault secret show --vault-name="${ENV}scoparellavault" --name=dbpassword -o tsv --query value)
APP_PASSWORD=$(az keyvault secret show --vault-name="${ENV}scoparellavault" --name=dbapppassword -o tsv --query value)

if [ ! -z "${MODULE_PATH}" ]
then
  echo "MODULE_PATH set to $MODULE_PATH"
else
  MODULE_PATH="."
fi

sqlcmd -S "$ENV-scoparella-database-instance.database.windows.net" -d "scoparella" -U scoparella_admin -P "$PASSWORD" -i "$MODULE_PATH/database-objects.sql"
