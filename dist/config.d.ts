import { type SomeCompanionConfigField } from '@companion-module/base';
export interface ModuleConfig {
    host: string;
    port: number;
    mpsPort: number;
    pollInterval: number;
    cameraCount: number;
}
export declare function getConfigFields(): SomeCompanionConfigField[];
