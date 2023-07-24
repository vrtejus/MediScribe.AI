# How to run the backend

## Decode environment files and keys

> Note: Skip this section if you're bringing your own environment variables.

`brew install git-crypt`
`brew install gnupg`

If you have not created a GPG key pair on your computer before, run `gpg --full-generate-key`

Send your GPG `USER_ID` to an admin to get access.
Example of `USER_ID` if you followed every instruction in the GPG key pair creation process: `First Last (Comment) <email>`

After you've been granted access, you can pull the latest from `main`, run `git-crypt unlock` and continue with the steps below.

> Once you have access, you can give access to anybody else by running: `git-crypt add-gpg-user USER_ID`

`npm i direnv`

`cd` into `backend` and run `direnv allow`

`docker-compose build`

## Run the backend app

`docker-compose up -d` – to run in the background, OR
`docker-compose up` – to run in the foreground.

If you run the containers in the background, you can view the logs easily with Docker Desktop.

Run `docker-compose down` to destroy any local instances of containers.
