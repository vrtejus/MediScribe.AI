# How to run the backend

`npm i direnv`

Create a `.env` file in this directory. Ask Vishnu for the contents.

`cd` into `backend` and run `direnv allow`

`docker-compose build`

`docker-compose up -d` – to run in the background, OR
`docker-compose up` – to run in the foreground.

If you run the containers in the background, you can view the logs easily with Docker Desktop.

Run `docker-compose down` to destroy any local instances of containers.
