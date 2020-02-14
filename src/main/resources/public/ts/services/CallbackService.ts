import {ng} from 'entcore';
import http, {AxiosResponse} from 'axios';
import {Callback} from '../models/Callback';

export interface CallbackService {
    post(Callback): Promise<AxiosResponse>;
}

export const callbackService: CallbackService = {

    async post(callback : Callback): Promise<AxiosResponse> {
        try {
            return await http.post(`/homework-assistance/services/${callback.userdata.service}/callback`, callback);
        } catch (err) {
            throw err;
        }
    }
};

export const CallbackService = ng.service('CallbackService', (): CallbackService => callbackService);