const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
let xml2js = require('nativescript-xml2js');
let fs = require("tns-core-modules/file-system");
const httpModule = require("tns-core-modules/http");
const imageSource = require("tns-core-modules/image-source");
const platformModule = require("tns-core-modules/platform");


let page;
let viewModel;
let sideDrawer;
let image;
let article;
let loading;

function onNavigatingTo(args) {
    page = args.object;
    article = new ObservableArray();
    viewModel = observableModule.fromObject({
        image:image,
        items:article
    });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    loading = page.getViewById("activityIndicator");

    httpModule.request({
        url: global.url + "general/news",
        method: "GET"
    }).then((response) => {
        const result = response.content.toJSON();
        loading.visibility = "visible";
        if (response.statusCode === 401 || response.statusCode === 500)
        {
            dialogs.alert({
                title: "Errore Server!",
                message: result,
                okButtonText: "OK"

            }).then();
        }
        else {
            for (let i=0; i<result.length; i++) {
                let img = "~/images/image1.jpg";

                if (result[i].image !== "")
                    img = result[i].image;


                let arr_desc = [];
                let items = {
                    desc: result[i].HTML
                };

                arr_desc.push(items);

                if (platformModule.isIOS){
                    arr_desc.splice(0, 0, {});
                }

                article.push({
                    title: result[i].titolo,
                    date:result[i].data,
                    date_text: result[i].data,
                    image: img,
                    items: arr_desc
                });

                article.sort(function (orderA, orderB) {
                    let dataA = Date.parse(orderA.date);
                    let dataB = Date.parse(orderB.date);

                    return (dataA > dataB) ? -1 : (dataA < dataB) ? 1 : 0;
                });
            }

            for (let i=0; i<article.length; i++){
                console.log(article.getItem(i).date);
            }
        }

        loading.visibility = "collapsed";
    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore Server!",
            message: e,
            okButtonText: "OK"
        });
    });

    page.bindingContext = viewModel;
}
function extractData(data) {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",];

    let day = data.substr(5,2);
    let month = data.substr(8,3);
    let year = data.substr(12,4);
    let hour = data.substr(17,2);
    let min = data.substr(20,2);

    let index_month = months.indexOf(month);
    let d = new Date(year, index_month, day, hour, min);

    return d;
}
function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    page.frame.navigate("home/home-page")
}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
