# scoparella.api

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

A Loopback API wrapper around the [Scoparella Engine](https://github.com/garrypas/scoparella.engine).

The library uses third-party OAuth2 providers to authenticate users before allowing them to take part in games.

Before running the app you will need to create a public/private key pair using the `create-keys.sh` (will eventually productionise this process).

## Tests

### In-place

### Standard

### Inside Docker network

## Logging

Logging is set to "warn" by default. For more verbose logging set the environment variable LOG_LEVEL. e.g.:

`LOG_LEVEL=info npm run start`

Options are `trace`, `info`, `warn` or `error`.
