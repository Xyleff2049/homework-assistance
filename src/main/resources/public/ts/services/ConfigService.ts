import {ng} from 'entcore';
import http, {AxiosPromise} from 'axios';
import {Config} from '../models/Config';

export interface ConfigService {
    get(): Promise<AxiosPromise>;
    put(config: Config) : Promise<AxiosPromise>;
}

export const configService: ConfigService = {

    async get(): Promise<AxiosPromise> {
        try {
            let {data} = await http.get('/homework-assistance/config');
            return data;
        } catch (err) {
            throw err;
        }
    },

    async put(config: Config) : Promise<AxiosPromise> {
        try {
            let {data} = await http.put('/homework-assistance/config', config.toJson());
            return data;
        } catch (err) {
            throw err;
        }
    }
};

export const ConfigService = ng.service('ConfigService', (): ConfigService => configService);