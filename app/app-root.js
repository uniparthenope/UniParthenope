const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const observableModule = require("tns-core-modules/data/observable");

let page;
let viewModel;

function pageLoaded(args) {
    page = args.object;

    viewModel = observableModule.fromObject({});

    page.bindingContext = viewModel;

}


//Go to Settings page
exports.goto_settings = function () {
    const nav =
        {
            moduleName: "settings/settings",
        };

    frame.topmost().navigate(nav);


};

function drawer_button1(){
    const sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    //Set link to open in webview
    const nav =
        {
            moduleName: "home/home-page",
            context: {
                link : 'https://www.google.it'
            }
        };

    frame.topmost().navigate(nav);
}

function drawer_button2(){
    const sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    const nav =
        {
            moduleName: "home/home-page",
            context: {
                link : 'https://www.facebook.com'
            }
        };

    frame.topmost().navigate(nav);
}

function drawer_button3(){
    const sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    //Set link to open in webview
    const nav =
        {
            moduleName: "home/home-page",
            context: {
                link : 'https://www.google.it'
            }
        };

    frame.topmost().navigate(nav);
}

function drawer_button4(){
    const sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    //Set link to open in webview
    const nav =
        {
            moduleName: "home/home-page",
            context: {
                link : 'https://www.google.it'
            }
        };

    frame.topmost().navigate(nav);
}

function drawer_button5(){
    const sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    //Set link to open in webview
    const nav =
        {
            moduleName: "home/home-page",
            context: {
                link : 'https://www.google.it'
            }
        };

    frame.topmost().navigate(nav);
}

function drawer_button6(){
    const sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    //Set link to open in webview
    const nav =
        {
            moduleName: "home/home-page",
            context: {
                link : 'https://www.google.it'
            }
        };

    frame.topmost().navigate(nav);
}

function drawer_button7(){
    const sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    //Set link to open in webview
    const nav =
        {
            moduleName: "home/home-page",
            context: {
                link : 'https://www.google.it'
            }
        };

    frame.topmost().navigate(nav);
}

exports.drawer_button1 = drawer_button1;
exports.drawer_button2 = drawer_button2;
exports.drawer_button3 = drawer_button3;
exports.drawer_button4 = drawer_button4;
exports.drawer_button5 = drawer_button5;
exports.drawer_button6 = drawer_button6;
exports.drawer_button7 = drawer_button7;
exports.pageLoaded = pageLoaded;
