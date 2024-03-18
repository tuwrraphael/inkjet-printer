import { State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { TestAction } from "../../state/actions/TestAction";
import template from "./AppComponent.html";
import "./AppComponent.scss";

export class AppComponent extends HTMLElement {

    private rendered = false;
    private store: Store;
    abortController: AbortController;
    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);

        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
        }
        document.getElementById("test").addEventListener("click", () => {
            this.store.postAction(new TestAction("test146"));
        });
        this.update(this.store.state, <StateChanges>Object.keys(this.store.state));
    }
    update(s: State, c: StateChanges): void {
        if (c.includes("testprop")) {
            let el = document.createElement("div");
            el.innerText = "State: " + JSON.stringify(s);
            this.appendChild(el);
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}
export const AppComponentTagName = "app-component";
if (!customElements.get(AppComponentTagName)) {
    customElements.define(AppComponentTagName, AppComponent);
}
