rm -rf RS512-test.key && rm -rf RS512-test.key.pub
ssh-keygen -t rsa -b 4096 -m PEM -f RS512-test.key -Kqy -N ""
openssl rsa -in RS512-test.key -pubout -outform PEM -out RS512-test.key.pub
