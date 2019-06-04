const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("http");
const appSettings = require("application-settings");

let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    getOrari();


    page.bindingContext = viewModel;
}
function getOrari() {

    httpModule.request({
        url: global.url + "segreteria",
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
            let aperturaStudente = result.orario_studenti;
            let aperturaDidattica = result.orario_studenti;
            console.log(aperturaStudente);
            console.log(aperturaDidattica);
            page.getViewById("aperturaStudente").text = aperturaStudente;
            page.getViewById("aperturaDidattica").text = aperturaDidattica;

            if (aperturaStudente === "CHIUSO")
                page.getViewById("aperturaStudente").color = "red";
            if (aperturaDidattica === "CHIUSO")
                page.getViewById("aperturaDidattica").color = "red";

            for (let i=0; i<result.didattica.length; i++){
                let ids = "did_";
                let time = "time_did_";
                page.getViewById(ids + i).text = result.didattica[i].giorno;

                if(result.didattica[i].orario_inizio === "0")
                {
                    page.getViewById(time + i).text = "CHIUSO";
                    page.getViewById(time + i).color = "red";
                }
                else
                    page.getViewById(time + i).text = result.didattica[i].orario_inizio + " / " + result.didattica[i].orario_fine;
            }

            for (let i=0; i<result.studenti.length; i++){
                let ids = "stu_";
                let time = "time_stu_";
                page.getViewById(ids + i).text = result.studenti[i].giorno;

                if(result.studenti[i].orario_inizio === "0")
                {
                    page.getViewById(time + i).text = "CHIUSO";
                    page.getViewById(time + i).color = "red";
                }
                else
                    page.getViewById(time + i).text = result.studenti[i].orario_inizio + " / " + result.studenti[i].orario_fine;
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
    page.frame.navigate("home/home-page")
}
function openClose(time)
{
    const giorni = ["LUN","MAR","MER","GIO","VEN"];
    const today = new Date();


}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
