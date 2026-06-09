import type { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import type { FramingStateData } from './api.js'
import type { CameraStateResponse } from './auto-tracking-api.js'
import type { LicenseData } from './license-api.js'

export function getVariableDefinitions(): CompanionVariableDefinition[] {
        const variables: CompanionVariableDefinition[] = []

        for (let cam = 1; cam <= 10; cam++) {
                variables.push(
                        {
                                variableId: `cam${cam}_name`,
                                name: `Camera ${cam} Name`,
                        },
                        {
                                variableId: `cam${cam}_ip`,
                                name: `Camera ${cam} IP Address`,
                        },
                        {
                                variableId: `cam${cam}_framing_enabled`,
                                name: `Camera ${cam} Framing Enabled`,
                        },
                        {
                                variableId: `cam${cam}_framing_running`,
                                name: `Camera ${cam} Framing Running`,
                        },
                        {
                                variableId: `cam${cam}_framing_status`,
                                name: `Camera ${cam} Framing Status`,
                        },
                        {
                                variableId: `cam${cam}_auto_zoom`,
                                name: `Camera ${cam} Auto Zoom`,
                        },
                        {
                                variableId: `cam${cam}_auto_face_search`,
                                name: `Camera ${cam} Auto Face Search`,
                        },
                        {
                                variableId: `cam${cam}_person_count`,
                                name: `Camera ${cam} Person Count`,
                        },
                        {
                                variableId: `cam${cam}_target_count`,
                                name: `Camera ${cam} Target Count`,
                        },
                        {
                                variableId: `cam${cam}_ptz_moving`,
                                name: `Camera ${cam} PTZ Moving`,
                        },
                        {
                                variableId: `cam${cam}_target_zoom`,
                                name: `Camera ${cam} Target Zoom`,
                        },
                        {
                                variableId: `cam${cam}_pt_speed`,
                                name: `Camera ${cam} Pan/Tilt Speed`,
                        },
                        {
                                variableId: `cam${cam}_z_speed`,
                                name: `Camera ${cam} Zoom Speed`,
                        },
                        {
                                variableId: `cam${cam}_sensitivity`,
                                name: `Camera ${cam} Sensitivity`,
                        },
                        {
                                variableId: `cam${cam}_at_tracking`,
                                name: `Camera ${cam} Auto Tracking`,
                        },
                        {
                                variableId: `cam${cam}_at_detection`,
                                name: `Camera ${cam} AT Detection`,
                        },
                        {
                                variableId: `cam${cam}_at_connection`,
                                name: `Camera ${cam} AT Connection`,
                        },
                        {
                                variableId: `cam${cam}_at_angle`,
                                name: `Camera ${cam} AT Angle Mode`,
                        }
                )
        }

        variables.push(
                {
                        variableId: 'vm_pgm_cell',
                        name: 'Video Mixer PGM Cell',
                },
                {
                        variableId: 'vm_layout',
                        name: 'Video Mixer Layout',
                },
                {
                        variableId: 'vm_enabled',
                        name: 'Video Mixer Enabled',
                },
                {
                        variableId: 'vm_volume',
                        name: 'Video Mixer Volume',
                },
                {
                        variableId: 'license_autoframing',
                        name: 'Auto Framing License Status',
                },
                {
                        variableId: 'license_autotracking',
                        name: 'Auto Tracking License Status',
                },
                {
                        variableId: 'license_videomixer',
                        name: 'Video Mixer License Status',
                }
        )

        return variables
}

export function getFramingStatusText(status: number): string {
        switch (status) {
                case 0:
                        return 'Stopped'
                case 1:
                        return 'Tracking'
                case 2:
                        return 'Lost'
                case 3:
                        return 'Searching'
                default:
                        return 'Unknown'
        }
}

export function getFramingEnableText(enable: number): string {
        switch (enable) {
                case 0:
                        return 'Off'
                case 1:
                        return 'Built-in'
                case 2:
                        return 'PC_GPU'
                case 6:
                        return 'Reference'
                default:
                        return 'Unknown'
        }
}

export function updateVariablesFromState(cameraId: number, state: FramingStateData): CompanionVariableValues {
        const values: CompanionVariableValues = {}

        values[`cam${cameraId}_framing_enabled`] = getFramingEnableText(state.FramingEnable)
        values[`cam${cameraId}_framing_running`] = state.FramingStartStop === 1 ? 'Running' : 'Stopped'
        values[`cam${cameraId}_framing_status`] = getFramingStatusText(state.FramingStatus)
        values[`cam${cameraId}_auto_zoom`] = state.AutoZoom ? 'On' : 'Off'
        values[`cam${cameraId}_auto_face_search`] = state.AutoFaceSearch ? 'On' : 'Off'
        values[`cam${cameraId}_person_count`] = state.person?.length ?? 0
        values[`cam${cameraId}_target_count`] = state.target_id?.length ?? 0
        values[`cam${cameraId}_ptz_moving`] = state.ptz_status?.ptz_move ? 'Moving' : 'Idle'
        values[`cam${cameraId}_target_zoom`] = state.target_frame?.zoom ?? 0
        values[`cam${cameraId}_pt_speed`] = state.TrackingControl?.PanTiltSpeed ?? 0
        values[`cam${cameraId}_z_speed`] = state.TrackingControl?.AutoZoomSpeed ?? 0
        values[`cam${cameraId}_sensitivity`] = state.TrackingControl?.Sensitivity ?? 0

        if (state.camera_info) {
                values[`cam${cameraId}_name`] = state.camera_info.name
                values[`cam${cameraId}_ip`] = state.camera_info.IP_address
        }

        return values
}

export function getAngleModeText(angle: number | undefined): string {
        switch (angle) {
                case 0:
                        return 'Upper'
                case 1:
                        return 'Body'
                case 2:
                        return 'Full'
                case 3:
                        return 'Off'
                default:
                        return 'Unknown'
        }
}

export function updateVariablesFromAutoTracking(cameraId: number, state: CameraStateResponse): CompanionVariableValues {
        const values: CompanionVariableValues = {}

        values[`cam${cameraId}_at_tracking`] = state.tracking === 1 ? 'Active' : 'Inactive'
        values[`cam${cameraId}_at_detection`] = state.detection === 1 ? 'Active' : 'Inactive'
        values[`cam${cameraId}_at_connection`] = state.connection === 1 ? 'Connected' : 'Disconnected'
        values[`cam${cameraId}_at_angle`] = getAngleModeText(state.angle)

        return values
}

export function updateVideoMixerVariables(pgmCell: number, layout: number, enabled: boolean, volume?: number): CompanionVariableValues {
        const values: CompanionVariableValues = {
                vm_pgm_cell: pgmCell,
                vm_layout: layout,
                vm_enabled: enabled ? 'Enabled' : 'Disabled',
        }
        if (volume !== undefined) {
                values.vm_volume = volume
        }
        return values
}

export function updateLicenseVariables(licenseData: LicenseData[]): CompanionVariableValues {
        const values: CompanionVariableValues = {}

        for (const license of licenseData) {
                if (license.PluginName === 'Auto Framing Plugin') {
                        values.license_autoframing = license.LicenseState
                } else if (license.PluginName === 'Auto Tracking Plugin') {
                        values.license_autotracking = license.LicenseState
                } else if (license.PluginName === 'Video Mixer Plugin') {
                        values.license_videomixer = license.LicenseState
                }
        }

        return values
}
