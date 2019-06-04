const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("application-settings");
const ObservableArray = require("data/observable-array").ObservableArray;
const Observable = require("data/observable");
const httpModule = require("tns-core-modules/http");
const frame = require("tns-core-modules/ui/frame");

let page;
let viewModel;
let sideDrawer;
let items;
let header_index = 0;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    items = new ObservableArray();
    viewModel = Observable.fromObject({
        items:items
    });

    httpModule.request({
        url: global.url + "foods/menuSearchUser/" + global.username,
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
        else {
            let count =0;
            for (let i=0; i<result.length; i++)
            {
                let data2 = new Date(result[i].data);
                let tod = new Date();
                let title ="";
                let classe = "textPrimary border ";

                if (data2.getDate() === tod.getDate() && data2.getMonth() === tod.getMonth() && data2.getFullYear() === tod.getFullYear())
                {
                    classe = classe + "color-green";
                    title = "(OGGI) "+data2.getDate() + "/"+(data2.getMonth()+1) + "/"+data2.getFullYear() + " "+data2.getHours() + ":"+data2.getMinutes();
                }
                else {
                    classe = classe + "color-gray";
                    title = data2.getDate() + "/"+(data2.getMonth()+1) + "/"+data2.getFullYear() + " "+data2.getHours() + ":"+data2.getMinutes();
                }
                count++;
                items.push({
                    nome_bar: title,
                    apertura: "Orario Apertura Mensa: " + result[i].apertura,
                    full_data: data2,
                    classe:classe,

                    items: [
                        {
                            primo_1: result[i].primo[0].piatto_1,
                            primo_2: result[i].primo[1].piatto_2,
                            primo_3: result[i].primo[2].piatto_3,
                            secondi_1: result[i].secondo[0].piatto_1,
                            secondi_2: result[i].secondo[1].piatto_2,
                            secondi_3: result[i].secondo[2].piatto_3,
                            contorni_1: result[i].contorno[0].piatto_1,
                            contorni_2: result[i].contorno[1].piatto_2,
                            contorni_3: result[i].contorno[2].piatto_3,
                            altro_1: result[i].altro[0].piatto_1,
                            altro_2: result[i].altro[1].piatto_2,
                            altro_3: result[i].altro[2].piatto_3
                        }
                    ]
                });
                items.sort(function (orderA, orderB) {
                    var nameA = orderA.full_data;
                    var nameB = orderB.full_data;
                    return (nameA > nameB) ? -1 : (nameA < nameB) ? 1 : 0;
                });

            }
        }
    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore Sincronizzazione Esami!",
            message: e,
            okButtonText: "OK"
        });
    });

    page.bindingContext = viewModel;
}
exports.onTap = function () {
    global.data_today = items.getItem(0).full_data;
    let data2= global.data_today;
    let tod = new Date();
    dialogs.confirm({
        title: "Conferma",
        message: "Sicuro di voler pubblicare il menu nuovamente?",
        okButtonText: "Si",
        cancelButtonText: "No"
    }).then(function (result) {
        // result argument is boolean
        console.log(items.getItem(header_index));
        let temp = items.getItem(header_index).apertura.split(':');
        const orario = temp.pop();

        if (result && orario !== "")
        {
            if (data2.getDate() === tod.getDate() && data2.getMonth() === tod.getMonth() && data2.getFullYear() === tod.getFullYear())
            {
                //TODO sostituire il menu (getId)
                dialogs.alert({
                    title: "Errore!",
                    message: "Hai già aggiunto un menu oggi!",
                    okButtonText: "OK"
                }).then(function(){
                    const nav =
                        {

                            moduleName: "usertecnico-all/usertecnico-all",
                            clearHistory: true
                        };
                    frame.topmost().navigate(nav);
                });
            }
            else {
                fetch(global.url + "foods/addMenu/" + global.encodedStr + "/" + orario, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        primo: [
                            {piatto_1: items.getItem(header_index).primo_1},
                            {piatto_2: items.getItem(header_index).primo_2},
                            {piatto_3: items.getItem(header_index).primo_3}
                        ],
                        secondo: [
                            {piatto_1: items.getItem(header_index).secondi_1},
                            {piatto_2: items.getItem(header_index).secondi_2},
                            {piatto_3: items.getItem(header_index).secondi_3}
                        ],
                        contorno: [
                            {
                                piatto_1: items.getItem(header_index).contorni_1
                            },
                            {
                                piatto_2: items.getItem(header_index).contorni_2
                            },
                            {
                                piatto_3: items.getItem(header_index).contorni_3
                            }
                        ],
                        altro: [
                            {
                                piatto_1: items.getItem(header_index).altro_1
                            },
                            {
                                piatto_2: items.getItem(header_index).altro_2
                            },
                            {
                                piatto_3: items.getItem(header_index).altro_3
                            }
                        ]
                    })

                }).then((r) => r.json())
                    .then((response) => {
                        const result = response.json;

                        dialogs.alert({
                            title: "Menu Caricato!",
                            message: "Il nuovo menu è stato caricato con successo!",
                            okButtonText: "OK"
                        }).then(function () {
                            const nav =
                                {
                                    moduleName: "usertecnico-all/usertecnico-all",
                                    clearHistory: true
                                };
                            frame.topmost().navigate(nav);
                        });
                    }).catch((e) => {
                    console.log(e);
                });
            }
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

};
exports.tapped = function (args) {
    header_index = args.index;
};
function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    page.frame.goBack();
}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
