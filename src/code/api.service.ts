import { $g } from "./global";
import { Kink, LIKE, LIKES, WindowFList } from "./model";
import { BiMap, BMap, ID, Q, strAt, xhr } from "./util";
import { MultiImageUpload } from "./multi-img-upload";

// Helper Types
type idToArrIds = { [key: string]: string[] };
type btn = HTMLElement & { onclick: () => void };
type cnt = HTMLElement & { content: string };

/** The actual Api */
export let CustomKinks = new BMap<Kink>();
export let Kinks = new BMap<Kink>();
export let CustomToSubs = new BiMap<Kink>();
let CustomToSubsIds: idToArrIds;
let FL = (window as any as WindowFList).FList;
let Init = false;
let DidMoveSubs = false;
let MultiImgUpload = new MultiImageUpload();

export function compare(kinkA: Kink, kinkB: Kink) {
    let isCustA = kinkA._c, isCustB = kinkB._c;
    if (isCustA !== isCustB) {
        return isCustB ? 1 : -1;
    }
    let likeA = kinkA.choice, likeB = kinkB.choice;
    if (likeA !== likeB) {
        return LIKES[likeA] - LIKES[likeB];
    }
    let nameA = kinkA.name, nameB = kinkB.name;
    for (let i = 0, I = nameA.length; i < I; i++) {
        let a = nameA.codePointAt(i);
        let b = nameB.codePointAt(i);
        if (b === undefined) return 1;
        if (a !== b) return a - b;
    }
    return nameA.length - nameB.length;
}

export function choiceChange(kink: Kink) {
    let fetishItemEl = ID("FetishItem" + kink.id);
    let newChoice = kink.choice;
    let sel = fetishItemEl.previousElementSibling as HTMLSelectElement;
    let oldChoice = sel.value;
    if (oldChoice !== newChoice) {
        let code = LIKES[newChoice];
        let btnsCh = fetishItemEl.children[2].children as any as HTMLElement[];
        if (code < 4) {
            (<btn>btnsCh[code * 2]).onclick();
        } else {
            let b = btnsCh[0] as btn;
            b.onclick(); b.onclick();
        }
        (<HTMLSelectElement>fetishItemEl.previousElementSibling).value = newChoice;
    }
}

export function kinksJsToHtml() {
    // Custom Fetishes Changes
    let cKinkMap = CustomKinks.b;
    let cKinks = CustomKinks.a;
    for (let i = 0, I = cKinks.length; i < I; i++) {
        let kink = cKinks[i];
        let ch: HTMLInputElement[];
        let id = kink.id;
        if (id[0] === "_") { // Need to add CustomKink to the page.
            (<btn>ID("customs-button-add")).onclick();
            ch = ID("CustomKinksList").lastElementChild.children as any;
            cKinkMap["N" + ch[6].value] = kink;
        } else {
            let kn = ID("kinkName" + (id[0] === "N" ? id.substring(1) : id));
            ch = kn.parentElement.children as any;
        }
        ch[2].value = kink.name;
        ch[4].value = kink.description;
        ch[5].value = kink.choice;
    }
    let htmlCusts = Q(".CustomKink"); // Handle Deletes. Ignore template (last  one)
    for (let i = 0, I = htmlCusts.length - 1; i < I; i++) {
        let htmlc = htmlCusts[i];
        let id = (<HTMLInputElement>htmlc.children[6]).value;
        let per = parseInt(id) > 500;
        if (!cKinkMap[per ? id : "N" + id]) {
            (<btn>htmlc.children[0]).onclick();
        }
    }
    // Fetishes Changes
    let kinks = Kinks.a;
    for (let i = 0, I = kinks.length; i < I; i++) {
        choiceChange(kinks[i]);
    }
    // Other
    subFetToFetIds();
}

function kinksHtmlToJs() {
    // Custom Fetishes
    CustomKinks.clear();
    let htmlCusts = Q(".CustomKink");
    for (let i = 0, I = htmlCusts.length - 1; i < I; i++) { // -1, because of a template in the DOM
        let htmlc = htmlCusts[i];
        let ch = htmlc.children as any as ({ value: string } & Node)[];
        let id = ch[6].value;
        let pers = parseInt(id) > 500; // FList webpage says 500 CK is the max; so in theory one could be creating new CKs up to 500
        // Note, to avoid matching ids between customs/regs, we append "N" to lowly-valued ids.
        let kink: Kink = {
            _o: true,
            _c: true,
            _p: pers,
            id: pers ? id : "N" + id,
            name: ch[2].value,
            description: ch[4].value,
            choice: ch[5].value as LIKE
        };
        CustomKinks.fset(kink);
    }
    // Fetishes
    Kinks.clear();
    let htmlFets = Q(".FetishItem");
    for (let i = 0, I = htmlFets.length; i < I; i++) {
        let htmlf = htmlFets[i];
        let ch = htmlf.children as any as HTMLElement[];
        let id = htmlf.id.substring(10);
        let kink: Kink = {
            _o: false,
            _c: false,
            _p: true,
            id: id,
            name: ch[0].innerText.trim(),
            description: ch[3].innerText.trim(),
            choice: (<HTMLSelectElement>htmlf.previousElementSibling).value as LIKE
        };
        Kinks.fset(kink);
    }
}

function applySubFetIdsToFets() {
    CustomToSubs.clear();
    const cKinkMap = CustomKinks.b;
    const kinkMap = Kinks.b;
    for (let id in CustomToSubsIds) {
        let kink = cKinkMap[id];
        if (!kink) {
            delete CustomToSubsIds[id];
        } else {
            let subIds = CustomToSubsIds[id];
            let subs = subIds ? subIds.map(id => kinkMap[id]) : [];
            CustomToSubs.set(kink, subs);
        }
    }
}

export function subFetToFetIds() {
    CustomToSubsIds = {} as idToArrIds;
    for (let key in CustomToSubs.a) {
        let subs = CustomToSubs.a[key];
        let subIds = subs ? subs.map(k => k.id) : [];
        CustomToSubsIds[key] = subIds;
    }
}

export function removeSubfetish(kinkId: string) {
    DidMoveSubs = true;
    CustomToSubs.remV(kinkId);
}

export function addSubfetish(custom: Kink, kink: Kink) {
    DidMoveSubs = true;
    CustomToSubs.add(custom, kink);
}

function _remCk(kink: Kink) {
    // Should check arr len, and it's prolly not neccessary to toggle moveCheck if being deleted...
    if (CustomToSubs.a[kink.id]) DidMoveSubs = true;
    CustomKinks.rem(kink);
    CustomToSubs.remK(kink.id);
}

export function removeCustom(kink: Kink) {
    if (!kink || !kink._c) return;
    _remCk(kink);
    let i = $g.Sels.indexOf(kink);
    if (i >= 0) $g.Sels.splice(i, 1);
}

export function removeKinkSelection() {
    let Sels = $g.Sels, sel0 = Sels[0];
    if (!sel0 || !sel0._c) return;
    // Should check arr len, and it's prolly not neccessary to toggle moveCheck if being deleted...
    for (let i = 0, I = Sels.length; i < I; i++) {
        _remCk(Sels[i]);
    }
    Sels.length = 0;
}

function postChangesFnWrap() {
    let btn = ID("character-button-save") as HTMLAnchorElement;
    if ((btn as { _i?: boolean })._i) return;
    (btn as { _i?: boolean })._i = true;
    let fn = btn.onclick as Function;
    btn.onclick = function () {
        if (!DidMoveSubs) { fn(); return; }
        let sfbc = JSON.stringify(CustomToSubsIds);
        let data = new URLSearchParams();
        data.append("csrf_token", (<cnt>ID("flcsrf-token")).content);
        data.append("subfetish_json", sfbc);
        data.append("charid", FL.CharacterLists.characterId);
        xhr("POST", "https://www.f-list.net/experimental/subfetish_save.php", data,
            { headers: ["Content-Type", "application/x-www-form-urlencoded"] },
            (err, x) => {
                if (err) {
                    FL.Common_displayError("Error posting CustomFetishes: " + x.responseText);
                    return;
                }
                fn();
            });
    }
}

export function sortAll() {
    CustomKinks.a.sort(compare);
    Kinks.a.sort(compare);
    let ar = CustomKinks.a;
    let map = CustomToSubs.a;
    for (let i = 0, I = ar.length; i < I; i++) {
        let custs = map[ar[i].id];
        if (custs) custs.sort(compare);
    }
}

export function begin() {
    if (!Init) {
        let tmp: Element | string = ID("characterListsTemplate");
        if (tmp) tmp = tmp.previousElementSibling;
        if (tmp) tmp = tmp.textContent;
        if (tmp) tmp = strAt(tmp as string, "\n            //FList.Subfetish.Data.SubfetishesByCustom = ", ";\n");
        CustomToSubsIds = tmp ? JSON.parse(tmp as string) : {};
        Init = true;
        postChangesFnWrap();
    }
    kinksHtmlToJs();
    applySubFetIdsToFets();
    MultiImgUpload.inject();
    // Old code to fetch the kinks from the subfetish page.
    // let name = FL.CharacterLists.characterName;
    // xhr("GET", "https://www.f-list.net/experimental/subfetish.php?c=" + encodeURIComponent(name), null, { type: "document" },
    //     (err: boolean, x: XMLHttpRequest) => {
    //         if (err) {
    //             FL.Common_displayError("Error retrieving custom fetish info: " + x.responseText);
    //             fn(true);
    //             return;
    //         }
    //         Init = true;
    //         postChangesFnWrap();
    //         let src = x.responseXML.documentElement.children[0].children[8].textContent;
    //         CustomToSubsIds = JSON.parse(strAt(src, "\n    FList.Subfetish.Data.SubfetishesByCustom = ", ";\n"));
    //         applySubFetIdsToFets();
    //         fn();
    //     });
    // kinksHtmlToJs(); //async, should always process first
}