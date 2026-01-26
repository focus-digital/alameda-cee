# Typescript Backend Template

> [!TODO]
> Update the title of this readme to your relevant project details.

## Prerequisites
- NodeJS
- Typescript
- Yarn (v 4.12.0)
- Docker
- Ruby (for Kamal)
- Kamal (v 2.0+)

## Stack

- Prisma: ORM
- Fastify: API
- SQlite: initial database
- Vitest: testing
- tanstack/ai: AI/LLM chat
- Resend: Email service

## Architecture

<pre>
prisma/ → database schema and settings
  schema.prisma → your database schema lives here.  
  seed.ts → seeds your database with data, pattern is to use services. 
src/ → backend logic
  server.ts → entry point for server
  api/ → the API main folder
    docs/ → swagger API documentation schemas and artifacts  
    plugins/ → middleware  
    routes/ → routes files for each top level route    
  domain → types and enums
  repo/ → database interactions for each table through prisma, returns domain types
  service/ → application business logic, use one or more repos
  util/ → utility functions
tests/ → test files
  helpers/ → helper files
    test-global-setup.ts → setup file
    test-setup.ts → setup file
  routes/ → route level tests  
</pre>

API call flow:
```
Routes → plugins → Services → Repos → prisma
```

## Getting started

Make sure the prerequisites above are installed. Then in the `backend` folder:
1. run `cp .env.example .env` to duplicate local env variables, update as applicable. Update the environment variables as applicable i.e. set your LLM API key for the AI assistant feature and `EMAIL_SERVICE_API_TOKEN` for the email service
1. run `yarn` to install all dependencies
1. run `yarn db:reset` to run initial migration and data seed
1. run `yarn dev` to start the API (check at http://localhost:3000/health)
1. view the swagger API documentation at http://localhost:3000/docs
1. run `yard db:studio` in a separate terminal window to view db tables
1. run tests `yarn test`

Then update the following files as necessary:
*  `.env`
* `package.json`
* `README.md`
* `AGENTS.md`

## Migrations

Run `yarn db:migrate` after changes to the schema

## Docker

We use Docker for CI/CD. See `Dockerfile` for details.

You can run the API within Docker locally:
1. Stop your locally running API if any
1. Run `yarn docker:build-run` to build, migrate, seed, and run the API
1. See all `docker:` commands in `package.json`

## Deploy

We use [Kamal](https://kamal-deploy.org/docs) to deploy our applications to the cloud. Our current setup uses:
- Docker: to build and run the API, with a `/data` volume config for SQLite
- Hetzner VMs: bare metal ubuntu VMs to serve the API
- Cloudflare DNS: to point your api subdomain to your hetzner VM
- Github Registry: to store your Docker builds

### Setting up a VM on Hetzner
You will need to create a heztner account, setup payment, and navigate to the console.

#### 1. Create an ssh key 

See [here](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)

#### 2. Add a server

Hetzner  Dashboard > Servers

Create a shared VM (start small)
- AMD
- OS: Ubuntu 22.04
- 2 vCPU
- 2 GB RAM
- 40 GB Disk local
- us-east or us-west
- Add your ssh key created above
- Note the IP of your new server

#### 3. Setup your server

SSH into your new server as root
```
ssh root@<VM-IP>
```

Add the deploy user
```
adduser deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

Install some core libraries
```
apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release
```

#### 4. Create the sqlite volumes

While still in your ssh session, create the volume that will be used to store sqlite file like

```
sudo mkdir -p /var/lib/<your-app>/<tenant or env>-data
sudo chown -R deploy:deploy /var/lib/<your-app>
```

An example
```
sudo mkdir -p /var/lib/fst/dev-data
sudo chown -R deploy:deploy /var/lib/fst
```

#### 5. Firewall setup

Hetzner Cloud console → Firewall → Create Firewall.

Add inbound rules:
```
Port 22   / TCP / Allow / (your IP only or 0.0.0.0/0 for initial setup)
Port 80   / TCP / Allow (Cloudflare IPs or 0.0.0.0/0)
Port 443  / TCP / Allow (Cloudflare IPs or 0.0.0.0/0)
```

Attach the firewall to your VM.

### Setting up your DNS in Cloudflare

#### 1. Setup DNS
Cloudflare Dashboard → DNS

Create an **A** record for each API instance or tenant:

```
Type: A
Name: <tenant or env>-api.example.com
Value: <Hetzner VM IP>
Proxy: Proxied (orange cloud)
```

#### 2. Cloudflare SSL/TLS Settings
Cloudflare Dashboard → SSL/TLS → Overview

```
SSL Mode: Full
```

#### 3. Enable “Always Use HTTPS”
Cloudflare Dashboard → SSL/TLS → Edge Certificates

Enable:
```
Always Use HTTPS
Automatic HTTPS Rewrites
```

#### 4. Confirm

- Cloudflare Dashboard → SSL/TLS → Origin Server: Confirm you don't see rules named `Origin Rules` and `Transform Rules`
- Cloudflare Dashboard → SSL/TLS → Edge Certificates: confirm you see certificates issues for your subdomains your created above

### Updating your deployment config
- Deployment config is under `config/deploy.yml`
- Update the config to match your relevant details

#### Secrets

Secrets are stored in `.kamal/secrets-common`. No actual clear text secrets should be stored in the file but pulled from other sources. Two options:

1. Store secret in local environment variables

In your terminal

Setup docker registry login
```
export REGISTRY_PASSWORD=mysupersecretpassword
```

Setup your API key to one of
```
export OPENAI_API_KEY=yourapikey
export ANTHROPIC_API_KEY=yourapikey
```

2. From a password manager like 1Password

See documentation in `.kamal/secrets-common` or https://kamal-deploy.org/

### Deploy and run

We've setup deployment related commands to be environment specific. This repo currently supports deploying to two target destinations `dev` and `demo` on the same VM at different subdomains. We will use `dev` for this section, but you can adjust `package.json` to match your preferred approach.

- Make sure your ssh agent is running and has your hetzner ssh key added
- Make sure docker is running locally
- Make sure your secrets are exported in your local machine
- Run `yarn dev:setup` if running a deploy for the **first time ever** on a fresh cloud VM
- Run `yarn dev:deploy` to build, migrate, and run the API (migration is run through the pre-deploy hook at `./kamal/hooks/pre-deploy`)
- Run the data seed first time, and as needed by `yarn dev:seed`
- Run `yarn dev:logs` to follow the server logs
- Test your API with something like `curl -I your-sub-domain-api.your-domain.com`

You can read more about hooks [here](https://kamal-deploy.org/docs/hooks/overview/).

Interested in deploying your frontend? See README in the frontend top level folder.

## Recommended tooling

- Beekeeper studio: sqlite query tool
- Insomnia: API tool
- Code editor: VsCode
- Preferred coding assistant: Codex or Claude Code

## AI/LLM assisted development

Update guidance to your code LLM in the AGENTS.md file.

  
