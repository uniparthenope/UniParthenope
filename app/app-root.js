const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const observableModule = require("tns-core-modules/data/observable");
const utilsModule = require("tns-core-modules/utils/utils");
const dialogs = require("tns-core-modules/ui/dialogs");
const modalViewModule = "modal-login/modal-login";
let base64= require('base-64');
let utf8 = require('utf8');

let viewModel;

function pageLoaded(args) {
    const page = args.object;
    viewModel = observableModule.fromObject({});
    page.bindingContext = viewModel;

}

exports.onTapLogin = function() {
    let sideDrawer = app.getRootView();
    let user = sideDrawer.getViewById("username").text;
    let pass = sideDrawer.getViewById("password").text;

    if (user != "" && pass!= "")
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
            okButtonText: "OK"
        });
    }

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

exports.goto_home = function () {
    const nav =
        {
            moduleName: "userCalendar/userCalendar",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);

};

exports.goto_libretto = function () {
    const nav =
        {
            moduleName: "Libretto/libretto",
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
            moduleName: "usertecnico-all/usertecnico-all",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.goto_menuNew = function () {
    const nav =
        {
            moduleName: "usertecnico/usertecnico",
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
exports.ontap_account = function(){
    utilsModule.openUrl("https://uniparthenope.esse3.cineca.it/Anagrafica/PasswordDimenticata.do");
};
exports.pageLoaded = pageLoaded;
