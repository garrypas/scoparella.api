import {inject, lifeCycleObserver, LifeCycleObserver} from "@loopback/core";
import {juggler} from "@loopback/repository";

const config = {
  name: "game",
  connector: "mssql",
  // url: 'localhost',
  host: "localhost",
  port: 1440,
  user: "scoparella",
  password: process.env.SQL_PASSWORD,
  database: "scoparella",
  schema: "scopa",
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver("datasource")
export class GameDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = "game";
  static readonly defaultConfig = config;

  constructor(
    @inject("datasources.config.game", {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
