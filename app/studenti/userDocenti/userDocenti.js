const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const modalViewModule = "modal/modal-docente/modal-docente";
const imageSourceModule = require("tns-core-modules/image-source");

let page;
let viewModel;
let sideDrawer;
let items;

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
                    console.log(result[i].curriculum);
                    items.push({
                        docenteNome: result[i].docenteNome + " "+ result[i].docenteCognome,
                        docenteCognome: result[i].docenteCognome,
                        corso: corsi,
                        telefono: result[i].telefono,
                        mail: result[i].email,
                        biography: result[i].biography,
                        notes: result[i].notes,
                        curriculum: result[i].curriculum,
                        pubblications: result[i].publications,
                        ruolo: result[i].ruolo,
                        settore: result[i].settore,
                        pic: result[i].url_pic,
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
                title: "Errore: UserDocenti getDocenti",
                message: result.errMsg,
                okButtonText: "OK"
            });
        }
    },(e) => {
        console.log("Error", e.retErrMsg);
        dialogs.alert({
            title: "Errore: UserDocenti",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

exports.onNavigatingTo = function(args) {
    items = new ObservableArray();
    page = args.object;
    viewModel = observableModule.fromObject({
        items:items
    });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    dialogs.confirm({
        title: L('warning'),
        message: L('myprof_alert'),
        okButtonText: L('y'),
        cancelButtonText: L('n')
    }).then(function (result) {
        if (result){
            getDocenti();
        }
        else{
            page.frame.goBack();
        }
    });


    page.bindingContext = viewModel;
}

exports.onItemTap = function(args) {
    const mainView = args.object;
    const index = args.index;

    const adLogId = {
        nome: items.getItem(index).docenteNome,
        telefono: items.getItem(index).telefono,
        mail: items.getItem(index).mail,
        biography: items.getItem(index).biography,
        notes: items.getItem(index).notes,
        url: items.getItem(index).url,
        curriculum: items.getItem(index).curriculum,
        pubblications: items.getItem(index).pubblications,
        ruolo: items.getItem(index).ruolo,
        settore: items.getItem(index).settore
    };
    //console.log(adLogId.nome);
    mainView.showModal(modalViewModule, adLogId, false);

}

exports.onDrawerButtonTap = function() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}