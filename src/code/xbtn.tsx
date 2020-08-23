import { cj } from "./util";
import { children, inv, invocable, le } from "./util-jsx";

function anchorClick(p: any, e:Event) {
    inv(p.opClick, e);
    return false;
}

export function XBtn(props: {clazz?: string, opClick?: invocable, isDisabled?: boolean} & children) {
    let disabled = props.isDisabled;
    return <a class={cj([props.clazz || "x-btn", "x-dis", disabled])} onClick={!disabled && le(anchorClick, props)}>{props.children}</a>
}