import {idiom, model, ng, template, toasts} from 'entcore';
import {Callback, services} from '../models/Callback';
import {Config, Exclusion} from '../models/Config';
import {DateUtils} from '../utils/date';
import {callbackService, configService} from '../services';

interface ViewModel {
    callback: Callback;
    error: string;
    minutesOpt: number[];
    config: Config;
    lightbox: {
        delete: boolean,
        add: boolean,
        error: boolean,
        modifier: boolean
    };
    modifier: string;
    message: string;
    exclusion: Exclusion;
    index: number;

    sendForm(): Promise<void>;
    saveConfig(): Promise<void>;
    saveMessage(string): Promise<void>;
    addExclusion(): Promise<void>;
    deleteExclusion(): Promise<void>;
    getClassName(): string;
    showLightbox(string, number?): void;
    hideLightbox(string): void;
    getTodayDate(): string;
    getTimeFormat(number): string;
    getHoursOpt(): number[];
    calculateMinutesOpt(): void;
    // test(string): void;
    // test2(string): void;
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
    vm.message = "";
    vm.exclusion = new Exclusion(new Date(), new Date());
    vm.index = 0;
    vm.lightbox = {
        delete: false,
        add: false,
        error: false,
        modifier: false
    };
    vm.modifier = "";


    vm.sendForm = async (): Promise<void> => {
        let dateValid = checkDate();
        let timeValid = checkCallbackTime();
        if (dateValid && timeValid) {
            let response = await callbackService.post(vm.callback);
            if (response.status == 200 || response.status == 201) {
                printDataCallback(response.data.body);
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

    vm.saveMessage = async (name: string): Promise<void> => {
        switch(name) {
            case "header": {
                vm.config.messages.header = vm.message;
                break;
            }
            case "body": {
                vm.config.messages.body = vm.message;
                break;
            }
            case "time": {
                vm.config.messages.time = vm.message;
                break;
            }
            case "days": {
                vm.config.messages.days = vm.message;
                break;
            }
            case "info": {
                vm.config.messages.info = vm.message;
                break;
            }
            default: {
                break;
            }
        }
        await vm.saveConfig();
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
            console.log("[ERROR] One or several of these dates already exist.")
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
                setModifierParams(name);
                vm.lightbox.modifier = true; break;
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
            case "modifier": {
                vm.lightbox.modifier = false; break;
            }
            default: {
                break;
            }
        }
    };

    vm.getTodayDate = (): string => {
        return DateUtils.format(new Date(), DateUtils.FORMAT["YEAR-MONTH-DAY"]);
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

    /*
    vm.test = (id: string): void  => {
        let original = document.getElementById('id');
        let replacement = document.createElement('textarea');
        replacement.setAttribute("id",id);
        replacement.setAttribute("class","newMessage");
        replacement.setAttribute("value", vm.message);
        replacement.setAttribute("ng-model", vm.message);
        replacement.setAttribute("ng-blur", "vm.test2(" + id + ")");
        replacement.innerHTML = original.innerHTML;
        original.parentNode.replaceChild(replacement, original);
        replacement.focus();
    };
    vm.test2 = (id: string): void  => {
        let original = document.getElementById('id');
        let replacement = document.createElement('div');
        replacement.setAttribute("id", id);
        replacement.setAttribute("class","multilines");
        replacement.setAttribute("ng-click","vm.test("+ id + ")");
        replacement.textContent = vm.message;
        original.innerHTML = original.innerHTML;
        original.parentNode.replaceChild(replacement, original);
    };
    */


    const loadConfig = async (): Promise<void> => {
        let response = await configService.get();
        if (response.status == 200 || response.status == 201) {
            vm.config.mongoToModel(response.data);
        }
        // console.log("loadConfig");
        // console.log(vm.config);
        $scope.safeApply();
    };

    const loadCallback = async () => {
            vm.callback.userdata.prenom = model.me.firstName;
            vm.callback.userdata.nom = model.me.lastName;
            vm.callback.userdata.etablissement = model.me.structureNames[0];
            vm.callback.userdata.classe = await vm.getClassName();
            vm.callback.userdata.service = "76"; // Set Français as default selected option
            vm.callback.userdata.matiere = services[vm.callback.userdata.service];
            vm.callback.callback_date = new Date();
            vm.callback.callback_time.hour = vm.config.times.start.hour;
            vm.calculateMinutesOpt();
            // console.log("loadCallback");
            // console.log(vm.callback);
            $scope.safeApply();
        };

    const checkExclusion = (): boolean => {
        let safe = true;
        vm.config.exclusions.forEach(exclusion => {
            if (vm.exclusion.start >= vm.exclusion.end) {
                vm.error = 'adminReverseDate';
                safe = false;
            }
            else if (
                exclusion.start === vm.exclusion.start ||
                exclusion.end === vm.exclusion.end ||
                vm.exclusion.start > exclusion.start && vm.exclusion.end < exclusion.end) {
                vm.error = 'adminExistingDate';
                safe = false;
            }
        });
        return safe;
    };

    const sortExclusion = (ex1:Exclusion, ex2:Exclusion): number => {
            let startValues1 = ex1.start.split("/");
            let startValues2 = ex2.start.split("/");

            let date1 = new Date(parseInt(startValues1[2]), parseInt(startValues1[1])-1, parseInt(startValues1[0]));
            let date2 = new Date(parseInt(startValues2[2]), parseInt(startValues2[1])-1, parseInt(startValues2[0])+1);

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

    const checkDate = (): boolean => {
        let check = true;
        let today = new Date();
        today.setDate(today.getDate() - 1);
        if (vm.callback.callback_date < today) {
            vm.error = 'studentOldDate';
            return false;
        }
        vm.config.exclusions.forEach( ex => {
            let startValues = ex.start.split("/");
            let endValues = ex.end.split("/");

            let startDate = new Date(parseInt(startValues[2]), parseInt(startValues[1])-1, parseInt(startValues[0]));
            let endDate = new Date(parseInt(endValues[2]), parseInt(endValues[1])-1, parseInt(endValues[0])+1);

            // Check is the selected date is available (not in closed period)
            if (startDate <= vm.callback.callback_date && vm.callback.callback_date < endDate) {
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

    const setModifierParams = (name: string): void => {
        switch(name) {
            case "header": {
                vm.message = vm.config.messages.header; break;
            }
            case "body": {
                vm.message = vm.config.messages.body; break;
            }
            case "time": {
                vm.message = vm.config.messages.time; break;
            }
            case "days": {
                vm.message = vm.config.messages.days; break;
            }
            case "info": {
                vm.message = vm.config.messages.info; break;
            }
            default: {
                break;
            }
        }
        vm.modifier = name;
    };

    const printDataCallback = (data: any): void => {
        console.log(JSON.parse(data.parameters.toString()));
    };


    const init = async (): Promise<void> => {
        await loadConfig();
        if ($scope.hasRight('student')) {
            await loadCallback();
        }
    };

    init();
}]);