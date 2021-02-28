const observableModule = require("tns-core-modules/data/observable");
let appversion = require("nativescript-appversion");
const platformModule = require("tns-core-modules/platform");
const app = require("tns-core-modules/application");
const email = require("nativescript-email");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");

let sideDrawer;
let page;
let viewModel;

exports.onNavigatingTo = function(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    appversion.getVersionName().then(function(v) {
        page.getViewById("version").text = L('version') + v;
    });

    page.bindingContext = viewModel;
}

exports.onTapPrivacy = function(args) {
    var button = args.object;
    const page = button.page;

    page.frame.navigate("general/privacy/privacy-page");
}

exports.onDrawerButtonTap = function() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.onGeneralMenu = function() {
    page.frame.navigate("general/home/home-page");
}

exports.contact_us = function () {
    dialogs.confirm({
        title: "Attenzione!",
        message: "La funzione 'Contatta gli Sviluppatori' permette di inviare un email al team che lavora alla progettazione e all'implementazione di app@uniparthenope al fine di comunicare problemi tecnici relativi ad essa.\nPer comunicazioni differenti si prega di rivolgersi alla propria segreteria di competenza\nGrazie.",
        okButtonText: "Contattaci",
        cancelButtonText: "Annulla"
    }).then(function (result){
        if(result){
            appversion.getVersionName().then(function(v) {
                let ver = v;
                let my_device = "DISPOSITIVO UTILIZZATO: \n"+
                    platformModule.device.manufacturer + " " + platformModule.device.os + " "+ platformModule.device.osVersion + "\n"+ platformModule.device.sdkVersion +" \n" +
                    platformModule.device.model + " " + platformModule.device.deviceType + "\n" + platformModule.device.region + " "+ platformModule.device.language;

                let title = "[APP v." + ver +" "+platformModule.device.os+"]" +" [ "+ appSettings.getString("userId","") + " "
                    + appSettings.getString("matricola","") + " "
                    + appSettings.getString("grpDes","") + " ]";


                email.compose({
                    subject: title,
                    body: "Scrivi messaggio ...\n\n\n (Non eliminare le seguenti informazioni)\n" +  my_device,
                    to: ['developer@uniparthenope.it']
                }).then(
                    function() {
                        console.log("Email closed");

                    }, function(err) {
                        dialogs.alert({
                            title: "Errore: Email",
                            message: err.toString(),
                            okButtonText: "OK"
                        });
                    });
            });

        }
    });
};
