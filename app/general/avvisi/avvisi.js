const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const httpModule = require("tns-core-modules/http");
const imageSource = require("tns-core-modules/image-source");
const platformModule = require("tns-core-modules/platform");

let page;
let viewModel;
let sideDrawer;
let image;
let article;
let loading;

function getNotifications(){
    httpModule.request({
        url: global.url + "general/avvisi/10",
        method: "GET"
    }).then((response) => {
        const result = response.content.toJSON();
        //loading.visibility = "visible";
        if (response.statusCode === 401 || response.statusCode === 500)
        {
            dialogs.alert({
                title: "Errore: Notizie getNotifications",
                message: result.errMsg,
                okButtonText: "OK"

            }).then();
        }
        else {
            for (let i=0; i<result.length; i++) {
                let arr_desc_not = [];
                let items = {
                    desc: result[i].HTML
                };
                arr_desc_not.push(items);

                if (platformModule.isIOS){
                    arr_desc_not.splice(0, 0, {});
                }

                let dat = new Date(result[i].data);
                article.push({
                    title: result[i].titolo,
                    date:result[i].data,
                    date_text: dat.getDate() + "/" + (dat.getMonth()+1) + "/" +dat.getFullYear() + " "+dat.getHours() + ":00",
                    items: arr_desc_not,
                });
                article.sort(function (orderA, orderB) {
                    let dataA = Date.parse(orderA.date);
                    let dataB = Date.parse(orderB.date);

                    return (dataA > dataB) ? -1 : (dataA < dataB) ? 1 : 0;
                });
            }

        }

        loading.visibility = "collapsed";
    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore: Notizie",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

exports.onNavigatingTo = function (args) {
    page = args.object;
    article = new ObservableArray();
    viewModel = observableModule.fromObject({
        image:image,
        items:article
    });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    loading = page.getViewById("activityIndicator");
    loading.visibility = "visible";


    getNotifications();

    page.bindingContext = viewModel;
}

exports.onDrawerButtonTap = function() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}