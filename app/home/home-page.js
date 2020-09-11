const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const appSettings = require("tns-core-modules/application-settings");
let geolocation = require("nativescript-geolocation");
const httpModule = require("http");
const base64= require('base-64');
const utilsModule = require("tns-core-modules/utils/utils");
const utf8 = require('utf8');
const dialogs = require("tns-core-modules/ui/dialogs");
let appversion = require("nativescript-appversion");
const modalViewModule = "modal-meteo/modal-meteo";
const platform = require("tns-core-modules/platform");

let page;
let viewModel;
let sideDrawer;
let remember;
let user;
let pos;

let array_locations = [{id: 'CDN', lat: 40.856831, long: 14.284553, color: 'linear-gradient(135deg, #5CC77A, #009432)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(0, 167, 84))'},
    {id: 'Medina', lat: 40.840447, long: 14.251863, color: 'linear-gradient(135deg, #107dd0, #22384f)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(221, 108, 166))'},
    {id: 'Acton', lat: 40.837372, long: 14.253502, color: 'linear-gradient(135deg, #107dd0, #22384f)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(11, 114, 181))'},
    {id: 'Parisi', lat: 40.832308, long: 14.245027, color: 'linear-gradient(135deg, #107dd0, #22384f)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(119, 72, 150))'},
    {id: 'Villa', lat: 40.823872, long: 14.216225, color: 'linear-gradient(135deg, #107dd0, #22384f)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(36, 36, 36))'}];

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();

    remember = appSettings.getBoolean("rememberMe");
    user = appSettings.getString("username");

    appversion.getVersionName().then(function(v) {
        page.getViewById("version").text = "Versione: " + v;
    });

    checkServer();
    initializeGraph();
    console.log(global.tempPos);

    if(!global.tempPos){ //Setto la posizione attuale, soltanto alla prima apertura dell'app
        console.log("Setto la posizione!");
        getPosition();
        global.tempPos = true;
    }


   if (user !== undefined && !global.isConnected){
       dialogs.alert({
           title: "Bentornato!",
           message: "Bentornato "+ appSettings.getString("nome") + " " + appSettings.getString("cognome"),
           okButtonText: "OK"
       }).then();
       autoconnect();
   }
   else if (remember) {
       console.log("HEREREM");
      setSideMenu(global.myform,global.username);
   }

   console.log("Sondaggio: " + appSettings.getBoolean("sondaggio"));

   if (appSettings.getBoolean("sondaggio",true)){
       showAD();
   }

    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function autoconnect() {
    console.log("REMEMBER= "+remember);
    if (remember){

        const sideDrawer = app.getRootView();
        let indicator = page.getViewById("activityIndicator");
        indicator.visibility = "visible";
        let user = appSettings.getString("username");
        console.log("USERNAME (old)= "+user);

        global.encodedStr = appSettings.getString("token");

        httpModule.request({
            url:  global.url + "login",
            method: "GET",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : "Basic "+ global.encodedStr
            }
        }).then((response) => {
            let _result = response.content.toJSON();

            if(response.statusCode === 401)
            {
                dialogs.alert({
                    title: "Autenticazione Fallita!",
                    message: _result.errMsg,
                    okButtonText: "OK"
                }).then(
                    args.object.closeModal()
                );
            }
            /* Se un utente è di tipo USER TECNICO (ristorante) 202 */
            else if (_result.user.grpDes === "Ristorante")
            {
                let remember = sideDrawer.getViewById("rememberMe").checked;
                console.log(_result);

                appSettings.setString("nome", _result.user.nome);
                appSettings.setString("cognome", _result.user.cognome);
                appSettings.setString("userId", _result.userId);
                appSettings.setString("emailAte",_result.user.email);
                appSettings.setString("ristorante",_result.user.nomeBar);
                appSettings.setString("matricola",_result.user.nomeBar);
                appSettings.setString("sesso",_result.user.sesso);
                appSettings.setString("telRes",_result.user.telefono);
                appSettings.setString("facDes","--");
                appSettings.setString("dataNascita","--");
                /*
                if (remember){
                    appSettings.setString("username",user);
                    appSettings.setString("password",pass);
                    appSettings.setBoolean("rememberMe",true);
                }*/
                global.isConnected = true;
                sideDrawer.getViewById("topName").text = _result.user.nome + " "+_result.user.cognome;
                setSideMenu("userRistoratore",_result.user.nome + " "+_result.user.cognome);
                sideDrawer.getViewById("topMatr").text = _result.user.nomeBar;
                sideDrawer.getViewById("topEmail").text = _result.user.email;
                sideDrawer.getViewById("topMatr").visibility = "visible";
                sideDrawer.getViewById("topEmail").visibility = "visible";
/*
                const nav =
                    {
                        moduleName: "ristoratore/ristoratore-home",
                        clearHistory: true
                    };
                page.frame.navigate(nav);

 */
            }
            /* Se un utente è di tipo USER TECNICO */
            else if (_result.user.grpDes === "PTA")
            {
                console.log("PTA");
                appSettings.setString("grpDes",_result.user.grpDes);
                appSettings.setString("matricola","--");

                let user = appSettings.getString("username",".");
                let nc = user.split(".");
                global.isConnected = true;

                appSettings.setString("nome", nc[0].toUpperCase());
                appSettings.setString("cognome", nc[1].toUpperCase());
                let username  = nc[0].toUpperCase() + " " + nc[1].toUpperCase();

                //sideDrawer.getViewById("topName").text = nc[0].toUpperCase() + " " + nc[1].toUpperCase();
                //let userForm = sideDrawer.getViewById("userOther");
                //let loginForm = sideDrawer.getViewById("loginForm");
                //loginForm.visibility = "collapsed";
                //userForm.visibility = "visible";

                indicator.visibility = "collapsed";
                setSideMenu("userOther",username);
/*
                const nav =
                    {
                        moduleName: "home/home-page",
                        clearHistory: true
                    };
                page.frame.navigate(nav);

 */

            }
            else if(_result.user.grpDes === "Docenti")
            {
                detailedProf(_result.user.docenteId); // Get detailed info of a professor
                setAnagrafe(_result.user.docenteId,_result.user.grpDes);
                appSettings.setNumber("idAb",_result.user.idAb);

                global.saveInfo(_result);
                global.isConnected = true;
                let nome = appSettings.getString("nome");
                let cognome = appSettings.getString("cognome");
                let username = nome + " " + cognome;
                setSideMenu("userDocente",username);
                indicator.visibility = "collapsed";
                const nav =
                    {
                        moduleName: "docenti/docenti-home/docenti-home",
                        clearHistory: true
                    };
                page.frame.navigate(nav);
            }
            else if (_result.user.grpDes === "Studenti")
            {
                let carriere = _result.user.trattiCarriera;
                global.saveInfo(_result);
                setAnagrafe(_result.user.persId,_result.user.grpDes);
                let index = appSettings.getNumber("carriera",0);
                console.log(_result.user.persId);
                global.saveCarr(carriere[index]);
                appSettings.setNumber("persId", _result.user.persId);

                getDepartment(carriere[index].stuId);
                global.isConnected = true;
                let nome = appSettings.getString("nome");
                let cognome = appSettings.getString("cognome");
                let username = nome + " " + cognome;
                setSideMenu("userForm",username);
                indicator.visibility = "collapsed";
                const nav =
                        {
                            moduleName: "userCalendar/userCalendar",
                            clearHistory: true
                        };
                page.frame.navigate(nav);

            }
            else{
                global.isConnected = true;
                let nome = appSettings.getString("nome","");
                let cognome = appSettings.getString("cognome","");
                let username = nome + " " + cognome;
                setSideMenu("userOther",username);
                indicator.visibility = "collapsed";
                /*
                const nav =
                    {
                        moduleName: "home/home-page",
                        clearHistory: true
                    };
                page.frame.navigate(nav);

                 */
                console.log("ALTRO USER");
            }

        },(e) => {
            dialogs.alert({
                title: "Errore: Home autoconnect",
                message: e.toString(),
                okButtonText: "OK"
            });
        });
        indicator.visibility = "collapsed";
    }
}

exports.onTapNotizie = function(){
  page.frame.navigate("notizie/notizie");
};

exports.onTapMeteo = function(){
    let loc;
    if (pos !== undefined)
        loc = { lat: pos.latitude, long: pos.longitude };
    else
        loc = {lat: 40.7, long: 14.17};
    page.showModal(modalViewModule, loc, false);
};

exports.onTapTrasporti = function(){

    page.frame.navigate("trasporti/trasporti");


};

exports.onTapAteneo = function(){
    if(platform.isIOS)
        utilsModule.openUrl("https://www.uniparthenope.it/");
    else{
        const nav =
            {
                moduleName: "portale/portale",
                context: {link:"https://www.uniparthenope.it/"}
            };
        page.frame.navigate(nav);
    }
};

exports.onTapEventi = function(){
    const nav =
        {
            moduleName: "orari/orari"
        };
    page.frame.navigate(nav);

};

exports.onTapFood = function(){
    const nav =
        {
           // moduleName:"docenti/docenti-appelli/docenti-appelli"
            moduleName: "menu/menu"
        };
    page.frame.navigate(nav);

};

function setSideMenu(type,username) {
     let actualForm = sideDrawer.getViewById(type);
     let loginForm = sideDrawer.getViewById("loginForm");
     loginForm.visibility = "collapsed";
     actualForm.visibility = "visible";
     global.myform = type;

     sideDrawer.getViewById("topName").text = username;
     global.username = username;

     if(type === "userForm"){
         sideDrawer.getViewById("topMatr").text = appSettings.getString("matricola");
         sideDrawer.getViewById("topEmail").text = appSettings.getString("emailAte");
         sideDrawer.getViewById("topMatr").visibility = "visible";
         sideDrawer.getViewById("topEmail").visibility = "visible";
         getPIC(appSettings.getNumber("persId"),0);
     }
    else if(type === "userDocente"){
         sideDrawer.getViewById("topMatr").text = appSettings.getString("ruolo")+ " " +appSettings.getString("settore");
         sideDrawer.getViewById("topEmail").text = appSettings.getString("emailAte");
         sideDrawer.getViewById("topMatr").visibility = "visible";
         sideDrawer.getViewById("topEmail").visibility = "visible";
         console.log(appSettings.getNumber("idAb"));
         getPIC(appSettings.getNumber("idAb"),1);

     }
    else if(type === "userRistoratore"){
         //getPIC(appSettings.getNumber("idAb"),1);

     }
     else if(type === "userOther"){
         getPIC(appSettings.getNumber("idAb"),1);
         sideDrawer.getViewById("topMatr").text = appSettings.getString("grpDes","");
         sideDrawer.getViewById("topMatr").visibility = "visible";

     }

 }
function showAD(){
    dialogs.confirm({
        title: "Sondaggio App@Uniparthenope",
        message: "Il tuo contributo è importante! \nDedicaci 3 minuti del tuo tempo per compilare un sondaggio anonimo.",
        okButtonText: "Certo",
        cancelButtonText: "Non Visualizzare Più",
        neutralButtonText: "Ricorda Dopo"
    }).then(function (result) {
        // result argument is boolean
        console.log(result);

        if(result){
            utilsModule.openUrl("https://forms.gle/NHt34NRw7uwMk9rEA");
            //appSettings.setBoolean("sondaggio", false);
        }
        else if (result === false)
            appSettings.setBoolean("sondaggio", false);
        else
            appSettings.setBoolean("sondaggio", true);

    });
}
exports.ontap_fb = function(){
    utilsModule.openUrl("https://www.facebook.com/Parthenope");
};

exports.ontap_you = function(){
    utilsModule.openUrl("https://www.youtube.com/channel/UCNBZALzU97MuIKSMS_gnO6A");
};

exports.ontap_twi = function(){
    utilsModule.openUrl("https://twitter.com/uniparthenope");
};

exports.ontap_insta = function(){
    utilsModule.openUrl("https://www.instagram.com/uniparthenope");
};

exports.onTapStudia = function(){
    utilsModule.openUrl("https://orienta.uniparthenope.it/");
};

function getPosition(){
    console.log("GetPosition ");

    geolocation.enableLocationRequest().then(function () {
        geolocation.isEnabled().then(function (isEnabled) {

            geolocation.getCurrentLocation({desiredAccuracy: 3, updateDistance: 10, maximumAge: 10000, timeout: 10000}).
            then(function(loc) {
                console.log("Finding "+loc);
                if (loc) {
                    pos = loc;
                    let position = calculateDistance(loc);
                    appSettings.setString("position", position);
                    console.log("MY_POSITION = "+loc.latitude+ " "+loc.longitude);
                }
                else { console.log("MY_POSITION = ERROR ");}
            }, function(e){

                console.log("Position Error: " + e.message);
            });
        })
    });
    console.log("QUI");
}

function calculateDistance(position) {
    let closer = "None";

    let bottom_bar = page.getViewById("bottom_bar");
    let image = page.getViewById("main_image");


    for (let i = 0; i < array_locations.length; i++) {
        let loc = new geolocation.Location();
        loc.latitude = array_locations[i].lat;
        loc.longitude = array_locations[i].long;
        //console.log("Distanza= "+geolocation.distance(position,loc));
        if (geolocation.distance(position, loc) < 300) {
            //console.log("Trovata!");
            closer = array_locations[i].id;
            bottom_bar.background = array_locations[i].color;
            image.backgroundImage = '~/images/image_' + array_locations[i].id + ".jpg";

        }

    }
    return closer;
}

function initializeGraph(){
    for (let i = 0; i < array_locations.length; i++) {
        let bg = page.getViewById("bg_" + i.toString());
        let icon = page.getViewById("icon_" + i.toString());


        bg.background = array_locations[i].background;
        icon.backgroundImage = '~/images/icon_home/' + array_locations[i].id + ".png";
    }
}
function detailedProf(docenteId) {
    httpModule.request({
        url: global.url + "professor/detailedInfo/"+ docenteId,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        let _result = response.content.toJSON();
        //TODO Gestire errori result
        //console.log(_result);
        global.saveProf(_result);

    },(e) => {
        dialogs.alert({
            title: "Errore: Home detailedProf",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}
function getDepartment(studId) {
    console.log(studId);
    httpModule.request({
        url: global.url + "students/departmentInfo/"+ studId,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        let _result = response.content.toJSON();
        //TODO gestire errori result
        global.saveDepartment(_result);

    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore: Home getDepartment",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

function checkServer(){
    httpModule.request({
        url: global.url_general,
        method: "GET",
        timeout: 2000
    }).then((response) => {
        if (response.statusCode !== 200){
            console.log("SERVER DOWN");
            dialogs.alert({
                title: "Errore Server!",
                message: "Il server è attualmente in manutenzione e le principali operazioni potrebbero non essere disponibili.\nCi scusiamo per il disagio!",
                okButtonText: "OK"
            });
        }
        else
            console.log("SERVER OK");

    },(e) => {

        dialogs.alert({
            title: "Errore Server!",
            message: "TIMEOUT\nIl server è attualmente in manutenzione e le principali operazioni potrebbero non essere disponibili.\nCi scusiamo per il disagio!",
            okButtonText: "OK"
        });
    });
}

function setAnagrafe(id, type){
    httpModule.request({
        url: global.url + "general/anagrafica/"+ id,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        let _result = response.content.toJSON();
    //TODO gestire errori result
        //console.log(_result);
        global.saveAnagrafe(type,_result);

    },(e) => {
        console.log("Errore Anagrafe", e);
        dialogs.alert({
            title: "Errore: Home getAnagrafe",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

function getPIC(personId, value) {
    let url;
    switch (value) {
        case 0:
            url = global.url + "general/image/" + personId;
            break;

        case 1:
            url = global.url + "general/image_prof/" + personId;
            break;
    }
    console.log(value);
    console.log(url);
    httpModule.getFile({
        "url": url,
        "method": "GET",
        headers: {
            "Content-Type": "image/jpg",
            "Authorization": "Basic " + global.encodedStr
        },
        "dontFollowRedirects": true
    }).then((source) => {
        sideDrawer.getViewById("topImg").backgroundImage = source["path"];
    }, (e) => {
        console.log("[Photo] Error", e);
        dialogs.alert({
            title: "Errore: Home getPic",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
