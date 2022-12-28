// @ts-ignore
import { Console } from "as-wasi/assembly";
import {
  Method,
  RequestBuilder,
  Response,
} from "@deislabs/wasi-experimental-http";

export function post(): void {
  let body = String.UTF8.encode("testing the body");
  let res = new RequestBuilder("https://postman-echo.com/post")
    .header("Content-Type", "text/plain")
    .method(Method.POST)
    .body(body)
    .send();

  print(res);
}

function print(res: Response): void {
  Console.log(res.status.toString());
  Console.log(res.headerGet("Content-Type"));
  let result = String.UTF8.decode(res.bodyReadAll().buffer);
  Console.log(result);
}

post();