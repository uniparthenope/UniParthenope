const app = require("tns-core-modules/application");
const platformModule = require("tns-core-modules/platform");
const frame = require("tns-core-modules/ui/frame");
const observableModule = require("tns-core-modules/data/observable");
const utilsModule = require("tns-core-modules/utils/utils");
const dialogs = require("tns-core-modules/ui/dialogs");
const modalViewModule = "modal-login/modal-login";
const email = require("nativescript-email");
let base64= require('base-64');
let appversion = require("nativescript-appversion");
let utf8 = require('utf8');
const appSettings = require("tns-core-modules/application-settings");


let viewModel;
let page;

function pageLoaded(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    page.bindingContext = viewModel;
}

exports.onTapLogin = function(args) {
    let sideDrawer = app.getRootView();
    let user = sideDrawer.getViewById("username").text;
    user = user.trim();
    let pass = sideDrawer.getViewById("password").text;
    sideDrawer.getViewById("password").dismissSoftInput(); //Close keyboard in IOS

    if (user !== "" && pass!== "")
    {
        let token = user + ":" + pass;
        var bytes = utf8.encode(token);
        global.encodedStr = base64.encode(bytes);
        sideDrawer.showModal(modalViewModule, {user:user, pass:pass}, () => {}, false);
    }
    else{
        dialogs.alert({
            title: "Errore!",
            message: "I campi Username e Password non possono essere vuoti!",
            okButtonTexext: "OK"
        });
    }
};

//Go to taxes page
exports.goto_tasse = function () {
    const nav =
        {

            moduleName: "tasse/tasse",
        };

    frame.Frame.topmost().navigate(nav);
};

//Go to Settings page
exports.goto_settings = function () {
    const nav =
        {
            moduleName: "settings/settings",
        };
    frame.Frame.topmost().navigate(nav);
};


exports.goto_about = function () {
    const nav =
        {
            moduleName: "about/about-page",
        };
    frame.Frame.topmost().navigate(nav);

};

exports.contact_us = function () {
    dialogs.confirm({
        title: "Attenzione!",
        message: "La funzione 'Contattaci' permette di contattare il team di sviluppo di app@uniparthenope al fine di comunicare problemi tecnici relativi ad essa.\nPer comunicazioni differenti si prega di rivolgersi alla propria segreteria di competenza\nGrazie.",
        okButtonText: "Contattaci",
        cancelButtonText: "Annulla"
    }).then(function (result){
        if(result){
            appversion.getVersionName().then(function(v) {
                let ver = v;
                let my_device = "DISPOSITIVO UTILIZZATO: \n"+
                    platformModule.device.manufacturer + " "+ platformModule.device.os + " "+ platformModule.device.osVersion + "\n"+ platformModule.device.sdkVersion +" \n" +
                    platformModule.device.model + " "+ platformModule.device.deviceType + "\n" + platformModule.device.region + " "+ platformModule.device.language;

                let title = "[APP v." + ver +" "+platformModule.device.os+"]" +" [ "+ appSettings.getString("userId","") + " "
                    + appSettings.getString("matricola","") + " "
                    + appSettings.getString("grpDes","") + " ]";
                console.log(title);

                console.log(my_device);


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
                        });        });


            });

        }
    });

};

exports.goto_home = function () {
    const nav =
        {
            moduleName: "userCalendar/userCalendar",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);

};

exports.goto_home_public = function () {
    const nav =
        {
            moduleName: "home/home-page",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);

};

exports.goto_docenti = function () {
    const nav =
        {
            moduleName: "userDocenti/userDocenti",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);

};

exports.goto_corsi = function () {
    const nav =
        {
            moduleName: "tutticorsi/tutticorsi",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);

};

exports.goto_segreteria = function () {
    const nav =
        {
            moduleName: "segreteria/segreteria",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);

};

exports.goto_menuList = function () {
    const nav =
        {
            moduleName: "ristoratore/ristoratore-home",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.goto_menuNew = function () {
    const nav =
        {
            moduleName: "ristoratore/ristoratore-addmenu",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.goto_adminHome = function () {
    const nav =
        {
            moduleName: "admin/admin-home/admin-home",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.goto_adminAccount = function () {
    const nav =
        {
            moduleName: "admin/allUser/allUser",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.goto_adminNew = function () {
    const nav =
        {
            moduleName: "admin/addUser/addUser",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.goto_appelli = function () {
    const nav =
        {
            moduleName: "userAppelli/appelli",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.goto_badge = function () {
    const nav =
        {
            moduleName: "badge/badge",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.goto_access = function () {
    const nav =
        {
            moduleName: "access/access",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.goto_taxes = function () {
    const nav =
        {
            moduleName: "tasse/tasse",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.goto_professor_home = function () {
    const nav =
        {
            moduleName: "docenti/docenti-home/docenti-home",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.goto_anagrafica = function () {

    const nav =
        {
            moduleName: "anagrafica/anagrafica",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);

    /*
    dialogs.alert({
        title: "Lavori in corso!",
        message: "La seguente sezione non è ancora pronta.\nCi scusiamo per il disagio!",
        okButtonText: "OK"
    });*/
};

exports.ontap_account = function(){
    utilsModule.openUrl("https://uniparthenope.esse3.cineca.it/Anagrafica/PasswordDimenticata.do");
};

exports.pageLoaded = pageLoaded;
