import { cj } from "./util";
import { children, invocable } from "./util-jsx";

/** FULL=0, AUTO=1 */
type size = 0 | 1

type Props = { title?: string, opClose: invocable, size?: size } & children;
export function XDialog(props: Props) {
    return <div class="Dialog">
        <div class={cj(["bp", "bp-s"+(props.size || 0)])}>
            <div class="bp-h">
                <h3 class="bp-hh" $HasTextChildren>{props.title}</h3>
                <img onClick={props.opClose} class="bp-hi" src="https://static.f-list.net/images/icons/cross-circle-frame.png" alt="Close Preview" />
            </div>
            <div class="bp-c">
                {props.children}
            </div>
        </div>
    </div>
}