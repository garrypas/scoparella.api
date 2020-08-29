import {expect, sinon} from "@loopback/testlab";
import {SinonSandbox} from "sinon";
import {SecretsService} from "../../../services";
const http = require("http");
const https = require("https");
describe("secrets.service unit tests", () => {
  let sandbox: SinonSandbox;
  const secretValue = "shh it's a secret...";

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    const fake = function (url: string, options: any, callback: any) {
      callback({
        statusCode: 200,
        setEncoding: function () {},
        on: function (event: string, eventCallback: any) {
          if (url.startsWith("http://169.254.169.254") && event === "data") {
            eventCallback(
              JSON.stringify({
                access_token: "123",
                token_type: "Bearer",
              }),
            );
          } else if (event === "data") {
            eventCallback(JSON.stringify({value: secretValue}));
          } else {
            // end
            eventCallback();
          }
        },
      });
    };
    sandbox.stub(http, "get").callsFake(fake);
    sandbox.stub(https, "get").callsFake(fake);
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("getSecrets()", () => {
    let secrets: any;
    beforeEach(async () => {
      secrets = await SecretsService.getSecrets();
    });
    it("Gets Google client id", async () => {
      expect(secrets.google.clientSecret).to.equal(secretValue);
    });
    it("Gets Facebook client id", async () => {
      expect(secrets.google.clientSecret).to.equal(secretValue);
    });
    it("Gets database password", async () => {
      expect(secrets.database.password).to.equal(secretValue);
    });
    it("Gets public key", async () => {
      expect(secrets.publicKey).to.equal(secretValue);
    });
    it("Gets private key", async () => {
      expect(secrets.privateKey).to.equal(secretValue);
    });
  });
});
