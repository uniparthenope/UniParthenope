const observableModule = require("tns-core-modules/data/observable");
let closeCallback;
const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("tns-core-modules/http");
const ObservableArray = require("data/observable-array").ObservableArray;
const Observable = require("data/observable");
const appSettings = require("application-settings");


let page;
let items;
let carriere;
let viewModel;

function onShownModally(args) {
    const context = args.context;
    closeCallback = args.closeCallback;
    page = args.object;
    items = new ObservableArray();
    let userList = page.getViewById("listview");
    let indicator = page.getViewById("activityIndicator");
    indicator.visibility = "visible";

    viewModel = Observable.fromObject({
        items:items
    });
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
            carriere = result.user.trattiCarriera;
            global.saveInfo(result);
            indicator.visibility = "collapsed";
            //Mostro le carriere
            for (let i=0; i<carriere.length; i++)
            {
                console.log(carriere[i].cdsDes);
                items.push({ "title": carriere[i].cdsDes,
                    "mat" : carriere[i].matricola,
                    "status" :carriere[i].staStuDes
                });
                userList.refresh();
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


    page.bindingContext = viewModel;

}

function onTap(args)
{
    const sideDrawer = app.getRootView();
    const index = args.index;
    appSettings.setNumber("carriera",index);
    global.isConnected = true;
    let nome = appSettings.getString("nome");
    let cognome = appSettings.getString("cognome");

    sideDrawer.getViewById("topName").text = nome + " " + cognome;
    global.saveCarr(carriere[index]);

    //Se login è studente
    let grpDes = appSettings.getString("grpDes");
    if (grpDes === "Studenti")
    {
        let userForm = sideDrawer.getViewById("userForm");
        let loginForm = sideDrawer.getViewById("loginForm");
        loginForm.visibility = "collapsed";
        userForm.visibility = "visible";
        args.object.closeModal();
        const nav =
            {
                moduleName: "userHome/userHome",
                clearHistory: true
            };
        frame.topmost().navigate(nav);
    }
    //TODO: Account docente
    else {
        dialogs.alert({
            title: "Utente non supportato!",
            message: "Siamo spiacenti, ma il tipo di utente che ha effettuato l'accesso non e' ancora supportato dalla app!",
            okButtonText: "OK"
        });
        //logout();
    }

}
exports.onTap = onTap;
exports.onShownModally = onShownModally;

