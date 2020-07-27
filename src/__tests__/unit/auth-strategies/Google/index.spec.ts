import {expect} from "@loopback/testlab";
import {
  googleUuid,
  verifyFunction,
} from "../../../../auth-strategies/Google/verifyFunction";
import {PlayerService} from "../../../../services/";
const googleProfile = require("../../../testData/google-profile.json");
describe("auth-strategies/Google", () => {
  let mappedProfile: any = null;
  before(done => {
    verifyFunction("123", "456", googleProfile, (err: any, user: any) => {
      mappedProfile = user;
      done(err);
    });
  });

  it("Maps a Google profile", async () => {
    expect(mappedProfile.id).to.equal(googleProfile.id);
    expect(mappedProfile.emails).to.equal(googleProfile.emails[0].value);
    expect(mappedProfile.name).to.equal(googleProfile.displayName);
    expect(mappedProfile.provider).to.equal("google");
    expect(mappedProfile.username).to.equal(googleProfile.displayName);
    expect(mappedProfile.photos).to.be.undefined();
  });

  it("Generates Google namespaced player ID", async () => {
    expect(mappedProfile.playerId).to.equal(
      PlayerService.generateId(googleProfile.id, googleUuid),
    );
  });
});
