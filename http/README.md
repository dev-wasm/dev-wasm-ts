# Experimental HTTP Client Example

## Building
```sh
npm install
npm run build
```

Unfortunately, the current `@deislabs/wasi-experimental-http` package has a small
problem with the current `as-wasi` package. If you see the following error:

```sh
> asc main.ts --target release

ERROR TS6054: File '~lib/as-wasi.ts' not found.
   :
 3 │ import { Console } from "as-wasi";
   │                         ~~~~~~~~~
   └─ in ~lib/@deislabs/wasi-experimental-http/index.ts(3,25)

FAILURE 1 parse error(s)
```

You need to change the import in `./node_modules/@deislabs/index.ts` from `import "as-wasi"` to `import "as-wasi/assembly"` This will be fixed in upcoming releases.

## Running without allowed hosts

```sh
# npm run start

> start
> wasmtime-http --wasi-modules=experimental-wasi-http build/main.wasm

ERROR CODE: 7
ERROR MESSAGE: Destination URL not allowed.
abort:  in (0:0)
Error: failed to run main module `build/main.wasm`

Caused by:
    0: failed to invoke command default
    1: error while executing at wasm backtrace:
           0:  0x54d - <unknown>!<wasm function 7>
           1: 0x1f76 - <unknown>!<wasm function 30>
           2: 0x21bf - <unknown>!<wasm function 31>
           3: 0x16d3 - <unknown>!<wasm function 26>
    2: exit with invalid exit status outside of [0..126)
```

By default the WASI-http runtime blocks all URLs, to open up the URL, use the `WASI_HTTP_ALLOWED_HOSTS` environment variable:

```sh
# This can be a comma separated list of URLs to allow
WASI_HTTP_ALLOWED_HOSTS=https://postman-echo.com npm run start

> start
> wasmtime-http --wasi-modules=experimental-wasi-http build/main.wasm

200
application/json; charset=utf-8
{"args":{},"data":"testing the body","files":{},"form":{},"headers":{"x-forwarded-proto":"https","x-forwarded-port":"443","host":"postman-echo.com","x-amzn-trace-id":"Root=1-63ab9531-13e124c75e84780c72f04c95","content-length":"16","content-type":"text/plain","accept":"*/*"},"json":null,"url":"https://postman-echo.com/post"}
```