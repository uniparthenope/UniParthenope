const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const email = require("nativescript-email");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const imageSourceModule = require("tns-core-modules/image-source");
const contacts = require("nativescript-contacts");
const platformModule = require("tns-core-modules/platform");



let page;
let viewModel;
let sideDrawer;
let info;

function choseBackground(page){
    let code = appSettings.getString("facCod");
    console.log(code);

    if (code === "D1" || code === "D6"){
        page.getViewById("back_image").backgroundImage = "~/images/image_Parisi.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(11, 114, 181,0.9)";
    }
    else if (code === "D2" || code === "D7"){
        page.getViewById("back_image").backgroundImage = "~/images/image_Parisi.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(119, 72, 150,0.9)";
    }
    else if (code === "D3"){
        page.getViewById("back_image").backgroundImage = "~/images/image_CDN.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(36, 36, 36,0.9)";
    }
    else if (code === "D4"){
        page.getViewById("back_image").backgroundImage = "~/images/image_CDN.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(0, 167, 84,0.9)";
    }
    else if (code === "D4"){
        page.getViewById("back_image").backgroundImage = "~/images/image_Acton.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(221, 108, 166,0.9)";
    }
    else{
        page.getViewById("back_image").backgroundImage = "~/images/newbackground.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(30, 50, 88,1)";
    }
}

function getPIC(personId, value){
    let url;
    switch (value) {
        case 0:
            url = global.url + "general/image/"+ personId;
            break;

        case 1:
            url = global.url + "general/image_prof/"+ personId;
            break;
    }

    httpModule.getFile({
        "url": url,
        "method": "GET",
        headers: {
            "Content-Type" : "image/jpg",
            "Authorization" : "Basic "+ global.encodedStr
        },
        "dontFollowRedirects": true
    }).then((source) => {
        page.getViewById("my_img").src = source.path;
    }, (e) => {
        console.log("[Photo] Error", e);
        dialogs.alert({
            title: "Errore: Anagrafe getPic",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

function getRecord(){
    httpModule.request({
        url : global.url_general + "Badges/v2/getContactInfo",
        method : "POST",
        headers : {
            "Content-Type": "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        },
        content : JSON.stringify({
            id: page.navigationContext.id
        })
    }).then((response) => {
        const result = response.content.toJSON();

        let message;
        if (response.statusCode === 500)
            message = "Error: " + result["errMsg"];
        else {
            info = result;
            page.getViewById("name").text = info.nome;
            page.getViewById("surname").text = info.cognome;
            page.getViewById("role").text = info.ruolo.toUpperCase();
            page.getViewById("matricola").text = info.matricola;
            page.getViewById("depart").text = "--"
            page.getViewById("uid").text = info.username;

            page.getViewById("sex").text = info.sesso;
            page.getViewById("nascita").text = info.dataNascita.substring(0,10);
            page.getViewById("email_ist").text = info.emailAte;
            page.getViewById("tel").text = info.telRes;

            if (info.ruolo  === "Studenti"){
                page.getViewById("my_img").src = imageSourceModule.ImageSource.fromBase64Sync(info.image);

                page.getViewById("email").text = info.email;
                page.getViewById("nazione").text =  info.desCittadinanza;

                page.getViewById("email_id").visibility = "visible";
                page.getViewById("nation_id").visibility = "visible";
            }
            else if (info.ruolo === "Docenti"){

                page.getViewById("my_img").src = info.image;

                page.getViewById("roleID").text = info.settore;
            }
        }
    }, error => {
        console.error(error);
    });

}

exports.onNavigatingTo = function(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    console.log("Navigation",info);

    if(page.navigationContext !== undefined){
        page.getViewById("save_info").visibility = "visible";
        page.getViewById("title").text = "Informazioni Contatto";


        getRecord();
    }
    else{
        page.getViewById("title").text = "Anagrafica";

        page.getViewById("save_info").visibility = "collapsed";

        choseBackground(page);
        page.getViewById("name").text = appSettings.getString("nome");
        page.getViewById("surname").text = appSettings.getString("cognome");
        page.getViewById("role").text = appSettings.getString("grpDes").toUpperCase();
        page.getViewById("matricola").text = appSettings.getString("matricola");
        page.getViewById("depart").text = appSettings.getString("facDes").toUpperCase();
        page.getViewById("uid").text = appSettings.getString("userId").toLowerCase();


        page.getViewById("sex").text = appSettings.getString("sesso");
        page.getViewById("nascita").text = appSettings.getString("dataNascita").substring(0,10);
        page.getViewById("email_ist").text = appSettings.getString("emailAte");
        page.getViewById("tel").text = appSettings.getString("telRes");


        if (appSettings.getString("grpDes") === "Studenti"){

            getPIC(appSettings.getNumber("persId"), 0);

            page.getViewById("email").text = appSettings.getString("email");
            page.getViewById("nazione").text = appSettings.getString("desCittadinanza");

            page.getViewById("email_id").visibility = "visible";
            page.getViewById("nation_id").visibility = "visible";
        }
        else if (appSettings.getString("grpDes") === "Docenti"){

            getPIC(appSettings.getNumber("idAb"), 1);

            page.getViewById("my_img").backgroundImage = url;
            page.getViewById("roleID").text = appSettings.getString("settCod");
        }
        else if (appSettings.getString("grpDes") === "Ristorante"){

            //getPIC(appSettings.getNumber("idAb"), 1);

            //page.getViewById("my_img").backgroundImage = url;
            page.getViewById("mat_label").text = "NOME RISTORANTE";
        }
    }

    page.bindingContext = viewModel;
}

exports.onDrawerButtonTap = function() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.tap_sendMail = function () {

    let my_mail = appSettings.getString("emailAte","");
    if(my_mail !== ""){
        dialogs.confirm({
            title: "Salvataggio Informazioni Utente",
            message: "Salvare le informazioni visualizzate nella propria casella email " + my_mail + " ?",
            okButtonText: "Si",
            cancelButtonText: "Annulla"
        }).then(function (result){
            if(result){
                let array = [];
                array.push(my_mail);
                //TODO permettere al server di gestire le mail
                email.compose({
                    subject: "APP@UNIPARTHENOPE Informazioni utente " + info.nome + " " +
                        info.cognome,
                    body: "Informazioni Utente\n\n" + info.nome + " " +
                        info.cognome + "\n"+
                        "Ruolo: " + info.ruolo + "\n"+
                        "Username: " + info.username + "\n"+
                        "Matricola: " + info.matricola + "\n"+
                        "Sesso: " + info.sesso + "\n"+
                        "Nascita: " + info.dataNascita.substring(0,10) + "\n"+
                        "Email Istituzionale: " + info.emailAte + "\n"+
                        "Tel. : " + info.telRes + "\n"+
                    "\n\nQuesta email è generata automaticamente da app@uniparthenope",
                    to: array
                }).then(
                    function() {
                        console.log("Email closed");

                    }, function(err) {
                        dialogs.alert({
                            title: "Errore: Email",
                            message: err.toString(),
                            okButtonText: "OK"
                        });
                    });
            }
        });
    }
    else{
        dialogs.alert({
            title: "Attenzione!",
            message: "Impossibile recuperare la propria mail!",
            okButtonText: "OK",
        }).then();
    }
}

exports.tap_addContact = function () {

    dialogs.confirm({
        title: "Salvataggio Informazioni Utente",
        message: "Aggiungere nuovo contatto alla rubrica?",
        okButtonText: "Si",
        cancelButtonText: "Annulla"
    }).then(function (result){
        if(result){
            dialogs.alert({
                title: "Successo",
                message: "Contatto salvato con successo!",
                okButtonText: "OK"
            });

            let newContact = new contacts.Contact();
            newContact.name.given = info.nome;
            newContact.name.family = info.cognome;
            newContact.organization.name = "Università degli Studi di Napoli 'Parthenope'";
            newContact.organization.jobTitle = info.ruolo + " "+info.matricola;
            newContact.phoneNumbers.push({
                label: contacts.KnownLabel.HOME,
                value: info.telRes
            }); // See below for known labels
            newContact.emailAddresses.push({ label: contacts.KnownLabel.HOME,
                value: info.emailAte});
            newContact.photo = imageSourceModule.ImageSource.fromBase64Sync(info.image);
            if(platformModule.isAndroid){
                Permissions.requestPermissions([android.Manifest.permission.GET_ACCOUNTS, android.Manifest.permission.WRITE_CONTACTS], "I need these permissions because I'm cool")
                    .then(() => {
                        newContact.save().then(()=>{
                            dialogs.alert({
                                title: "Successo!",
                                message: "Utente aggiunto con successo alla rubrica!",
                                okButtonText: "OK",
                            })
                        });
                    });
            }
            else
                newContact.save();

        }
    });

}