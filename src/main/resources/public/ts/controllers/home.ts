import {idiom, model, ng, template, toasts} from 'entcore';
import {Callback} from '../models/Callback';
import {Config, Exclusion} from '../models/Config';
import {DateUtils} from '../utils/date';
import {callbackService, configService} from '../services';

interface ViewModel {
    callback: Callback;
    error: string;
    minutesOpt: number[];
    config: Config;
    exclusion: Exclusion;
    index: number;
    lightbox: {
        delete: boolean,
        add: boolean,
        error: boolean
    };
    services: {};

    sendForm(): Promise<void>;
    saveConfig(): Promise<void>;
    saveMessage(string): Promise<void>;
    focusText(string): Promise<void>;
    addExclusion(): Promise<void>;
    deleteExclusion(): Promise<void>;
    getClassName(): string;
    showLightbox(string, number?): void;
    hideLightbox(string): void;
    getTimeFormat(number): string;
    getHoursOpt(): number[];
    calculateMinutesOpt(): void;
    getServices(): Promise<void>;
}


export const homeController = ng.controller('HomeController', ['$scope', 'ConfigService', 'CallbackService',
    function ($scope) {

    $scope.lang = idiom;
    $scope.template = template;
    const vm: ViewModel = this;

    vm.callback = new Callback();
    vm.error = "";
    vm.minutesOpt = [];

    vm.config = new Config();
    vm.exclusion = new Exclusion(new Date(), new Date());
    vm.index = 0;
    vm.lightbox = {
        delete: false,
        add: false,
        error: false
    };
    vm.services = {};


    vm.sendForm = async (): Promise<void> => {
        let dayValid = checkCallbackDay();
        let dateValid = checkCallbackDate();
        let timeValid = checkCallbackTime();
        if (dayValid && dateValid && timeValid) {
            let response = await callbackService.post(vm.callback);
            if (response.status == 200) {
                // console.log(JSON.parse(response.data.body.parameters.toString()));
                toasts.confirm(idiom.translate('student.send'));
            } else {
                toasts.warning(response.data.toString());
            }
        }
        else {
            vm.showLightbox('error');
        }
        $scope.safeApply();
    };

    vm.saveConfig = async (): Promise<void> => {
        if (checkConfigTime()) {
            let response = await configService.put(vm.config);
            if (response.status == 200 || response.status == 201) {
                toasts.confirm(idiom.translate('admin.save'));
                vm.config.mongoToModel(response.data);
            }
            else {
                toasts.warning(response.data.toString());
            }
        }
        else {
            vm.showLightbox('error');
        }
        // console.log("saveConfig");
        // console.log(vm.config);
        $scope.safeApply();
    };

    vm.saveMessage = async (idName: string): Promise<void> => {
        let save = false;
        let input = document.getElementById(idName).innerText;
        switch(idName) {
            case "message-header": {
                if (input != vm.config.messages.header) {
                    vm.config.messages.header = input;
                    save = true;
                }
                break;
            }
            case "message-body": {
                if (input != vm.config.messages.body) {
                    vm.config.messages.body = input;
                    save = true;
                }
                break;
            }
            case "message-time": {
                if (input != vm.config.messages.time) {
                    vm.config.messages.time = input;
                    save = true;
                }
                break;
            }
            case "message-days": {
                if (input != vm.config.messages.days) {
                    vm.config.messages.days = input;
                    save = true;
                }
                break;
            }
            case "message-info": {
                if (input != vm.config.messages.info) {
                    vm.config.messages.info = input;
                    save = true;
                }
                break;
            }
            default: {
                break;
            }
        }
        if (save) {
            await vm.saveConfig();
        }
    };

    vm.focusText = async (idName: string): Promise<void> => {
        document.getElementById(idName).focus();
    };

    vm.addExclusion = async (): Promise<void> => {
        if (vm.exclusion.start instanceof Date) {
            vm.exclusion.start = DateUtils.format(vm.exclusion.start, DateUtils.FORMAT["DAY-MONTH-YEAR"]);
        }
        if (vm.exclusion.end instanceof Date) {
            vm.exclusion.end = DateUtils.format(vm.exclusion.end, DateUtils.FORMAT["DAY-MONTH-YEAR"]);
        }
        let safe = checkExclusion();
        if (safe) {
            vm.config.exclusions.push(vm.exclusion);
            vm.config.exclusions = vm.config.exclusions.sort((ex1, ex2) => sortExclusion(ex1,ex2));
            await vm.saveConfig();
        }
        else {
            vm.showLightbox('error');
            // console.log("[ERROR] One or several of these dates already exist.")
        }
    };

    vm.deleteExclusion = async (): Promise<void> => {
        try {
            vm.config.exclusions.splice(vm.index, 1);
        } catch (err) {
            throw err;
        }
        await vm.saveConfig();
    };

    vm.getClassName = (): string => {
        if (model.me.classNames != null && model.me.classNames.length > 0) {
            let brutClassName = model.me.classNames[0];
            let index = brutClassName.indexOf( "$" );
            return brutClassName.substring(index + 1);
        }
        else {
            return " ";
        }
    };

    vm.showLightbox = (name: string, index?:number): void => {
        switch(name) {
            case "delete": {
                vm.index = index;
                vm.exclusion = vm.config.exclusions[vm.index];
                vm.lightbox.delete = true; break;
            }
            case "add": {
                vm.lightbox.add = true; break;
            }
            case "error": {
                vm.lightbox.error = true; break;
            }
            default: {
                break;
            }
        }
    };

    vm.hideLightbox = (name: string): void => {
        switch(name) {
            case "delete": {
                vm.lightbox.delete = false; break;
            }
            case "add": {
                vm.lightbox.add = false; break;
            }
            case "error": {
                vm.lightbox.error = false; break;
            }
            default: {
                break;
            }
        }
    };

    vm.getTimeFormat = (n: number) : string => {
        let s = n.toString();
        if (s.length < 2) {
            return "0" + s;
        }
        else {
            return s;
        }
    }

    vm.getHoursOpt = (): number[] => {
        let hours = [];
        for (let i = vm.config.times.start.hour; i <= vm.config.times.end.hour; i++) {
            if (i === vm.config.times.end.hour && vm.config.times.end.minute === 0) {
                break;
            }
            hours.push(i);
        }
        return hours;
    };

    vm.calculateMinutesOpt = (): void => {
        let minutes = [];
        let selectedHour = parseInt(vm.callback.callback_time.hour.toString());
        let starth = parseInt(vm.config.times.start.hour.toString());
        let endh = parseInt(vm.config.times.end.hour.toString());
        let startm = parseInt(vm.config.times.start.minute.toString());
        let endm= parseInt(vm.config.times.end.minute.toString());

        if (starth === endh) {
            for (let i = startm; i <= endm; i+=5) {
                minutes.push(i);
            }
        }
        else if (selectedHour === starth) {
            for (let i = startm; i <= 55; i+=5) {
                minutes.push(i);
            }
        }
        else if (selectedHour === endh) {
            for (let i = 0; i <= endm; i+=5) {
                minutes.push(i);
            }
        }
        else if (selectedHour > starth && selectedHour < endh) {
            for (let i = 0; i <= 55; i+=5) {
                minutes.push(i);
            }
        }
        else {
            console.log("Invalid hours defined by the admin");
        }

        try {
            vm.minutesOpt = minutes;
            vm.callback.callback_time.minute = vm.minutesOpt[0];
        }
        catch (err) {
            throw err;
        }
    };



    const loadConfig = async (): Promise<void> => {
        let response = await configService.get();
        if (response.status == 200 || response.status == 201) {
            vm.config.mongoToModel(response.data);
        }
        $scope.safeApply();
    };

    const loadCallback = async (): Promise<void> => {
            vm.callback.userdata.prenom = model.me.firstName;
            vm.callback.userdata.nom = model.me.lastName;
            vm.callback.userdata.etablissement = model.me.structureNames[0];
            vm.callback.userdata.classe = await vm.getClassName();
            vm.callback.userdata.matiere = Object.keys(vm.services)[0];
            vm.callback.userdata.service = vm.services[vm.callback.userdata.matiere];
            vm.callback.callback_date = new Date();
            vm.callback.callback_time.hour = vm.config.times.start.hour;
            vm.calculateMinutesOpt();
            $scope.safeApply();
        };

    const checkCallbackDay = (): boolean => {
        let dayChoice = new Date(vm.callback.callback_date).getDay();
        if ((dayChoice === 1  && !vm.config.days.monday) ||
            (dayChoice === 2  && !vm.config.days.tuesday) ||
            (dayChoice === 3  && !vm.config.days.wednesday) ||
            (dayChoice === 4  && !vm.config.days.thursday) ||
            (dayChoice === 5  && !vm.config.days.friday) ||
            (dayChoice === 6  && !vm.config.days.saturday) ||
            (dayChoice === 0  && !vm.config.days.sunday)) {
            vm.error = 'studentWrongDay';
            return false;
        }
        return true;
};

    const checkCallbackDate = (): boolean => {
        let check = true;
        let callbackDate: Date = vm.callback.callback_date;
        callbackDate.setHours(0,0,0,0);
        let today = new Date();
        today.setDate(today.getDate() - 1);
        if (callbackDate < today) {
            vm.error = 'studentOldDate';
            return false;
        }
        vm.config.exclusions.forEach( ex => {
            let startDate = getDate(ex.start);
            let endDate = getDate(ex.end);

            // Check is the selected date is available (not in closed period)
            if (startDate <= callbackDate && callbackDate <= endDate) {
                vm.error = 'studentClosedDate';
                vm.exclusion = ex;
                check = false;
            }
        });
        return check;
    };

    const checkCallbackTime = (): boolean => {
        /* if   (hour out of bounds) ||
                (hour = startHour but minute is before start) ||
                (hour = endHour but minute is after end)*/
        if ((vm.callback.callback_time.hour < vm.config.times.start.hour || vm.callback.callback_time.hour > vm.config.times.end.hour) ||
            (vm.callback.callback_time.hour === vm.config.times.start.hour && vm.callback.callback_time.minute < vm.config.times.start.minute) ||
            (vm.callback.callback_time.hour === vm.config.times.end.hour && vm.callback.callback_time.minute > vm.config.times.end.minute)) {
            vm.error = 'studentTime';
            return false;
        }
        return true;
    };

    const checkConfigTime = (): boolean => {
        if ((vm.config.times.start.hour > vm.config.times.end.hour) ||
            (vm.config.times.start.hour === vm.config.times.end.hour && vm.config.times.start.minute >= vm.config.times.end.minute)) {
            vm.error = 'adminReverseTime';
            return false;
        }
        return true;
    };

    const checkExclusion = (): boolean => {
        let today = new Date();
        today.setDate(today.getDate() - 1);
        let startDate = getDate(vm.exclusion.start);
        let endDate = getDate(vm.exclusion.end);

        if (startDate < today) {
            vm.error = 'adminOldDate';
            return false;
        }
        else if (startDate > endDate) {
            vm.error = 'adminReverseDate';
            return false;
        }
        else {
            let safe = true;
            vm.config.exclusions.forEach(ex => {
                let exStartDate = getDate(ex.start);
                let exEndDate = getDate(ex.end);

                if (startDate - exStartDate === 0 ||
                    endDate - exEndDate === 0 ||
                    startDate > exStartDate && endDate < exEndDate) {
                    vm.error = 'adminExistingDate';
                    safe = false;
                }
            });
            return safe;
        }
    };

    const sortExclusion = (ex1:Exclusion, ex2:Exclusion): number => {
        let date1 = getDate(ex1.start);
        let date2 = getDate(ex2.start);

        if (date1 > date2) {
            return 1;
        }
        else if (date1 < date2) {
            return -1;
        }
        else {
            return 0;
        }
    };

    const getDate = (stringDate:string) : any => {
        let values = stringDate.split("/");
        return new Date(parseInt(values[2]), parseInt(values[1])-1, parseInt(values[0]));
    }

    const getServices = async (): Promise<void> => {
        let response = await callbackService.getServices();
        vm.services = response.data;
        $scope.safeApply();
    };

    const init = async (): Promise<void> => {
        await loadConfig();
        if ($scope.hasRight('student')) {
            await getServices();
            await loadCallback();        }
    };

    init();
}]);