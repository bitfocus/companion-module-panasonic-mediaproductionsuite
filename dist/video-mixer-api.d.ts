import type { ModuleConfig } from './config.js';
export interface VideoMixerResponse {
    resp: 'ack' | 'nack';
    layout?: number;
    cell?: number;
    volume?: number;
    enable?: number;
    cells?: CellData[];
}
export interface CellData {
    cell: number;
    name: string;
    type: string;
}
export declare class VideoMixerApi {
    private config;
    private log;
    constructor(config: ModuleConfig, log: (level: 'info' | 'warn' | 'error' | 'debug', message: string) => void);
    updateConfig(config: ModuleConfig): void;
    private buildUrl;
    private parseResponse;
    private sendCommand;
    switchPgm(cell: number): Promise<VideoMixerResponse>;
    dsk(control: 0 | 1): Promise<VideoMixerResponse>;
    captureScreenshot(control: 1 | 2, image: 0 | 1): Promise<VideoMixerResponse | Buffer>;
    captureAiBackground(input: number, bkgd: number): Promise<VideoMixerResponse>;
    getMultiViewLayout(): Promise<VideoMixerResponse>;
    getMultiViewCell(cell: number): Promise<VideoMixerResponse>;
    getPgmCell(): Promise<VideoMixerResponse>;
    getMultiViewImage(cell: number): Promise<Buffer | null>;
    controlVolume(volume: number): Promise<VideoMixerResponse>;
    getAudioVolume(): Promise<VideoMixerResponse>;
    getVmEnableStatus(): Promise<VideoMixerResponse>;
}
