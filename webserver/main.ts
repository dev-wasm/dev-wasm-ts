import { Console, Environ } from "as-wasi/assembly";

function queryArgs(q: string | null): Map<string, string> {
    const result = new Map<string, string>();
    if (!q) { return result; }
    const parts = q.split("&");
    for (var i = 0; i < parts.length; i++) {
        const pieces = parts[i].split('=');
        if (pieces.length === 1) {
            result.set(pieces[0], '');
        }
        if (pieces.length === 2) {
            result.set(pieces[0], pieces[1]);
        }
    }
    return result;
}

const e = new Environ();
const query = queryArgs(e.get('QUERY_STRING'));
Console.log("Content-type: text/html");
Console.log("");
Console.log(`<html><body>Hello ${query.has('name') ? query['name'] : 'unknown'}</body></html>`);