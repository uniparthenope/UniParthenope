const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const app = require("tns-core-modules/application");
const httpModule = require("tns-core-modules/http");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");

let page;
let viewModel;
let sideDrawer;
let index = 0;

let departments;
let prenotazioneServizi;
let servicesList;
let loading;
let no_less;

function dayOfWeek(date) {
    date = date.getDay();
    return isNaN(date) ? null : ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][date];

}

function monthOfYear(date) {

    return isNaN(date) ? null : ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"][date];

}

function convertMinutes(data) {

    if(data < 10)
        return data + "0";
    else
        return data;

}

function convertData(data){

    let day = data[8]+data[9];
    let month = data[5]+data[6];
    let year = data[0]+data[1]+data[2]+data[3];
    let hour = data[11]+data[12];
    let min = data[14]+data[15];

    let d = new Date(year,month-1,day,hour,min);

    return d;
}

function getAllServices(){
    loading.visibility = "visible";
    while(departments.length > 0)
        departments.pop();

    let url = global.url_general + "GAUniparthenope/v1/getTodayServices";
    //loading.visibility = "visible";
    httpModule.request({
        url: url,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        let dep = response.content.toJSON();
        for(let x = 0; x<dep.length; x++){
            departments.push({
                area :dep[x].area
            });
            servicesList = dep;
        }
        showService(0); //Show default lession
        loading.visibility = "collapsed";
    },(e) => {
        console.log("Error", e);
        loading.visibility = "collapsed";

        dialogs.alert({
            title: "Errore: prenotazioni",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

function showService(index){
    loading.visibility = "visible";

    while(prenotazioneServizi.length > 0)
        prenotazioneServizi.pop();

    let result = servicesList[index].services;
    if(result.length === 0)
        no_less.visibility = "visible";
    else
        no_less.visibility = "collapsed";

    for (let i=0; i<result.length; i++){
        loading.visibility = "visible";

        let fulldata = convertData(result[i].start);
        fulldata = "" + dayOfWeek(fulldata) + " " + fulldata.getDate() + " " + monthOfYear(fulldata.getMonth()) + " " + fulldata.getFullYear();
        //console.log(fulldata);
        let start_data = convertData(result[i].start);
        let end_data = convertData(result[i].end);
        let max_cap = Math.floor(result[i].room.capacity);
        let rem_cap = max_cap - Math.floor(result[i].room.availability);

        let res;
        if (result[i].reservation.reserved)
            res = "visible";
        else
            res = "collapsed";

        prenotazioneServizi.push({
            "id": result[i].id,
            "classe": "examPass",
            "nome": fulldata,
            "start": ""+ start_data.getHours() + ":"+ convertMinutes(start_data.getMinutes()),
            "end": ""+ end_data.getHours() + ":"+convertMinutes(end_data.getMinutes()),
            "room": result[i].room.name,
            "room_place": result[i].room.description,
            "capacity": max_cap + " "+L('places'),
            "availability":rem_cap + "/",
            "max_c" : max_cap,
            "ava_c" : rem_cap,
            "res" : res,
            "isReserved": result[i].reservation.reserved,
            "reserved_by": result[i].reservation.reserved_by,
            "reserved_id": result[i].reservation.reserved_id
        });
        prenotazioneServizi.sort(function (orderA, orderB) {
            let nameA = orderA.nome;
            let nameB = orderB.nome;
            return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
        });
        prenotazioneServizi.sort(function (orderA, orderB) {
            let nameA = orderA.isReserved;
            let nameB = orderB.isReserved;
            return (nameA < nameB) ? 1 : (nameA > nameB) ? -1 : 0;
        });
    }
    loading.visibility = "collapsed";
}

exports.onNavigatingTo = function(args) {
    page = args.object;

    no_less = page.getViewById("no_lession");
    loading = page.getViewById("activityIndicator");


    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    prenotazioneServizi = new ObservableArray();
    departments = new ObservableArray();

    viewModel = observableModule.fromObject({
        prenotazioneServizi: prenotazioneServizi,
        departments: departments
    });

    getAllServices();
    page.bindingContext = viewModel;
}

exports.onDrawerButtonTap = function() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.onItemTap_department = function(args) {
    const index = args.index;
    showService(index);
}

exports.onItemTap = function(args) {
    const index = args.index;

    let lez = prenotazioneServizi.getItem(index);

    if(lez.isReserved){
        dialogs.confirm({
            title: L('rmv_book_title'),
            message: L('rmv_book'),
            okButtonText: L('y'),
            cancelButtonText: L('n'),
        }).then(function (result) {
            if (result){
                httpModule.request({
                    url: global.url_general + "GAUniparthenope/v1/Reservations/" + lez.reserved_id,
                    method: "DELETE",
                    headers: {
                        "Content-Type" : "application/json",
                        "Authorization" : "Basic " + global.encodedStr
                    }
                }).then((response) => {
                    const result = response.content.toJSON();

                    if (response.statusCode === 200){
                        global.updatedExam = false;
                        dialogs.alert({
                            title: "Successo",
                            message: result["status"],
                            okButtonText: "OK"
                        }).then(function (){
                            const nav =
                                {
                                    moduleName: "common/prenotazione-servizi/prenotazione-servizi",
                                    clearHistory: true
                                };
                            page.frame.navigate(nav);
                        });
                    }
                    else{
                        dialogs.alert({
                            title: "Errore: Cancellazione Prenotazioni",
                            message: result['message'],
                            okButtonText: "OK"
                        });
                    }

                },(e) => {
                    console.log("QUI");
                    console.log("Error", e);
                    dialogs.alert({
                        title: "Errore: Cancellazione prenotazioni",
                        message: e.toString(),
                        okButtonText: "OK"
                    });
                });
            }
        });
    }
    else{
        dialogs.confirm({
            title: L('book_title'),
            message: L('book_pl'),
            okButtonText: L('y'),
            cancelButtonText: L('n'),
        }).then(function (result) {
            console.log(result);
            if (result){
                httpModule.request({
                    url : global.url_general + "GAUniparthenope/v1/ServicesReservation",
                    method: "POST",
                    headers: {
                        "Content-Type" : "application/json",
                        "Authorization" : "Basic " + global.encodedStr
                    },
                    content : JSON.stringify({
                        id_entry: lez.id.toString(),
                        matricola: appSettings.getString("matricola", ""),
                    })
                }).then((response) => {
                    const result = response.content.toJSON();

                    if (response.statusCode === 200){
                        dialogs.alert({
                            title: L('success'),
                            message: result["status"],
                            okButtonText: "OK"
                        }).then(function (){
                            const nav =
                                {
                                    moduleName: "common/prenotazione-servizi/prenotazione-servizi",
                                    clearHistory: true
                                };
                            page.frame.navigate(nav);
                        });
                    }
                    else{
                        dialogs.alert({
                            title: "Errore: Prenotazioni",
                            message: result["errMsg"],
                            okButtonText: "OK"
                        });
                    }

                },(e) => {
                    console.log("Error", e);
                    dialogs.alert({
                        title: "Errore: prenotazioni",
                        message: e.toString(),
                        okButtonText: "OK"
                    });
                });
            }
        });
    }

}