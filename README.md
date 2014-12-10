simple-log-stats
----------------

A :cool: log parser for heroku router logs.

## Usage

Have your log file at the ready and point the program at it:

```bash
$ npm install
$ time ./main.js ~/sample.log
```

The `routes.json` file contains the set of routes you care about (the whitelist).

## Running the tests

```bash
$ npm test
```
