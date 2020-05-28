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




    if (appSettings.getString("grpDes") === "Studenti"){

        //page.getViewById("my_img").backgroundImage = getPIC(appSettings.getNumber("persId"));
        page.getViewById("name").text = appSettings.getString("nome");
        page.getViewById("surname").text = appSettings.getString("cognome");
        page.getViewById("matricola").text = appSettings.getString("matricola");
        page.getViewById("role").text = appSettings.getString("grpDes").toUpperCase();
        page.getViewById("depart").text = appSettings.getString("facDes").toUpperCase();



    }
    else if (appSettings.getString("grpDes") === "Docenti"){

        let url = "https://www.uniparthenope.it/sites/default/files/styles/fototessera__175x200_/public/ugov_wsfiles/foto/ugov_fotopersona_0000000000"+
            appSettings.getNumber("idAb") +".jpg";

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
    }
    else if (code === "D2"){

    }
    else if (code === "D4"){
        page.getViewById("back_image").backgroundImage = "~/images/image_CDN.jpg";
    }
}

function getPIC(personId){

    httpModule.getImage({
        url: global.url + "general/image/"+ personId,
        method: "GET",
        headers: {
            "Content-Type" : "image/jpg",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {

        //let _result = response.content.toJSON();
        console.log("HERE");
        //let image = imageSourceModule.ImageSource.fromBase64(response.toBase64String("jpg");

        //console.log(response.toBase64String("jpg"));


    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Autenticazione Fallita!",
            message: e.retErrMsg,
            okButtonText: "OK"
        });
    });

}
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
