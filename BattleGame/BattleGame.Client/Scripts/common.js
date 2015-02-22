requirejs.config({
    baseUrl: "Scripts/lib/",
    waitSeconds: 60,
    urlArgs: "bust=" + (new Date()).getTime(),
    //urlArgs: "bust=v2",
    paths: {
        app: "../app"
    },
    shim: {
        signalR: {
            deps: ["jquery"]
        },
        bootstrap: {
            deps: ["jquery"]
        },
        sammy: {
            deps: ["jquery"],
            exports: "Sammy"
        },
        toastr: {
            deps: ["jquery"]
        },
        underscore: {
            exports: '_'
        }
    }
});