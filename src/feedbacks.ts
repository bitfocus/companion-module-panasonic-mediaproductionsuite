import { combineRgb, type CompanionFeedbackDefinitions, type DropdownChoice } from '@companion-module/base'
import type { PanasonicAutoFramingInstance } from './main.js'

export function getFeedbacks(instance: PanasonicAutoFramingInstance): CompanionFeedbackDefinitions {
        const cameraIdChoices: DropdownChoice[] = []
        for (let i = 1; i <= 20; i++) {
                cameraIdChoices.push({ id: i, label: `Camera ${i}` })
        }

        return {
                framingEnabled: {
                        type: 'boolean',
                        name: 'Framing Enabled',
                        description: 'Check if Auto Framing is enabled for a camera',
                        defaultStyle: {
                                bgcolor: combineRgb(0, 204, 0),
                                color: combineRgb(0, 0, 0),
                        },
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: (feedback) => {
                                const cameraId = Number(feedback.options.camera_id)
                                const state = instance.cameraStates.get(cameraId)
                                return state?.FramingEnable !== undefined && state.FramingEnable > 0
                        },
                },

                framingRunning: {
                        type: 'boolean',
                        name: 'Framing Running',
                        description: 'Check if tracking is currently running',
                        defaultStyle: {
                                bgcolor: combineRgb(0, 204, 0),
                                color: combineRgb(0, 0, 0),
                        },
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: (feedback) => {
                                const cameraId = Number(feedback.options.camera_id)
                                const state = instance.cameraStates.get(cameraId)
                                return state?.FramingStartStop === 1
                        },
                },

                framingStatus: {
                        type: 'boolean',
                        name: 'Framing Status',
                        description: 'Check current framing status',
                        defaultStyle: {
                                bgcolor: combineRgb(0, 204, 0),
                                color: combineRgb(0, 0, 0),
                        },
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                                {
                                        type: 'dropdown',
                                        id: 'status',
                                        label: 'Status',
                                        choices: [
                                                { id: 0, label: 'Stopped' },
                                                { id: 1, label: 'Tracking' },
                                                { id: 2, label: 'Lost' },
                                                { id: 3, label: 'Searching' },
                                        ],
                                        default: 1,
                                },
                        ],
                        callback: (feedback) => {
                                const cameraId = Number(feedback.options.camera_id)
                                const targetStatus = Number(feedback.options.status)
                                const state = instance.cameraStates.get(cameraId)
                                return state?.FramingStatus === targetStatus
                        },
                },

                autoZoomEnabled: {
                        type: 'boolean',
                        name: 'Auto Zoom Enabled',
                        description: 'Check if Auto Zoom is enabled',
                        defaultStyle: {
                                bgcolor: combineRgb(0, 153, 204),
                                color: combineRgb(255, 255, 255),
                        },
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: (feedback) => {
                                const cameraId = Number(feedback.options.camera_id)
                                const state = instance.cameraStates.get(cameraId)
                                return state?.AutoZoom === true
                        },
                },

                autoFaceSearchEnabled: {
                        type: 'boolean',
                        name: 'Auto Face Search Enabled',
                        description: 'Check if Auto Face Search is enabled',
                        defaultStyle: {
                                bgcolor: combineRgb(204, 102, 0),
                                color: combineRgb(255, 255, 255),
                        },
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: (feedback) => {
                                const cameraId = Number(feedback.options.camera_id)
                                const state = instance.cameraStates.get(cameraId)
                                return state?.AutoFaceSearch === true
                        },
                },

                ptzMoving: {
                        type: 'boolean',
                        name: 'PTZ Moving',
                        description: 'Check if camera PTZ is currently moving',
                        defaultStyle: {
                                bgcolor: combineRgb(255, 204, 0),
                                color: combineRgb(0, 0, 0),
                        },
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: (feedback) => {
                                const cameraId = Number(feedback.options.camera_id)
                                const state = instance.cameraStates.get(cameraId)
                                return state?.ptz_status?.ptz_move === true
                        },
                },

                hasTargets: {
                        type: 'boolean',
                        name: 'Has Tracking Targets',
                        description: 'Check if camera has active tracking targets',
                        defaultStyle: {
                                bgcolor: combineRgb(102, 51, 153),
                                color: combineRgb(255, 255, 255),
                        },
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: (feedback) => {
                                const cameraId = Number(feedback.options.camera_id)
                                const state = instance.cameraStates.get(cameraId)
                                return state?.target_id !== undefined && state.target_id.length > 0
                        },
                },

                personDetected: {
                        type: 'boolean',
                        name: 'Person Detected',
                        description: 'Check if any person is detected in the frame',
                        defaultStyle: {
                                bgcolor: combineRgb(0, 102, 204),
                                color: combineRgb(255, 255, 255),
                        },
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: (feedback) => {
                                const cameraId = Number(feedback.options.camera_id)
                                const state = instance.cameraStates.get(cameraId)
                                return state?.person !== undefined && state.person.length > 0
                        },
                },

                autoStartAreaEnabled: {
                        type: 'boolean',
                        name: 'Auto Start Area Enabled',
                        description: 'Check if Auto Start Area is enabled',
                        defaultStyle: {
                                bgcolor: combineRgb(153, 102, 51),
                                color: combineRgb(255, 255, 255),
                        },
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: (feedback) => {
                                const cameraId = Number(feedback.options.camera_id)
                                const state = instance.cameraStates.get(cameraId)
                                return state?.auto_start_area?.AutoStartAreaEnable === 1
                        },
                },

                atTrackingActive: {
                        type: 'boolean',
                        name: 'Auto Tracking: Tracking Active',
                        description: 'Check if Auto Tracking is currently tracking',
                        defaultStyle: {
                                bgcolor: combineRgb(0, 204, 0),
                                color: combineRgb(0, 0, 0),
                        },
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: (feedback) => {
                                const cameraId = Number(feedback.options.camera_id)
                                const state = instance.autoTrackingStates.get(cameraId)
                                return state?.tracking === 1
                        },
                },

                atDetectionActive: {
                        type: 'boolean',
                        name: 'Auto Tracking: Detection Active',
                        description: 'Check if person detection is active',
                        defaultStyle: {
                                bgcolor: combineRgb(0, 153, 204),
                                color: combineRgb(255, 255, 255),
                        },
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: (feedback) => {
                                const cameraId = Number(feedback.options.camera_id)
                                const state = instance.autoTrackingStates.get(cameraId)
                                return state?.detection === 1
                        },
                },

                atConnectionState: {
                        type: 'boolean',
                        name: 'Auto Tracking: Camera Connected',
                        description: 'Check if camera is connected for Auto Tracking',
                        defaultStyle: {
                                bgcolor: combineRgb(0, 204, 0),
                                color: combineRgb(0, 0, 0),
                        },
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: (feedback) => {
                                const cameraId = Number(feedback.options.camera_id)
                                const state = instance.autoTrackingStates.get(cameraId)
                                return state?.connection === 1
                        },
                },

                vmPgmCell: {
                        type: 'boolean',
                        name: 'Video Mixer: PGM Cell Active',
                        description: 'Check if a specific cell is active as PGM',
                        defaultStyle: {
                                bgcolor: combineRgb(204, 0, 0),
                                color: combineRgb(255, 255, 255),
                        },
                        options: [
                                {
                                        type: 'number',
                                        id: 'cell',
                                        label: 'Cell Number',
                                        default: 1,
                                        min: 1,
                                        max: 14,
                                },
                        ],
                        callback: (feedback) => {
                                const cell = Number(feedback.options.cell)
                                return instance.videoMixerPgmCell === cell
                        },
                },

                vmEnabled: {
                        type: 'boolean',
                        name: 'Video Mixer: Enabled',
                        description: 'Check if Video Mixer is enabled',
                        defaultStyle: {
                                bgcolor: combineRgb(0, 204, 0),
                                color: combineRgb(0, 0, 0),
                        },
                        options: [],
                        callback: () => {
                                return instance.videoMixerEnabled
                        },
                },

                licenseActivated: {
                        type: 'boolean',
                        name: 'License: Plugin Activated',
                        description: 'Check if a plugin has an activated license',
                        defaultStyle: {
                                bgcolor: combineRgb(0, 204, 0),
                                color: combineRgb(0, 0, 0),
                        },
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'plugin',
                                        label: 'Plugin',
                                        choices: [
                                                { id: 'Auto Framing Plugin', label: 'Auto Framing Plugin' },
                                                { id: 'Auto Tracking Plugin', label: 'Auto Tracking Plugin' },
                                                { id: 'Video Mixer Plugin', label: 'Video Mixer Plugin' },
                                        ],
                                        default: 'Auto Framing Plugin',
                                },
                        ],
                        callback: (feedback) => {
                                const pluginName = String(feedback.options.plugin)
                                const plugin = instance.licenseData.find((p) => p.PluginName === pluginName)
                                return plugin?.LicenseState === 'Activated'
                        },
                },
        }
}
