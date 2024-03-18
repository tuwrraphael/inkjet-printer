export interface State {
    testprop:string;
}

export type StateChanges = (keyof State)[];