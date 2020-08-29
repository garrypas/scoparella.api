import {inject, lifeCycleObserver, LifeCycleObserver} from "@loopback/core";
import {juggler} from "@loopback/repository";
import {Logger} from "../Logger";

@lifeCycleObserver("datasource")
export class GameDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = "game";

  constructor(
    @inject("secrets.json") secrets: any,
    @inject("config.json") config: any,
    @inject("logger") logger: Logger,
  ) {
    super(GameDataSource.getDbConfig(secrets, config, logger));
  }

  private static getDbConfig(secrets: any, config: any, logger: Logger): any {
    logger.info(
      `Setting up database connection with config ${JSON.stringify(
        config.database,
      )}`,
    );
    return Object.assign({}, config.database, secrets.database);
  }
}
