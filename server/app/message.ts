import { Config } from "../../training/learning/config";
import { ProgressArg } from "../../training/learning/progress";

export const message = 'message';

export interface WorkerRequest{
    config: Config;
    id: string;
}

export interface WorkerResponse {
    id: string;
    arg: ProgressArg
}