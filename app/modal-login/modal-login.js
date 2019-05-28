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
let account;
let items;
let carriere;
let viewModel;
let user;
let pass;

function onShownModally(args) {
    closeCallback = args.closeCallback;
    page = args.object;
    items = new ObservableArray();
    let userList = page.getViewById("listview");
    let indicator = page.getViewById("activityIndicator");
    indicator.visibility = "visible";
    const contex = args.context;
    user = contex.user;
    pass = contex.pass;
    viewModel = Observable.fromObject({
        items:items
    });

    httpModule.request({
        url: global.url + "login/" + global.encodedStr,
        method: "GET"
    }).then((response) => {
        let result = response.content.toJSON();
        result = result.response;
        console.log(result);

        if (result.statusCode === 401 || result.statusCode === 500)
        {
            dialogs.alert({
                title: "Autenticazione Fallita!",
                message: result.retErrMsg,
                okButtonText: "OK"
            }).then(
                args.object.closeModal()
            );
        }
        else
        {
            account = result;
            carriere = result.user.trattiCarriera;

            if (carriere.length > 1)
            {
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
            else
            {
                selectedCarrer(0);
            }

        }

    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Autenticazione Fallita!",
            message: e.retErrMsg,
            okButtonText: "OK"
        });
        args.object.closeModal();
    });


    page.bindingContext = viewModel;

}

function onTap(args)
{
    const index = args.index;
    selectedCarrer(index);
}

function selectedCarrer(index)
{
    const sideDrawer = app.getRootView();
    global.saveInfo(account);
    appSettings.setNumber("carriera",index);
    let remember = sideDrawer.getViewById("rememberMe").checked;
    if (remember){
        appSettings.setString("username",user);
        appSettings.setString("password",pass);
        appSettings.setBoolean("rememberMe",true);
    }
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
        closeCallback();
        const nav =
            {
                moduleName: "userCalendar/userCalendar",
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
        args.object.closeModal();
        //logout();
    }
}
exports.onTap = onTap;
exports.onShownModally = onShownModally;

