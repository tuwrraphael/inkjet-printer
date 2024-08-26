import { Router, RouteRenderer, AsyncRouteResolver } from "route-it";
import "./components/HomeComponent/HomeComponent";
import "./components/InkControl/InkControl";
import "./components/Print/Print";
import "./components/Dropwatcher/Dropwatcher";
import { InkControlTagName } from "./components/InkControl/InkControl";
import { PrintTagName } from "./components/Print/Print";
import { DropwatcherTagName } from "./components/Dropwatcher/Dropwatcher";
import { InspectTagName } from "./components/Inspect/Inspect";
import { NozzletestTagName } from "./components/Nozzletest/Nozzletest";
import { UtilsTagName } from "./components/Utils/Utils";
import { Store } from "./state/Store";
import { RouteChanged } from "./state/actions/RouteChanged";

class ContainerRouteRenderer implements RouteRenderer<HTMLElement> {
    private currentComponent: HTMLElement = null;
    constructor(private container: HTMLElement) {
    }
    render(component: HTMLElement) {
        if (component && component !== this.currentComponent) {
            if (this.currentComponent) {
                this.container.innerHTML = "";
            }
            this.container.appendChild(component);
            this.currentComponent = component;
        }
    }
}

export class AppRouter {
    static instance: AppRouter = null;
    router: Router<HTMLElement>;
    private store: Store;

    static getInstance() {
        if (null == this.instance) {
            this.instance = new AppRouter();
        }
        return this.instance;
    }

    constructor() {
        this.store = Store.getInstance();
        let store = this.store;

        class AppRouteResolver implements AsyncRouteResolver<HTMLElement> {

            async resolve(lastRoute: string, currentRoute: string, router: Router<any>, s: { searchParams: URLSearchParams }): Promise<false | HTMLElement> {
                console.log("Resolving route: " + currentRoute);
                store.postAction(new RouteChanged(currentRoute));
                if (/^ink-control$/.test(currentRoute)) {
                    return document.createElement(InkControlTagName);
                } else if (/^print$/.test(currentRoute)) {
                    return document.createElement(PrintTagName);
                } else if (/^dropwatcher$/.test(currentRoute)) {
                    return document.createElement(DropwatcherTagName);
                } else if (/^inspect$/.test(currentRoute)) {
                    return document.createElement(InspectTagName);
                } else if (/^nozzletest$/.test(currentRoute)) {
                    return document.createElement(NozzletestTagName);
                } else if (/^utils$/.test(currentRoute)) {
                    return document.createElement(UtilsTagName);
                }
                store.postAction(new RouteChanged("home"));
                return document.createElement("home-component");
            }
        }
        let container: HTMLElement = document.querySelector(".content");
        this.router = new Router<HTMLElement>(new AppRouteResolver(), new ContainerRouteRenderer(container));
    }
}