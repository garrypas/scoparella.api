export const googleUuid = "6f749a83-243b-44c7-b702-2d19147711dc";
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
      playerId: PlayerService.generateId(profile.id, googleUuid),
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
