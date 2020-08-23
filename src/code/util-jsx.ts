import { InfernoNode, LinkedEvent } from "inferno";
import { dequal } from "./util";

/** For use with static getDerivedStateFromProps */
export function deepStateFromProps(nextProps: any, state: any) {
    let res: any = null;
    for(let key in nextProps) {
        let prop = nextProps[key];
        if(!dequal(prop, state[key])) {
            if(!res) res={};
            res[key] = prop;
        }
    }
    return res;
}

/** For use with shouldComponentUpdate */
export function deepStateCheck(np:any, ns:any) {
    //@ts-ignore
    return !dequal(this.state, ns);
}

/** Invocable */
export type invocable = ((event?: any) => any) | LinkedEvent<any, any>;

/** Invoke a function or LinkEvent */
export function inv(fn: invocable, ev?: any) {
    if(fn) {
        if((<any>fn).event) {
            (<any>fn).event((<any>fn).data, ev);
        } else {
            (<any>fn)(ev);
        }
    }
}

/** LinkEvent reordered */
export function le<T, E extends Event>(event: (data: T, event: E) => void, data?: T): LinkedEvent<T, E> | null {
    return { data, event };
}

/** With Children Type */
export type children = { children?: InfernoNode };