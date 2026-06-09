import type { CompanionActionDefinitions, DropdownChoice } from '@companion-module/base'
import type { PanasonicAutoFramingInstance } from './main.js'

export function getActions(instance: PanasonicAutoFramingInstance): CompanionActionDefinitions {
        const cameraIdChoices: DropdownChoice[] = []
        for (let i = 1; i <= 20; i++) {
                cameraIdChoices.push({ id: i, label: `Camera ${i}` })
        }

        const presetChoices: DropdownChoice[] = []
        for (let i = 1; i <= 20; i++) {
                presetChoices.push({ id: i, label: `Preset ${i}` })
        }

        const speedChoices: DropdownChoice[] = [
                { id: -2, label: 'Very Slow (-2)' },
                { id: -1, label: 'Slow (-1)' },
                { id: 0, label: 'Normal (0)' },
                { id: 1, label: 'Fast (1)' },
                { id: 2, label: 'Very Fast (2)' },
        ]

        const maskAreaChoices: DropdownChoice[] = [
                { id: 1, label: 'Mask Area 1' },
                { id: 2, label: 'Mask Area 2' },
                { id: 3, label: 'Mask Area 3' },
        ]

        return {
                framingEnable: {
                        name: 'Framing Enable',
                        description: 'Enable or disable Auto Framing for a camera',
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
                                        id: 'enable',
                                        label: 'Enable',
                                        choices: [
                                                { id: 'on', label: 'On' },
                                                { id: 'off', label: 'Off' },
                                        ],
                                        default: 'on',
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const enable = action.options.enable === 'on'
                                await instance.api?.framingEnable(cameraId, enable)
                        },
                },

                framingStart: {
                        name: 'Framing Start',
                        description: 'Start tracking framing for a camera',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                await instance.api?.framingStartStop(cameraId, 'start')
                        },
                },

                framingStop: {
                        name: 'Framing Stop',
                        description: 'Stop tracking framing for a camera',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                await instance.api?.framingStartStop(cameraId, 'stop')
                        },
                },

                framingToggle: {
                        name: 'Framing Start/Stop Toggle',
                        description: 'Toggle tracking framing for a camera',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const state = instance.cameraStates.get(cameraId)
                                const isRunning = state?.FramingStartStop === 1
                                await instance.api?.framingStartStop(cameraId, isRunning ? 'stop' : 'start')
                        },
                },

                trackingControl: {
                        name: 'Tracking Control',
                        description: 'Set framing speed and sensitivity',
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
                                        id: 'pt_speed',
                                        label: 'Pan/Tilt Speed',
                                        choices: [{ id: 'unchanged', label: 'Unchanged' }, ...speedChoices],
                                        default: 'unchanged',
                                },
                                {
                                        type: 'dropdown',
                                        id: 'z_speed',
                                        label: 'Zoom Speed',
                                        choices: [{ id: 'unchanged', label: 'Unchanged' }, ...speedChoices],
                                        default: 'unchanged',
                                },
                                {
                                        type: 'dropdown',
                                        id: 'sensitivity',
                                        label: 'Sensitivity',
                                        choices: [{ id: 'unchanged', label: 'Unchanged' }, ...speedChoices],
                                        default: 'unchanged',
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const options: { pt_speed?: number; z_speed?: number; sensitivity?: number } = {}
                                if (action.options.pt_speed !== 'unchanged') options.pt_speed = Number(action.options.pt_speed)
                                if (action.options.z_speed !== 'unchanged') options.z_speed = Number(action.options.z_speed)
                                if (action.options.sensitivity !== 'unchanged') options.sensitivity = Number(action.options.sensitivity)
                                await instance.api?.trackingControl(cameraId, options)
                        },
                },

                autoFaceSearch: {
                        name: 'Auto Face Search',
                        description: 'Enable or disable Auto Face Search',
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
                                        id: 'mode',
                                        label: 'Mode',
                                        choices: [
                                                { id: 1, label: 'Enable' },
                                                { id: 0, label: 'Disable' },
                                        ],
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const mode = Number(action.options.mode) as 0 | 1
                                await instance.api?.autoFaceSearch(cameraId, mode)
                        },
                },

                presetRecall: {
                        name: 'Advanced Preset Recall',
                        description: 'Recall an Advanced Preset',
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
                                        id: 'preset_num',
                                        label: 'Preset Number',
                                        choices: presetChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const presetNum = Number(action.options.preset_num)
                                await instance.api?.preset(cameraId, 'recall', presetNum)
                        },
                },

                presetSet: {
                        name: 'Advanced Preset Set',
                        description: 'Save current position to an Advanced Preset',
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
                                        id: 'preset_num',
                                        label: 'Preset Number',
                                        choices: presetChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const presetNum = Number(action.options.preset_num)
                                await instance.api?.preset(cameraId, 'set', presetNum)
                        },
                },

                presetClear: {
                        name: 'Advanced Preset Clear',
                        description: 'Clear an Advanced Preset',
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
                                        id: 'preset_num',
                                        label: 'Preset Number',
                                        choices: presetChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const presetNum = Number(action.options.preset_num)
                                await instance.api?.preset(cameraId, 'clear', presetNum)
                        },
                },

                targetFrameRecall: {
                        name: 'Target Frame Recall',
                        description: 'Recall a Target Frame preset',
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
                                        id: 'preset_num',
                                        label: 'Preset Number',
                                        choices: presetChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const presetNum = Number(action.options.preset_num)
                                await instance.api?.targetFrame(cameraId, 'recall', presetNum)
                        },
                },

                targetFrameSet: {
                        name: 'Target Frame Set',
                        description: 'Save current frame as Target Frame preset',
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
                                        id: 'preset_num',
                                        label: 'Preset Number',
                                        choices: presetChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const presetNum = Number(action.options.preset_num)
                                await instance.api?.targetFrame(cameraId, 'set', presetNum)
                        },
                },

                targetFrameClear: {
                        name: 'Target Frame Clear',
                        description: 'Clear a Target Frame preset',
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
                                        id: 'preset_num',
                                        label: 'Preset Number',
                                        choices: presetChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const presetNum = Number(action.options.preset_num)
                                await instance.api?.targetFrame(cameraId, 'clear', presetNum)
                        },
                },

                targetPosition: {
                        name: 'Target Position',
                        description: 'Select, add, or remove framing targets at coordinates',
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
                                        id: 'mode',
                                        label: 'Mode',
                                        choices: [
                                                { id: 'select', label: 'Select' },
                                                { id: 'plus', label: 'Add (+)' },
                                                { id: 'minus', label: 'Remove (-)' },
                                        ],
                                        default: 'select',
                                },
                                {
                                        type: 'number',
                                        id: 'target_x',
                                        label: 'X Coordinate (0-1920)',
                                        default: 960,
                                        min: 0,
                                        max: 1920,
                                },
                                {
                                        type: 'number',
                                        id: 'target_y',
                                        label: 'Y Coordinate (0-1080)',
                                        default: 540,
                                        min: 0,
                                        max: 1080,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const mode = String(action.options.mode) as 'select' | 'plus' | 'minus'
                                const targetX = Number(action.options.target_x)
                                const targetY = Number(action.options.target_y)
                                await instance.api?.targetPosition(cameraId, mode, targetX, targetY)
                        },
                },

                targetFaceSelect: {
                        name: 'Target Face Select',
                        description: 'Select face(s) for tracking by ID or name',
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
                                        id: 'select_by',
                                        label: 'Select By',
                                        choices: [
                                                { id: 'id', label: 'Face ID' },
                                                { id: 'name', label: 'Name' },
                                        ],
                                        default: 'id',
                                },
                                {
                                        type: 'textinput',
                                        id: 'value',
                                        label: 'Face ID(s) or Name(s) (comma-separated)',
                                        default: '1',
                                        tooltip: 'For IDs: 1,2,3. For names: "BOB","EMI"',
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const selectBy = String(action.options.select_by)
                                const value = String(action.options.value)
                                const options = selectBy === 'id' ? { face_id: value } : { name: value }
                                await instance.api?.targetFace(cameraId, 'select', options)
                        },
                },

                targetFaceClear: {
                        name: 'Target Face Clear',
                        description: 'Clear face selection',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                await instance.api?.targetFace(cameraId, 'clear')
                        },
                },

                autoZoom: {
                        name: 'Auto Zoom',
                        description: 'Enable or disable Auto Zoom',
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
                                        id: 'mode',
                                        label: 'Mode',
                                        choices: [
                                                { id: 1, label: 'Enable' },
                                                { id: 0, label: 'Disable' },
                                        ],
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const mode = Number(action.options.mode) as 0 | 1
                                await instance.api?.autoZoom(cameraId, mode)
                        },
                },

                autoZoomToggle: {
                        name: 'Auto Zoom Toggle',
                        description: 'Toggle Auto Zoom on/off',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const state = instance.cameraStates.get(cameraId)
                                const isEnabled = state?.AutoZoom === true
                                await instance.api?.autoZoom(cameraId, isEnabled ? 0 : 1)
                        },
                },

                autoStartArea: {
                        name: 'Auto Start Area',
                        description: 'Configure Auto Start Area',
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
                                        id: 'mode',
                                        label: 'Mode',
                                        choices: [
                                                { id: 1, label: 'Enable' },
                                                { id: 0, label: 'Disable' },
                                        ],
                                        default: 1,
                                },
                                {
                                        type: 'number',
                                        id: 'area_x',
                                        label: 'Area X (optional)',
                                        default: 0,
                                        min: 0,
                                        max: 1920,
                                },
                                {
                                        type: 'number',
                                        id: 'area_y',
                                        label: 'Area Y (optional)',
                                        default: 0,
                                        min: 0,
                                        max: 1080,
                                },
                                {
                                        type: 'number',
                                        id: 'area_width',
                                        label: 'Area Width (optional)',
                                        default: 1920,
                                        min: 0,
                                        max: 1920,
                                },
                                {
                                        type: 'number',
                                        id: 'area_height',
                                        label: 'Area Height (optional)',
                                        default: 1080,
                                        min: 0,
                                        max: 1080,
                                },
                                {
                                        type: 'checkbox',
                                        id: 'use_area',
                                        label: 'Set Area Coordinates',
                                        default: false,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const mode = Number(action.options.mode) as 0 | 1
                                const useArea = Boolean(action.options.use_area)
                                const area = useArea
                                        ? {
                                                        x: Number(action.options.area_x),
                                                        y: Number(action.options.area_y),
                                                        width: Number(action.options.area_width),
                                                        height: Number(action.options.area_height),
                                                }
                                        : undefined
                                await instance.api?.autoStartArea(cameraId, mode, area)
                        },
                },

                maskArea: {
                        name: 'Mask Area',
                        description: 'Configure Mask Area',
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
                                        id: 'area_id',
                                        label: 'Mask Area Number',
                                        choices: maskAreaChoices,
                                        default: 1,
                                },
                                {
                                        type: 'number',
                                        id: 'area_x',
                                        label: 'Area X',
                                        default: 0,
                                        min: 0,
                                        max: 1920,
                                },
                                {
                                        type: 'number',
                                        id: 'area_y',
                                        label: 'Area Y',
                                        default: 0,
                                        min: 0,
                                        max: 1080,
                                },
                                {
                                        type: 'number',
                                        id: 'area_width',
                                        label: 'Area Width',
                                        default: 200,
                                        min: 0,
                                        max: 1920,
                                },
                                {
                                        type: 'number',
                                        id: 'area_height',
                                        label: 'Area Height',
                                        default: 200,
                                        min: 0,
                                        max: 1080,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const areaId = Number(action.options.area_id)
                                const area = {
                                        x: Number(action.options.area_x),
                                        y: Number(action.options.area_y),
                                        width: Number(action.options.area_width),
                                        height: Number(action.options.area_height),
                                }
                                await instance.api?.maskArea(cameraId, areaId, area)
                        },
                },

                frameMapping: {
                        name: 'Frame Mapping',
                        description: 'Execute Frame Mapping',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                await instance.api?.frameMapping(cameraId)
                        },
                },

                currentFrameAbsolute: {
                        name: 'Current Frame (Absolute)',
                        description: 'Adjust current framing using absolute coordinates',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                                {
                                        type: 'number',
                                        id: 'target_x',
                                        label: 'Target X (0-1920)',
                                        default: 960,
                                        min: 0,
                                        max: 1920,
                                },
                                {
                                        type: 'number',
                                        id: 'target_y',
                                        label: 'Target Y (0-1080)',
                                        default: 540,
                                        min: 0,
                                        max: 1080,
                                },
                                {
                                        type: 'number',
                                        id: 'auto_zoom_ratio',
                                        label: 'Zoom Ratio (10-70, 0 = unchanged)',
                                        default: 0,
                                        min: 0,
                                        max: 70,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const options: { target_x?: number; target_y?: number; auto_zoom_ratio?: number } = {
                                        target_x: Number(action.options.target_x),
                                        target_y: Number(action.options.target_y),
                                }
                                const zoomRatio = Number(action.options.auto_zoom_ratio)
                                if (zoomRatio >= 10) {
                                        options.auto_zoom_ratio = zoomRatio
                                }
                                await instance.api?.currentFrame(cameraId, 'absolute', options)
                        },
                },

                currentFrameRelative: {
                        name: 'Current Frame (Relative)',
                        description: 'Adjust current framing using relative values',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                                {
                                        type: 'number',
                                        id: 'target_x',
                                        label: 'Target X (-100 to 100)',
                                        default: 0,
                                        min: -100,
                                        max: 100,
                                },
                                {
                                        type: 'number',
                                        id: 'target_y',
                                        label: 'Target Y (-100 to 100)',
                                        default: 0,
                                        min: -100,
                                        max: 100,
                                },
                                {
                                        type: 'number',
                                        id: 'auto_zoom_ratio',
                                        label: 'Zoom Change (-60 to 60)',
                                        default: 0,
                                        min: -60,
                                        max: 60,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const options: { target_x?: number; target_y?: number; auto_zoom_ratio?: number } = {}
                                const targetX = Number(action.options.target_x)
                                const targetY = Number(action.options.target_y)
                                const zoomRatio = Number(action.options.auto_zoom_ratio)
                                if (targetX !== 0) options.target_x = targetX
                                if (targetY !== 0) options.target_y = targetY
                                if (zoomRatio !== 0) options.auto_zoom_ratio = zoomRatio
                                await instance.api?.currentFrame(cameraId, 'relative', options)
                        },
                },

                panLeft: {
                        name: 'Pan Left',
                        description: 'Pan the current frame left (relative: -100~100 step, absolute: 0~1920 pixel)',
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
                                        id: 'mode',
                                        label: 'Mode',
                                        choices: [
                                                { id: 'relative', label: 'Relative (-100~100)' },
                                                { id: 'absolute', label: 'Absolute (0~1920x1080)' },
                                        ],
                                        default: 'relative',
                                },
                                {
                                        type: 'number',
                                        id: 'target_x',
                                        label: 'Target X (relative: -100~100, absolute: 0~1920)',
                                        default: -10,
                                        min: -100,
                                        max: 1920,
                                },
                                {
                                        type: 'number',
                                        id: 'target_y',
                                        label: 'Target Y (relative: -100~100, absolute: 0~1080)',
                                        default: 0,
                                        min: -100,
                                        max: 1080,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const mode = String(action.options.mode) as 'relative' | 'absolute'
                                const targetX = Number(action.options.target_x)
                                const targetY = Number(action.options.target_y)
                                await instance.api?.currentFrame(cameraId, mode, { target_x: targetX, target_y: targetY })
                        },
                },

                panRight: {
                        name: 'Pan Right',
                        description: 'Pan the current frame right (relative: -100~100 step, absolute: 0~1920 pixel)',
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
                                        id: 'mode',
                                        label: 'Mode',
                                        choices: [
                                                { id: 'relative', label: 'Relative (-100~100)' },
                                                { id: 'absolute', label: 'Absolute (0~1920x1080)' },
                                        ],
                                        default: 'relative',
                                },
                                {
                                        type: 'number',
                                        id: 'target_x',
                                        label: 'Target X (relative: -100~100, absolute: 0~1920)',
                                        default: 10,
                                        min: -100,
                                        max: 1920,
                                },
                                {
                                        type: 'number',
                                        id: 'target_y',
                                        label: 'Target Y (relative: -100~100, absolute: 0~1080)',
                                        default: 0,
                                        min: -100,
                                        max: 1080,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const mode = String(action.options.mode) as 'relative' | 'absolute'
                                const targetX = Number(action.options.target_x)
                                const targetY = Number(action.options.target_y)
                                await instance.api?.currentFrame(cameraId, mode, { target_x: targetX, target_y: targetY })
                        },
                },

                tiltUp: {
                        name: 'Tilt Up',
                        description: 'Tilt the current frame up (relative: -100~100 step, absolute: 0~1080 pixel)',
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
                                        id: 'mode',
                                        label: 'Mode',
                                        choices: [
                                                { id: 'relative', label: 'Relative (-100~100)' },
                                                { id: 'absolute', label: 'Absolute (0~1920x1080)' },
                                        ],
                                        default: 'relative',
                                },
                                {
                                        type: 'number',
                                        id: 'target_x',
                                        label: 'Target X (relative: -100~100, absolute: 0~1920)',
                                        default: 0,
                                        min: -100,
                                        max: 1920,
                                },
                                {
                                        type: 'number',
                                        id: 'target_y',
                                        label: 'Target Y (relative: -100~100, absolute: 0~1080)',
                                        default: -10,
                                        min: -100,
                                        max: 1080,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const mode = String(action.options.mode) as 'relative' | 'absolute'
                                const targetX = Number(action.options.target_x)
                                const targetY = Number(action.options.target_y)
                                await instance.api?.currentFrame(cameraId, mode, { target_x: targetX, target_y: targetY })
                        },
                },

                tiltDown: {
                        name: 'Tilt Down',
                        description: 'Tilt the current frame down (relative: -100~100 step, absolute: 0~1080 pixel)',
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
                                        id: 'mode',
                                        label: 'Mode',
                                        choices: [
                                                { id: 'relative', label: 'Relative (-100~100)' },
                                                { id: 'absolute', label: 'Absolute (0~1920x1080)' },
                                        ],
                                        default: 'relative',
                                },
                                {
                                        type: 'number',
                                        id: 'target_x',
                                        label: 'Target X (relative: -100~100, absolute: 0~1920)',
                                        default: 0,
                                        min: -100,
                                        max: 1920,
                                },
                                {
                                        type: 'number',
                                        id: 'target_y',
                                        label: 'Target Y (relative: -100~100, absolute: 0~1080)',
                                        default: 10,
                                        min: -100,
                                        max: 1080,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const mode = String(action.options.mode) as 'relative' | 'absolute'
                                const targetX = Number(action.options.target_x)
                                const targetY = Number(action.options.target_y)
                                await instance.api?.currentFrame(cameraId, mode, { target_x: targetX, target_y: targetY })
                        },
                },

                zoomIn: {
                        name: 'Zoom In',
                        description: 'Zoom in the current frame',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                                {
                                        type: 'number',
                                        id: 'amount',
                                        label: 'Amount (1-60)',
                                        default: 5,
                                        min: 1,
                                        max: 60,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const amount = Math.abs(Number(action.options.amount))
                                await instance.api?.currentFrame(cameraId, 'relative', { auto_zoom_ratio: amount })
                        },
                },

                zoomOut: {
                        name: 'Zoom Out',
                        description: 'Zoom out the current frame',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                                {
                                        type: 'number',
                                        id: 'amount',
                                        label: 'Amount (1-60)',
                                        default: 5,
                                        min: 1,
                                        max: 60,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const amount = -Math.abs(Number(action.options.amount))
                                await instance.api?.currentFrame(cameraId, 'relative', { auto_zoom_ratio: amount })
                        },
                },

                autoFaceSearchToggle: {
                        name: 'Auto Face Search Toggle',
                        description: 'Toggle Auto Face Search on/off',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const state = instance.cameraStates.get(cameraId)
                                const isEnabled = state?.AutoFaceSearch === true
                                await instance.api?.autoFaceSearch(cameraId, isEnabled ? 0 : 1)
                        },
                },

                autoStartAreaToggle: {
                        name: 'Auto Start Area Toggle',
                        description: 'Toggle Auto Start Area on/off',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const state = instance.cameraStates.get(cameraId)
                                const isEnabled = state?.auto_start_area?.AutoStartAreaEnable === 1
                                await instance.api?.autoStartArea(cameraId, isEnabled ? 0 : 1)
                        },
                },

                maskAreaClear: {
                        name: 'Mask Area Clear',
                        description: 'Clear a Mask Area by setting it to zero',
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
                                        id: 'area_id',
                                        label: 'Mask Area Number',
                                        choices: maskAreaChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const areaId = Number(action.options.area_id)
                                await instance.api?.clearMaskArea(cameraId, areaId)
                        },
                },

                framingEnableToggle: {
                        name: 'Framing Enable Toggle',
                        description: 'Toggle Auto Framing enable/disable',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const state = instance.cameraStates.get(cameraId)
                                const isEnabled = state?.FramingEnable !== undefined && state.FramingEnable > 0
                                await instance.api?.framingEnable(cameraId, !isEnabled)
                        },
                },

                targetPositionOnRefCam: {
                        name: 'Target Position (Reference Camera)',
                        description: 'Select, add, or remove framing targets on reference camera',
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
                                        id: 'mode',
                                        label: 'Mode',
                                        choices: [
                                                { id: 'select', label: 'Select' },
                                                { id: 'plus', label: 'Add (+)' },
                                                { id: 'minus', label: 'Remove (-)' },
                                        ],
                                        default: 'select',
                                },
                                {
                                        type: 'number',
                                        id: 'target_x',
                                        label: 'X Coordinate (0-1920)',
                                        default: 960,
                                        min: 0,
                                        max: 1920,
                                },
                                {
                                        type: 'number',
                                        id: 'target_y',
                                        label: 'Y Coordinate (0-1080)',
                                        default: 540,
                                        min: 0,
                                        max: 1080,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const mode = String(action.options.mode) as 'select' | 'plus' | 'minus'
                                const targetX = Number(action.options.target_x)
                                const targetY = Number(action.options.target_y)
                                await instance.api?.targetPosition(cameraId, mode, targetX, targetY, 1)
                        },
                },

                getImage: {
                        name: 'Get Image (Log URL)',
                        description: 'Log the URL for retrieving a thumbnail image from the Auto Framing Plugin',
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
                                        id: 'category',
                                        label: 'Image Category',
                                        choices: [
                                                { id: 'CurrentFrame', label: 'Current Frame' },
                                                { id: 'TargetFrame', label: 'Target Frame' },
                                                { id: 'AdvancedPreset', label: 'Advanced Preset' },
                                        ],
                                        default: 'CurrentFrame',
                                },
                                {
                                        type: 'number',
                                        id: 'number',
                                        label: 'Preset/Frame Number (for TargetFrame/AdvancedPreset)',
                                        default: 1,
                                        min: 1,
                                        max: 20,
                                },
                        ],
                        callback: async (action) => {
                                if (!instance.api) return
                                const cameraId = Number(action.options.camera_id)
                                const category = String(action.options.category) as 'CurrentFrame' | 'TargetFrame' | 'AdvancedPreset'
                                const number = category !== 'CurrentFrame' ? Number(action.options.number) : undefined
                                const url = instance.api.getImageUrl(category, cameraId, number)
                                instance.log('info', `GetImage URL: ${url}`)
                        },
                },

                getLicenseData: {
                        name: 'License: Get License Data',
                        description: 'Get license status of all paid plugins',
                        options: [],
                        callback: async () => {
                                if (!instance.licenseApi) return
                                try {
                                        const response = await instance.licenseApi.getLicenseData()
                                        if (response.Response === 'ack' && response.LicenseData) {
                                                instance.licenseData = response.LicenseData
                                                instance.log('info', `License data received: ${response.LicenseData.length} plugins`)
                                                instance.checkFeedbacks()
                                        }
                                } catch (error) {
                                        instance.log('error', `Failed to get license data: ${error}`)
                                }
                        },
                },

                atCameraControl: {
                        name: 'Auto Tracking: Camera Control',
                        description: 'Enable or disable Auto Tracking function for a camera',
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
                                        id: 'control',
                                        label: 'Control',
                                        choices: [
                                                { id: 'start', label: 'Start (Enable)' },
                                                { id: 'stop', label: 'Stop (Disable)' },
                                        ],
                                        default: 'start',
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const control = String(action.options.control) as 'start' | 'stop'
                                await instance.autoTrackingApi?.cameraControl(cameraId, control)
                        },
                },

                atTracking: {
                        name: 'Auto Tracking: Tracking',
                        description: 'Start or stop the tracking process',
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
                                        id: 'process',
                                        label: 'Process',
                                        choices: [
                                                { id: 'start', label: 'Start' },
                                                { id: 'stop', label: 'Stop' },
                                        ],
                                        default: 'start',
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const process = String(action.options.process) as 'start' | 'stop'
                                await instance.autoTrackingApi?.tracking(cameraId, process)
                        },
                },

                atAngle: {
                        name: 'Auto Tracking: Angle',
                        description: 'Set camera angle mode during auto tracking',
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
                                        id: 'mode',
                                        label: 'Angle Mode',
                                        choices: [
                                                { id: 'upper', label: 'Upper Body' },
                                                { id: 'body', label: 'Full Body' },
                                                { id: 'full', label: 'Full Shot' },
                                                { id: 'off', label: 'Off' },
                                        ],
                                        default: 'upper',
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const mode = String(action.options.mode) as 'upper' | 'body' | 'full' | 'off'
                                await instance.autoTrackingApi?.angle(cameraId, mode)
                        },
                },

                atCameraState: {
                        name: 'Auto Tracking: Get Camera State',
                        description: 'Get the auto tracking state of a camera',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'camera_id',
                                        label: 'Camera',
                                        choices: cameraIdChoices,
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                if (!instance.autoTrackingApi) return
                                const cameraId = Number(action.options.camera_id)
                                try {
                                        const response = await instance.autoTrackingApi.cameraState(cameraId)
                                        if (response.resp === 'ack') {
                                                instance.autoTrackingStates.set(cameraId, response)
                                                instance.log('info', `Camera ${cameraId} state: tracking=${response.tracking}, detection=${response.detection}`)
                                                instance.checkFeedbacks()
                                        }
                                } catch (error) {
                                        instance.log('error', `Failed to get camera state: ${error}`)
                                }
                        },
                },

                atTrackingControl: {
                        name: 'Auto Tracking: Tracking Control',
                        description: 'Start or stop tracking (alternative command)',
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
                                        id: 'enable',
                                        label: 'Enable',
                                        choices: [
                                                { id: 'on', label: 'On' },
                                                { id: 'off', label: 'Off' },
                                        ],
                                        default: 'on',
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const enable = String(action.options.enable) as 'on' | 'off'
                                await instance.autoTrackingApi?.trackingControl(cameraId, enable)
                        },
                },

                atAutoFaceSearch: {
                        name: 'Auto Tracking: Auto Face Search',
                        description: 'Enable or disable Auto Face Search',
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
                                        id: 'mode',
                                        label: 'Mode',
                                        choices: [
                                                { id: 1, label: 'Enable' },
                                                { id: 0, label: 'Disable' },
                                        ],
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const mode = Number(action.options.mode) as 0 | 1
                                await instance.autoTrackingApi?.autoFaceSearch(cameraId, mode)
                        },
                },

                atPreset: {
                        name: 'Auto Tracking: Preset',
                        description: 'Set, clear, or recall a camera preset',
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
                                        id: 'mode',
                                        label: 'Mode',
                                        choices: [
                                                { id: 'recall', label: 'Recall' },
                                                { id: 'set', label: 'Set' },
                                                { id: 'clear', label: 'Clear' },
                                        ],
                                        default: 'recall',
                                },
                                {
                                        type: 'number',
                                        id: 'preset_num',
                                        label: 'Preset Number (1-100)',
                                        default: 1,
                                        min: 1,
                                        max: 100,
                                },
                        ],
                        callback: async (action) => {
                                const cameraId = Number(action.options.camera_id)
                                const mode = String(action.options.mode) as 'set' | 'clear' | 'recall'
                                const presetNum = Number(action.options.preset_num)
                                await instance.autoTrackingApi?.preset(cameraId, mode, presetNum)
                        },
                },

                vmSwitchPgm: {
                        name: 'Video Mixer: Switch PGM',
                        description: 'Switch PGM to a specific cell',
                        options: [
                                {
                                        type: 'number',
                                        id: 'cell',
                                        label: 'Cell Number (1-14, where 13=A, 14=B)',
                                        default: 1,
                                        min: 1,
                                        max: 14,
                                },
                        ],
                        callback: async (action) => {
                                const cell = Number(action.options.cell)
                                await instance.videoMixerApi?.switchPgm(cell)
                        },
                },

                vmDsk: {
                        name: 'Video Mixer: DSK Control',
                        description: 'Turn Down Stream Key on or off',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'control',
                                        label: 'Control',
                                        choices: [
                                                { id: 1, label: 'On' },
                                                { id: 0, label: 'Off' },
                                        ],
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const control = Number(action.options.control) as 0 | 1
                                await instance.videoMixerApi?.dsk(control)
                        },
                },

                vmCaptureScreenshot: {
                        name: 'Video Mixer: Capture Screenshot',
                        description: 'Capture PGM or KEY image',
                        options: [
                                {
                                        type: 'dropdown',
                                        id: 'control',
                                        label: 'Capture Type',
                                        choices: [
                                                { id: 1, label: 'PGM Video' },
                                                { id: 2, label: 'KEY Video' },
                                        ],
                                        default: 1,
                                },
                        ],
                        callback: async (action) => {
                                const control = Number(action.options.control) as 1 | 2
                                await instance.videoMixerApi?.captureScreenshot(control, 0)
                        },
                },

                vmCaptureAiBackground: {
                        name: 'Video Mixer: Capture AI Background',
                        description: 'Capture background image for AI Keying',
                        options: [
                                {
                                        type: 'number',
                                        id: 'input',
                                        label: 'Input Number (1-4)',
                                        default: 1,
                                        min: 1,
                                        max: 4,
                                },
                                {
                                        type: 'number',
                                        id: 'bkgd',
                                        label: 'Background Number (1-4)',
                                        default: 1,
                                        min: 1,
                                        max: 4,
                                },
                        ],
                        callback: async (action) => {
                                const input = Number(action.options.input)
                                const bkgd = Number(action.options.bkgd)
                                await instance.videoMixerApi?.captureAiBackground(input, bkgd)
                        },
                },

                vmGetMultiViewLayout: {
                        name: 'Video Mixer: Get Multi View Layout',
                        description: 'Get current Multi View layout setting',
                        options: [],
                        callback: async () => {
                                if (!instance.videoMixerApi) return
                                try {
                                        const response = await instance.videoMixerApi.getMultiViewLayout()
                                        if (response.resp === 'ack' && response.layout !== undefined) {
                                                instance.videoMixerLayout = response.layout
                                                instance.log('info', `Multi View Layout: ${response.layout}`)
                                                instance.checkFeedbacks()
                                        }
                                } catch (error) {
                                        instance.log('error', `Failed to get layout: ${error}`)
                                }
                        },
                },

                vmGetPgmCell: {
                        name: 'Video Mixer: Get PGM Cell',
                        description: 'Get current PGM selection cell',
                        options: [],
                        callback: async () => {
                                if (!instance.videoMixerApi) return
                                try {
                                        const response = await instance.videoMixerApi.getPgmCell()
                                        if (response.resp === 'ack' && response.cell !== undefined) {
                                                instance.videoMixerPgmCell = response.cell
                                                instance.log('info', `PGM Cell: ${response.cell}`)
                                                instance.checkFeedbacks()
                                        }
                                } catch (error) {
                                        instance.log('error', `Failed to get PGM cell: ${error}`)
                                }
                        },
                },

                vmControlVolume: {
                        name: 'Video Mixer: Control Volume',
                        description: 'Set output audio volume',
                        options: [
                                {
                                        type: 'number',
                                        id: 'volume',
                                        label: 'Volume (0-100)',
                                        default: 100,
                                        min: 0,
                                        max: 100,
                                },
                        ],
                        callback: async (action) => {
                                const volume = Number(action.options.volume)
                                await instance.videoMixerApi?.controlVolume(volume)
                        },
                },

                vmGetVmEnableStatus: {
                        name: 'Video Mixer: Get Enable Status',
                        description: 'Get Video Mixer enable status',
                        options: [],
                        callback: async () => {
                                if (!instance.videoMixerApi) return
                                try {
                                        const response = await instance.videoMixerApi.getVmEnableStatus()
                                        if (response.resp === 'ack' && response.enable !== undefined) {
                                                instance.videoMixerEnabled = response.enable === 1
                                                instance.log('info', `Video Mixer Enabled: ${instance.videoMixerEnabled}`)
                                                instance.checkFeedbacks()
                                        }
                                } catch (error) {
                                        instance.log('error', `Failed to get VM status: ${error}`)
                                }
                        },
                },
        }
}
