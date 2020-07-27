export const facebookUuid = "a5f7fc40-b793-40cb-bdd8-c68ba3f50b8e";
import {Profile} from "passport";
import {PlayerService} from "../../services";

export function verifyFunction(
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  done: (error: any, user?: any, info?: any) => void,
) {
  done(
    null,
    {
      playerId: PlayerService.generateId(profile.id, facebookUuid),
      id: profile.id,
      emails: profile.emails?.length ? profile.emails[0].value : "",
      name: profile.displayName,
      provider: profile.provider,
      username: profile.displayName,
      photo: profile.photos?.length ? profile.photos[0].value : "",
    },
    null,
  );
}
