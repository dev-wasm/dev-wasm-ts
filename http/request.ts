import * as raw from "./raw";

function getMethod(method: string): i32 {
    if (method === "GET") return 0;
    if (method == "HEAD") return 1;
    if (method == "POST") return 2;
    if (method == "PUT") return 3;
    if (method == "DELETE") return 4;
    if (method == "CONNECT") return 5;
    if (method == "OPTIONS") return 6;
    if (method == "TRACE") return 7;
    if (method == "PATCH") return 8;
    throw ("Unknown method: " + method);
}

export class Response {
    StatusCode: number;
    Body: string;

    constructor() {
        this.StatusCode = 0;
        this.Body = "";
    }

    public toString(): string {
        return `${this.StatusCode}\n${this.Body}\n`;
    }
}

class URL {
    scheme: string;
    authority: string;
    path: string;
    query: string;

    constructor(url: string) {
        // TODO: this should be a regexp.
        let ix = url.indexOf("//");
        this.scheme = url.substring(0, ix);
    
        let ix2 = url.indexOf("/", ix + 2);
        this.authority = ix2 === -1 ? url.substring(ix+2) : url.substring(ix+2, ix2);
    
        if (ix2 === -1) {
            this.path = "";
            this.query = "";
        } else { 
            let ix3 = url.indexOf("?");
            this.path = ix3 === -1 ? url.substring(ix2) : url.substring(ix2, ix3);
    
            if (ix3 === -1) {
                this.query = "";
            } else {
                // TODO: Hash here?
                this.query = url.substring(ix3);
            }
        }
    }
}

export class HeaderValue {
    name: string;
    value: string;
}

export function request(method: string, url: string, body: string | null, headers: HeaderValue[] | null): Response {
    let u = new URL(url);
    let ret = new Response();

    let header_ptr: usize = 0;
    let header_length = headers === null ? 0 : headers.length;
    let wasi_headers = [] as raw.WasiString[][];
    if (headers !== null) {
        wasi_headers = headers.map((header: HeaderValue): raw.WasiString[] => {
            return [new raw.WasiString(header.name), new raw.WasiString(header.value)];
        });

        let buf = new ArrayBuffer(16 * header_length);
        let dv = new DataView(buf, 0, 16 * header_length);
        for (let i = 0; i < wasi_headers.length; i++) {
            let header = wasi_headers[i];
            dv.setInt32(0, header[0].ptr as i32, true);
            dv.setInt32(4, header[0].length as i32, true);
            dv.setInt32(8, header[1].ptr as i32, true);
            dv.setInt32(12, header[1].length as i32, true);        
        }

        header_ptr = changetype<usize>(buf);
    }
    let header_handle = raw.new_fields(header_ptr, header_length);

    let path = new raw.WasiString(u.path + (u.query.length > 0 ? (u.query) : ""));
    let authority = new raw.WasiString(u.authority);
    let m = getMethod(method);
    let req = raw.new_outgoing_request(m, 0, 0, 1, path.ptr, path.length, 0, 0, 0, 0, 1, authority.ptr, authority.length, header_handle);

    let res: raw.WasiPtr<raw.WasiHandle>;

    if (body != null && body.length > 0) {
        raw.outgoing_request_write(req, res);
        let tmp = new ArrayBuffer(8);
        memory.copy(changetype<usize>(tmp), res, 8);
        let dv = new DataView(tmp);
        let is_err = dv.getUint32(0, true);
        let output_stream = dv.getUint32(4, true);
        let body_string = new raw.WasiString(body);

        // TODO: check errors here.
        raw.streams_write(output_stream, body_string.ptr, body_string.length, res);
    }
    let fut = raw.handle(req, 0, 0, 0, 0, 0, 0, 0);

    raw.future_incoming_response_get(fut, res);
    let tmp = new ArrayBuffer(12);
    memory.copy(changetype<usize>(tmp), res, 12);
    let dv = new DataView(tmp);
    let is_some = dv.getUint32(0, true);
    let is_err = dv.getUint32(4, true);
    let val = dv.getUint32(8, true);
    if (!is_some || is_err) {
        ret.StatusCode = -1;
        return ret;
    }
    ret.StatusCode = raw.incoming_response_status(val);

    let h = raw.incoming_response_headers(val);
    let ptr = heap.alloc(8);
    raw.incoming_response_consume(val, ptr);
    tmp = new ArrayBuffer(8);
    memory.copy(changetype<usize>(tmp), ptr, 8);
    heap.free(ptr);
    dv = new DataView(tmp);
    is_some = dv.getUint32(0, true);
    let stream = dv.getUint32(4, true);
    ptr = heap.alloc(16);
    raw.streams_read(stream, 1024 * 1024, ptr);
    tmp = new ArrayBuffer(16);
    memory.copy(changetype<usize>(tmp), ptr, 16);
    heap.free(ptr);
    dv = new DataView(tmp);
    is_err = dv.getUint32(0, true);
    ptr = dv.getUint32(4, true);
    let len = dv.getUint32(8, true);
    tmp = new ArrayBuffer(len);
    memory.copy(changetype<usize>(tmp), ptr, len);
    ret.Body = String.UTF8.decode(tmp);

    return ret;
}