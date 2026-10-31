import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
        host: string
        port: number
        mpsPort: number
        pollInterval: number
        cameraCount: number
        pollAutoTracking: boolean
        pollVideoMixer: boolean
}

export function getConfigFields(): SomeCompanionConfigField[] {
        return [
                {
                        type: 'textinput',
                        id: 'host',
                        label: 'IP Address',
                        width: 12,
                        regex: Regex.IP,
                        default: '192.168.0.200',
                        tooltip: 'IP address of the PC running Media Production Suite',
                },
                {
                        type: 'number',
                        id: 'port',
                        label: 'Auto Framing Port',
                        width: 4,
                        default: 1338,
                        min: 1,
                        max: 65535,
                        tooltip: 'Auto Framing Plugin port (default: 1338)',
                },
                {
                        type: 'number',
                        id: 'mpsPort',
                        label: 'MPS Port',
                        width: 4,
                        default: 1337,
                        min: 1,
                        max: 65535,
                        tooltip: 'Media Production Suite port for License, Video Mixer, Auto Tracking (default: 1337)',
                },
                {
                        type: 'number',
                        id: 'pollInterval',
                        label: 'Poll Interval (ms)',
                        width: 4,
                        default: 1000,
                        min: 200,
                        max: 10000,
                        tooltip: 'How often to poll for camera status (in milliseconds)',
                },
                {
                        type: 'number',
                        id: 'cameraCount',
                        label: 'Camera Count',
                        width: 4,
                        default: 10,
                        min: 1,
                        max: 100,
                        tooltip: 'Maximum number of cameras to poll',
                },
                {
                        type: 'checkbox',
                        id: 'pollAutoTracking',
                        label: 'Poll Auto Tracking Plugin',
                        width: 6,
                        default: false,
                        tooltip: 'Poll Auto Tracking status on port 1337. Leave disabled if this plugin is not in use.',
                },
                {
                        type: 'checkbox',
                        id: 'pollVideoMixer',
                        label: 'Poll Video Mixer Plugin',
                        width: 6,
                        default: false,
                        tooltip: 'Poll Video Mixer status on port 1337. Leave disabled if this plugin is not in use.',
                },
        ]
}
