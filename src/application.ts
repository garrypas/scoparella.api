import {AuthenticationComponent} from "@loopback/authentication";
import {BootMixin} from "@loopback/boot";
import {ApplicationConfig, createBindingFromClass} from "@loopback/core";
import {RepositoryMixin} from "@loopback/repository";
import {RestApplication, toInterceptor} from "@loopback/rest";
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from "@loopback/rest-explorer";
import {ServiceMixin} from "@loopback/service-proxy";
import passport from "passport";
import {StrategyOption as FacebookStrategyOption} from "passport-facebook";
import {StrategyOptions as GoogleStrategyOptions} from "passport-google-oauth2";
import path from "path";
import {setupStrategy as setupFacebookStrategy} from "./auth-strategies/Facebook/";
import {GameAuthorizationHandler} from "./auth-strategies/GameAuthorizationHandler";
import {setupStrategy as setupGoogleStrategy} from "./auth-strategies/Google/";
import {setupStrategy as setupJwtStrategy} from "./auth-strategies/Jwt/";
import {JwtOptions} from "./auth-strategies/Jwt/JwtOptions";
import {register as registerInterceptors} from "./auth-strategies/passportMiddleware";
import {ConsoleLogger} from "./Logger";
import {LoggingInterceptor} from "./middleware/LoggingInterceptor";
import {MySequence} from "./sequence";
import {ConfigService} from "./services";
export {ApplicationConfig};
const config = ConfigService.getConfig();
export class ScoparellaApiApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}, private secrets: any) {
    super(options);
    const logger = new ConsoleLogger();

    logger.trace("Adding logging middleware...");
    this.bind("logging-middleware").toProvider(LoggingInterceptor);
    logger.trace("Added logging middleware");

    logger.trace("Setting up strategies IOC magic...");
    this.setupStrategies();
    logger.trace("Strategies IOC magic setup");

    logger.trace("Adding logger singleton to IOC container...");
    this.bind("logger").to(logger);
    logger.trace("Adding logger to IOC container...");

    // this.add(
    //   createBindingFromClass(ConsoleLogger, {
    //     key: "logger",
    //   }),
    // );
    this.add(
      createBindingFromClass(GameAuthorizationHandler, {
        key: "gameAuthorizationHandler",
      }),
    );
    logger.trace("Adding secrets.json singleton to IOC container...");
    this.bind("secrets.json").to(secrets);
    logger.trace("Added secrets.json");

    logger.trace("Adding config.json singleton to IOC container...");
    this.bind("config.json").to(config);
    logger.trace("Added config.json");

    logger.trace("Setting up Sequence");
    this.sequence(MySequence);
    logger.trace("Sequence was setup");

    logger.trace("Setting up AuthenticationComponent");
    this.component(AuthenticationComponent);
    logger.trace("AuthenticationComponent was setup");

    logger.trace("Setting up Passport serializers");
    passport.serializeUser(function (user: any, done) {
      done(null, user);
    });
    passport.deserializeUser(function (user: any, done) {
      done(null, user);
    });
    logger.trace("Passport serializers setup");

    this.static("/", path.join(__dirname, "../public"));

    logger.trace("Swagger bits...");
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: "/explorer",
    });
    this.component(RestExplorerComponent);
    logger.trace("Swagger bits setup");

    this.projectRoot = __dirname;
    this.bootOptions = {
      controllers: {
        dirs: ["controllers"],
        extensions: [".controller.js"],
        nested: true,
      },
      services: {
        dirs: ["services"],
        extensions: [".service.js", ".commands.js"],
        nested: true,
      },
    };
  }

  private setupStrategies() {
    const googleOptions = Object.assign(
      {},
      config.thirdPartyConfig.google,
      this.secrets.google,
    ) as GoogleStrategyOptions;

    const facebookOptions = Object.assign(
      {},
      config.thirdPartyConfig.facebook,
      this.secrets.facebook,
    ) as FacebookStrategyOption;

    const jwtOptions = config.thirdPartyConfig.jwt as JwtOptions;
    jwtOptions.secretOrKey = this.secrets.publicKey;
    jwtOptions.privateKey = this.secrets.privateKey;

    this.bind("passport-init-mw").to(toInterceptor(passport.initialize()));

    setupGoogleStrategy(this, googleOptions);
    setupFacebookStrategy(this, facebookOptions);
    setupJwtStrategy(this, jwtOptions);

    registerInterceptors(
      "passport-jwt",
      "passport-google",
      "passport-facebook",
      "logging-middleware",
    );
  }
}
