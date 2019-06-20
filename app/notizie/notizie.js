const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Observable = require("data/observable");
const app = require("tns-core-modules/application");
let xml2js = require('nativescript-xml2js');
let fs = require("tns-core-modules/file-system");
const httpModule = require("tns-core-modules/http");
const imageSource = require("image-source");

let page;
let viewModel;
let sideDrawer;
let image;
let items;

function onNavigatingTo(args) {
    page = args.object;
    items = new ObservableArray();
    viewModel = observableModule.fromObject({
        image:image,
        items:items
    });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    page.getViewById("loading").busy= true;

    let dest = fs.path.join(fs.knownFolders.currentApp().path, "/assets/rss.xml");
    let url = "https://www.uniparthenope.it/rss.xml";
    httpModule.getFile(url, dest).then(function (r) {
        let parser = new xml2js.Parser();

        r.readText().then(function  (data){
            parser.parseString(data, function (err, result) {
                console.log(result.rss.channel[0].item.length);
                let count = 0;
                for(let i=0; i<result.rss.channel[0].item.length; i++)
                {
                    const myHtmlString = result.rss.channel[0].item[i].description.toString();
                    const title = result.rss.channel[0].item[i].title.toString();
                    const date = result.rss.channel[0].item[i].pubDate.toString();
                    console.log(title);
                    let data = extractData(date);

                    let inizio = myHtmlString.search("Testo:");
                    let fine = myHtmlString.search("Foto/Video:");

                    let final_string = myHtmlString.slice(inizio+6, fine);

                    let inizio_link = myHtmlString.search("https://www.uniparthenope.it/sites/default/files/");
                    let new_string = myHtmlString.slice(inizio_link);
                    let fine_link;
                    console.log("Inizio: " + inizio_link);
                    fine_link = new_string.search(".jpg");

                    console.log("Fine: " + fine_link);
                    if(fine_link === -1){
                        fine_link = new_string.search(".png");
                    }
                    let final_string_link = new_string.slice(0, fine_link+4);
                    console.log(final_string_link);

                    imageSource.fromUrl(final_string_link)
                        .then(function () {
                            if (++count == result.rss.channel[0].item.length)
                                page.getViewById("loading").busy= false;
                            items.push({
                                title: title,
                                date:data,
                                date_text: data.getDate() + "/" +(data.getMonth()+1) + "/" +data.getFullYear() + " " + data.getHours() + ":" +data.getMinutes(),
                                image: final_string_link,
                                items: [
                                    {
                                        desc: final_string
                                    }
                                ]
                            });
                            items.sort(function (orderA, orderB) {
                                let nameA = orderA.date;
                                let nameB = orderB.date;
                                return (nameA > nameB) ? -1 : (nameA < nameB) ? 1 : 0;
                            });
                        }).catch(err => {
                            console.log("Somthing went wrong!");
                        if (++count == result.rss.channel[0].item.length)
                            page.getViewById("loading").busy= false;
                        });
                }
            });
        });
    },function (e) {
        console.log(e);
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
