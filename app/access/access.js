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
let status = ["Non Definito","In Distanza","In Presenza"];


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


    let at = "";

    if (index === 0)
        at = "undefined";
    else if (index === 1)
        at = "distance";
    else if (index === 2)
        at = "presence";
    console.log(at);
    console.log(my_status);

    if (my_status !== at){
        loading.visibility = "visible";

        httpModule.request({
            url: global.url_general + "Access/v1/classroom",
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : "Basic " + global.encodedStr
            },
            content: JSON.stringify({
                accessType: at
            })
        }).then((response) => {
            const result = response.content.toJSON();

            if (response.statusCode === 401 || response.statusCode === 500) {
                dialogs.alert({
                    title: "Errore: Access ontapSave",
                    message: result.errMsg,
                    okButtonText: "OK"

                }).then();
            }
            else
            {
                dialogs.confirm({
                    title: "Accesso Modificato!",
                    message: "",
                    okButtonText: "OK"
                }).then(function (result) {
                    loading.visibility = "collapsed";
                    my_status = at;
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

};

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
