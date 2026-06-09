import type { ModuleConfig } from './config.js';
export interface LicenseApiResponse {
    Command: string;
    Response: 'ack' | 'nack';
    NACKDetail?: string;
    LicenseData?: LicenseData[];
}
export interface LicenseData {
    PluginName: string;
    LicenseState: 'Initial' | 'Activated' | 'Deactivated' | 'In Trial' | 'Trial Expired' | 'License Expired' | 'Duplicated';
    RemainDays: number | null;
    TotalLicenseCount: number;
    UsedLicenseCount: number;
    LicensedDevice: LicensedDevice[] | null;
}
export interface LicensedDevice {
    'IP Address': string;
    Name: string;
}
export declare class LicenseApi {
    private config;
    private log;
    constructor(config: ModuleConfig, log: (level: 'info' | 'warn' | 'error' | 'debug', message: string) => void);
    updateConfig(config: ModuleConfig): void;
    private buildUrl;
    private sendCommand;
    getLicenseData(): Promise<LicenseApiResponse>;
}
