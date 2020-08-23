import { Component } from "inferno";
import * as api from "./api.service";
import { XDialog } from "./dialog";
import { $g } from "./global";
import { Input, Select, TextArea } from "./inputs";
import { Kink } from "./model";
import { le } from "./util-jsx";
import { XBtn } from "./xbtn";

let IDS = 0;

function hideDialog(d: XEditDialog) {
    d.clear();
}

function saveChanges(d: XEditDialog) {
    let s = d.state, kink = s.kink;
    if(s.oldKink) {
        Object.assign(s.oldKink, kink);
    } else {
        kink.id = "_" + (IDS++);
        api.CustomKinks.fset(kink);
    }
    $g.UpdateUi(); // Update all, since we don't know how the new name will be reordered.
    d.clear();
}

function remKink(d: XEditDialog) {
    let oldk = d.state.oldKink;
    if(oldk) {
        api.removeCustom(oldk);
        $g.UpdateUi();
    }
    d.clear();
}

type Props = {}; type State = { kink?: Kink, oldKink?: Kink };
export class XEditDialog extends Component<Props, State> {
    state: State = {};

    componentDidMount() {
        $g.initEditDialog = (oldKink, isNew) => {
            if (isNew) {
                let kink: Kink = { _o: false, _p: false, _c: true, id: "", name: "", description: "", choice: "fave" };
                this.setState({ kink: kink, oldKink: null });
            } else if (oldKink) {
                let kink: Kink = Object.assign({}, oldKink);
                this.setState({ kink, oldKink });
            } else {
                this.clear();
            }
        }
    }

    clear() {
        this.setState({ kink: null, oldKink: null });
    }

    render(props: Props, state: State) {
        const kink = state.kink, on = !!kink;
        const reg = on && !kink._c;

        return on && <XDialog size={1} title={reg ? "Info" : state.oldKink ? "Edit" : "Create" } opClose={le(hideDialog, this)}>
            <div class="kinkBtns edt-btns">
                <XBtn opClick={le(hideDialog, this)}>Cancel</XBtn>
                <XBtn isDisabled={reg} clazz="x-btn red" opClick={le(remKink, this)}>× Remove</XBtn>
                <XBtn opClick={le(saveChanges, this)}>⎙ Apply</XBtn>
            </div>
            <label class="edt-lbl">Name</label>
            <Input disabled={reg} class="edt-inp" type="text" maxLength={30} prop="kink.name" state={state}></Input>
            <label class="edt-lbl">Choice</label>
            <Select class="edt-sel" prop="kink.choice" state={state}>
                <option value="fave">Favorite</option>
                <option value="yes">Yes</option>
                <option value="maybe">Maybe</option>
                <option value="no">No</option>
                <option value="undecided">Undecided</option>
            </Select>
            <label class="edt-lbl">Description</label>
            <TextArea disabled={reg} class="edt-txt" maxLength={1024} prop="kink.description" state={state}></TextArea>
        </XDialog>
    }

}