#!/bin/bash
PASSWORD=$(az keyvault secret show --vault-name="${ENV}scoparellavault" --name=dbpassword -o tsv --query value)
APP_PASSWORD=$(az keyvault secret show --vault-name="${ENV}scoparellavault" --name=dbapppassword -o tsv --query value)
if [[ -z "${MODULE_PATH}" ]]
then
      MODULE_PATH="."
      APP_PASSWORD="Xy"
else
      echo "MODULE_PATH SET TO $MODULE_PATH"
fi
echo "Insert password for placeholder..."
sed -i'' -e "s|<PASSWORD>|$APP_PASSWORD|g" "$MODULE_PATH/setup-database.sql"
sqlcmd -S "$ENV-scoparella-database-instance.database.windows.net" -d "master" -U scoparella_admin -P "$PASSWORD" -i "$MODULE_PATH/setup-database.sql"
echo "Put password placeholder back..."
sed -i'' -e "s|$APP_PASSWORD|<PASSWORD>|g" "$MODULE_PATH/setup-database.sql"
rm -rf ./*.sql-*
