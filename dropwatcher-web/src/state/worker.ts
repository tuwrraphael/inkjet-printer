import { ActionType } from "./actions/ActionType";
import { State } from "./State";

import { TestAction } from "./actions/TestAction";

type Actions = TestAction
    ;
let state: State = {
    testprop: "test"
};

function updateState(updateFn: (oldState: State) => Partial<State>) {
    let update = updateFn(state);
    state = {
        ...state,
        ...update
    };
    self.postMessage([update, Object.keys(update)]);
}

async function handleMessage(msg: Actions) {
    switch (msg.type) {
        case ActionType.TestAction:
            updateState(oldState => ({ testprop: msg.term }));
            break;
    }
}
self.postMessage([state, Object.keys(state)]);
self.addEventListener("message", ev => {
    let msg: Actions = ev.data;
    handleMessage(msg).catch(err => console.error(err));
});