const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const frame = require("tns-core-modules/ui/frame");


let page;
let viewModel;
let sideDrawer;
let items;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    getUsers();

    items = new ObservableArray();

    viewModel = Observable.fromObject({
        items:items
    });

    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    page.frame.goBack();
}
function getUsers(){
    fetch(global.url + "admin/"+global.encodedStr + "/allUsers")
        .then((response) => response.json())
        .then((r) => {
            console.log(r);
            for (let x=0; x < r.length; x++)
            {

                items.push({
                    username: r[x].username,
                    email: r[x].email,
                    nome_bar: r[x].nome_bar,
                    id: r[x].id
                });
                items.sort(function (orderA, orderB) {
                    let nameA = orderA.id;
                    let nameB = orderB.id;
                    return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
                });
                page.getViewById("listview").refresh();
            }

        }).catch((err) => {
    });
}
//REMOVE USER
exports.tapped = function (args) {
    let ind = args.index;
    let header_index = items.getItem(ind).id;

    dialogs.confirm({
        title: "Conferma",
        message: "Sicuro di voler eliminare l'utente?",
        okButtonText: "Si",
        cancelButtonText: "No"
    }).then(function (result) {
        // result argument is boolean
        if (result)
        {
            fetch(global.url + "admin/" + global.encodedStr + "/deleteUser/" + header_index, {
                method: "GET",
                headers: {"Content-Type": "application/json"}
            }).then((r) => r.json())
                .then((response) => {
                    if (response.code === 200)
                    {
                        dialogs.alert({
                            title: "Utente Cancellato!",
                            message: "Utente cancellato con successo!",
                            okButtonText: "OK"
                        }).then(function () {
                            const nav =
                                {
                                    moduleName: "admin/allUser/allUser",
                                    clearHistory: true
                                };
                            frame.topmost().navigate(nav);
                        });
                    }
                    else {
                        dialogs.alert({
                            title: "Errore!",
                            message: "Utente non cancellato!",
                            okButtonText: "OK"
                        }).then(function () {

                        });
                    }
                }).catch((e) => {
                console.log(e);
            });
        }
    });
};

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
