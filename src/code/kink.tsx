import { Component, createRef } from "inferno";
import * as api from "./api.service";
import { $g } from "./global";
import { Kink } from "./model";
import { cj } from "./util";
import { deepStateFromProps } from "./util-jsx";

type XKProp = { kink: Kink }; type XKState = { kink: Kink, subs: Kink[] | undefined, sel: boolean };
export class XKink extends Component<XKProp, XKState> {
    state: XKState = {} as XKState;
    ref = createRef();

    render(props: XKProp, state: XKState) {
        const kink = state.kink;
        let multi = state.subs && state.subs.length > 0, open = kink._o;
        return <li ref={this.ref} class={cj([
            kink.choice,
            "kink",
            "multi", multi,
            "open", multi && open,
            "closed", multi && !open,
            "sel", state.sel,
            "custom", kink._c,
            "reg", !kink._c,
            "new", !kink._p])}>
            {kink.name}
            <XKinks kinks={state.subs}></XKinks>
        </li>
    }

    componentDidMount() {
        (this.ref.current as any)._k = this;
    }

    componentDidUpdate() {
        (this.ref.current as any)._k = this;
    }

    static getDerivedStateFromProps(np: XKProp, s: XKState) {
        let res = deepStateFromProps(np, s);
        let kink = np.kink || s.kink;
        if (!np.kink || !s.kink || np.kink.id !== s.kink.id) {
            res.subs = kink._c ? api.CustomToSubs.a[kink.id] : null;
        }
        let sel = $g.Sels.indexOf(kink) >= 0;
        if (sel !== s.sel) {
            if (!res) res = {};
            res.sel = sel;
        }
        return res;
    }

}

type XKSProp = { kinks: Kink[] | undefined, clazz?: string };
export class XKinks extends Component<XKSProp> {

    render(p: XKSProp) {
        const ks = p.kinks;
        if (!ks) return null;
        return <ul class={p.clazz || "subkinks"} $HasKeyedChildren>
            {ks.map(kink =>
                <XKink key={kink.id} kink={kink}></XKink>
            )}
        </ul>
    }

}