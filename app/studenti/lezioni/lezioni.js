const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const app = require("tns-core-modules/application");
const httpModule = require("tns-core-modules/http");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");

let page;
let viewModel;
let sideDrawer;
let lezioni;
let loading;
let no_less

function onNavigatingTo(args) {
    page = args.object;

    lezioni = new ObservableArray();

    viewModel = observableModule.fromObject({
        lezioni: lezioni
    });

    let title = page.getViewById("title");
    let today = new Date();
    let final_data = "" + dayOfWeek(today) + " " + today.getDate() + " " + monthOfYear(today.getMonth()) + " " + today.getFullYear();

    no_less = page.getViewById("no_lession");
    loading = page.getViewById("activityIndicator");
    title.text = "Ricerca lezioni di " + final_data;

    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    getLectures();

    page.bindingContext = viewModel;
}

function getLectures(){
    loading.visibility = "visible";

    let url = global.url_general + "GAUniparthenope/v1/getTodayLecture/" + appSettings.getNumber("matId");

    httpModule.request({
        url: url,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        for (let i=0; i<result.length; i++){
            let start_data = convertData(result[i].start);
            let end_data = convertData(result[i].end);
            let max_cap = result[i].room.capacity;
            let rem_cap = result[i].room.capacity - result[i].room.availability;
            let res;
            if (result[i].reservation.reserved)
                res = "visible";
            else
                res = "collapsed";

            lezioni.push({
                "id": result[i].id,
                "id_corso":result[i].id_corso,
                "classe": "examPass",
                "pr": res,
                "nome": result[i].course_name,
                "prof": result[i].prof,
                "start": ""+ start_data.getHours() + ":" + convertMinutes(start_data.getMinutes()),
                "end": ""+ end_data.getHours() + ":" + convertMinutes(end_data.getMinutes()),
                "room": result[i].room.name,
                "room_place": result[i].room.description,
                "capacity": max_cap + " Posti",
                "availability":rem_cap + "/",
                "max_c" : max_cap,
                "ava_c" : rem_cap,
                "isReserved":result[i].reservation.reserved,
                "reserved_id" : result[i].reservation.reserved_id
            });

            lezioni.sort(function (orderA, orderB) {
                let nameA = orderA.start;
                let nameB = orderB.start;
                return (nameA < nameB) ? 1 : (nameA > nameB) ? -1 : 0;
            });

            no_less.visibility = "collapsed";
        }
        loading.visibility = "collapsed";
    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore: prenotazioni",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu(){
    const nav =
        {
            moduleName: "home/home-page",
            clearHistory: true
        };
    page.frame.navigate(nav);
}

function onItemTap(args) {
    const index = args.index;

    let lez = lezioni.getItem(index);

    if(lez.isReserved){
        dialogs.confirm({
            title: "Cancellazione posto",
            message: "Sicuro di voler cancellare la prenotazione ad un posto?",
            okButtonText: "Sì",
            cancelButtonText: "No",
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
                                    moduleName: "lezioni/lezioni",
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
            title: "Prenotazione posto",
            message: "Sicuro di voler prenotare un posto?",
            okButtonText: "Sì",
            cancelButtonText: "No",
        }).then(function (result) {
            console.log(result);
            if (result){
                httpModule.request({
                    url : global.url_general + "GAUniparthenope/v1/Reservations",
                    method: "POST",
                    headers: {
                        "Content-Type" : "application/json",
                        "Authorization" : "Basic " + global.encodedStr
                    },
                    content : JSON.stringify({
                        id_corso : lez.id_corso.toString(),
                        id_lezione: lez.id.toString(),
                        matricola: appSettings.getString("matricola", ""),
                        matId: appSettings.getNumber("matId", 0).toString(),
                    })
                }).then((response) => {
                    const result = response.content.toJSON();

                    if (response.statusCode === 200){
                        dialogs.alert({
                            title: "Successo",
                            message: result["status"],
                            okButtonText: "OK"
                        }).then(function (){
                            const nav =
                                {
                                    moduleName: "lezioni/lezioni",
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
exports.onItemTap = onItemTap;

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;

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