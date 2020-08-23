import { Component } from "inferno";
import * as api from "./api.service";
import { XDialog } from "./dialog";
import { $g } from "./global";
import { XMainUi } from "./mainui";
import { le } from "./util-jsx";
import { XBtn } from "./xbtn";

function beginDialog(d: XShowUiBtn) {
    api.begin();
    d.setState({ show: true });
}

function hideDialog(d: XShowUiBtn) {
    d.setState({ show: false });
}

type Prop = {}; type State = { show: boolean };
export class XShowUiBtn extends Component<Prop, State> {
    state = { show: false };

    componentDidMount() {
        $g.togMainDialog = (open) => this.setState({ show: open });
    }

    componentDidUpdate() {
        if (this.state.show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }

    render(p: Prop, s: State) {
        return <>
            <XBtn opClick={le(beginDialog, this)}>Show Table</XBtn>
            {s.show && <XDialog title="Kinks" opClose={le(hideDialog, this)}>
                <XMainUi></XMainUi>
            </XDialog>}
        </>
    }
}