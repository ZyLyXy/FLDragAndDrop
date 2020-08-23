import { Component } from "inferno";
import { $g } from "./global";
import { Select } from "./inputs";
import { le } from "./util-jsx";
import { XBtn } from "./xbtn";

/** Ranges for empty characters. */
const rng = [173,
    847,
    1564,
    6068, 6069,
    6155, 6156, 6157, 6158,
    8203, 8204, 8205, 8206, 8207,
    8234, /*8235,*/ 8236, 8237,
    8288, 8289, 8290, 8291, 8292, 8293, 8294, /*8295,*/ 8296, 8297, 8298, 8299, 8300, 8301, 8302, 8303];

/** HEADER=0 | CONTENT=1 | FOOTER=2 | NONE=3 */
type nameType = 0 | 1 | 2 | 3;

function unborderedName(name: string): [string, nameType] {
    if (!name) return ["", 3];
    let i = name.indexOf("【"), j = -1;
    if (i >= 0) {
        j = name.indexOf("】", i);
        if (j >= 0) return [name.substring(i + 1, j), 0];
    }
    i = name.indexOf("│");
    if (i >= 0) return [name.substring(i + 1), 1];
    i = name.indexOf("〔", i);
    if (i >= 0) {
        j = name.indexOf("〕", i);
        return [name.substring(i + 1, j), 2];
    }
    if (name.endsWith("└──────────────────────┘")) return ["", 2];
    if(name.charCodeAt(1) === rng[0]) return [name.substring(2), 3];
    if(rng.indexOf(name.charCodeAt(0)) >= 0) return [name.substring(1), 3];
    return [name, 3];
}

function changeKink(change: nameType, num: number) {
    let Sels = $g.Sels;
    if (!Sels || Sels.length < 1 || !Sels[0]._c) return;
    let code = num < 0 ? "" : String.fromCharCode(num), baseCode = num < 0 ? "" : String.fromCharCode(rng[0]);
    for (let i = 0, I = Sels.length; i < I; i++) {
        let sel = Sels[i];
        let nameAndType = unborderedName(sel.name);
        let op = change < 3 ? change : nameAndType[1];
        let name = nameAndType[0];
        switch (op) {
            case 0: sel.name = code + baseCode + "┌【" + name + "】┐"; break;
            case 1: sel.name = code + "│" + name; break;
            case 2: sel.name = code + (name ? "└〔" + name + "〕┘" : "└──────────────────────┘"); break;
            case 3: sel.name = code + name; break;
        }
    }
    $g.UpdateUi();
}

function toHeader(h: XHeadingBtns) {
    changeKink(0, h.state.num);
}

function toContent(h: XHeadingBtns) {
    changeKink(1, h.state.num);
}

function toFooter(h: XHeadingBtns) {
    changeKink(2, h.state.num);
}

function numChange(h: XHeadingBtns) {
    changeKink(3, h.state.num);
}

type Props = {}; type State = { num: number };
export class XHeadingBtns extends Component<Props, State> {

    componentDidMount() {
        $g.Updates.HB = this;
    }

    state = { num: -1 } as State;
    render(props: Props, state: State) {
        let sel0 = $g.Sels[$g.Sels.length - 1];
        let val = sel0 ? rng.indexOf(sel0.name.charCodeAt(0)) : -1;
        if (val >= 0) {
            state.num = rng[val]; // Hack, change initial num on render...
        } else {
            state.num = -1;
        }

        return <>
            <XBtn clazz="x-btn btn-f" opClick={le(toHeader, this)}>◎ Header</XBtn>
            <XBtn clazz="x-btn btn-n" opClick={le(toContent, this)}>◎ Content</XBtn>
            <XBtn clazz="x-btn btn-n" opClick={le(toFooter, this)}>◎ Footer</XBtn>
            <Select class="x-sel" prop="num" state={state} ilk={1} opChange={le(numChange, this)} $HasKeyedChildren>
                <option key={-1} value={-1} $HasTextChildren>X</option>
                {rng.map((num, i) =>
                    <option key={num} value={num} $HasTextChildren>{i + ": " + num}</option>
                )}
            </Select>
        </>
    }

}