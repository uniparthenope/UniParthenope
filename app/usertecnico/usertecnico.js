const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const camera = require("nativescript-camera");
const imageModule = require("tns-core-modules/ui/image");
const base64 = require("tns-core-modules/image-source");
const appSettings = require("tns-core-modules/application-settings");
const textFieldModule = require("tns-core-modules/ui/text-field");
const fileSystemModule = require("tns-core-modules/file-system");
const httpModule = require("http");
const frame = require("tns-core-modules/ui/frame");
const ListPicker = require("tns-core-modules/ui/list-picker").ListPicker;
const imageSourceModule = require("tns-core-modules/image-source");


let page;
let viewModel;
let sideDrawer;
let img;
let values = ["Offerta","Primo","Secondo","Contorno","Bibita","Altro"];

function onNavigatingTo(args) {
    page = args.object;
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    viewModel = observableModule.fromObject({
       items_picker: values,
        sel: 2,
    });


    page.bindingContext = viewModel;
    //page.getViewById("image").src = "~/images/no_food.png";
}

function onTapSave() {
    let nome = page.getViewById("nome").text;
    let desc = page.getViewById("desc").text;
    let prezzo = page.getViewById("prezzo").text;
    let tipo = values[page.getViewById("lp").selectedIndex];
    let active = page.getViewById("alwaysActive").checked;


    dialogs.confirm({
        title: "Conferma",
        message: "Sicuro di voler pubblicare il menu?",
        okButtonText: "Si",
        cancelButtonText: "No"
    }).then(function (result) {
        // result argument is boolean
        if (result)
        {
            fetch(global.url + "foods/addMenu/" + global.encodedStr, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: nome,
                    descrizione: desc,
                    tipologia: tipo,
                    prezzo:prezzo,
                    attivo: active,
                    img:img

                })
            }).then((r) => r.json())
                .then((response) => {
                    const result = response.json;
                    console.log(result);
                    dialogs.alert({
                        title: "Menu Caricato!",
                        message: "Il nuovo menu è stato caricato con successo!",
                        okButtonText: "OK"
                    }).then(function(){
                        const nav =
                            {
                                moduleName: "usertecnico-all/usertecnico-all",
                                clearHistory: true
                            };
                        frame.topmost().navigate(nav);
                    });
                }).catch((e) => {
            });
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
exports.onTapAdd = function(){

    camera.requestPermissions().then(
        function success() {
            let options = { width: 150, height: 100, keepAspectRatio: true, saveToGallery: false };
            camera.takePicture(options)
                .then(function (imageAsset) {
                    let image = new imageModule.Image();
                    image.src = imageAsset;
                    base64.fromAsset(imageAsset).then(res=>{
                        let myImageSource = res;
                        page.getViewById("image").src = myImageSource;
                        img = myImageSource.toBase64String("jpeg", 50);
                        //console.log(img);
                    })
                }).catch(function (err) {
                console.log("Error -> " + err.message);
            });
        },
        function failure() {
// permission request rejected
// ... tell the user ...
        }
    );
};
exports.onTapSave = onTapSave;
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
