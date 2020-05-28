const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const imageSourceModule = require("tns-core-modules/image-source");

let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    choseBackground(page);
    getQr();
    console.log("PERSID= "+appSettings.getNumber("persId"))
    if (appSettings.getString("grpDes") === "Studenti"){

        getPIC(appSettings.getNumber("persId"), 0);
        page.getViewById("name").text = appSettings.getString("nome");
        page.getViewById("surname").text = appSettings.getString("cognome");
        page.getViewById("matricola").text = appSettings.getString("matricola");
        page.getViewById("role").text = appSettings.getString("grpDes").toUpperCase();
        page.getViewById("depart").text = appSettings.getString("facDes").toUpperCase();
    }
    else if (appSettings.getString("grpDes") === "Docenti"){

        getPIC(appSettings.getNumber("idAb"), 1);
        page.getViewById("name").text = appSettings.getString("nome");
        page.getViewById("surname").text = appSettings.getString("cognome");
        page.getViewById("my_img").backgroundImage = url;
        page.getViewById("role").text = appSettings.getString("grpDes").toUpperCase();
        page.getViewById("matricola").text = appSettings.getString("matricola");
        page.getViewById("roleID").text = appSettings.getString("settCod");
        page.getViewById("depart").text = appSettings.getString("facDes").toUpperCase();
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

function choseBackground(page){
    let code = appSettings.getString("facCod");
    console.log(code);

    if (code === "D1" || code === "D6"){
        page.getViewById("back_image").backgroundImage = "~/images/image_PARISI.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(11, 114, 181,0.9)";
    }
    else if (code === "D2" || code === "D7"){
        page.getViewById("back_image").backgroundImage = "~/images/image_PARISI.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(119, 72, 150,0.9)";
    }
    else if (code === "D3"){
        page.getViewById("back_image").backgroundImage = "~/images/image_CDN.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(36, 36, 36,0.9)";
    }
    else if (code === "D4"){
        page.getViewById("back_image").backgroundImage = "~/images/image_CDN.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(0, 167, 84,0.9)";
    }
    else if (code === "D4"){
        page.getViewById("back_image").backgroundImage = "~/images/image_ACTON.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(221, 108, 166,0.9)";
    }
    else{
        page.getViewById("back_image").backgroundImage = "~/images/image1.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(34, 56, 79,0.9)";
    }
}

function getQr(){
    httpModule.getFile({
        "url": global.url + "general/qrCode",
        "method": "GET",
        headers: {
            "Content-Type" : "image/png",
            "Authorization" : "Basic "+ global.encodedStr
        },
        "dontFollowRedirects": true
    }).then((source) => {
        page.getViewById("my_qr").backgroundImage = source["path"];
    }, (e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Autenticazione Fallita!",
            message: e.retErrMsg,
            okButtonText: "OK"
        });
    });
}

function getPIC(personId, value){
    let url;
    switch (value) {
        case 0:
            url = global.url + "general/image/"+ personId;
            break;

        case 1:
            url = global.url + "general/image_prof/"+ personId;
            break;
    }

    httpModule.getFile({
        "url": url,
        "method": "GET",
        headers: {
            "Content-Type" : "image/jpg",
            "Authorization" : "Basic "+ global.encodedStr
        },
        "dontFollowRedirects": true
    }).then((source) => {
        page.getViewById("my_img").backgroundImage = source["path"];
    }, (e) => {
        console.log("[Photo] Error", e);
        dialogs.alert({
            title: "Error",
            message: e.retErrMsg,
            okButtonText: "OK"
        });
    });
}
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
