# Devcontainer WASM-TS
Simple devcontainer for AssemblyScript/TypeScript development

# Usage

## Github Codespaces
Just click the button:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=575631506)


## Visual Studio Code
Note this assumes that you have the VS code support for remote containers and `docker` installed 
on your machine.

```sh
git clone https://github.com/dev-wasm/dev-wasm-ts
cd dev-wasm-ts
code ./
```

Visual studio should prompt you to see if you want to relaunch the workspace in a container, you do.

# Building and Running

## Simple Example
There is a simple example in the `simple` directory. To build and run:

```sh
cd simple
npm install
npm run build
wasmtime build/main.wasm --dir .
```

## Web serving with WAGI
There is an example of a WAGI web server in the `webserver` directory:

```sh
cd webserver
npm install
npm run build
npm run start
```
This will start a simple web server powered by lighttpd running on port localhost:8080. If you
are running in Github codespaces, it should prompt you to open a browser that will forward to
your codespace.

## HTTP client example
There is a more complicated example in the [`http` directory](./http/) which shows an example 
of making an HTTP client call using the experimental wasi+http support in [`wasmtime-http`](https://github.com/brendandburns/wasmtime).
