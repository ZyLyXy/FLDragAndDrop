import { Component, render, VNode } from "inferno";
import * as api from "./api.service";
import { Kink, WindowFList } from "./model";
import { cj, Q } from "./util";
import { le } from "./util-jsx";
import { XBtn } from "./xbtn";

const NO_SEL = "X";
let customs: Kink[];
let options: JSX.Element[];
let jsx: JSX.Element[];

// Hijack this (unused?) function to redo select options.
const FL = (window as any as WindowFList).FList;
let oldRC = FL.Subfetish.Data.removeCustom;
FL.Subfetish.Data.removeCustom = function (id: string) {
    let fid = parseInt(id) > 500 ? id : "N" + id;
    api.removeCustom(api.CustomKinks.b[fid]);
    updateSelects();
    oldRC(id);
}

function filterPersited(arg: Kink) {
    return arg && arg._p;
}
function craftOptions() {
    // Determine the selectable custom kinks
    let custs = api.CustomKinks.a.filter(filterPersited).sort(api.compare);
    let eq = customs && customs.length === custs.length;
    if (eq) for (let i = 0, I = customs.length; i < I; i++) {
        if (custs[i].id !== customs[i].id) {
            eq = false;
            break;
        }
    }
    if (eq) {
        return options;
    }
    // Create the possible options
    customs = custs;
    let options0: JSX.Element[] = new Array(customs.length + 1);
    options0[0] = <option key={NO_SEL} class="opt-kink" value={NO_SEL} $HasTextChildren>None</option>;
    for (let i = 0, I = customs.length; i < I; i++) {
        let kink = customs[i];
        options0[i + 1] = <option key={kink.id} class={"opt-kink " + kink.choice} value={kink.id} $HasTextChildren>{kink.name}</option>
    }
    return options0;
}
function craftJsx() {
    // Create the array of JSX nodes
    let kinks = api.Kinks.a;
    let subsToCustom = api.CustomToSubs.b;
    let jsx0: JSX.Element[] = new Array(kinks.length);
    for (let i = 0, I = kinks.length; i < I; i++) {
        let kink = kinks[i];
        let par = subsToCustom[kink.id], sel = par ? par.id : NO_SEL;
        jsx0[i] = <KinkToCustomSel key={kink.id} kink={kink} sel={sel} opts={options}></KinkToCustomSel>;
    }
    return jsx0;
}
export function setJsxSelects() {
    options = craftOptions();
    jsx = craftJsx();
    // Render all of it to the DOM
    let selMap: { [key: string]: JSX.Element } = {};
    for (let i = 0, I = jsx.length; i < I; i++) {
        let sels = jsx[i];
        selMap[sels.props.kink.id] = sels;
    }
    let htmlKinks = Q(".FetishItem");
    for (let i = 0, I = htmlKinks.length; i < I; i++) {
        let el = htmlKinks[i];
        let id = el.id.substring(10);
        let sel = selMap[id];
        if (sel) {
            let frag = new DocumentFragment();
            render(sel, frag);
            el.children[2].appendChild(frag.firstElementChild);
        }
    }
}
// Update all the JSX nodes
export function updateSelects() {
    options = craftOptions();
    let subsToCustom = api.CustomToSubs.b;
    for (let i = 0, I = jsx.length; i < I; i++) {
        let jsxSel = jsx[i];
        let kink = jsxSel.props.kink;
        let par = subsToCustom[kink.id], sel = par ? par.id : NO_SEL;
        ((jsxSel as VNode).children as Component).setState({ sel: sel, opts: options });
    }
}

// Change kink to the selected value
function changedKink(k: KinkToCustomSel, e: Event) {
    let id = (e.target as HTMLSelectElement).value;
    if (id === NO_SEL) {
        api.removeSubfetish(k.props.kink.id);
    } else {
        let custKink = api.CustomKinks.b[id];
        if (custKink) {
            let kink = k.props.kink;
            kink.choice = custKink.choice;
            api.choiceChange(kink);
            api.addSubfetish(custKink, kink);
        }
    }
    api.subFetToFetIds(); // For now, immediately apply _all_ the changes to the ID map.
    k.setState({ sel: id });
}

function remKink(k: KinkToCustomSel) {
    api.removeSubfetish(k.props.kink.id);
    api.subFetToFetIds();
    k.setState({ sel: NO_SEL });
}

// Properties and State
type P = { kink: Kink, sel: string, opts: JSX.Element[] }; type S = { sel: string, opts: JSX.Element[] };
// Actual select component with the selected value, onChange link, and possible options
class KinkToCustomSel extends Component<P, S> {
    state = {} as S;

    render(props: P, state: S) {
        const sel = state.sel;
        return <div class="sel-kink-div">
            <select class={cj(["sel-kink", "none", sel === NO_SEL])} value={sel} onChange={le(changedKink, this)}>{state.opts}</select>
            <XBtn clazz="sel-kink-x x-btn btn-l" isDisabled={sel === NO_SEL} opClick={le(remKink, this)}>×</XBtn>
        </div>
    }

    shouldComponentUpdate(np: P, ns: S) {
        let s = this.state;
        return s.sel !== ns.sel || s.opts !== ns.opts;
    }

    static getDerivedStateFromProps(np: P, s: S) {
        let obj: S;
        if (!s.sel) {
            obj = { sel: np.sel } as S;
        }
        if (!s.opts) {
            if (!obj) obj = { opts: options } as S;
            else obj.opts = options;
        }
        return obj;
    }
}