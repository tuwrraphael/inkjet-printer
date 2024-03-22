import { applyPolyfill } from 'custom-elements-hmr-polyfill';

if (module.hot) {
    console.log("HMR enabled");
    applyPolyfill();
    
}
await import("./app").catch(console.error);