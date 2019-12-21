const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const modalViewModule = "modal-docente/modal-docente";

let page;
let viewModel;
let sideDrawer;
let items;

function onNavigatingTo(args) {
    items = new ObservableArray();
    page = args.object;
    viewModel = observableModule.fromObject({
        items:items
    });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    getDocenti();

    page.bindingContext = viewModel;
}

function onItemTap(args) {
    const mainView = args.object;
    const index = args.index;

    const adLogId = { nome: items.getItem(index).docenteNome, telefono: items.getItem(index).telefono, mail: items.getItem(index).mail,
        url: items.getItem(index).url};
    //console.log(adLogId.nome);
    mainView.showModal(modalViewModule, adLogId, false);

}

exports.onItemTap = onItemTap;

function getDocenti(){
    let aaId = appSettings.getString("aa_accad");
    let aaId_split = aaId.split(" ");
    let cdsId = appSettings.getNumber("cdsId");

    httpModule.request({
        url: global.url + "getDocenti/"+ aaId_split[0] +"/" + cdsId.toString(),
        method: "GET",
        headers: {"Content-Type": "application/json"}
    }).then((response) => {
        const result = response.content.toJSON();
        //console.log(result);
        if (result.statusCode === 401 || result.statusCode === 500)
        {
            dialogs.alert({
                title: "Errore Server!",
                message: result.retErrMsg,
                okButtonText: "OK"

            }).then(
            );
        }
        else
        {
            page.getViewById("activityIndicator").visibility = "visible";
            for (let i=0; i<result.length; i++)
            {
                global.myDocenti.push({
                    docenteNome: result[i].docenteNome,
                    docenteCognome: result[i].docenteCognome,
                    docenteId: result[i].docenteId,
                    docenteMat: result[i].docenteMat,
                    corso: result[i].corso,
                    adId: result[i].adId
                });


                    httpModule.request({
                        url: global.url + "info/persone/"+ result[i].docenteCognome + " " + result[i].docenteNome,
                        method: "GET",
                        headers: {"Content-Type": "application/json"}
                    }).then((response2) => {
                        const result2 = response2.content.toJSON();
                        //console.log(result2);
                        if (result2.statusCode === 401 || result2.statusCode === 500)
                        {
                            dialogs.alert({
                                title: "Errore Server!",
                                message: result2.retErrMsg,
                                okButtonText: "OK"

                            }).then();
                        }
                        else
                        {
                            let flag = false;

                            for (let x=0;x<items.length; x++){
                                if(items.getItem(x).docenteCognome === result[i].docenteCognome){
                                    items.getItem(x).corso.push(result[i].corso);
                                    flag = true;
                                }
                            }
                            if (!flag){
                                page.getViewById("activityIndicator").visibility = "visible";
                                let corsi = [];
                                corsi.push(result[i].corso);
                            items.push({
                                docenteNome: result[i].docenteNome + " "+ result[i].docenteCognome,
                                docenteCognome: result[i].docenteCognome,
                                corso: corsi,
                                telefono: result2.telefono,
                                mail: result2.email,
                                pic: result2.url_pic,
                                url: result2.link
                            });

                            items.sort(function (orderA, orderB) {
                                let nameA = orderA.docenteCognome;
                                let nameB = orderB.docenteCognome;
                                return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
                            });
                            }
                            page.getViewById("activityIndicator").visibility = "collapsed";
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
    page.frame.navigate("home/home-page");
}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
