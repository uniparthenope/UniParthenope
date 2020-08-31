const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const modalViewModule = "modal-docente/modal-docente";
const imageSourceModule = require("tns-core-modules/image-source");

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
    page.getViewById("activityIndicator").visibility = "visible";

    let aaId = appSettings.getString("aa_accad", "2019");
    let aaId_split = aaId.split(" ");
    let cdsId = appSettings.getNumber("cdsId");

    httpModule.request({
        url: global.url + "students/getProfessors/"+ aaId_split[0] +"/" + cdsId.toString(),
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();

        if(response.statusCode === 200){
            for (let i=0; i<result.length; i++){
                let flag = false;
                for (let x=0;x<items.length; x++){
                    if(items.getItem(x).docenteCognome === result[i].docenteCognome){
                        items.getItem(x).corso.push(result[i].corso);
                        flag = true;
                    }
                }
                if (!flag){
                    let corsi = [];
                    corsi.push(result[i].corso);
                    items.push({
                        docenteNome: result[i].docenteNome + " "+ result[i].docenteCognome,
                        docenteCognome: result[i].docenteCognome,
                        corso: corsi,
                        telefono: result[i].telefono,
                        mail: result[i].email,
                        pic: imageSourceModule.fromBase64(result[i].url_pic),
                        url: result[i].link
                    });

                    items.sort(function (orderA, orderB) {
                        let nameA = orderA.docenteCognome;
                        let nameB = orderB.docenteCognome;
                        return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
                    });
                }
            }

            page.getViewById("activityIndicator").visibility = "collapsed";
        }
        else{
            dialogs.alert({
                title: "Errore Server!",
                message: result.errMsg,
                okButtonText: "OK"
            });
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
