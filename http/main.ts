// @ts-ignore
import { Console } from "as-wasi/assembly";
import { request, HeaderValue } from "./request";
export function cabi_realloc(a: usize, b: usize, c: usize, len: usize): usize {
  return heap.alloc(len);
}

export function get(url: string, headers: HeaderValue[]): void {
  let response = request("GET", url, null, headers);
  Console.log(`Status: ${response.StatusCode}`);
  Console.log(`${response.Body}`);
}

export function post(url: string, body: string): void {
  let response = request("POST", url, body, null);
  Console.log(`Status: ${response.StatusCode}`);
  Console.log(`${response.Body}`);
}

get("https://postman-echo.com/get", [{name: "User-Agent", value: "Wasi-HTTP"}]);
get("https://postman-echo.com/get?some=args&go=here", [{name: "User-Agent", value: "Wasi-HTTP"}]);
post("https://postman-echo.com/post", '{"some": "value", "goes": "here"}');