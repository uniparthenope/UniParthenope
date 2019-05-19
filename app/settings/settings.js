const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");


let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}
function onGeneralMenu()
{
    page.frame.navigate("home/home-page")
}
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
