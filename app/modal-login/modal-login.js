const observableModule = require("tns-core-modules/data/observable");
let closeCallback;
const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("tns-core-modules/http");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const appSettings = require("tns-core-modules/application-settings");
let base64= require('base-64');
let utf8 = require('utf8');

/*
            7	Docenti
            4	Ipot. Immatricolati
            8	Preiscritti
            9	Registrati
            6	Studenti
             */

let page;
let account;
let items;
let carriere;
let viewModel;
let user;
let pass;
let sideDrawer;

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
    console.log("Temp_Token: " + global.encodedStr);

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

        console.log(response.statusCode);

        if(response.statusCode === 401 || response.statusCode === 500)
        {
            dialogs.confirm({
                title: "Autenticazione Fallita!",
                message: _result.errMsg,
                okButtonText: "OK"
            }).then(function (result) {
                args.object.closeModal();
            });
        }
        if(response.statusCode === 503)
        {
            dialogs.confirm({
                title: "Errore Server ESSE3",
                message: "Il server ESSE3 è momentaneamente non raggiungibile!\n\nPer maggiori info:\nhttps://uniparthenope.esse3.cineca.it/",
                okButtonText: "OK"
            }).then(function (result) {
                args.object.closeModal();
            });
        }
        /* Se un utente è di tipo USER TECNICO (ristorante) */
        else if (response.statusCode === 600)
        {
            sideDrawer = app.getRootView();
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
        // RISTORANTI
        else if(response.statusCode === 202){
            //console.log(_result);
            sideDrawer = app.getRootView();
            appSettings.setString("grpDes",_result.user.grpDes);
            appSettings.setString("matricola","--");
            let remember = sideDrawer.getViewById("rememberMe").checked;

            if (remember){
                appSettings.setString("username",user);
                appSettings.setString("token",global.encodedStr);
                appSettings.setBoolean("rememberMe",true);
            }

            appSettings.setString("nome", _result.user.nome);
            appSettings.setString("cognome", _result.user.cognome);
            appSettings.setString("userId", _result.userId);
            appSettings.setString("emailAte",_result.user.email);
            appSettings.setString("ristorante",_result.user.nomeBar);
            appSettings.setString("matricola",_result.user.nomeBar);
            appSettings.setString("sesso",_result.user.sesso);
            appSettings.setString("telRes",_result.user.telefono);
            appSettings.setString("facDes","--");
            appSettings.setString("dataNascita","--");

            //getPIC();
            //console.log("Ristorante: " + _result.user.nomeBar);

            sideDrawer.getViewById("topName").text = _result.user.nome + " "+_result.user.cognome;
            global.username = _result.userId;

            sideDrawer.getViewById("topMatr").text = _result.user.nomeBar;
            sideDrawer.getViewById("topEmail").text = _result.user.email;
            sideDrawer.getViewById("topMatr").visibility = "visible";
            sideDrawer.getViewById("topEmail").visibility = "visible";

            let userForm = sideDrawer.getViewById("userRistoratore");
            let loginForm = sideDrawer.getViewById("loginForm");
            loginForm.visibility = "collapsed";
            userForm.visibility = "visible";

            closeCallback();
            const nav =
                {
                    moduleName: "ristoratore/ristoratore-home",
                    clearHistory: true
                };
            frame.Frame.topmost().navigate(nav);
        }
        else if(response.statusCode === 200)
        {
            console.log(_result.user.grpDes);

            account = _result;
            // STUDENTE
            if(_result.user.grpDes === "Studenti"){
                console.log(_result.user.userId);

                normalizeToken(_result.user.userId);

                carriere = _result.user.trattiCarriera;
                setAnagrafe(_result.user.persId,_result.user.grpDes);

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
            }
           else if(_result.user.grpDes === "Docenti"){

                normalizeToken(_result.user.userId);
                detailedProf(_result.user.docenteId); // Get detailed info of a professor
                setAnagrafe(_result.user.docenteId,_result.user.grpDes);
                sideDrawer = app.getRootView();
                global.saveInfo(account);
                let remember = sideDrawer.getViewById("rememberMe").checked;

                if (remember){
                    appSettings.setString("username",_result.user.userId);
                    appSettings.setString("token",global.encodedStr);
                    appSettings.setBoolean("rememberMe",true);
                }
                console.log("Docente:" + _result.user.userId);
                appSettings.setNumber("idAb",_result.user.idAb);
                global.isConnected = true;
                let nome = appSettings.getString("nome");
                let cognome = appSettings.getString("cognome");

                sideDrawer.getViewById("topName").text = nome + " " + cognome;
                sideDrawer.getViewById("topMatr").text = appSettings.getString("ruolo")+ " " +appSettings.getString("settore");
                sideDrawer.getViewById("topEmail").text = appSettings.getString("emailAte");
                sideDrawer.getViewById("topMatr").visibility = "visible";
                sideDrawer.getViewById("topEmail").visibility = "visible";
                getPIC(_result.user.idAb,1);
                //getPIC(appSettings.getNumber("idAb",1));
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
            /*
                        else if(_result.user.grpDes === "Tecnico"){
                            sideDrawer = app.getRootView();
                            let remember = sideDrawer.getViewById("rememberMe").checked;

                            if (remember){
                                appSettings.setString("username",user);
                                appSettings.setString("password",pass);
                                appSettings.setBoolean("rememberMe",true);
                            }
                            console.log("Ristorante:" + _result.username);

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

            }*/
                // PTA, ALTRI UTENTI
            else{
                //console.log(_result.user.grpId);
                sideDrawer = app.getRootView();
                appSettings.setString("grpDes",_result.user.grpDes);
                appSettings.setString("matricola","--");

                let remember = sideDrawer.getViewById("rememberMe").checked;


                if (remember){
                    appSettings.setString("username",user);
                    appSettings.setString("token",global.encodedStr);
                    appSettings.setBoolean("rememberMe",true);
                }
                global.isConnected = true;
                let nc = user.split(".");

                appSettings.setString("nome", nc[0].toUpperCase());
                appSettings.setString("cognome", nc[1].toUpperCase());


                sideDrawer.getViewById("topName").text = nc[0].toUpperCase() + " " + nc[1].toUpperCase();
                let userForm = sideDrawer.getViewById("userOther");
                let loginForm = sideDrawer.getViewById("loginForm");
                loginForm.visibility = "collapsed";
                userForm.visibility = "visible";

                closeCallback();
                const nav =
                    {
                        moduleName: "home/home-page",
                        clearHistory: true
                    };
                frame.Frame.topmost().navigate(nav);
            }
        }


    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore: Login",
            message: e.toString(),
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

function getPIC(personId, value) {
    let url;
    switch (value) {
        case 0:
            url = global.url + "general/image/" + personId;
            break;

        case 1:
            url = global.url + "general/image_prof/" + personId;
            break;
    }

    httpModule.getFile({
        "url": url,
        "method": "GET",
        headers: {
            "Content-Type": "image/jpg",
            "Authorization": "Basic " + global.encodedStr
        },
        "dontFollowRedirects": true
    }).then((source) => {
        sideDrawer.getViewById("topImg").backgroundImage = source["path"];
    }, (e) => {
        console.log("[Photo] Error", e);
        dialogs.alert({
            title: "Errore: getPic",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

function selectedCarrer(index) {
    sideDrawer = app.getRootView();
    appSettings.setNumber("carriera",index);
    getDepartment(items.getItem(index).stuId);
    appSettings.setNumber("persId", account.user.persId);

    global.saveInfo(account);
    let remember = sideDrawer.getViewById("rememberMe").checked;
    if (remember){
        appSettings.setString("username",user);
        appSettings.setString("token",global.encodedStr);
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
        sideDrawer.getViewById("topMatr").text = appSettings.getString("matricola");
        sideDrawer.getViewById("topEmail").text = appSettings.getString("emailAte");
        sideDrawer.getViewById("topMatr").visibility = "visible";
        sideDrawer.getViewById("topEmail").visibility = "visible";
        getPIC(appSettings.getNumber("persId"),0);
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
            title: "Lavori in corso!",
            message: "L'applicazione è in fase di sviluppo",
            okButtonText: "OK"
        });
        args.object.closeModal();
        //logout();

    }
}
function normalizeToken(userId){
    let token = userId + ":" + pass;
    let bytes = utf8.encode(token);
    global.encodedStr = base64.encode(bytes);
    console.log("Normalized_Token: " + global.encodedStr);

}
function detailedProf(docenteId) {
    httpModule.request({
        url: global.url + "professor/detailedInfo/"+ docenteId,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        let _result = response.content.toJSON();
        global.saveProf(_result);

    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore: Modal-Login detailedProf",
            message: e.toString(),
            okButtonText: "OK"
        });
    });

}

function setAnagrafe(id, type){
    httpModule.request({
        url: global.url + "general/anagrafica/"+ id,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        let _result = response.content.toJSON();

        //console.log(_result);
        global.saveAnagrafe(type,_result);

        if (type === "Docenti"){
            let nome = appSettings.getString("nome");
            let cognome = appSettings.getString("cognome");

            sideDrawer.getViewById("topName").text = nome + " " + cognome;
            sideDrawer.getViewById("topMatr").text = _result.ruolo+ " " + _result.settore;
            sideDrawer.getViewById("topEmail").text = _result.emailAte;
            sideDrawer.getViewById("topMatr").visibility = "visible";
            sideDrawer.getViewById("topEmail").visibility = "visible";
        }

    },(e) => {
        console.log("Errore Anagrafe", e);
        dialogs.alert({
            title: "Errore: Modal-Login setAnagrafe",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

function getDepartment(studId) {
    console.log(studId);
    httpModule.request({
        url: global.url + "students/departmentInfo/"+ studId,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        let _result = response.content.toJSON();
        global.saveDepartment(_result);

    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore: Modal-Login getDepartment",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}
exports.onTap = onTap;
exports.onShownModally = onShownModally;

