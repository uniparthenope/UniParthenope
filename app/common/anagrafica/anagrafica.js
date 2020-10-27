const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");

let page;
let viewModel;
let sideDrawer;

function choseBackground(page){
    let code = appSettings.getString("facCod");
    console.log(code);

    if (code === "D1" || code === "D6"){
        page.getViewById("back_image").backgroundImage = "~/images/image_Parisi.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(11, 114, 181,0.9)";
    }
    else if (code === "D2" || code === "D7"){
        page.getViewById("back_image").backgroundImage = "~/images/image_Parisi.jpg";
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
        page.getViewById("back_image").backgroundImage = "~/images/image_Acton.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(221, 108, 166,0.9)";
    }
    else{
        page.getViewById("back_image").backgroundImage = "~/images/newbackground.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(30, 50, 88,1)";
    }
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
            title: "Errore: Anagrafe getPic",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

exports.onNavigatingTo = function(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    choseBackground(page);
    page.getViewById("name").text = appSettings.getString("nome");
    page.getViewById("surname").text = appSettings.getString("cognome");
    page.getViewById("role").text = appSettings.getString("grpDes").toUpperCase();
    page.getViewById("matricola").text = appSettings.getString("matricola");
    page.getViewById("depart").text = appSettings.getString("facDes").toUpperCase();
    page.getViewById("uid").text = appSettings.getString("userId").toLowerCase();


    page.getViewById("sex").text = appSettings.getString("sesso");
    page.getViewById("nascita").text = appSettings.getString("dataNascita").substring(0,10);
    page.getViewById("email_ist").text = appSettings.getString("emailAte");
    page.getViewById("tel").text = appSettings.getString("telRes");


    if (appSettings.getString("grpDes") === "Studenti"){

        getPIC(appSettings.getNumber("persId"), 0);

        page.getViewById("email").text = appSettings.getString("email");
        page.getViewById("nazione").text = appSettings.getString("desCittadinanza");

        page.getViewById("email_id").visibility = "visible";
        page.getViewById("nation_id").visibility = "visible";
    }
    else if (appSettings.getString("grpDes") === "Docenti"){

        getPIC(appSettings.getNumber("idAb"), 1);

        page.getViewById("my_img").backgroundImage = url;
        page.getViewById("roleID").text = appSettings.getString("settCod");
    }
    else if (appSettings.getString("grpDes") === "Ristorante"){

        //getPIC(appSettings.getNumber("idAb"), 1);

        //page.getViewById("my_img").backgroundImage = url;
        page.getViewById("mat_label").text = "NOME RISTORANTE";
    }

    page.bindingContext = viewModel;
}

exports.onDrawerButtonTap = function() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}
