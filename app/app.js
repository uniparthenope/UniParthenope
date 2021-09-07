const application = require("tns-core-modules/application");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const appRater = require("nativescript-rater").appRater;
const app = require("tns-core-modules/application");
const StoreUpdate = require("nativescript-store-update");
let firebase = require("nativescript-plugin-firebase");
let dialog = require("tns-core-modules/ui/dialogs");
const frame = require("tns-core-modules/ui/frame");
const platformModule = require("tns-core-modules/platform");
require('globals');
require('nativescript-i18n');

//let domain = "http://api.uniparthenope.it:5000";
let domain = "https://api.uniparthenope.it";
//let domain = "http://127.0.0.1:5000";

global.url = domain + "/UniparthenopeApp/v1/";
global.url2 = domain + "/UniparthenopeApp/v2/";
global.url_general = domain + "/";
global.version;
global.notification_token;

global.isConnected = false;
global.updatedExam = false;
global.encodedStr = "";
global.authToken="";
global.tempNum = 0;
global.myform = "";
global.username = "";
global.data_today;
global.events = [];
global.tempPos = false;
global.globalEvents = [];
global.freqExams = [];
global.myExams = [];
global.myDocenti = [];
global.myPrenotazioni = [];
global.myLezioni = [];
global.myAppelli = new ObservableArray();
global.news = new ObservableArray();
global.my_selfcert;
global.services = [];
global.notification_flag = false;

/*
appSettings.setString("aa_accad", result.aa_accad);
appSettings.setString("sessione", result.curr_sem);
appSettings.setString("semestre", result.semestre);
*/

global.clearAll = function(){

    global.isConnected = false;
    global.updatedExam = false;
    global.tempPos = false;
    global.tempNum = 0;
    global.encodedStr = "";
    global.authToken="";
    global.myform = "";
    global.username = "";
    global.events = [];
    global.freqExams = [];
    global.myExams = [];
    global.myDocenti = [];
    global.myPrenotazioni = [];
    global.myAppelli = new ObservableArray();
    global.news = new ObservableArray();
    global.services = [];
    global.notification_flag = false;

    appSettings.clear();
};

global.dayOfWeek = function(date) {
    date = date.getDay();
    return isNaN(date) ? null : [L('dom'), L('lun'), L('mar'), L('mer'), L('gio'), L('ven'), L('sab')][date];
}

global.monthOfYear = function(date) {

    return isNaN(date) ? null : [L('gen'), L('feb'), L('mar_m'), L('apr'), L('mag'), L('giu'), L('lug'), L('ago'), L('set'), L('ott'), L('nov'), L('dic')][date];

}

global.saveInfo =async function(result) {
    await appSettings.setString("codFis",result.user.codFis);
    await appSettings.setString("nome",result.user.firstName);
    await appSettings.setString("cognome",result.user.lastName);
    await appSettings.setString("grpDes",result.user.grpDes);
    await appSettings.setNumber("grpId",result.user.grpId);

    //appSettings.setNumber("persId", result.user.persId);
    await appSettings.setString("userId", result.user.userId);

    if  (result.user.grpDes === "Studenti"){
        let index = await appSettings.getNumber("carriera");

                console.log(result.user.trattiCarriera[index].strutturaDes);

                await appSettings.setString("strutturaDes",result.user.trattiCarriera[index].strutturaDes);
                await appSettings.setString("strutturaId",result.user.trattiCarriera[index].strutturaId.toString());
                await appSettings.setString("strutturaGaId",result.user.trattiCarriera[index].strutturaGaId.toString());
                await appSettings.setString("corsoGaId",result.user.trattiCarriera[index].corsoGaId.toString());

                console.log("SAVE_INFO Dipartimento= "+result.user.trattiCarriera[index].strutturaDes);
                console.log("SAVE_INFO Dipartimento ID= "+result.user.trattiCarriera[index].strutturaId);
                console.log("SAVE_INFO GA Id= "+result.user.trattiCarriera[index].strutturaGaId);
                console.log("SAVE_INFO GA Corso= "+result.user.trattiCarriera[index].corsoGaId);
    }

    global.authToken= result.authToken;
    console.log("SAVE_INFO CF= "+result.user.codFis);
    console.log("SAVE_INFO Name= "+result.user.firstName);
    console.log("SAVE_INFO Surname= "+result.user.lastName);
    console.log("SAVE_INFO grpDes= "+result.user.grpDes);
    console.log("SAVE_INFO grpId= "+result.user.grpId);

    //console.log("SAVE_INFO persId= "+result.user.persId);
    console.log("SAVE_INFO userId= " + result.user.userId);
    console.log("SAVE_INFO AuthToken= " + global.authToken);
};
global.saveAnagrafe = function(type,result){
    console.log("SAVE_ANAGR dataNascita= "+result.dataNascita);
    console.log("SAVE_ANAGR emailAte= "+result.emailAte);
    console.log("SAVE_ANAGR sesso= "+result.sesso);
    console.log("SAVE_ANAGR telRes= "+result.telRes);

    appSettings.setString("dataNascita",result.dataNascita);
    appSettings.setString("emailAte",result.emailAte);
    appSettings.setString("sesso",result.sesso);
    appSettings.setString("telRes",result.telRes);

    if (type === "Studenti"){
        console.log("SAVE_ANAGR desCittadinanza= "+result.desCittadinanza);
        console.log("SAVE_ANAGR email= "+result.email);

        appSettings.setString("desCittadinanza",result.desCittadinanza);
        appSettings.setString("email",result.email);
    }
    else if (type === "Docenti"){
        console.log("SAVE_ANAGR ruolo= "+result.ruolo);
        console.log("SAVE_ANAGR settore= "+result.settore);

        appSettings.setString("ruolo",result.ruolo);
        appSettings.setString("settore",result.settore);
    }
};
global.saveCarr = function(result) {
    console.log("SAVE_CARR cdsDes= "+result.cdsDes);
    console.log("SAVE_CARR cdsId= "+result.cdsId);
    console.log("SAVE_CARR matId= "+result.matId);
    console.log("SAVE_CARR stuId= "+result.stuId);
    console.log("SAVE_CARR Mat.= "+result.matricola);

    appSettings.setString("cdsDes",result.cdsDes);
    appSettings.setNumber("cdsId",result.cdsId);
    appSettings.setNumber("matId",result.matId);
    appSettings.setNumber("stuId",result.stuId);
    appSettings.setString("matricola",result.matricola);

    return true;
};
global.saveDepartment = function(result) {
    console.log("SAVE_CARR dataIscr= "+result.dataIscr);
    console.log("SAVE_CARR facCod= "+result.facCod);
    console.log("SAVE_CARR facCsaCod= "+result.facCsaCod);
    console.log("SAVE_CARR facDes= "+result.facDes);
    console.log("SAVE_CARR sedeId.= "+result.sedeId);
    console.log("SAVE_CARR sediDes.= "+result.sediDes);

    appSettings.setString("dataIscr",result.dataIscr);
    appSettings.setString("facCod",result.facCod);
    appSettings.setString("facCsaCod",result.facCsaCod);
    appSettings.setString("facDes",result.facDes);
    appSettings.setNumber("sedeId",result.sedeId);
    appSettings.setString("sediDes",result.sediDes);


};
global.saveProf = function(result) {
    console.log("SAVE_CARR settCod= " + result.settCod);
    appSettings.setString("settCod",result.settCod);

    console.log("SAVE_CARR ruoloDocCod= "+result.ruoloDocCod);
    appSettings.setString("ruoloDocCod",result.ruoloDocCod);

    console.log("SAVE_CARR Mat.= "+result.docenteMatricola);
    appSettings.setString("matricola",result.docenteMatricola);

    console.log("SAVE_CARR facCod= " + result.facCod);
    appSettings.setString("facCod",result.facCod);

    console.log("SAVE_CARR facDes= "+result.facDes);
    appSettings.setString("facDes",result.facDes);

    console.log("SAVE_CARR facId.= "+result.facId);
    appSettings.setNumber("facId",result.facId);

};

global.getAllBadge = function(page) {
    let calendar = appSettings.getNumber("calendarBadge",0);
    let exams = appSettings.getNumber("examsBadge",0);
    let food = appSettings.getNumber("foodBadge",0);
    let trasport = appSettings.getNumber("trasportBadge",0);
    let appello = appSettings.getNumber("appelloBadge",0);

    if (calendar === 0) {
            page.getViewById("badge_Calendar").visibility = "collapsed";

    }
    else {
            page.getViewById("badge_Calendar").visibility = "visible";
            page.getViewById("text_badgeCalendar").text = calendar;
    }
    if (appello === 0) {
        page.getViewById("badge_appello").visibility = "collapsed";

    }
    else {
        page.getViewById("badge_appello").visibility = "visible";
        page.getViewById("text_badgeAppello").text = appello;
    }

    if (exams === 0) {
        page.getViewById("badge_Courses").visibility = "collapsed";
    }
    else {
        page.getViewById("badge_Courses").visibility = "visible";
        page.getViewById("text_badgeCourses").text = exams;
    }

    if (food === 0) {
        page.getViewById("badge_Food").visibility = "collapsed";
    }
    else {
        page.getViewById("badge_Food").visibility = "visible";
        page.getViewById("text_badgeFood").text = food;
    }

    if (trasport === 0) {
        page.getViewById("badge_Bus").visibility = "collapsed";
    }
    else {
        page.getViewById("badge_Bus").visibility = "visible";
        page.getViewById("text_badgeBus").text = trasport;
    }
};

application.on(application.exitEvent, (args) => {
    console.log(appSettings.getBoolean("rememberMe", false));

    if (!appSettings.getBoolean("rememberMe", false)){
        let temp_scelta = appSettings.getBoolean("sondaggio", false);

        let grp = "GRP_" + appSettings.getNumber("grpId",0);
        let cds = "CDS_" + appSettings.getNumber("cdsId",0);
        if(appSettings.getNumber("grpId",0) !== 0){
            firebase.unsubscribeFromTopic(grp).then(() => console.log("Unsubscribed from ",grp));
            firebase.unsubscribeFromTopic(cds).then(() => console.log("Unsubscribed from ",cds));
        }

        clearAll();

        appSettings.setBoolean("sondaggio", temp_scelta);
    }

    if (args.android) {
        if(global.encodedStr !== " "){
            let url = global.url + "logout/" + global.encodedStr + "/" + global.authToken;
            httpModule.request({
                url: url,
                method: "GET"
            }).then((response) => {
                const result = response.content.toJSON();

                if(result.status_code === 200){
                    console.log("Logout");
                }

            },(e) => {
                dialog.alert({
                    title: "Errore: Logout",
                    message: e.toString(),
                    okButtonText: "OK"
                });
            });

        }
        console.log("Exit: " + args.android);
    } else if (args.ios) {
        console.log("Exit: " + args.ios);
    }
});

application.on(application.suspendEvent, (args) => {
    global.tempPos = false;

    if (args.android) {
        console.log("Suspend: " + args.android);
    } else if (args.ios) {
        console.log("Suspend: " + args.ios);
    }
});

application.on(application.launchEvent, (args) => {
    if (args.android) {
        // For Android applications, args.android is an android.content.Intent class.
        console.log("Launched Android application with the following intent: " + args.android + ".");
    } else if (args.ios !== undefined) {
        // For iOS applications, args.ios is NSDictionary (launchOptions).
        console.log("Launched iOS application with options: " + args.ios);
    }

});


// RATING APP
appRater.init({
    showNeverButton:false,
    debugMode:false
});

if(app.ios){
    appRater.ios.setAlertTitle('Valuta app@uniparthenope');
    appRater.ios.setAlertMessage('Se ti piace quest\'app, trova un momento per lasciare una recensione positiva.\n La tua opinione conta per noi.');
    appRater.ios.setAlertCancelTitle('No, Grazie!');
    appRater.ios.setAlertRateTitle('Valuta Adesso');
    appRater.ios.setAlertRateLaterTitle('Ricorda Dopo');
    appRater.ios.setAppName('app@uniparthenope');
}


//APPLICATION UPDATES
let options = {
    title: "Aggiornamento Disponibile!",
    message: "È disponibile una nuova versione dell'applicazione, si consiglia di effettuare l'aggiornamento!",
    updateButton:"Aggiorna",
    skipButton: "Non Adesso"
}
StoreUpdate.StoreUpdate.init({
    notifyNbDaysAfterRelease: 0,
    majorUpdateAlertType: StoreUpdate.AlertTypesConstants.FORCE,
    countryCode: "it",
    alertOptions: options
})

//FIREBASE PLUGIN
firebase.init({
    showNotifications: true,
    showNotificationsWhenInForeground: true,
    onMessageReceivedCallback: function(message) {
        console.log(message);
        console.log("Title: " + message.title);
        console.log("Body: " + message.body);
        console.log("Value of 'page': " + message.data.page);
        console.log("Foreground: " + message.foreground);
        //console.log("Info: " + message.data.info)

        if(platformModule.isIOS){
            global.notification_flag = true;
            if (!message.foreground){
                setTimeout(() => {
                    if (message.data.page){
                        if (message.data.page === "info"){
                            dialog.confirm({
                                title: message.title,
                                message: message.body,
                                cancelButtonText: "Rifiuta",
                                okButtonText: "Conferma"
                            }).then(result => {
                                if (result){
                                    console.log("ID " + message.data.id);
                                    httpModule.request({
                                        url : global.url_general + "Badges/v2/sendInfo",
                                        method : "POST",
                                        headers : {
                                            "Content-Type": "application/json",
                                            "Authorization" : "Basic "+ global.encodedStr
                                        },
                                        content : JSON.stringify({
                                            receivedToken: message.data.receivedToken,
                                            id: message.data.id
                                        })
                                    }).then((response) => {
                                        const result = response.content.toJSON();
                                        console.log(result);

                                        let message;
                                        if (response.statusCode === 500)
                                            message = "Error: " + result["errMsg"];
                                        else
                                            message = result["message"];

                                        // Inserire risposta nell'alert (Nome,Cognome,Email,Matr e Autorizzazione)
                                        dialog.alert({
                                            title: "Result:",
                                            message: message,
                                            okButtonText: "OK"
                                        });
                                    }, error => {
                                        console.error(error);
                                    });
                                }
                            });
                        }
                        else if(message.data.page === "info_received"){
                            dialog.confirm({
                                title: message.title,
                                message: message.body,
                                cancelButtonText: "Annulla",
                                okButtonText: "Vai"
                            }).then(result => {
                                if (result){
                                    const nav = {
                                        moduleName: "common/anagrafica/anagrafica",
                                        clearHistory: false,
                                        context: {
                                            id: message.data.id_info
                                        }
                                    };
                                    frame.Frame.topmost().navigate(nav);
                                }
                            });
                        }
                        else{
                            dialog.confirm({
                                title: message.title,
                                message: message.body,
                                cancelButtonText: "Annulla",
                                okButtonText: "Vai"
                            }).then(result => {
                                if (result){
                                    const nav = {
                                        moduleName: "general/singleNews/singleNews",
                                        clearHistory: false,
                                        context: {
                                            title: message.data.title,
                                            body: message.data.body
                                        }
                                    };
                                    frame.Frame.topmost().navigate(nav);
                                }
                            });
                        }
                    }
                }, 50);
            }
            else{
                if (message.data.page){
                    if (message.data.page === "info"){
                        dialog.confirm({
                            title: message.title,
                            message: message.body,
                            cancelButtonText: "Rifiuta",
                            okButtonText: "Conferma"
                        }).then(result => {
                            if (result){
                                console.log("ID " + message.data.id);

                                httpModule.request({
                                    url : global.url_general + "Badges/v2/sendInfo",
                                    method : "POST",
                                    headers : {
                                        "Content-Type": "application/json",
                                        "Authorization" : "Basic "+ global.encodedStr
                                    },
                                    content : JSON.stringify({
                                        receivedToken: message.data.receivedToken,
                                        id: message.data.id
                                    })
                                }).then((response) => {
                                    const result = response.content.toJSON();
                                    console.log("RESULT: ",result);

                                    let message;
                                    if (response.statusCode === 500)
                                        message = "Error: " + result["errMsg"];
                                    else
                                        message = result["message"];

                                    // Inserire risposta nell'alert (Nome,Cognome,Email,Matr e Autorizzazione)
                                    dialog.alert({
                                        title: "Result:",
                                        message: message,
                                        okButtonText: "OK"
                                    });
                                }, error => {
                                    console.error(error);
                                });
                            }
                        });
                    }
                    else if(message.data.page === "info_received"){
                        dialog.confirm({
                            title: message.title,
                            message: message.body,
                            cancelButtonText: "Annulla",
                            okButtonText: "Vai"
                        }).then(result => {
                            if (result){
                                const nav = {
                                    moduleName: "common/anagrafica/anagrafica",
                                    clearHistory: false,
                                    context: {
                                        id: message.data.id_info
                                    }                                };
                                frame.Frame.topmost().navigate(nav);
                            }
                        });
                    }
                }

            }
        }
        else if(platformModule.isAndroid){
            if (message.foreground){
                if(message.data.page){
                    if (message.data.page === "info"){
                        dialog.confirm({
                            title: message.title,
                            message: message.body,
                            cancelButtonText: "Rifiuta",
                            okButtonText: "Conferma"
                        }).then(result => {
                            if (result){
                                console.log("ID " + message.data.id);
                                console.log("RCV TOKEN ", message.data.receivedToken);

                                httpModule.request({
                                    url : global.url_general + "Badges/v2/sendInfo",
                                    method : "POST",
                                    headers : {
                                        "Content-Type": "application/json",
                                        "Authorization" : "Basic "+ global.encodedStr
                                    },
                                    content : JSON.stringify({
                                        receivedToken: message.data.receivedToken,
                                        id: message.data.id
                                    })
                                }).then((response) => {
                                    const result = response.content.toJSON();
                                    console.log("RESULT",result);

                                    let message;
                                    if (response.statusCode === 500)
                                        message = "Error: " + result["errMsg"];
                                    else
                                        message = result["message"];

                                    // Inserire risposta nell'alert (Nome,Cognome,Email,Matr e Autorizzazione)
                                    dialog.alert({
                                        title: "Result:",
                                        message: message,
                                        okButtonText: "OK"
                                    });
                                }, error => {
                                    console.error(error);
                                });
                            }
                        });
                    }
                    else if(message.data.page === "info_received"){
                        dialog.confirm({
                            title: message.title,
                            message: message.body,
                            cancelButtonText: "Annulla",
                            okButtonText: "Vai"
                        }).then(result => {
                            if (result){
                                const nav = {
                                    moduleName: "common/anagrafica/anagrafica",
                                    clearHistory: false,
                                    context: {
                                        id: message.data.id_info
                                    }
                                };
                                frame.Frame.topmost().navigate(nav);
                            }
                        });
                    }
                    else{
                        dialog.confirm({
                            title: message.title,
                            message: message.body,
                            cancelButtonText: "Annulla",
                            okButtonText: "Vai"
                        }).then(result => {
                            if (result){
                                const nav = {
                                    moduleName: "general/singleNews/singleNews",
                                    clearHistory: false,
                                    context: {
                                        title: message.data.title,
                                        body: message.data.body
                                    }
                                };
                                frame.Frame.topmost().navigate(nav);
                            }
                        });
                    }
                }
            }
            else {
                global.notification_flag = true;
                setTimeout(() => {
                    if (message.data.page){
                        if (message.data.page === "info"){
                            dialog.confirm({
                                title: message.title,
                                message: message.body,
                                cancelButtonText: "Rifiuta",
                                okButtonText: "Conferma"
                            }).then(result => {
                                if (result){
                                    console.log("ID " + message.data.id);

                                    httpModule.request({
                                        url : global.url_general + "Badges/v2/sendInfo",
                                        method : "POST",
                                        headers : {
                                            "Content-Type": "application/json",
                                            "Authorization" : "Basic "+ global.encodedStr
                                        },
                                        content : JSON.stringify({
                                            receivedToken: message.data.receivedToken,
                                            id: message.data.id
                                        })
                                    }).then((response) => {
                                        const result = response.content.toJSON();
                                        console.log(result);

                                        let message;
                                        if (response.statusCode === 500)
                                            message = "Error: " + result["errMsg"];
                                        else
                                            message = result["message"];

                                        dialog.alert({
                                            title: "Result:",
                                            message: message,
                                            okButtonText: "OK"
                                        });
                                    }, error => {
                                        console.error(error);
                                    });
                                }
                            });
                        }
                        else if(message.data.page === "info_received"){
                            dialog.confirm({
                                title: message.title,
                                message: message.body,
                                cancelButtonText: "Annulla",
                                okButtonText: "Vai"
                            }).then(result => {
                                if (result){
                                    const nav = {
                                        moduleName: "common/anagrafica/anagrafica",
                                        clearHistory: false,
                                        context: {
                                            id: message.data.id_info
                                        }
                                    };
                                    frame.Frame.topmost().navigate(nav);
                                }
                            });
                        }
                        else{
                            dialog.confirm({
                                title: message.title,
                                message: message.body,
                                cancelButtonText: "Annulla",
                                okButtonText: "Vai"
                            }).then(result => {
                                if (result){
                                    const nav = {
                                        moduleName: "general/singleNews/singleNews",
                                        clearHistory: false,
                                        context: {
                                            title: message.data.title,
                                            body: message.data.body
                                        }
                                    };
                                    frame.Frame.topmost().navigate(nav);
                                }
                            });
                        }
                    }
                }, 50);
            }
        }
    },
    onPushTokenReceivedCallback: function(token) {
        global.notification_token = token;
        console.log("Firebase push token: " + token);
    }
}).then(
    function () {
        console.log("firebase.init done");
        firebase.subscribeToTopic("ALL").then(() => console.log("Subscribed ALL"));

    },
    function (error) {
        console.log("firebase.init error: " + error);
    }
);

application.run({ moduleName: "app-root" });