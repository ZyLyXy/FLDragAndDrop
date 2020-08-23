import { Component } from "inferno";
import { Kink, ToolTip } from "./model";

function UpdateUi() {
    for(let key in $g.Updates) $g.Updates[key].forceUpdate();
}

export const $g: {
    Sels: Kink[],
    UpdateUi: typeof UpdateUi,
    Updates: {[key:string]: Component}
    ToolTip: ToolTip,
    togMainDialog: (open: boolean) => void,
    initEditDialog: (kink: Kink, isNew?: boolean) => void
} = { Sels: [], UpdateUi: UpdateUi, Updates: {} } as any;