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
const thirdPartyConfig: Record<
  string,
  object
> = require("./third-party-config.json");
export class ScoparellaApiApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}, private secrets: any) {
    super(options);
    this.bind("logging-middleware").toProvider(LoggingInterceptor);
    this.setupStrategies();
    this.add(
      createBindingFromClass(ConsoleLogger, {
        key: "logger",
      }),
    );
    this.add(
      createBindingFromClass(GameAuthorizationHandler, {
        key: "gameAuthorizationHandler",
      }),
    );
    this.bind("secrets.json").to(secrets);
    this.bind("config.json").to(config);

    this.sequence(MySequence);

    this.component(AuthenticationComponent);
    passport.serializeUser(function (user: any, done) {
      done(null, user);
    });
    passport.deserializeUser(function (user: any, done) {
      done(null, user);
    });

    this.static("/", path.join(__dirname, "../public"));

    this.configure(RestExplorerBindings.COMPONENT).to({
      path: "/explorer",
    });
    this.component(RestExplorerComponent);

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
    const googleOptions = thirdPartyConfig["google"] as GoogleStrategyOptions;
    googleOptions.clientSecret = this.secrets.google.clientSecret;

    const facebookOptions = thirdPartyConfig[
      "facebook"
    ] as FacebookStrategyOption;
    facebookOptions.clientSecret = this.secrets.facebook.clientSecret;

    const jwtOptions = thirdPartyConfig["jwt"] as JwtOptions;
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
