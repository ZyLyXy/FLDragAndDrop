import { Component } from "inferno";
import * as api from "./api.service";
import { XKinks } from "./kink";
import { Kink } from "./model";

function cap(str: string): string {
    return str[0].toUpperCase() + str.substring(1);
}

type Props = { name: string }; type State = { kinks: Kink[] }
export class XBox extends Component<Props> {

    render(p: Props, s: State) {
        return <div class="box">
            <div $HasTextChildren>{cap(p.name)}</div>
            <XKinks clazz="kinks" kinks={s.kinks}></XKinks>
        </div>
    }

    static getDerivedStateFromProps(np: Props, s: State) {
        let kinks: Kink[] = [];
        let cks = api.CustomKinks.a;
        let name = np.name;
        for (let i = 0, I = cks.length; i < I; i++) {
            let ck = cks[i];
            if (ck.choice === name) {
                kinks.push(ck);
            }
        }
        let ks = api.Kinks.a;
        let subsWithParMap = api.CustomToSubs.b;
        for (let i = 0, I = ks.length; i < I; i++) {
            let k = ks[i];
            if (subsWithParMap[k.id]) continue;
            if (k.choice === name) {
                kinks.push(k);
            }
        }
        return { kinks };
    }
}