export const services = {
    80: "Anglais",
    81: "Espagnol",
    76: "Français",
    77: "Mathématiques",
    78: "Physique"
};

export class Time {
    hour: number;
    minute: number;
}

export class Userdata {
    prenom: string;
    nom: string;
    etablissement: string;
    classe: string;
    service: string;
    matiere: string;
}

export class Callback {
    destination: string;
    callback_date: any;
    callback_time: Time;
    userdata: Userdata;
    informations_complementaires: string;
    key: string;
    ip_server: string;
    address: string;

    constructor() {
        this.destination = null;
        this.callback_date = null;
        this.callback_time = new Time();
        this.userdata = new Userdata();
        this.informations_complementaires = null;
        this.key = null;
        this.ip_server = null;
        this.address = "https://ng1.preprod-ent.fr/kiamo";
        // this.address = "http://" + this.ip_server + "/api/service/" + this.userdata.service + "/tasks?token=" + this.key;
        // this.address = "http://" + this.ip_server + "/api/serviceS/" + this.userdata.service + "/tasks?token=" + this.key;
    }

    mongoToModel(data: any) {
        this.destination = data.destination;
        this.callback_date = data.callback_date;
        this.callback_time = data.callback_time;
        this.userdata = data.userdata;
        this.informations_complementaires = data.informations_complementaires;
    }

    toJson(): Object {
        return {
            destination: this.destination,
            callback_date: this.callback_date,
            callback_time: this.callback_time,
            userdata: this.userdata,
            informations_complementaires: this.informations_complementaires
        }
    }
}