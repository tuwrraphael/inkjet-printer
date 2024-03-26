import { Router, RouteRenderer, AsyncRouteResolver } from "route-it";
import "./components/HomeComponent/HomeComponent";
import "./components/InkControl/InkControl";
import "./components/MovementControl/MovementControl";
import "./components/Print/Print";
import { MovementControlTagName } from "./components/MovementControl/MovementControl";
import { InkControlTagName } from "./components/InkControl/InkControl";
import { PrintTagName } from "./components/Print/Print";

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

    static getInstance() {
        if (null == this.instance) {
            this.instance = new AppRouter();
        }
        return this.instance;
    }

    constructor() {
        class AppRouteResolver implements AsyncRouteResolver<HTMLElement> {

            async resolve(lastRoute: string, currentRoute: string, router: Router<any>, s: { searchParams: URLSearchParams }): Promise<false | HTMLElement> {
                console.log("Resolving route: " + currentRoute);
                if (/^ink-control$/.test(currentRoute)) {
                    return document.createElement(InkControlTagName);
                } else if (/^movement-control$/.test(currentRoute)) {
                    return document.createElement(MovementControlTagName);
                }
                else if (/^print$/.test(currentRoute)) {
                    return document.createElement(PrintTagName);
                }
                return document.createElement("home-component");
            }
        }
        let container: HTMLElement = document.querySelector(".content");
        this.router = new Router<HTMLElement>(new AppRouteResolver(), new ContainerRouteRenderer(container));
    }
}