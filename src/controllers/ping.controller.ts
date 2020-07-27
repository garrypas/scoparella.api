import {authenticate} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {get, Request, ResponseObject, RestBindings} from "@loopback/rest";
/**
 * OpenAPI response for ping()
 */
const pingResponse: ResponseObject = {
  description: "Ping Response",
  content: {
    "application/json": {
      schema: {
        type: "object",
        title: "PingResponse",
        properties: {
          greeting: {type: "string"},
          date: {type: "string"},
          url: {type: "string"},
          headers: {
            type: "object",
            properties: {
              "Content-Type": {type: "string"},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {}

  // Map to `GET /ping`
  @get("/ping", {
    responses: {
      "200": pingResponse,
    },
  })
  ping(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: "Hello from LoopBack",
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }

  @authenticate("jwt")
  @get("/ping/authenticated", {
    responses: {
      "200": pingResponse,
    },
  })
  authenticatedPing(): object {
    return {
      user: this.req.user,
      greeting: "Hello from LoopBack",
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }
}
