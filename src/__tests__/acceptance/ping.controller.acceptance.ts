import {Client, expect} from "@loopback/testlab";
import {ScoparellaApiApplication} from "../..";
import {JwtPassportStubBuilder} from "../builders";
import {setupApplication} from "./test-helper";

describe("PingController", () => {
  let app: ScoparellaApiApplication;
  let client: Client;

  before("setupApplication", async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it("invokes GET /ping", async () => {
    const res = await client.get("/ping?msg=world").expect(200);
    expect(res.body).to.containEql({greeting: "Hello from LoopBack"});
  });

  describe("Authenticated ping", () => {
    let sandbox: JwtPassportStubBuilder;
    before(() => {
      sandbox = new JwtPassportStubBuilder()
        .asValidAuthentication()
        .withAnyProfile()
        .build();
    });
    after(() => {
      sandbox.restore();
    });
    it("authenticated ping works when authenticated", async () => {
      const res = await client.get("/ping/authenticated").expect(200);
      expect(res.body).to.containEql({greeting: "Hello from LoopBack"});
      expect(res.body.user).to.match({name: "John Smith"});
    });
  });
});
