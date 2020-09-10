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
let autocert_old = true;
let status = ["Non Definito","A Distanza","In Presenza"];


function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({
        status: status
    });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    loading = page.getViewById("activityIndicator");

    getStatus();


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

function getStatus(){
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

            }).then();
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

            page.getViewById("switch_sondaggio").checked = autocert_old;


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
    let lp = page.getViewById("listpicker");

    if (index === 0){
        lp.selectedIndex = index;
        sendRequest("undefined");
    }

    else if (index === 1){
        lp.selectedIndex = index;
        sendRequest("distance");
    }

    else if (index === 2){
        if (appSettings.getBoolean("autocertificazione",false)){
            sendRequest("presence");
        }
        else{
            dialogs.confirm({
                title: "Attenzione!",
                message: "Per poter selezionare il tipo di accesso in PRESENZA bisogna prima accettare l'Autocertificazione Obbligatoria!",
                okButtonText: "OK"
            }).then(function (result) {
                if(my_status === "distance")
                    lp.selectedIndex = 1;
                else
                    lp.selectedIndex = 0;
            });
        }

    }

};

function sendRequest(scelta){
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

            }).then();
        }
        else
        {
            loading.visibility = "collapsed";
            dialogs.confirm({
                title: "Accesso Modificato!",
                message: "",
                okButtonText: "OK"
            }).then(function (result) {
                loading.visibility = "collapsed";
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

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;

function onSwitchLoaded_autocert(args) {
    const mySwitch = args.object;

    mySwitch.on("checkedChange", (args) => {
        const sw = args.object;
        const isChecked = sw.checked;

        if(isChecked && !autocert_old){

            httpModule.request({
                url: global.url + "general/covidAlert",
                method: "GET",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : "Basic " + global.encodedStr
                }
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
                            appSettings.setBoolean("autocertificazione",true);
                            autocert_old = true;
                        }


                        else{
                            page.getViewById("switch_sondaggio").checked = false;
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
        else if (!isChecked && my_status === "presence" && index === 2){

                dialogs.alert({
                    title: "Attenzione!",
                    message: "Il tipo di accesso in PRESENZA non consente di modificare l'autocertificazione!",
                    okButtonText: "OK"
                });
                page.getViewById("switch_sondaggio").checked = true;
                autocert_old = true;




        }
        else{
            console.log("FALSO");
            appSettings.setBoolean("autocertificazione",false);
            autocert_old = false;
        }

    });
}
exports.onSwitchLoaded_autocert = onSwitchLoaded_autocert;