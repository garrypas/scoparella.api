import {inject, lifeCycleObserver, LifeCycleObserver} from "@loopback/core";
import {juggler} from "@loopback/repository";
// const config = ConfigService.getConfig().database;
// config.password = SecretsService.getSecrets().database.password;

// const config = {
//   name: "game",
//   connector: "mssql",
//   // url: 'localhost',
//   host: process.env.SQL_HOST ?? "localhost",
//   port: parseInt(process.env.SQL_PORT ?? "1440"),
//   user: "scoparella",
//   password: "P@ss55w0rd",
//   database: "scoparella",
//   schema: "scopa",
// };

@lifeCycleObserver("datasource")
export class GameDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = "game";

  constructor(
    @inject("secrets.json") secrets: any,
    @inject("config.json") config: any,
  ) {
    super(Object.assign({}, config.database, secrets.database));
  }
}
