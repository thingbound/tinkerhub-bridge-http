# tinkerhub-bridge-http

[Tinkerhub](https://github.com/tinkerhub/tinkerhub) plugin for accessing
things over HTTP.

## Usage

When running [tinkerhubd](https://github.com/tinkerhub/tinkerhub-daemon) install
via:

```
$ tinkerhubd install bridge-http
```

## Server port

Currently its not possible to configure the server port and it always starts on
port 10000.

## API

### `GET /v1/things`

List all the things that can be seen.

### `GET /v1/things/:tags`

List all the things that matches the given tags. Tags are comma-separated,
so `type:light,cap:dimmable` would be equivalent to calling
`th.get('type:light', 'cap:dimmable')` in the normal API.

### `GET /v1/things/:tags/call/:action`

Call an action on all things matching the tags. This will call the action
without any arguments.

### `POST /v1/things/:tags/call/:action`

Call an action on all things matching the tags. The body of the POST should
be in an array in JSON format. The array represents the arguments to pass to
the action.
