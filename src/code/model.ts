
export const LIKES = { fave: 0, yes: 1, maybe: 2, no: 3, undecided: 4 };

export type LIKE = "fave" | "yes" | "maybe" | "no" | "undecided";

export interface ToolTip {
    showTip: (id: string, title: string, body: string, el: HTMLElement, elHeight?: number, fixedEl?: HTMLElement) => void;
    clearTip: () => void;
}

export interface Kink {
    /** Open, really only used by TSX for the view */
    _o: boolean;
    /** Is CustomKink */
    _c: boolean;
    /** Is Persisted */
    _p: boolean;
    /** ID; If begins with _, it is manually made by dialog */
    id: string;
    /** Name */
    name: string;
    /** Description */
    description: string;
    /** Choice */
    choice: LIKE;
}

// Helper Interface (Incomplete)
export interface WindowFList {
    FList: {
        CharacterLists: {
            characterId: string;
            characterName: string;
        },
        Common_displayError: (str: string) => void,
        Subfetish: {
            Data: {
                removeCustom: (id:string)=>void
            }
        }
    }    
}