import { Component, createRef } from "inferno";
import * as api from "./api.service";
import { XBox } from "./box";
import * as dnd from "./drag-drop.service";
import { XEditDialog } from "./edit-dialog";
import { $g } from "./global";
import { XHeadingBtns } from "./heading-btns";
import { updateSelects } from "./kink-to-custom-sels";
import { le } from "./util-jsx";
import { XBtn } from "./xbtn";


function togKinks(open: boolean) {
    let kinks = api.CustomKinks.a;
    for(let i=0, I=kinks.length; i<I; i++) {
        kinks[i]._o = open;
    }
    $g.UpdateUi();
}

function collapseKinks() {
    togKinks(false);
}

function expandKinks() {
    togKinks(true);
}

function addKink() {
    $g.initEditDialog(null, true);
}

function remKink() {
    api.removeKinkSelection();
    $g.UpdateUi();
}

function applyChanges() {
    api.kinksJsToHtml();
    $g.togMainDialog(false);
    updateSelects();
}

class MainBtns extends Component {
    render() {
        return <div class="kinkBtns">
            <XBtn clazz="x-btn btn-f btn-sm" opClick={le(collapseKinks)}>⊖</XBtn>
            <XBtn clazz="x-btn btn-l btn-sm" opClick={le(expandKinks)}>⊕</XBtn>
            <XHeadingBtns></XHeadingBtns>
            <XBtn clazz="x-btn btn-f green" opClick={le(addKink)}>＋ Custom Kink</XBtn>
            <XBtn clazz="x-btn btn-l red" opClick={le(remKink)}>× Custom Kink</XBtn>
            <XBtn opClick={le(applyChanges)}>Apply Changes To Page</XBtn>
        </div>
    }
}

class MainBoxes extends Component {

    componentDidMount() {
        $g.Updates.MB = this;
    }

    render() {
        // Before rendering our data, make sure everything is sorted.
        api.sortAll();
        return <div ref={dnd.doDragDropBinds} class="boxes">
            <XBox name="fave"></XBox>
            <XBox name="yes"></XBox>
            <XBox name="maybe"></XBox>
            <XBox name="no"></XBox>
            <XBox name="undecided"></XBox>
        </div>
    }

}

type TP = {}; type TS = { id: string, title: string, body: string, x: number, y: number, eh: number, fl: number, ft: number };
export class XMainToolTip extends Component<TP, TS> {
    state: TS = {} as any;
    div = createRef();

    componentDidMount() {
        $g.ToolTip = this;
    }

    componentDidUpdate() {
        // Has a few magic offset numbers here: Should fix later.
        let e = this.div.current as HTMLDivElement;
        let s = this.state;
        if (!e || !s.id) return;
        let sty = e.style;
        let top = Math.round(s.y - e.clientHeight - s.ft - 5);
        if (top < 0) {
            top = Math.round(s.y + s.eh - s.ft + 5);
        }
        sty.top = top + "px";
        sty.left = Math.round(s.x - s.fl) + "px";
    }

    render(p: TP, s: TS) {
        return <div ref={this.div} style={!s.id ? "display: none" : ""} class="x-tt ui-tooltip qtip ui-helper-reset ui-tooltip-shadow ui-tooltip-pos-tc ui-widfget ui-tfooltip-focus">
            <div class="ui-tooltip-titlebar ui-widget-header">
                <div id="ui-tooltip-4-title" class="ui-tooltip-title" $HasTextChildren>
                    {s.title || ""}
                </div>
            </div>
            <div class="ui-tooltip-content ui-widget-content" id="ui-tooltip-4-content" $HasTextChildren>
                {s.body || ""}
            </div>
        </div>
    }

    showTip(id: string, title: string, body: string, e: HTMLElement, eHeight?: number, eFixed?: HTMLElement) {
        if (this.state.id !== id) {
            let rect = e.getBoundingClientRect();
            this.setState({
                id: id,
                title: title,
                body: body,
                x: rect.x,
                y: rect.y,
                eh: eHeight || e.offsetHeight,
                fl: eFixed ? eFixed.offsetLeft : 0,
                ft: eFixed ? eFixed.offsetTop : 0
            })
        }
    }

    clearTip() {
        this.setState({ id: null });
    }
}

export class XMainUi extends Component {
    render() {
        return <div class="kinkInf">
            <MainBtns></MainBtns>
            <MainBoxes></MainBoxes>
            <XMainToolTip></XMainToolTip>
            <XEditDialog></XEditDialog>
        </div>
    }
}