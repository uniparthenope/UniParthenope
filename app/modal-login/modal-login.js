const observableModule = require("tns-core-modules/data/observable");
let closeCallback;
const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("tns-core-modules/http");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const appSettings = require("tns-core-modules/application-settings");


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
    console.log("Token: " + global.encodedStr);

    viewModel = Observable.fromObject({
        items:items
    });

    httpModule.request({
        url: global.url + "login" ,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        let _result = response.content.toJSON();
        //let result = _result.response;

        console.log(response.statusCode);

        if(response.statusCode === 401)
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
        else if (response.statusCode === 600)
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
            frame.Frame.topmost().navigate(nav);
        }
        /* Se un utente è di tipo ADMIN (ristorante) */
        else if (response.statusCode === 666)
        {
            const sideDrawer = app.getRootView();
            let remember = sideDrawer.getViewById("rememberMe").checked;

            if (remember){
                appSettings.setString("username",user);
                appSettings.setString("password",pass);
                appSettings.setBoolean("rememberMe",true);
            }
            console.log("Admin:" + _result.username);

            sideDrawer.getViewById("topName").text = _result.username;
            global.username = _result.username;
            let userForm = sideDrawer.getViewById("userAdmin");
            let loginForm = sideDrawer.getViewById("loginForm");
            loginForm.visibility = "collapsed";
            userForm.visibility = "visible";

            closeCallback();
            const nav =
                {
                    moduleName: "admin/admin-home/admin-home",
                    clearHistory: true
                };
            frame.Frame.topmost().navigate(nav);
        }
        else
        {
            account = _result;
            carriere = _result.user.trattiCarriera;

            if (carriere.length > 0)
            {
                indicator.visibility = "collapsed";
                //Mostro le carriere
                for (let i=0; i<carriere.length; i++)
                {
                    console.log(carriere[i].cdsDes);
                    items.push({
                        "cdsDes": carriere[i].cdsDes,
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
                if(_result.user.grpDes === "Docenti"){
                    const sideDrawer = app.getRootView();
                    global.saveInfo(account);
                    let remember = sideDrawer.getViewById("rememberMe").checked;

                    if (remember){
                        appSettings.setString("username",user);
                        appSettings.setString("password",pass);
                        appSettings.setBoolean("rememberMe",true);
                    }
                    console.log("Docente:" + _result.user.userId);
                    global.isConnected = true;
                    let nome = appSettings.getString("nome");
                    let cognome = appSettings.getString("cognome");

                    sideDrawer.getViewById("topName").text = nome + " " + cognome;
                    let userForm = sideDrawer.getViewById("userDocente");
                    let loginForm = sideDrawer.getViewById("loginForm");
                    loginForm.visibility = "collapsed";
                    userForm.visibility = "visible";

                    closeCallback();
                    const nav =
                        {
                            moduleName: "docenti/docenti-home/docenti-home",
                            clearHistory: true
                        };
                    frame.Frame.topmost().navigate(nav);
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

function selectedCarrer(index) {
    const sideDrawer = app.getRootView();
    appSettings.setNumber("carriera",index);
    global.saveInfo(account);
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
                clearHistory: false
            };
        frame.Frame.topmost().navigate(nav);
    }

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

