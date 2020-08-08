import {readFileSync} from "fs";
import {resolve} from "path";
export class ConfigService {
  private static config: any = null;
  static getConfig() {
    if (!this.config) {
      const path = resolve(
        __dirname,
        `../../config${process.env.TEST ? ".test" : ""}.json`,
      );
      this.config = JSON.parse(
        readFileSync(path, {
          encoding: "utf-8",
        }),
      );
      this.config.database.host =
        process.env.DB_HOST ?? this.config.database.host;
      this.config.database.port = +(
        process.env.DB_PORT ?? this.config.database.port
      );
    }
    return Object.assign({}, this.config);
  }
}
