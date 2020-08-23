import { Component } from "inferno";
import { inv, invocable, le } from "./util-jsx";

/** 0=NONE, 1=NUMBER, */
type ilk = 0 | 1;
type Obj = { [key: string]: any };
type State = { [key: string]: any };
type Prop = { prop: string, state: State, ilk?: ilk, opChange?: invocable };

function valChange(c: Component<Prop, any>, e: Event) {
    let prop = c.props, state = prop.state;
    let val = (e.target as any).value;
    let strProp = prop.prop.split("."), len = strProp.length - 1;
    let tar: any = state;
    for (let i = 0; i < len; i++) {
        tar = tar[strProp[i]];
    }
    tar[strProp[len]] = prop.ilk === 1 ? parseFloat(val) : val;
    c.forceUpdate();
    if (prop.opChange) inv(prop.opChange, e);
}

function getVal(prop: Prop) {
    let strProp = prop.prop.split("."), len = strProp.length;
    let val: any = prop.state;
    for (let i = 0; i < len; i++) {
        val = val ? val[strProp[i]] : null;
    }
    return val;
}

const ignore: Obj = { prop: true, state: true, opChange: true, children: true };
/** copy an object, ignoring certain attributes */
function copy(obj: Obj) {
    let o2: Obj = {};
    for (let k in obj) {
        if (!ignore[k]) o2[k] = obj[k];
    }
    return o2;
}

type InputProps = Prop & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export class Input extends Component<InputProps> {
    render(props: InputProps) {
        let cp = copy(props);
        return <input {...cp} value={getVal(props)} onInput={le(valChange, this)}></input>
    }
}

type TextAreaProps = Prop & DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
export class TextArea extends Component<TextAreaProps> {
    render(props: TextAreaProps) {
        let cp = copy(props);
        return <textarea {...cp} value={getVal(props)} onInput={le(valChange, this)}></textarea>
    }
}

type SelectProps = Prop & DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
export class Select extends Component<SelectProps> {
    render(props: SelectProps) {
        let cp = copy(props);
        return <select {...cp} value={getVal(props)} onChange={le(valChange, this)}>{props.children}</select>
    }
}