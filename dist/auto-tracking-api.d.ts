import type { ModuleConfig } from './config.js';
export interface AutoTrackingResponse {
    resp: 'ack' | 'nack';
    message?: string;
}
export interface CameraStateResponse {
    resp: 'ack' | 'nack';
    id?: number;
    connection?: number;
    detection?: number;
    tracking?: number;
    lost?: number;
    angle?: number;
    preset?: number[];
    angle_type?: number;
    target_position?: number[];
    target_position_area?: number[];
    pan_tilt_limit?: number[];
    face_recognition?: number;
    auto_face_search?: number;
    auto_zoom?: number;
}
export declare class AutoTrackingApi {
    private config;
    private log;
    constructor(config: ModuleConfig, log: (level: 'info' | 'warn' | 'error' | 'debug', message: string) => void);
    updateConfig(config: ModuleConfig): void;
    private buildUrl;
    private parseResponse;
    private sendCommand;
    cameraControl(id: number, control: 'start' | 'stop'): Promise<AutoTrackingResponse>;
    tracking(id: number, process: 'start' | 'stop'): Promise<AutoTrackingResponse>;
    angle(id: number, mode: 'upper' | 'body' | 'full' | 'off'): Promise<AutoTrackingResponse>;
    cameraState(id: number): Promise<CameraStateResponse>;
    trackingControl(id: number, enable: 'on' | 'off'): Promise<AutoTrackingResponse>;
    cameraControlView(id: number, control: 'start' | 'stop'): Promise<AutoTrackingResponse>;
    autoFaceSearch(id: number, mode: 0 | 1): Promise<AutoTrackingResponse>;
    preset(id: number, mode: 'set' | 'clear' | 'recall', presetNum: number): Promise<AutoTrackingResponse>;
}
