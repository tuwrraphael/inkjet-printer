export function abortableEventListener<TCallbackFnResult,
    TEvent,
    TCallbackFn extends (this: THTMLElement, event: TEvent extends keyof HTMLElementEventMap ? HTMLElementEventMap[TEvent] : any) => TCallbackFnResult,
    TAddEventListener extends (eventName: TEvent, listener: TCallbackFn) => void,
    THTMLElement extends { addEventListener: TAddEventListener, removeEventListener: TAddEventListener }>(element: THTMLElement, event: TEvent, listenerFn: TCallbackFn, signal: AbortSignal): void {
    element.addEventListener(event, listenerFn);
    signal.addEventListener("abort", () => {
        element.removeEventListener(event, listenerFn);
    });
}