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

    constructor() {
        this.destination = null;
        this.callback_date = null;
        this.callback_time = new Time();
        this.userdata = new Userdata();
        this.informations_complementaires = null;
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