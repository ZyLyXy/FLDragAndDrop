import * as api from "./api.service";
import { $g } from "./global";
import { XKink } from "./kink";
import { Kink, LIKE } from "./model";
import { AE } from "./util";

/** Drop to is either a choice or a CustomKink */
type DropTo = { c?: LIKE, k?: Kink };
/** Element with XKink */
type exk = { _k?: XKink };
/** Element with Init Bool */
type ini = { _i?: boolean };

/** Drag-N-Drop / Selection Service */
let El: HTMLElement; // Element containing items to drag n' drop
let Last: Kink = null; // Last clicked Kink

function mouseUp(e: Event) {
    let el = findKinkEl(e);
    if (el) {
        el.removeAttribute("draggable");
    }
}

function ctxMenu(e: Event) {
    let el = findKinkEl(e);
    if (el) {
        e.preventDefault();
        $g.initEditDialog(el._k.state.kink);
        return false;
    }
}

function drop(e: Event) {
    dragEnd();
    const Sels = $g.Sels;
    if (Sels.length < 1) { return; }
    let sel0 = Sels[0];
    let customSel = sel0._c;
    let tar = getDroppedTo(e, !customSel);
    if (tar) {
        if (tar.c) {
            for (let i = 0, I = Sels.length; i < I; i++) {
                let sel = Sels[i];
                sel.choice = tar.c;
                if (customSel) {
                    let sfcs = api.CustomToSubs.a[sel.id];
                    if (sfcs) for (let j = 0, J = sfcs.length; j < J; j++) {
                        sfcs[j].choice = tar.c;
                    }
                } else {
                    api.removeSubfetish(sel.id);
                }
            }
        } else {
            let kink = tar.k;
            if (kink._p) {
                for (let i = 0, I = Sels.length; i < I; i++) {
                    let sel = Sels[i];
                    sel.choice = kink.choice;
                    api.addSubfetish(kink, sel);
                }
                kink._o = true;
            } else {
                // Could warn about new kinks needing to be persisted first...
            }
        }
        $g.UpdateUi();
    }
}

function dragOver(e: Event) {
    let t = e.target as HTMLElement;
    while (t) {
        let cn = t.className;
        if (cn === "box" || cn === "kinks" || cn === "subkinks") {
            e.preventDefault();
            return;
        }
        t = t.parentElement;
    }
}

function dragEnd() {
    El.classList.remove("drag");
}

function dragStart(e: Event) {
    El.classList.add("drag");
    $g.ToolTip.clearTip();
    let el = findKinkEl(e);
    let xk = el._k;
    let k = xk.state.kink;
    if ($g.Sels.indexOf(k) < 0) {
        click(e as MouseEvent, true);
    }
}

function mouseDown(e: Event) {
    let el = findKinkEl(e);
    if (el) {
        el.draggable = true;
    }
}

function mouseOver(e: Event) {
    let kEl = findKinkEl(e);
    if (kEl) {
        let kink: Kink = kEl._k.state.kink;
        $g.ToolTip.showTip(kink.id, kink.name, kink.description, kEl, 18);
    } else {
        $g.ToolTip.clearTip();
    }
}

function mouseLeave() {
    $g.ToolTip.clearTip();
}

function click(ev: MouseEvent, forceSel?: boolean) {
    let e = findKinkEl(ev);
    if (!e) return;
    let xk = e._k;
    let xstate = xk.state;
    let kink = xstate.kink;
    let CustomSubs = api.CustomToSubs;
    let sf = CustomSubs.a[kink.id];
    let multi = sf && sf.length > 0;
    let cust = CustomSubs.b[kink.id];
    if (!forceSel && ev.offsetX <= (cust ? 46 : 32)) { // Icon click
        if (multi && ev.offsetX <= 16) { // + click for multi
            kink._o = !kink._o;
            xk.forceUpdate();
        } else {
            $g.initEditDialog(kink);
        }
    } else {
        let sel0 = $g.Sels[0];
        if (sel0) {
            if (sel0._c !== kink._c) {
                $g.Sels = [];
                Last = kink;
            }
        }
        if (!ev.shiftKey || Last === null || (Last._c && !api.CustomKinks.b[Last.id])) {
            Last = kink;
        }
        if (ev.shiftKey && $g.Sels.length > 0) {
            if (kink.choice === Last.choice) {
                $g.Sels = [];
                let kinks = cust ? CustomSubs.a[cust.id] : kink._c ? api.CustomKinks.a : api.Kinks.a;
                let tIdx = kinks.indexOf(kink), lastIdx = kinks.indexOf(Last);
                for (let i = tIdx < lastIdx ? tIdx : lastIdx, I = tIdx < lastIdx ? lastIdx : tIdx; i <= I; i++) {
                    $g.Sels.push(kinks[i]);
                }
            }
        } else if (ev.ctrlKey) {
            let idx = $g.Sels.indexOf(kink);
            if (idx >= 0) {
                $g.Sels.splice(idx, 1);
            } else {
                $g.Sels.push(kink);
            }
        } else {
            $g.Sels = [kink];
        }
        $g.UpdateUi();
    }
}

function findKinkEl(e: Event): HTMLElement & exk | undefined {
    let t = e.target as HTMLElement;
    while (t && t !== El) {
        let kink = (<exk>t)._k;
        if (kink) return t;
        t = t.parentElement;
    }
}

function getDroppedTo(e: Event, regKink: boolean): DropTo {
    let t = e.target as HTMLElement;
    while (t && t !== El) {
        let cn = t.className;
        let xk: XKink = regKink && (<exk>t)._k;
        let kink = regKink && xk && xk.state.kink;
        if (regKink && kink && kink._c) {
            return { k: kink };
        } else if (cn === "box") {
            return { c: t.firstElementChild.textContent.toLowerCase() as LIKE };
        }
        t = t.parentElement;
    }
    return null;
}

export function doDragDropBinds(e: HTMLElement) {
    if (!e || (e as ini)._i) {
        return;
    }
    const touch = 'ontouchstart' in window;
    (e as ini)._i = true;
    El = e;
    $g.Sels = [];
    AE(e, "mouseover", mouseOver);
    AE(e, "mouseleave", mouseLeave);
    AE(e, "click", click);
    AE(e, "contextmenu", ctxMenu);
    AE(e, touch ? "touchend" : "mouseup", mouseUp);
    AE(e, touch ? "touchstart" : "mousedown", mouseDown);
    AE(e, "dragover", dragOver);
    AE(e, "dragstart", dragStart);
    AE(e, "dragend", dragEnd);
    AE(e, "drop", drop);
}