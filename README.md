# scoparella.api

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

A Loopback API wrapper around the [Scoparella Engine](https://github.com/garrypas/scoparella.engine).

The library uses third-party OAuth2 providers to authenticate users before allowing them to take part in games.

The application includes bespoke Terraform scripts targeting Azure Kubernetes Service (AKS) with an MS SQL back-end.

## Tests

### In-place

1. Ensure the dockerise MS SQL database is up, and give it around 10 seconds to warm up.
1. Run the tests `npm run test:only` - this will runs tests with no clean or build.

### Standard

1. Ensure the dockerise MS SQL database is up, and give it around 10 seconds to warm up.
1. Run the tests `npm t`

### Inside Docker network

1. Run `npm run test:docker` - this will spin-up MS SQL and the App inside a docker network and run the tests within a container. It's a chance to test how the app runs once it has been rolled into a Docker image.

## Logging

Logging is set to "warn" by default. For more verbose logging set the environment variable LOG_LEVEL. e.g.:

`LOG_LEVEL=info npm run start`

Options are `trace`, `info`, `warn` or `error`.

`trace` is very noisy and is used for local debugging, so is `info` to a lesser extent. In a production setting we'd set this to `warn`.
