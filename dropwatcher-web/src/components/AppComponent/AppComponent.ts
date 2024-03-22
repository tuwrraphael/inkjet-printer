import { State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import template from "./AppComponent.html";
import "./AppComponent.scss";
import "../PrinterStatus/PrinterStatus";
import { AppRouter } from "../../app-router";

export class AppComponent extends HTMLElement {

    private rendered = false;
    private store: Store;
    abortController: AbortController;
    router: AppRouter;
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
            this.querySelectorAll("a").forEach((e: HTMLAnchorElement) => {
                e.addEventListener("click", ev => {
                    ev.preventDefault();
                    this.router.router.navigate(e.getAttribute("href"),null);
                });
            });
            
        }
        this.update(this.store.state, <StateChanges>Object.keys(this.store.state || {}));        
        this.router = AppRouter.getInstance();
        this.router.router.run();
        console.log("AppComponent connected");
    }
    update(s: State, c: StateChanges): void {
        // // if (c.includes("testprop")) {
        // let el = document.createElement("div");
        // el.innerText = "State: " + JSON.stringify(s);
        // this.appendChild(el);
        // // }
    }

    disconnectedCallback() {
        console.log("AppComponent disconnected");
        this.abortController.abort();
        this.router.router.destroy();
        AppRouter.instance = null;
    }
}
export const AppComponentTagName = "app-component";
customElements.define(AppComponentTagName, AppComponent);

