# Tests

## Directories

### Acceptance tests

Contains acceptance tests talking to a dockerised SQL Server instance; only the third party endpoints are stubbed at the Passport level.

### Builders

Builders that allow stubs to be easily setup and (where necessary) torn down.

### Docker

Dockerised dependencies (e.g.) SQL Server.

## Running Tests

1. Ensure the dockerise SQL Server instance is running. Run `npm run docker:deps` and wait a couple of seconds for the container to start up (the command executes as a daemon).

1. Run `npm t`, which will transpile, apply linting fixes etc before running the acceptance tests.
