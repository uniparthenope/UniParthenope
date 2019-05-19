const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");


let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();


    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
