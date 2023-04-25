# P2P-Wazobia

P2P-Wazobia is a scalable REST-based wallet service that enables users to deposit, transfer and withdraw funds securely.

## Features
- Real-time transfer between wallets
- Deposit funds from your preferred card network for free
- Withdraw funds to your local bank account for free

## Quick start
### Docker (preferred):
1. Clone the repo:
```
> git clone git@github.com:lawalbolaji/p2p-wazobia.git
```
2. In the project's root directory, run:
```
> cp .env.example .env.local.docker
```
3. Update credentials in .env.local.docker
4. Boot up:
```
> docker-compose -f dev.docker-compose.yml up -d
```

### NodeJs & NPM:
1. Clone the repo:
```
> git clone git@github.com:lawalbolaji/p2p-wazobia.git
```
2. Follow instructions [here](/) to setup mysql database
3. In the project's root directory, run:
```
> cp .env.example .env.local.docker
```
4. Update credentials in .env.local.docker
5. Add Project Dependencies:
```
> npm ci --legacy-peer-deps
```
6. Boot up
```
> npm run start:dev
```

Don't forget to checkout our [documentation](/)!

## Deployment
Please refer to our deployment instructions [here](/).

## Contributing
- Missing something or found a bug? [Report here](/).
- Pull requests are welcome but for major issues, please open an issue [here](/) for discussion first.

## License
P2P-Wazobia is available under [Apache License 2.0](/).
