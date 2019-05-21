const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const appSettings = require("application-settings");
const frame = require("tns-core-modules/ui/frame");
const httpModule = require("tns-core-modules/http");
const base64= require('base-64');
const utf8 = require('utf8');
const dialogs = require("tns-core-modules/ui/dialogs");

let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    if (!global.isConnected)
        autoconnect();

    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}
function autoconnect()
{
    let remember = appSettings.getBoolean("rememberMe");
    console.log("REMEMBER= "+remember);
    if (remember){
        const sideDrawer = app.getRootView();
        let indicator = page.getViewById("activityIndicator");
        indicator.visibility = "visible";
        let user = appSettings.getString("username");
        let pass = appSettings.getString("password");
        console.log("USERNAME (old)= "+user);
        let token = user + ":" + pass;
        var bytes = utf8.encode(token);
        global.encodedStr = base64.encode(bytes);
        let url = "https://uniparthenope.esse3.cineca.it/e3rest/api/login";

        httpModule.request({
            url: url,
            method: "GET",
            headers: {"Content-Type": "application/json",
                "Authorization":"Basic "+ global.encodedStr}
        }).then((response) => {
            const result = response.content.toJSON();
            console.log(result);
            if (result.statusCode === 401 || result.statusCode === 500)
            {
                dialogs.alert({
                    title: "Autenticazione Fallita!",
                    message: result.retErrMsg,
                    okButtonText: "OK"
                });
            }
            else
            {
                let carriere = result.user.trattiCarriera;
                global.saveInfo(result);

                let index = appSettings.getNumber("carriera");
                global.saveCarr(carriere[index]);
                global.isConnected = true;
                let nome = appSettings.getString("nome");
                let cognome = appSettings.getString("cognome");
                sideDrawer.getViewById("topName").text = nome + " " + cognome;
                let grpDes = appSettings.getString("grpDes");
                if (grpDes === "Studenti")
                {
                    let userForm = sideDrawer.getViewById("userForm");
                    let loginForm = sideDrawer.getViewById("loginForm");
                    loginForm.visibility = "collapsed";
                    userForm.visibility = "visible";
                    indicator.visibility = "collapsed";
                    const nav =
                        {
                            moduleName: "userHome/userHome",
                            clearHistory: true
                        };
                    frame.topmost().navigate(nav);
                }
            }

        },(e) => {
            console.log("Error", e.retErrMsg);
            dialogs.alert({
                title: "Autenticazione Fallita!",
                message: e.retErrMsg,
                okButtonText: "OK"
            });
        });
        indicator.visibility = "collapsed";
    }
}
//TODO Social Buttons
//TODO Notizie
//TODO Trasporti
//TODO Ateneo
//TODO Convenzioni
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
