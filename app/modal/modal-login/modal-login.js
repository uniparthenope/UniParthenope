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
let firebase = require("nativescript-plugin-firebase");
const platformModule = require("tns-core-modules/platform");



/*
            7	Docenti
            4	Ipot. Immatricolati
            8	Preiscritti
            9	Registrati
            6	Studenti
            99  PTA
*/

let page;
let account;
let items;
let carriere;
let viewModel;
let user;
let pass;
let sideDrawer;

function normalizeToken(userId){
    let token = userId + ":" + pass;
    let bytes = utf8.encode(token);
    global.encodedStr = base64.encode(bytes);
    console.log("Normalized_Token: " + global.encodedStr);
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
    appSettings.setNumber("carriera",index);
    getDepartment(items.getItem(index).stuId);
    appSettings.setNumber("persId", account.user.persId);

    let remember = sideDrawer.getViewById("rememberMe").checked;
    deviceNotifications();
    if (remember){
        appSettings.setString("username",user);
        appSettings.setString("token",global.encodedStr);
        appSettings.setBoolean("rememberMe",true);

        let grpId = "GRP_" + account.user.grpId;
        firebase.subscribeToTopic(grpId).then(() => console.log("Subscribed to",grpId));
        appSettings.setBoolean("topic_grpId",true);

        let cdsId = "CDS_" + items.getItem(index).cdsId;
        firebase.subscribeToTopic(cdsId).then(() => console.log("Subscribed to",cdsId));
        appSettings.setBoolean("topic_cdsId",true);
    }
    global.isConnected = true;
    appSettings.setString("badgeButton","Student Card");
    sideDrawer.getViewById("badge_button").text = "Student Card";
    let nome = appSettings.getString("nome");
    let cognome = appSettings.getString("cognome");
    sideDrawer.getViewById("topName").text = nome + " " + cognome;

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
            moduleName: "studenti/userCalendar/userCalendar",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
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

exports.onShownModally = function (args) {
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
    sideDrawer = app.getRootView();

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
        if(response.statusCode === 401 || response.statusCode === 500) {
            dialogs.confirm({
                title: L('failed_auth'),
                message: _result.errMsg,
                okButtonText: "OK"
            }).then(function (result) {
                args.object.closeModal();
            });
        }
        if(response.statusCode === 503) {
            dialogs.confirm({
                title: L('server_err'),
                message: L('server_err_msg') + "\n\n"+L('moreinfo')+"\nhttps://uniparthenope.esse3.cineca.it/",
                okButtonText: "OK"
            }).then(function (result) {
                args.object.closeModal();
            });
        }
        else if(response.statusCode === 200) {
            let grpId = "GRP_"+_result.user.grpId.toString();
            console.log(_result.user.grpDes);

            account = _result;
            // STUDENTE
            if(_result.user.grpDes === "Studenti"){
                global.myform = "userForm";
                normalizeToken(_result.user.userId);

                carriere = _result.user.trattiCarriera;
                setAnagrafe(_result.user.persId,_result.user.grpDes);
                global.saveInfo(account);

                if (carriere.length > 0) {
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

            // DOCENTI
            else if(_result.user.grpDes === "Docenti"){
                global.myform = "userDocente";
                normalizeToken(_result.user.userId);
                detailedProf(_result.user.docenteId); // Get detailed info of a professor
                setAnagrafe(_result.user.docenteId,_result.user.grpDes);
                global.saveInfo(account);
                deviceNotifications();
                let remember = sideDrawer.getViewById("rememberMe").checked;

                if (remember){
                    appSettings.setString("username",_result.user.userId);
                    appSettings.setString("token",global.encodedStr);
                    appSettings.setBoolean("rememberMe",true);

                    firebase.subscribeToTopic(grpId).then(() => console.log("Subscribed to",grpId));
                    appSettings.setBoolean("topic_grpId",true);
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
                appSettings.setString("badgeButton","Faculty Card");
                sideDrawer.getViewById("badge_button_docente").text = "Faculty Card";
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

            // RISTORANTI
            else if(_result.user.grpDes === "Ristorante"){
                global.myform = "userRistoratore";
                appSettings.setString("grpDes",_result.user.grpDes);
                appSettings.setString("matricola","--");
                let remember = sideDrawer.getViewById("rememberMe").checked;

                if (remember){
                    appSettings.setString("username",user);
                    appSettings.setString("token",global.encodedStr);
                    appSettings.setBoolean("rememberMe",true);

                    firebase.subscribeToTopic(grpId).then(() => console.log("Subscribed to",grpId));
                    appSettings.setBoolean("topic_grpId",true);
                }

                appSettings.setString("nome", _result.user.nome);
                appSettings.setString("cognome", _result.user.cognome);
                appSettings.setString("userId", _result.user.userId);
                appSettings.setString("emailAte",_result.user.email);
                appSettings.setString("ristorante",_result.user.nomeBar);
                appSettings.setString("matricola",_result.user.nomeBar);
                appSettings.setString("sesso",_result.user.sesso);
                appSettings.setString("telRes",_result.user.telefono);
                appSettings.setString("facDes","--");
                appSettings.setString("dataNascita","--");
                deviceNotifications();


                //getPIC();
                //console.log("Ristorante: " + _result.user.nomeBar);
                appSettings.setString("badgeButton","Staff Card");
                sideDrawer.getViewById("badge_button_risto").text = "Staff Card";

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

            // REGISTRATI/DOTTORANDI/IPOT.IMMATRICOLATI/PREISCRITTI/ISCRITTI
            else if(_result.user.grpDes === "Registrati" || _result.user.grpDes === "Dottorandi" || _result.user.grpDes === "Ipot. Immatricolati" || _result.user.grpDes === "Preiscritti" || _result.user.grpDes=== "Iscritti"){
                global.myform = "userOther";
                normalizeToken(_result.user.userId);
                global.saveInfo(account);
                appSettings.setString("matricola","--");

                appSettings.setString("badgeButton","Student Card");
                sideDrawer.getViewById("badge_button_other").text = "Student Card";

                let remember = sideDrawer.getViewById("rememberMe").checked;

                if (remember){
                    appSettings.setString("username",user);
                    appSettings.setString("token",global.encodedStr);
                    appSettings.setBoolean("rememberMe",true);

                    firebase.subscribeToTopic(grpId).then(() => console.log("Subscribed to",grpId));
                    appSettings.setBoolean("topic_grpId",true);
                }
                deviceNotifications();

                let nome = account.user.firstName;
                let cognome = account.user.lastName;

                sideDrawer.getViewById("topName").text = nome + " " + cognome;
                sideDrawer.getViewById("topMatr").text = _result.user.grpDes;
                sideDrawer.getViewById("topMatr").visibility = "visible";
                global.username = nome + " " + cognome;
                global.topMatr = _result.user.grpDes;


                if  (_result.user.persId !== undefined){
                    appSettings.setNumber("persId",_result.user.persId);

                }
                //getPIC(_result.user.persId,0);

                let userForm = sideDrawer.getViewById("userOther");
                let loginForm = sideDrawer.getViewById("loginForm");
                loginForm.visibility = "collapsed";
                userForm.visibility = "visible";

                closeCallback();
                global.isConnected = true;

                const nav =
                    {
                        moduleName: "general/home/home-page",
                        clearHistory: true
                    };
                frame.Frame.topmost().navigate(nav);
            }

            // PTA, ALTRI UTENTI
            else{
                global.myform = "userOther";
                deviceNotifications();
                //console.log(_result.user.grpId);
                if (_result.user.grpDes === "PTA"){
                    sideDrawer.getViewById("badge_button_other").text = "Staff Card";
                    appSettings.setString("badgeButton","Staff Card");

                }
                else
                    appSettings.setString("badge_button_other","UniParthenope Card");

                normalizeToken(_result.user.userId);
                global.saveInfo(account);
                console.log("QUI");

                if  (_result.user.persId !== undefined){
                    appSettings.setNumber("persId",_result.user.persId);
                    getPIC(_result.user.persId,0);
                }

                console.log("QUI");
                appSettings.setString("matricola","--");

                let remember = sideDrawer.getViewById("rememberMe").checked;


                if (remember){
                    appSettings.setString("username",user);
                    appSettings.setString("token",global.encodedStr);
                    appSettings.setBoolean("rememberMe",true);

                    firebase.subscribeToTopic(grpId).then(() => console.log("Subscribed to",grpId));
                    appSettings.setBoolean("topic_grpId",true);
                }
                global.isConnected = true;


                let nc;

                if(user.includes(".")){
                    nc = user.split(".");
                    appSettings.setString("nome", nc[0].toUpperCase());
                    appSettings.setString("cognome", nc[1].toUpperCase());
                }
                else{
                    nc = _result.user.userId.split(".");
                    appSettings.setString("nome", nc[0].toUpperCase());
                    appSettings.setString("cognome", nc[1].toUpperCase());
                }

                appSettings.setString("nome", nc[0].toUpperCase());
                appSettings.setString("cognome", nc[1].toUpperCase());

                sideDrawer.getViewById("topName").text = nc[0].toUpperCase() + " " + nc[1].toUpperCase();
                sideDrawer.getViewById("topName").visibility = "visible";
                sideDrawer.getViewById("topMatr").text = appSettings.getString("grpDes");
                sideDrawer.getViewById("topMatr").visibility = "visible";
                let userForm = sideDrawer.getViewById("userOther");
                let loginForm = sideDrawer.getViewById("loginForm");
                loginForm.visibility = "collapsed";
                userForm.visibility = "visible";

                closeCallback();
                const nav =
                    {
                        moduleName: "general/home/home-page",
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

exports.onTap = function (args) {
    const index = args.index;
    console.log("MATID= " + items.getItem(index).matId);

    if(global.saveCarr(items.getItem(index)))
        selectedCarrer(index);
}

function deviceNotifications(){
    let model = platformModule.device.model;
    let os = platformModule.device.os + " " + platformModule.device.osVersion;

    httpModule.request({
        url : global.url_general + "Notifications/v1/registerDevice",
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic " + global.encodedStr
        },
        content : JSON.stringify({
            token : global.notification_token,
            device_model: model,
            os_version: os
        })
    }).then((response) => {
    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore: Notifications",
            message: e.toString(),
            okButtonText: "OK"
        });
    });

}
