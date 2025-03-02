declare module '*.html' {
    const content: string;
    export default content;
}
declare module "*.svg" {
    const content: string;
    export default content;
}
declare const __ENVIRONMENT : "local"|"gh-pages";
declare const __CACHENAME : string;