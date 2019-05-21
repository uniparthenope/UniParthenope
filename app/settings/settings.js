const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("application-settings");

let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    let remember = appSettings.getBoolean("rememberMe");
    if (remember)
        page.getViewById("deleteBtn").visibility = "visible";
    else
        page.getViewById("deleteBtn").visibility = "collapsed";

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

function onTapDelete(){
    dialogs.confirm({
        title: "Rimozione Account",
        message: "Dimenticare tutti i dati?",
        okButtonText: "Si",
        cancelButtonText: "No"
    }).then(function (result) {
        if (result){
            appSettings.clear();
            let loginForm = sideDrawer.getViewById("loginForm");
            let userForm = sideDrawer.getViewById("userForm");
            sideDrawer.getViewById("topName").text = "Benvenuto!";
            //Default foto (se aggiunta)
            userForm.visibility = "collapsed";
            loginForm.visibility = "visible";
            page.getViewById("deleteBtn").visibility = "collapsed";
            page.frame.navigate("home/home-page");
        }
    });
}
exports.onTapDelete = onTapDelete;
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
