const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");

let page;
let viewModel;
let sideDrawer;

exports.onNavigatingTo = function (args) {
    page = args.object;

    viewModel = observableModule.fromObject({});

    sideDrawer = app.getRootView();

    page.getViewById("title").text = page.navigationContext.title;
    page.getViewById("body").html = page.navigationContext.body;

    global.notification_flag = false;

    page.bindingContext = viewModel;
}

exports.onDrawerButtonTap = function() {
    sideDrawer.showDrawer();
}