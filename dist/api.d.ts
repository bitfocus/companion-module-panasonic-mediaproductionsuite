import type { ModuleConfig } from './config.js';
export interface ApiResponse {
    Command: string;
    Parameter: string;
    Response: 'ack' | 'nack';
    NACKDetail?: string;
    FramingState?: FramingStateData[];
}
export interface FramingStateData {
    AutoFaceSearch: boolean;
    AutoZoom: boolean;
    FramingEnable: number;
    FramingStartStop: number;
    FramingStatus: number;
    TargetFace: {
        list_id: number[];
        name: string[];
    };
    TrackingControl: {
        AutoZoomSpeed: number;
        PanTiltSpeed: number;
        Sensitivity: number;
    };
    auto_start_area: {
        AutoStartAreaEnable: number;
        polygon: number[][];
    };
    camera_info?: {
        IP_address: string;
        PanTiltLimitUDLR: number[];
        guid: string;
        id: number;
        name: string;
        powermode: number;
    };
    mask_area: {
        polygon_array: number[][][];
    };
    person: PersonData[];
    ptz_status: {
        ptz_move: boolean;
    };
    selected_id: number;
    target_id: number[];
    target_frame: {
        pos_x: number;
        pos_y: number;
        zoom: number;
    };
}
export interface PersonData {
    body: {
        height: number;
        width: number;
        x: number;
        y: number;
    };
    head: {
        height: number;
        width: number;
        x: number;
        y: number;
    };
    id: number;
    name: string;
}
export declare class PanasonicAutoFramingApi {
    private config;
    private log;
    constructor(config: ModuleConfig, log: (level: 'info' | 'warn' | 'error' | 'debug', message: string) => void);
    updateConfig(config: ModuleConfig): void;
    private buildUrl;
    sendCommand(cmd: string, params: Record<string, string | number>): Promise<ApiResponse>;
    framingEnable(id: number, enable: boolean): Promise<ApiResponse>;
    framingStartStop(id: number, process: 'start' | 'stop'): Promise<ApiResponse>;
    framingState(id: number): Promise<ApiResponse>;
    trackingControl(id: number, options: {
        pt_speed?: number;
        z_speed?: number;
        sensitivity?: number;
    }): Promise<ApiResponse>;
    autoFaceSearch(id: number, mode: 0 | 1): Promise<ApiResponse>;
    preset(id: number, mode: 'set' | 'clear' | 'recall', preset_num: number): Promise<ApiResponse>;
    targetFrame(id: number, mode: 'set' | 'clear' | 'recall', preset_num: number): Promise<ApiResponse>;
    targetPosition(id: number, mode: 'select' | 'plus' | 'minus', target_x: number, target_y: number, on_ref_cam?: number): Promise<ApiResponse>;
    targetFace(id: number, mode: 'select' | 'clear', options?: {
        face_id?: string;
        name?: string;
    }): Promise<ApiResponse>;
    autoZoom(id: number, mode: 0 | 1): Promise<ApiResponse>;
    autoStartArea(id: number, mode: 0 | 1, area?: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): Promise<ApiResponse>;
    maskArea(id: number, area_id: number, area?: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): Promise<ApiResponse>;
    frameMapping(id: number): Promise<ApiResponse>;
    currentFrame(id: number, mode: 'absolute' | 'relative', options?: {
        target_x?: number;
        target_y?: number;
        auto_zoom_ratio?: number;
    }): Promise<ApiResponse>;
    getImageUrl(category: 'CurrentFrame' | 'TargetFrame' | 'AdvancedPreset', id: number, number?: number): string;
    getImage(category: 'CurrentFrame' | 'TargetFrame' | 'AdvancedPreset', id: number, number?: number): Promise<Buffer | null>;
    clearMaskArea(id: number, area_id: number): Promise<ApiResponse>;
}
