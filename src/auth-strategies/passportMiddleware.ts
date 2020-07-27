import {composeInterceptors, intercept} from "@loopback/core";

const interceptors: string[] = [];

export function passportMiddleware() {
  const allInterceptors = ["passport-init-mw" /*, 'passport-session-mw'*/];
  allInterceptors.push(...interceptors);
  return intercept(composeInterceptors(...allInterceptors));
}
export function register(...ids: string[]) {
  interceptors.push(...ids);
}
