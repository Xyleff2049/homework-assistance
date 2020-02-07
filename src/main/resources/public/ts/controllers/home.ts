import {idiom, model, moment, ng, template} from 'entcore';
import {Callback, services} from '../models/Callback';
import {Config, Exclusion} from '../models/Config';
import {DateUtils} from '../utils/date';
import {CallbackService, ConfigService} from '../services';

interface ViewModel {
    callback: Callback;
    error: boolean;

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
    isAdmin: boolean;

    sendForm(): Promise<void>;
    saveConfig(): Promise<void>;
    saveMessage(string): Promise<void>;
    addExclusion(): Promise<void>;
    deleteExclusion(): Promise<void>;
    getClassName(): string;
    showLightbox(string, number?): void;
    hideLightbox(string): void;
}


export const homeController = ng.controller('HomeController', ['$scope', 'ConfigService', 'CallbackService',
    function ($scope, ConfigService: ConfigService, CallbackService: CallbackService) {

    $scope.lang = idiom;
    $scope.template = template;

    const vm: ViewModel = this;

    vm.callback = new Callback();
    vm.error = true; // true for time error, false for date error

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
    vm.isAdmin = $scope.hasRight('admin');
    // vm.isAdmin = false;

    vm.sendForm = async (): Promise<void> => {
        let dateValid = checkDate();
        let timeValid = checkTime();
        if (dateValid && timeValid) {
            let data = await CallbackService.post(vm.callback);
            vm.callback.mongoToModel(data);
        }
        else {
            vm.showLightbox('error');
        }
        console.log("sendForm");
        console.log(vm.callback);
        $scope.safeApply();
    };

    vm.saveConfig = async (): Promise<void> => {
        // vm.config.exclusions.sort((ex1,ex2) => sortExclusion(ex1,ex2));
        let data = await ConfigService.put(vm.config);
        vm.config.mongoToModel(data);
        console.log("saveConfig");
        console.log(vm.config);
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
        }
        else {
            console.log("One or several of these dates already exist.")
        }
        await vm.saveConfig();
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

    vm.showLightbox = (name:string, index?:number): void => {
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

    vm.hideLightbox = (name:string): void => {
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


    const loadConfig = async (): Promise<void> => {
        let data = await ConfigService.get();
        vm.config.mongoToModel(data);
        console.log("loadConfig");
        console.log(vm.config);
        $scope.safeApply();
    };

    const checkExclusion = (): boolean => {
        let safe = true;
        vm.config.exclusions.forEach(exclusion => {
            if (exclusion.start === vm.exclusion.start || exclusion.end === vm.exclusion.end) {
                safe = false;
            }
        });
        return safe;
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
        vm.callback.callback_time.minute = vm.config.times.start.minute;
        console.log("loadCallback");
        console.log(vm.callback);
        $scope.safeApply();
    };

    const checkDate = (): boolean => {
        let check = true;
        vm.config.exclusions.forEach( ex => {
            let startValues = ex.start.split("/");
            let endValues = ex.end.split("/");

            let startDate = new Date(parseInt(startValues[2]), parseInt(startValues[1])-1, parseInt(startValues[0]));
            let endDate = new Date(parseInt(endValues[2]), parseInt(endValues[1])-1, parseInt(endValues[0])+1);

            if (startDate <= vm.callback.callback_date && vm.callback.callback_date < endDate) {
                console.log("Date is wrong");
                vm.error = false;
                vm.exclusion = ex;
                check = false;
            }
        });
        return check;
    };

    const checkTime = (): boolean => {
        if (vm.callback.callback_time.hour < vm.config.times.start.hour ||
            vm.callback.callback_time.hour > vm.config.times.end.hour) {
            console.log("Time is wrong");
            vm.error = true;
            return false;
        }
        else if (vm.callback.callback_time.hour === vm.config.times.start.hour &&
            vm.callback.callback_time.minute < vm.config.times.start.minute) {
            console.log("Time is wrong");
            vm.error = true;
            return false;
        }
        else if (vm.callback.callback_time.hour === vm.config.times.end.hour &&
            vm.callback.callback_time.minute > vm.config.times.end.minute) {
            console.log("Time is wrong");
            vm.error = true;
            return false;
        }
        else {
            return true;
        }
    };

    const setModifierParams = (name:string): void => {
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

    const sortExclusion = (ex1:Exclusion, ex2:Exclusion): number => {
        let startValues1 = ex1.start.split("/");
        let startValues2 = ex2.end.split("/");

        startValues1 = [parseInt(startValues1[0]), parseInt(startValues1[1])-1, parseInt(startValues1[2])];
        startValues2 = [parseInt(startValues2[0]), parseInt(startValues2[1])-1, parseInt(startValues2[2])];


        return 0;
    };

    const init = async (): Promise<void> => {
        await loadConfig();
        if (!vm.isAdmin) {
            await loadCallback();
        }
    };

    init();
}]);