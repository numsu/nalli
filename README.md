# Nalli - Mobile wallet for Nano cryptocurrency
[Nalli](https://nalli.app) is a mobile wallet for [Nano](https://nano.org). Nalli allows you to send and receive Nano using phone numbers.

The app is built with React Native using the Expo platform.

## Features
- Non-custodial: keys are stored on your device
- Import/Export Nano and HD (BIP39/44) wallets, seeds and private keys
- Multiple account support
- Transact Nano to any contact or phone number
- Transact Nano with QR code or wallet address
- Over The Air (OTA) updates on application load
- Builds to iOS and Android
- SMS 2FA registration, pin login

## Running
In addition to the run commands below, Expo might require you to login.
```
yarn install
yarn start
```
## Contributing
Please open issues concerning bugs, feature requests etc.

The application's backend is not open source. Code contributions should be made using the production endpoints. Pull requests are welcome, make sure to open an issue before taking your time to implement a new feature and discuss it with the maintainers.

## Publishing
To publish a new version of the application via OTA, run
```
expo publish
```
To build the Android binary, run:
```
expo build:android
```
To build the iOS binary, run:
```
expo build:ios
```

## Donations
You can help Nalli development by sending a Nano donation. All donations will be used exclusively for maintenance costs and further development.

`nano_1iic4ggaxy3eyg89xmswhj1r5j9uj66beka8qjcte11bs6uc3wdwr7i9hepm`

## Community
Join the [Nalli discord channel](https://discord.gg/h88pUTZ)
