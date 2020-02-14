import {ng} from 'entcore';
import http, {AxiosResponse} from 'axios';
import {Config} from '../models/Config';

export interface ConfigService {
    get(): Promise<AxiosResponse>;
    put(config: Config) : Promise<AxiosResponse>;
}

export const configService: ConfigService = {

    async get(): Promise<AxiosResponse> {
        try {
            return await http.get('/homework-assistance/config');
        } catch (err) {
            throw err;
        }
    },

    async put(config: Config) : Promise<AxiosResponse> {
        try {
            return await http.put('/homework-assistance/config', config.toJson());
        } catch (err) {
            throw err;
        }
    }
};

export const ConfigService = ng.service('ConfigService', (): ConfigService => configService);