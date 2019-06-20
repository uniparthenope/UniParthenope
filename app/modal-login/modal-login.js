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
        let _result = response.content.toJSON();
        let result = _result.response;

        if(_result.statusCode === 401)
        {
            dialogs.alert({
                title: "Autenticazione Fallita!",
                message: _result.errMsg,
                okButtonText: "OK"
            }).then(
                args.object.closeModal()
            );
        }
        /* Se un utente è di tipo USER TECNICO (ristorante) */
        else if (_result.statusCode === 600)
        {
            const sideDrawer = app.getRootView();
            let remember = sideDrawer.getViewById("rememberMe").checked;

            if (remember){
                appSettings.setString("username",user);
                appSettings.setString("password",pass);
                appSettings.setBoolean("rememberMe",true);
            }
            console.log("UserTecnico:" + _result.username);

            sideDrawer.getViewById("topName").text = _result.username;
            global.username = _result.username;
            let userForm = sideDrawer.getViewById("userTecnico");
            let loginForm = sideDrawer.getViewById("loginForm");
            loginForm.visibility = "collapsed";
            userForm.visibility = "visible";

            closeCallback();
            const nav =
                {
                    moduleName: "usertecnico-all/usertecnico-all",
                    clearHistory: true
                };
            frame.topmost().navigate(nav);
        }
        else
        {
            account = result;
            carriere = result.user.trattiCarriera;

            if (carriere.length > 0)
            {
                indicator.visibility = "collapsed";
                //Mostro le carriere
                for (let i=0; i<carriere.length; i++)
                {
                    console.log(carriere[i].cdsDes);
                    items.push({ "cdsDes": carriere[i].cdsDes,
                        "cdsId": carriere[i].cdsId,
                        "matricola" : carriere[i].matricola,
                        "matId" : carriere[i].matId,
                        "stuId" : carriere[i].stuId,
                        "status" :carriere[i].staStuDes
                    });
                    userList.refresh();
                }
            }
            else
            {
                if(result.user.grpDes === "Docenti"){
                    dialogs.alert({
                        title: "Attenzione!",
                        message: "Il docente non è ancora supportato!! Lavori in corso.....",
                        okButtonText: "OK"
                    });
                    args.object.closeModal();
                }
                else{
                    dialogs.alert({
                        title: "Attenzione!",
                        message: "Lavori in corso.....",
                        okButtonText: "OK"
                    });
                    args.object.closeModal();
                }
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
    console.log("MATID= "+items.getItem(index).matId);

    if(global.saveCarr(items.getItem(index)))
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
    //global.saveCarr(carriere[index]);

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

