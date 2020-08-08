import {inject, lifeCycleObserver, LifeCycleObserver} from "@loopback/core";
import {juggler} from "@loopback/repository";

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
