# Public REST API for React

## Ready-to-use Percentage: `60%`

## What is it?

This project automatically adds a public REST API to sit on top of any react project you build.

It has the ability to point to multiple specified databases.

## Setup

Make sure you install this on the same directory of your react `build` directory. This project sits above it and leaves your react project untouched.

### Folder Structure:

    ReactProjectName
    ├── build/
    │ ├── // Your built react project
    │ ├── static/
    │ ├── images/
    │ ├── index.html
    │ └── etc....
    ├── // This repo
    ├── node_modules/
    ├── settings.json
    ├── package.json
    ├── package-lock.json
    └── server.js

### Configure Environment

Install node modules

    $ npm install

Run the app

    $ node server.js

I recommend using something like pm2 to keep this server up in the background.

Also make sure to have your server setup for proxies.

### settings.json

These settings should be all you need to change to get everything working.

| Line                 | Explaination                                                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"databases": {...}` | Your database's info. You can add multiple databases.                                                                                                      |
| `"path": "/api"`     | The beginning of the url path. The url look like: `www.example.com/{path}/{DB_NAME}` for each database. Can't be blank or `/` <sub><sup>...yet</sup></sub> |
| `"port": 3000`       | The open port node will use when running the app.                                                                                                          |

## Current Issues:

When using create-react-app, registerServiceWorker.js can make this project dysfunctional when you go to the desired urls in a browser (particularly chrome). I plan on fixing this issue in the future, but in the mean time you can disable registerServiceWorker in your react project by commenting it out in the src/index.js file. Then the API urls will work with a **cache refresh** in your browser.
