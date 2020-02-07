export class Message {
    header: string;
    body: string;
    days: string;
    time: string;
    info: string;
}

export class Exclusion {
    start: any;
    end: any;

    constructor(start:any, end:any) {
        this.start = start;
        this.end = end;
    }
}

export class Week {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
}

export class Times {
    start: Time;
    end: Time;
}

export class Time {
    hour: number;
    minute: number;
}

export class Config {
    id: string;
    messages: Message;
    exclusions: Exclusion[];
    days: Week;
    times: Times;

    constructor() {
        this.id = null;
        this.messages = new Message();
        this.exclusions = [];
        this.days = new Week();
        this.times = new Times();
    }

    mongoToModel(data: any): void {
        this.id = data._id;
        this.messages = data.messages;
        this.exclusions = data.settings.exclusions;
        this.days = data.settings.opening_days;
        this.times = data.settings.opening_time;
    }

    toJson(): Object {
        return {
            _id: this.id,
            messages : this.messages,
            settings : {
                exclusions : this.exclusions,
                opening_days : this.days,
                opening_time : this.times
            }
        }
    }
}