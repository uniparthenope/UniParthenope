const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const utilsModule = require("tns-core-modules/utils/utils");

let page;
let viewModel;
let sideDrawer;
let loading;
let index;
let my_status = "";
let my_selfcert = false;
let status = ["Non Definito","A Distanza","In Presenza"];
let isStudent = false;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({
        status: status
    });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    loading = page.getViewById("activityIndicator");

    getSelfCert();

    if (appSettings.getString("grpDes") === "Studenti"){
        isStudent = true;
        getAccess();
        page.getViewById("scelta_accesso").visibility = "visible";

    }
    else{
        isStudent = false;
        page.getViewById("scelta_accesso").visibility = "collapsed";

    }

    page.bindingContext = viewModel;
}

function onListPickerLoaded(fargs) {
    const listPickerComponent = fargs.object;
    listPickerComponent.on("selectedIndexChange", (args) => {
        const picker = args.object;
        index = picker.selectedIndex;

        //console.log(`index: ${picker.selectedIndex}; item" ${status[picker.selectedIndex]}`);
    });
}
exports.onListPickerLoaded = onListPickerLoaded;

function getAccess(){
    loading.visibility = "visible";

    httpModule.request({
        url: global.url_general + "Access/v1/classroom",
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic " + global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        console.log(result);

        if (response.statusCode === 401 || response.statusCode === 500) {
            dialogs.alert({
                title: "Errore Server!",
                message: result,
                okButtonText: "OK"

            })
        }
        else
        {
            let lp = page.getViewById("listpicker");
            my_status = result.accessType;

            if (result.accessType === "presence"){
                lp.selectedIndex = 2;
            }

            else if(result.accessType === "distance"){
                lp.selectedIndex = 1;
            }

            else {
                page.getViewById("alert1").visibility = "visible";
                lp.selectedIndex = 0;
            }


            loading.visibility = "collapsed";
        }
    },(e) => {
        console.log("Error", e.retErrMsg);
        dialogs.alert({
            title: "Errore Server!",
            message: e.retErrMsg,
            okButtonText: "OK"
        });
    });
}

function getSelfCert(){
    loading.visibility = "visible";

    httpModule.request({
        url: global.url_general + "Access/v1/covidStatement",
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic " + global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        console.log(result);

        if (response.statusCode === 401 || response.statusCode === 500) {
            dialogs.alert({
                title: "Errore Server!",
                message: result,
                okButtonText: "OK"

            })
        }
        else
        {
            let sw = page.getViewById("switch_sondaggio");
            if(result.covidStatement){

                my_selfcert = true;
                appSettings.setBoolean("selfcert", true);
                sw.checked = "true";
            }
            else{
                my_selfcert = false;
                appSettings.setBoolean("selfcert", false);
                sw.checked = "false";
            }

            loading.visibility = "collapsed";
        }
    },(e) => {
        console.log("Error", e.retErrMsg);
        dialogs.alert({
            title: "Errore Server!",
            message: e.retErrMsg,
            okButtonText: "OK"
        });
    });
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    const nav =
        {
            moduleName: "home/home-page",
            clearHistory: true
        };
    page.frame.navigate(nav);
}

exports.ontap_save = function(){
    if(isStudent){
        if(index === 0){
            setAccess("undefined");
        }
        else if(index === 1){
            setAccess("distance");
        }
        else if(index === 2){
            if (my_selfcert){
                setAccess("presence");
            }
            else{
                dialogs.confirm({
                    title: "Attenzione!",
                    message: "Per poter selezionare il tipo di accesso in PRESENZA bisogna prima accettare l'Autocertificazione Obbligatoria!",
                    okButtonText: "OK"
                });
            }
        }
    }
    else{
        setSelfCert(my_selfcert);
    }
};

function setSelfCert(flag){
    loading.visibility = "visible";
    httpModule.request({
        url: global.url_general + "Access/v1/covidStatement",
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic " + global.encodedStr
        },
        content: JSON.stringify({
            covidStatement: flag
        })
    }).then((response) => {
        const result = response.content.toJSON();

        if (response.statusCode === 401 || response.statusCode === 500) {
            loading.visibility = "collapsed";
            dialogs.alert({
                title: "Errore: Access ontapSave",
                message: result.errMsg,
                okButtonText: "OK"
            });
        }
        else {
            loading.visibility = "collapsed";
            dialogs.confirm({
                title: "Success",
                message: "Modifica effettuata!",
                okButtonText: "OK"
            }).then(function () {
                const nav =
                    {
                        moduleName: "access/access",
                        clearHistory: true
                    };
                page.frame.navigate(nav);
            });
        }
    },(e) => {
        dialogs.alert({
            title: "Errore: Access",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

function setAccess(scelta){
    loading.visibility = "visible";
    httpModule.request({
        url: global.url_general + "Access/v1/classroom",
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic " + global.encodedStr
        },
        content: JSON.stringify({
            accessType: scelta
        })
    }).then((response) => {
        const result = response.content.toJSON();

        if (response.statusCode === 401 || response.statusCode === 500) {
            loading.visibility = "collapsed";
            dialogs.alert({
                title: "Errore: Access ontapSave",
                message: result.errMsg,
                okButtonText: "OK"

            });
        }
        else
        {
            setSelfCert(my_selfcert);
        }
    },(e) => {
        dialogs.alert({
            title: "Errore: Access",
            message: e.toString(),
            okButtonText: "OK"
        });
    });

}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;

function onSwitchLoaded_autocert(args) {
    const mySwitch = args.object;

    mySwitch.on("checkedChange", (args) => {
        const sw = args.object;
        const isChecked = sw.checked;

        if(isChecked){
            httpModule.request({
                url: global.url_general + "Access/v1/covidStatementMessage",
                method: "GET",
            }).then((response) => {
                const result = response.content.toJSON();

                if (response.statusCode === 401 || response.statusCode === 500) {
                    dialogs.alert({
                        title: "Errore Server!",
                        message: result,
                        okButtonText: "OK"

                    }).then();
                }
                else{

                    dialogs.confirm({
                        title: result.titolo,
                        message: result.body,
                        okButtonText: "Si",
                        cancelButtonText: "No"
                    }).then(function (result) {
                        if(result){
                            my_selfcert = true;
                            appSettings.setBoolean("selfcert",true);
                        }


                        else{
                            my_selfcert = false;
                            page.getViewById("switch_sondaggio").checked = false;
                            appSettings.setBoolean("selfcert" , false);
                        }
                    });
                }
            },(e) => {
                dialogs.alert({
                    title: "Errore: COVID Message",
                    message: e.toString(),
                    okButtonText: "OK"
                });
            });

        }
        else{
            my_selfcert = false;
            console.log("FALSO");
            appSettings.setBoolean("selfcert",false);
        }

    });
}
exports.onSwitchLoaded_autocert = onSwitchLoaded_autocert;
