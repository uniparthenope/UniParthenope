const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");

let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    if (appSettings.getString("grpDes") === "Studenti"){
        page.getViewById("name").text = appSettings.getString("nome");
        page.getViewById("surname").text = appSettings.getString("cognome");
        page.getViewById("matricola").text = appSettings.getString("matricola");
        let r = appSettings.getString("grpDes").toUpperCase();
        page.getViewById("role").text = r;

    }
    else if (appSettings.getString("grpDes") === "Docenti"){
        page.getViewById("name").text = appSettings.getString("nome");
        page.getViewById("surname").text = appSettings.getString("cognome");
        let url = "https://www.uniparthenope.it/sites/default/files/styles/fototessera__175x200_/public/ugov_wsfiles/foto/ugov_fotopersona_0000000000"+
            appSettings.getNumber("idAb") +".jpg";
        page.getViewById("my_img").backgroundImage = url;
        let r = appSettings.getString("grpDes").toUpperCase();
        page.getViewById("role").text = r;
    }



    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    page.frame.goBack();
}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
