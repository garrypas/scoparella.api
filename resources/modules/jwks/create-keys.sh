if [ -z "${ENV}" ]
then
  echo "ENV environment variable not specified. Exiting..."
  exit 1
fi

if [ ! -z "${MODULE_PATH}" ]
then
  echo "MODULE_PATH set to $MODULE_PATH"
else
  MODULE_PATH="."
fi

rm -rf $MODULE_PATH/RS512.key && rm -rf $MODULE_PATH/RS512.key.pub
ssh-keygen -t rsa -b 4096 -m PEM -f $MODULE_PATH/RS512.key -Kqy -N ""
openssl rsa -in $MODULE_PATH/RS512.key -pubout -outform PEM -out $MODULE_PATH/RS512.key.pub

public_key=`cat $MODULE_PATH/RS512.key.pub`
private_key=`cat $MODULE_PATH/RS512.key`

az keyvault secret set --vault-name="${ENV}scoparellavault" --name=private-key --value="$private_key" -o none
az keyvault secret set --vault-name="${ENV}scoparellavault" --name=public-key --value="$public_key" -o none

rm -rf $MODULE_PATH/RS512.key.pub
rm -rf $MODULE_PATH/RS512.key

echo "Setup keys"
