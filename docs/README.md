# Documentation

## Build and Deployment

#### Development

For development, do:

```sh
$ docker compose up
```

<p align="justify">
Docker will start three containers: db, backend and frontend; mapped to ports 5432, 3000 and 80 respectively. Additionally the backend container also exposes prisma studio on port 5555. Docker will mount the back/ and front/ directories to their respective containers to support hot reloading. In both cases the node_modules/ folder is mounted as an anonymous volume to isolate it from the host's, as a result you may have to run `npm ci` on the host to get intellisense on your ide. If you ran docker before installing packages locally npm might fails due to missing permissions, in that case remove the node_modules/ folder and run npm again.
</p>

<p align="justify">
Environment variables are set through a .env file on the project root, if you wish to forward any variables to a container you must list them under the service's environment property in the docker-compose.yaml file.
</p>

#### Production

There is no ci pipeline nor build script for deploying to production so far. In order to run the backend, you must run `npm build` followed by `npm start`. For the frontend you only need to run `npm build` to produce the static HTML+JS files and serve them with `express.static` or some other kind of hosting.

## Testing

There are some minimal tests in back/src/tests.ts for hitting endpoints whose responses contain a body. They're mainly used for checking compliance to the openapi spec whenever there are any changes, you can run them with `npm test`. Other that those, testing is done manually with an http client.

## Architecture

The application is composed of a Postgres database, an http server hosting a REST api, and a static web client that fetches dynamic content from the api and performs client side rendering.

<!-- TODO: improve data models -->

- There is a logical and physical data model that describes the database schema, however they are incomplete as they dont document constraints nor views.
- There is a document listing the functional requirements for the application.
