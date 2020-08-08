#! /bin/bash

# Note: ensure `chmod +x setup.sh` is run on host before starting container
set -x

run_mssql() {
  /opt/mssql/bin/sqlservr
}

setup_database() {
  while :
  do
    /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -Q 'SELECT 0'
    echo "waiting for mssql to start..."
    if [ $? -eq 0 ]; then
      break
    fi
    sleep 1s
  done

  /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -i "/start/sql-scripts/create-database.sql"
}

setup_database & /opt/mssql/bin/sqlservr
