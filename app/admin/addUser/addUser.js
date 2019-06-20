const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");


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
    page.frame.goBack();
}
exports.onTapSave = function (){
    let username = page.getViewById("username").text;
    let pass = page.getViewById("pass").text;
    let email = page.getViewById("email").text;
    let locale = page.getViewById("locale").text;


    dialogs.confirm({
        title: "Conferma",
        message: "Creare nuovo utente?",
        okButtonText: "Si",
        cancelButtonText: "No"
    }).then(function (result) {
        // result argument is boolean
        if (result)
        {
            fetch(global.url + "admin/addUser/" +  username + "/" + pass + "/" + email + "/" + locale + "/" + global.encodedStr, {
                method: "POST",
                headers: { "Content-Type": "application/json"}

            }).then((r) => r.json())
                .then((response) => {
                    const result = response.json;
                    console.log(result);
                    dialogs.alert({
                        title: "Utente Creato!",
                        message: "Utente con successo!",
                        okButtonText: "OK"
                    }).then(function(){
                        const nav =
                            {
                                moduleName: "admin/allUser/allUser",
                                clearHistory: true
                            };
                        frame.topmost().navigate(nav);
                    });
                }).catch((e) => {
            });
        }
    });
};

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
