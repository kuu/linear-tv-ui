# linear-tv-ui
Linear TV UI demo

## Prerequisite
Node.js version 6+

## Install
```
$ git clone git@github.com:kuu/linear-tv-ui.git
$ cd linear-tv-ui
$ npm install
$ npm run build
```

## Config
Put config file(s) in your work directory.
```js
$ mkdir config
$ vi config/default.json
{
  "server": {
    "host": "localhost",
    "port": 3004
  },
  "api": {
    "key": "Your Ooyala API Key",
    "secret": "Your Ooyala API Secret"
  },
  "player": {
    "pcode": "Provider Code (Left part of the api key)",
    "playerBrandingId": "Player Id",
    "version": "Player version"
  }
}
```

## Run
```
$ npm run watch
```
