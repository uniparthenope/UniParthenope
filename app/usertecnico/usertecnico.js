const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("application-settings");
const textFieldModule = require("tns-core-modules/ui/text-field");
const httpModule = require("http");

let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();




    page.bindingContext = viewModel;
}
function onTapSave() {

    let orario = page.getViewById("orario").text;
    //TODO inserire limitazioni orario
    let p1 = page.getViewById("p1").text;
    let p2 = page.getViewById("p2").text;
    let p3 = page.getViewById("p3").text;

    let s1 = page.getViewById("s1").text;
    let s2 = page.getViewById("s2").text;
    let s3 = page.getViewById("s3").text;

    let c1 = page.getViewById("c1").text;
    let c2 = page.getViewById("c2").text;
    let c3 = page.getViewById("c3").text;

    let a1 = page.getViewById("a1").text;
    let a2 = page.getViewById("a2").text;
    let a3 = page.getViewById("a3").text;

    dialogs.confirm({
        title: "Conferma",
        message: "Sicuro di voler pubblicare il menu?",
        okButtonText: "Si",
        cancelButtonText: "No"
    }).then(function (result) {
        // result argument is boolean
        if (result && orario !== "")
        {

            fetch(global.url + "foods/addMenu/" + global.encodedStr +"/"+ orario, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    primo: [
                        {piatto_1: p1                },
                        {piatto_2: p2                },
                        {piatto_3: p3                }
                    ],
                    secondo: [
                        {piatto_1: s1               },
                        {piatto_2: s2                },
                        {piatto_3: s3                }
                    ],
                    contorno: [
                        {
                            piatto_1: c1                },
                        {
                            piatto_2: c2                },
                        {
                            piatto_3: c3                }
                    ],
                    altro: [
                        {
                            piatto_1: a1                },
                        {
                            piatto_2: a2                },
                        {
                            piatto_3: a3                }
                    ]
                })
            }).then((r) => r.json())
                .then((response) => {
                    const result = response.json;
                }).catch((e) => {
            });
        }
        else if (orario === "")
            {
                dialogs.alert({
                    title: "Errore",
                    message: "Il campo ORARIO non può essere vuoto!",
                    okButtonText: "OK"
                }).then(
                );
            }
    });

}
function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    page.frame.goBack();
}

exports.onTapSave = onTapSave;
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
