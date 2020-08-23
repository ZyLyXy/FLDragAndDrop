/** Callbacks */
export type callback<E, D> = (err?: E, data?: D) => any;

/** Classname Join */
export function cj(data: any[]) {
    let ar = [];
    for (let i = 0, I = data.length; i < I; i++) {
        let j = i + 1;
        if(j < I) {
            let nx = data[j], ok = !!nx;
            if(ok && nx.constructor === String) {
                ar.push(data[i]);
            } else {
                if(ok) {
                    ar.push(data[i]);
                }
                i++;
            }
        } else {
            ar.push(data[i]);
        }
    }
    return ar.join(" ");
}

/** String, value between two points */
export function strAt(str: string, pre: string, post: string) {
    let i = str.indexOf(pre);
    if (i < 0) return "";
    let afterI = i + pre.length;
    let j = str.indexOf(post, afterI);
    if (j < 0) return "";
    return str.substring(afterI, j);
}

/** Xhr Options */
interface XhrOpts {
    type?: "arraybuffer" | "blob" | "document" | "json" | "text";
    headers?: string[];
    sync?: boolean;
}

/** Network Request */
export function xhr(method: string,
    url: string,
    body?: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams
        | ReadableStream<Uint8Array> | null | undefined,
    opts?: XhrOpts | null | undefined,
    fn?: callback<boolean, XMLHttpRequest>) {
    const x = new XMLHttpRequest();
    if (fn) {
        x.onreadystatechange = function () {
            if (x.readyState !== 4) { return; }
            fn(x.status !== 200, x);
        };
    }
    if (opts) {
        let type = opts.type;
        if (type) {
            x.responseType = type;
        }
    }
    x.open(method, url, opts ? !opts.sync : true);
    if (opts) {
        let heads = opts.headers;
        if (heads) {
            for (let i = 0, I = heads.length; i < I; i += 2) {
                x.setRequestHeader(heads[i], heads[i + 1]);
            }
        }
    }
    x.send(body);
}

/** Map for copy visited usage */
const VST = new Map();

/** Basic Deep Copy */
export function dcopy(obj: any, noClear?: boolean) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }
    let csr = obj.constructor;
    if (csr === Date) {
        return new Date(obj) as any;
    }
    if (csr === RegExp) {
        return obj;
    }
    let result: any = VST.get(obj);
    if (!result) {
        if (csr === Array) {
            result = [];
            VST.set(obj, result);
            for (let i = 0, I = obj.length; i < I; i++) {
                result.push(dcopy(obj[i], true));
            }
        } else {
            result = {};
            VST.set(obj, result);
            for (let key in obj) {
                result[key] = dcopy(obj[key], true);
            }
        }
    }
    if (!noClear) VST.clear();
    return result;
}

/** Basic Deep Equal Comparison */
export function dequal(o0: any, o1: any, noc?: boolean): boolean {
    if (o0 === o1) {
        return true;
    }
    if ((!o0 || typeof o0 !== 'object') || (!o1 || typeof o1 !== 'object')) {
        return false;
    }
    let csr0 = o0.constructor;
    if (csr0 !== o1.constructor) {
        return false;
    }
    if (csr0 === Date) {
        return o0.getTime() === o1.getTime();
    }
    if (csr0 === RegExp) {
        return o0.source === o1.source;
    }
    let oVst = VST.get(o0);
    if (!oVst) {
        VST.set(o0, o1);
        if (csr0 === Array) {
            let len = o0.length;
            if (len !== o1.length) { if (!noc) VST.clear(); return false; }
            for (let i = 0; i < len; i++) {
                if (!dequal(o0[i], o1[i], true)) { if (!noc) VST.clear(); return false; }
            }
        } else {
            let k0 = Object.keys(o0), k1 = Object.keys(o1), len = k0.length;
            if (len !== k1.length) { if (!noc) VST.clear(); return false; }
            for (let i = 0; i < len; i++) {
                let key = k0[i];
                if (!dequal(o0[key], o1[key], true)) { if (!noc) VST.clear(); return false; }
            }
        }
    } else if (noc) { // VST.has(o)===true should only occur if noc===true
        return o1 === oVst;
    }
    if (!noc) VST.clear();
    return true;
}

/** Get By Id */
export function ID(id: string): HTMLElement {
    return document.getElementById(id);
}

/** Query Selector All */
export function Q(query: string): NodeListOf<HTMLElement> {
    return document.querySelectorAll(query);
}

/** Query Selector One */
export function Q1(query: string): HTMLElement {
    return document.querySelector(query) as HTMLElement;
}

/** AddEventListener */
export function AE<K extends keyof HTMLElementTagNameMap, L extends keyof HTMLElementEventMap>(
    el: HTMLElementTagNameMap[K],
    at: L,
    fn: (this: HTMLElementTagNameMap[K], ev: HTMLElementEventMap[L]) => any,
    opts?: boolean | AddEventListenerOptions) {
    if(opts === undefined) el.addEventListener(at, fn as any)
    else el.addEventListener(at, fn as any, opts);
}

/** Remove Element */
export function rem(el: Node) {
    const p = el.parentElement;
    if (p) {
        return p.removeChild(el);
    }
}

/** Make Element */
export function h(tag: string) {
    return document.createElement(tag);
}

/** Insert Before */
export function insb(el: Node, toIns: Node) {
    const p = el.parentElement;
    if (p) {
        return p.insertBefore(toIns, el);
    }
}

/** Insert as Child */
export function ins(el: Node, toAdd: Node) {
    return el.appendChild(toAdd);
}


type tid = { id: string }
/** IndexOf By Id Prop */
export function idxOfId<T extends tid>(arr: T[], id: any) {
    for (let i = 0, I = arr.length; i < I; i++) {
        if (arr[i].id === id) return i;
    }
    return -1;
}

/** Basic map with an array (for traversing / sorting), assumes type has "id" */
export class BMap<T extends tid> {
    /** Map */
    public b: { [key: string]: T } = {};
    /** Array */
    public a: T[] = [];

    /** Set Value, and Push||Unshift. For now, assume objects have a "id" prop */
    public set(val: T, atStart?: boolean) {
        let a = this.a, id = val.id, idx = idxOfId(a, id);
        this.b[id] = val;
        if (idx >= 0) {
            a[idx] = val;
        } else {
            atStart ? a.unshift(val) : a.push(val);
        }
    }

    /** Force Set and Push */
    public fset(val: T) {
        let id = val.id;
        this.b[id] = val;
        this.a.push(val);
    }

    /** Remove */
    public rem(val: T) {
        let a = this.a, id = val.id, idx = idxOfId(a, id);
        delete this.b[id];
        if (idx >= 0) {
            a.splice(idx, 1);
        }
    }

    /** Clear. Note: For now, the 'map' of {} is reinstantiated. */
    public clear() {
        this.a.length = 0;
        this.b = {};
    }
}

/** Basic bidirectional map, assumes type has "id" prop */
export class BiMap<T extends tid> {
    /** Main Map */
    public a: { [key: string]: T[] } = {};
    /** Backwards Map */
    public b: { [key: string]: T } = {};

    /** Set Value */
    public set(main: T, sub: T[]) {
        let back = this.b, mainId = main.id;
        this.remK(mainId);        
        this.a[mainId] = sub;
        for (let i = 0, I = sub.length; i < I; i++) {
            back[sub[i].id] = main;
        }
    }

    /** Add Value */
    public add(main: T, sub: T) {
        let back = this.b, mainId = main.id, subId = sub.id;
        this.remV(subId);
        let subs = this.a[mainId];
        if(!subs) subs = this.a[mainId] = [sub];
        else subs.push(sub);
        back[sub.id] = main;        
    }

    /** Remove by value */
    public remV(subId: string) {
        let back = this.b;
        let main = back[subId];
        if(main) {
            let arr = this.a[main.id];
            if (arr) {
                let i = idxOfId(arr, subId);
                if (i >= 0) arr.splice(i, 1);
            }
        }
        delete back[subId];
    }

    /** Remove by key */
    public remK(keyId: string) {        
        let arr = this.a[keyId];
        if (arr) {
            let back = this.b;
            for (let i = 0, I = arr.length; i < I; i++) {
                delete back[arr[i].id];
            }
            delete this.a[keyId];
        }
    }

    /** Clear. Note: For now, the 'map' of {} is reinstantiated. */
    public clear() {
        this.a = {};
        this.b = {};
    }
}