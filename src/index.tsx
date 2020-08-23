
import { render } from 'inferno';
import * as api from './code/api.service';
import { setJsxSelects } from './code/kink-to-custom-sels';
import { XShowUiBtn } from './code/showuibtn';
// @ts-ignore
import mainStyle from './code/style.css';
import { h, ID, ins, insb, Q } from './code/util';

// Inject styles
function styleInject(style: string) {
    const head = document.head;
    const s = h("style") as HTMLStyleElement & { styleSheet: { cssText: string } };
    s.type = "text/css";
    if (s.styleSheet) {
        s.styleSheet.cssText = style;
    } else {
        ins(s, document.createTextNode(style));
    }
    ins(head, s);
}
styleInject(mainStyle);

// Apply selection fixes
let sels = Q("[name='customkinkchoice[]'");
for (let i = 0, I = sels.length; i < I; i++) {
    let sel: HTMLSelectElement = sels[i] as any;
    if (sel.childElementCount >= 5) continue;
    let opt: HTMLOptionElement = h("option") as any; opt.value = "undecided"; opt.textContent = "Undecided";
    sel.appendChild(opt);
    if (sel.selectedIndex === 0 && sel.firstElementChild.getAttribute("selected") === null) {
        let seld = false;
        for (let j = 0, ch = sel.options, J = ch.length; j < J; j++) {
            if (ch[j].getAttribute("selected") !== null) { seld = true; sel.selectedIndex = j; break; }
        }
        if (!seld) { sel.selectedIndex = 4; }
    }
}

// Determine initial information
api.begin();

// Begin rendering
let df = new DocumentFragment();
render(<XShowUiBtn></XShowUiBtn>, df);
let btn = df.firstElementChild;
let customs = ID("CustomKinksList") as HTMLElement;
insb(customs, btn);
setJsxSelects();