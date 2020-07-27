import {Client, expect} from "@loopback/testlab";
import {readFileSync} from "fs";
import {verify} from "jsonwebtoken";
import {Strategy as FacebookStrategy} from "passport-facebook";
import {Strategy as GoogleStrategy} from "passport-google-oauth2";
import {ScoparellaApiApplication} from "../..";
import {PassportStubBuilder} from "./../builders/";
import {setupApplication} from "./test-helper";
const profiles: Record<string, object> = {
  facebook: require("./../testData/facebook-profile.json"),
  google: require("./../testData/google-profile.json"),
};
const secrets = require("./../../../secrets.json");
const publicKey: string = readFileSync(secrets.keys.publicKey, {
  encoding: "utf8",
});

describe("AuthController", () => {
  let app: ScoparellaApiApplication;
  let client: Client;
  before("setupApplication", async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });
  describe("Third party login", () => {
    [{strategy: "facebook"}, {strategy: "google"}].forEach(testCase => {
      it(`Redirects requests to ${testCase.strategy} for authentication`, async () => {
        const res = await client
          .get(`/api/auth/thirdparty/${testCase.strategy}`)
          .expect(303);
        expect(
          res.header["location"].includes(`${testCase.strategy}.com`),
        ).to.be.true();
      });
    });
  });

  function setupPassportStubForSuccessScenario(
    strategyName: string,
    passportStrategy: any,
  ): PassportStubBuilder {
    return new PassportStubBuilder(passportStrategy)
      .withName(strategyName)
      .withProfile(profiles[strategyName])
      .build();
  }

  function setupPassportStubForFailureScenario(
    strategyName: string,
    passportStrategy: any,
  ): PassportStubBuilder {
    return new PassportStubBuilder(passportStrategy)
      .withName(strategyName)
      .withProfile(profiles[strategyName])
      .asInvalidAuthentication()
      .build();
  }

  [
    {strategy: "facebook", passportStrategy: FacebookStrategy},
    {strategy: "google", passportStrategy: GoogleStrategy},
  ].forEach(testCase => {
    describe("Third party valid authentication callback", () => {
      let sandbox: PassportStubBuilder;
      before("Setup stubs for valid authentication callback", async () => {
        sandbox = setupPassportStubForSuccessScenario(
          testCase.strategy,
          testCase.passportStrategy,
        );
      });

      after(async () => {
        sandbox.restore();
      });

      it(`Authenticates using the ${testCase.strategy} strategy, and sets up profile in JWT encrypted with private key`, async () => {
        const response = await client
          .get(`/api/auth/thirdparty/${testCase.strategy}/callback?code=123`)
          .expect(202);
        expect(response.body.jwtToken).not.to.be.undefined();
        expect(verify(response.body.jwtToken, publicKey)).to.match({
          aud: "localhost.com",
          provider: testCase.strategy,
        });
      });
    });
  });

  [
    {strategy: "facebook", passportStrategy: FacebookStrategy},
    {strategy: "google", passportStrategy: GoogleStrategy},
  ].forEach(testCase => {
    describe("Third party invalid authentication callback", () => {
      let sandbox: PassportStubBuilder;
      before("Setup stubs for failed authentication callback", async () => {
        sandbox = setupPassportStubForFailureScenario(
          testCase.strategy,
          testCase.passportStrategy,
        );
      });

      after(async () => {
        sandbox.restore();
      });

      it(`Fails authentication using the ${testCase.strategy} strategy`, async () => {
        const response = await client
          .get(`/api/auth/thirdparty/${testCase.strategy}/callback?code=123`)
          .expect(401);
        expect(response.body.jwtToken).to.be.undefined();
      });
    });
  });
});
