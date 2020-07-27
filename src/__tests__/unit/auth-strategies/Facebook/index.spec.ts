import {expect} from "@loopback/testlab";
import {
  facebookUuid,
  verifyFunction,
} from "../../../../auth-strategies/Facebook/verifyFunction";
import {PlayerService} from "../../../../services";
const facebookProfile = require("../../../testData/facebook-profile.json");
describe("auth-strategies/Facebook", () => {
  let mappedProfile: any = null;
  before(done => {
    verifyFunction("123", "456", facebookProfile, (err: any, user: any) => {
      mappedProfile = user;
      done(err);
    });
  });

  it("Maps a Facebook profile", async () => {
    expect(mappedProfile.id).to.equal(facebookProfile.id);
    expect(mappedProfile.emails).to.equal(facebookProfile.emails[0].value);
    expect(mappedProfile.name).to.equal(facebookProfile.displayName);
    expect(mappedProfile.provider).to.equal("facebook");
    expect(mappedProfile.username).to.equal(facebookProfile.displayName);
    expect(mappedProfile.photos).to.be.undefined();
  });

  it("Generates Facebook namespaced player ID", async () => {
    expect(mappedProfile.playerId).to.equal(
      PlayerService.generateId(facebookProfile.id, facebookUuid),
    );
  });
});
