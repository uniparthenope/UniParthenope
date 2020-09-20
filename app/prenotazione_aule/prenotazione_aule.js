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
let id_corso;
let courses = global.freqExams;
let lezioni;
let lezioniList;
let loading;

function onNavigatingTo(args) {
    page = args.object;

    lezioni = new ObservableArray();
    lezioniList = page.getViewById("lezioni_listview");

    viewModel = observableModule.fromObject({
        courses: courses,
        lezioni: lezioni
    });
    loading = page.getViewById("activityIndicator");
    let title = page.getViewById("title");
    let today = new Date();
    let final_data ="" + dayOfWeek(today) + " " + today.getDate() + " " + monthOfYear(today.getMonth()) + " " + today.getFullYear();

    title.text = "Ricerca lezioni di " + final_data;

    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    page.bindingContext = viewModel;
}

exports.ontap_save = function() {
    loading.visibility = "visible";
    while(lezioni.length > 0)
        lezioni.pop();

    id_corso = courses[index].codice;

    console.log(courses[index].codice);
    let url = global.url_general + "GAUniparthenope/v1/getTodayLecture/" + courses[index].codice;

    console.log(url);

    httpModule.request({
        url: url,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();

        let no_less = page.getViewById("no_lession");

        if (result.length === 0)
            no_less.visibility = "visible";
        else
            no_less.visibility = "collapsed";

        loading.visibility = "collapsed";


        console.log(lezioni);
        for (let i=0; i<result.length; i++){
            let fulldata = new Date(result[i].start);
            fulldata = "" + dayOfWeek(fulldata) + " " + fulldata.getDate() + " " + monthOfYear(fulldata.getMonth()) + " " + fulldata.getFullYear();
            console.log(fulldata);

            let start_data = new Date(result[i].start);
            let end_data = new Date(result[i].end);
            lezioni.push({
                "id": result[i].id,
                "classe": "examPass",
                "nome": fulldata,
                "prof": "PROF. ACCIDERBOLINETTI DE ACCIDERBOLIS",
                "start": ""+ start_data.getHours() + ":"+ convertMinutes(start_data.getMinutes()),
                "end": ""+ end_data.getHours() + ":"+convertMinutes(end_data.getMinutes()),
                "room": result[i].room.name,
                "room_place": result[i].room.description,
                "capacity": result[i].room.capacity
            });
        }
        lezioniList.refresh();

    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore: prenotazioni",
            message: e.toString(),
            okButtonText: "OK"
        });
    });

};

function onItemTap(args) {
    const mainView = args.object;
    const index = args.index;

    let id = lezioni.getItem(index).id;

    dialogs.confirm({
        title: "Prenotazione posto",
        message: "Sicuro di voler prenotare un posto?",
        okButtonText: "Sì",
        cancelButtonText: "No",
    }).then(function (result) {
        console.log(result);
        if (result){
            httpModule.request({
                url : global.url_general + "GAUniparthenope/v1/setPrenotazione",
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : "Basic "+ global.encodedStr
                },
                content : JSON.stringify({
                    id_corso : id_corso,
                    id_lezione: id.toString(),
                    matricola: appSettings.getString("matricola", "")
                })
            }).then((response) => {
                const result = response.content.toJSON();

                if (response.statusCode === 200){
                    dialogs.alert({
                        title: "Successo",
                        message: result["status"],
                        okButtonText: "OK"
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

function onListPickerLoaded(fargs) {
    const listPickerComponent = fargs.object;
    listPickerComponent.on("selectedIndexChange", (args) => {
        const picker = args.object;
        index = picker.selectedIndex;
    });
}
exports.onListPickerLoaded = onListPickerLoaded;


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
