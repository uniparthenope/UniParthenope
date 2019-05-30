const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
let xml2js = require('nativescript-xml2js');
let fs = require("tns-core-modules/file-system");
const httpModule = require("tns-core-modules/http");
var imageSource = require("image-source");

let page;
let viewModel;
let sideDrawer;
var image;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({
        image:image
    });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();


    let dest = fs.path.join(fs.knownFolders.currentApp().path, "/assets/rss.xml");
    let url = "https://www.uniparthenope.it/rss.xml";
    httpModule.getFile(url, dest).then(function (r) {
        var parser = new xml2js.Parser();
        r.readText().then(function  (data){
            parser.parseString(data, function (err, result) {
                /*for(let i=0; i<result.rss.channel[0].item.length; i++){
                    console.dir(result.rss.channel[0].item[i]);
                    //console.dir(result.rss.channel[0].item[i].description);
                }*/
                const myHtmlString = result.rss.channel[0].item[1].description.toString();
                let inizio = myHtmlString.search("Testo:");
                let fine = myHtmlString.search("Foto/Video:");
                console.log("Inizio: " + inizio);
                console.log("Fine: " + fine);
                let final_string = myHtmlString.slice(inizio+6, fine);

                let inizio_link = myHtmlString.search("https://www.uniparthenope.it/sites/default/files/immagini");
                let fine_link;
                fine_link = myHtmlString.search(".jpg");
                if(fine_link === -1){
                    fine_link = myHtmlString.search(".png");
                }
                let final_string_link = myHtmlString.slice(inizio_link, fine_link+4);
                console.log(final_string_link);

                imageSource.fromUrl(final_string_link)
                    .then(function () {
                        viewModel.image = final_string_link;
                    }).catch(err => {console.log("Somthing went wrong!");});

                viewModel.set("htmlString", final_string);
            });
        });
    },function (e) {
        console.log(e);
    });


    page.bindingContext = viewModel;
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
