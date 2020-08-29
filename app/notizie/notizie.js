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
let notifications;
let loading_news;
let loading_not;

function onNavigatingTo(args) {
    page = args.object;
    article = new ObservableArray();
    notifications = new ObservableArray();
    viewModel = observableModule.fromObject({
        items2:notifications,
        image:image,
        items:article

    });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    loading_not = page.getViewById("activityIndicator2");
    loading_news = page.getViewById("activityIndicator");

    getNews();
    getNotifications();

    page.bindingContext = viewModel;
}

function getNews(){
    httpModule.request({
        url: global.url + "general/news",
        method: "GET"
    }).then((response) => {
        const result = response.content.toJSON();
        loading_news.visibility = "visible";
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

        }

        loading_news.visibility = "collapsed";
    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore Server!",
            message: e,
            okButtonText: "OK"
        });
    });
}
function getNotifications(){
    httpModule.request({
        url: global.url + "general/avvisi",
        method: "GET"
    }).then((response) => {
        const result = response.content.toJSON();
        loading_not.visibility = "visible";
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
                console.log(result[i].titolo);
                let arr_desc_not = [];
                let items = {
                    desc_not: result[i].HTML
                };

                arr_desc_not.push(items);

                if (platformModule.isIOS){
                    arr_desc_not.splice(0, 0, {});
                }
                notifications.push({
                    title_not: result[i].titolo,
                    date_not:result[i].data,
                    date_text_not: result[i].data,
                    items: arr_desc_not
                });
                notifications.sort(function (orderA, orderB) {
                    let dataA = Date.parse(orderA.date_not);
                    let dataB = Date.parse(orderB.date_not);

                    return (dataA > dataB) ? -1 : (dataA < dataB) ? 1 : 0;
                });
            }

        }

        loading_not.visibility = "collapsed";
    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore Server!",
            message: e,
            okButtonText: "OK"
        });
    });
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
