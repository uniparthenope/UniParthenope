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

function onNavigatingTo(args) {
    page = args.object;

    lezioni = new ObservableArray();
    lezioniList = page.getViewById("lezioni_listview");

    viewModel = observableModule.fromObject({
        courses: courses,
        lezioni: lezioni
    });

    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    page.bindingContext = viewModel;
}

exports.ontap_save = function() {
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


        console.log(lezioni);
        for (let i=0; i<result.length; i++){
            lezioni.push({
                "id": result[i].id,
                "classe": "examPass",
                "nome": result[i].course_name,
                "prof": result[i].prof,
                "start": result[i].start,
                "end": result[i].end,
                "room": result[i].room.name,
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

                if (response.statusCode == 200){
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
