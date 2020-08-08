import {ApplicationConfig, ScoparellaApiApplication} from "./application";
import {ConsoleLogger} from "./Logger";
import {SecretsService} from "./services";
export * from "./application";
const logger = new ConsoleLogger();

export async function main(options: ApplicationConfig = {}) {
  const app = new ScoparellaApiApplication(
    options,
    await SecretsService.getSecrets(),
  );
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  logger.info(`Server is running at ${url}`);
  logger.info(`Try ${url}/ping`);
  return app;
}

if (require.main === module) {
  const port = +(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? "localhost";
  logger.trace(`RESTful settings, port number ${port}, host ${host}`);

  const config = {
    rest: {
      port,
      host,
      gracePeriodForClose: 5000, //ms
      openApiSpec: {
        setServersFromRequest: true,
      },
    },
  };
  main(config)
    .then(() => {
      logger.trace("RESTful settings accepted.");
    })
    .catch(err => {
      logger.error("Cannot start the application.");
      logger.error(err);
    });
}
