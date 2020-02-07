import {ng} from 'entcore';
import http, {AxiosPromise} from 'axios';
import {Callback} from '../models/Callback';

export interface CallbackService {
    post(Callback): Promise<AxiosPromise>;
}

export const callbackService: CallbackService = {

    async post(callback : Callback): Promise<AxiosPromise> {
        try {
            let {data} = await http.post(`/homework-assistance/services/${callback.userdata.service}/callback`, callback);
            return data;
        } catch (err) {
            throw err;
        }
    }
};

export const CallbackService = ng.service('CallbackService', (): CallbackService => callbackService);