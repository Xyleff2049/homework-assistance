import {idiom, ng, toasts} from 'entcore';
import http, {AxiosResponse} from 'axios';
import {Callback} from '../models/Callback';

export interface CallbackService {
    post(Callback): Promise<AxiosResponse>;
    getServices(): Promise<AxiosResponse>;
}

export const callbackService: CallbackService = {

    async post(callback : Callback): Promise<AxiosResponse> {
        try {
            return await http.post(`/homework-assistance/services/${callback.userdata.service}/callback`, callback);
        } catch (err) {
            toasts.warning(idiom.translate('student.error.sendForm'));
            throw err;
        }
    },

    async getServices(): Promise<AxiosResponse> {
        try {
            return await http.get("/homework-assistance/services/all");
        } catch (err) {
            toasts.warning(idiom.translate('student.error.getServices'));
            throw err;
        }
    }
};

export const CallbackService = ng.service('CallbackService', (): CallbackService => callbackService);