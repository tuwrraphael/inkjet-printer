let example_variable: string;

if (__ENVIRONMENT == "local") {
    example_variable = "debug";
}
else if (__ENVIRONMENT == "gh-pages") {
    example_variable = "prod";
}

export const environment = {
    env: example_variable
};
