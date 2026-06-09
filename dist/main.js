import { InstanceBase, InstanceStatus, runEntrypoint, } from '@companion-module/base';
import { getConfigFields } from './config.js';
import { PanasonicAutoFramingApi } from './api.js';
import { LicenseApi } from './license-api.js';
import { AutoTrackingApi } from './auto-tracking-api.js';
import { VideoMixerApi } from './video-mixer-api.js';
import { getActions } from './actions.js';
import { getFeedbacks } from './feedbacks.js';
import { getPresets } from './presets.js';
import { getVariableDefinitions, updateVariablesFromState, updateVariablesFromAutoTracking, updateVideoMixerVariables, updateLicenseVariables } from './variables.js';
export class PanasonicAutoFramingInstance extends InstanceBase {
    config = {
        host: '192.168.0.200',
        port: 1338,
        mpsPort: 1337,
        pollInterval: 1000,
        cameraCount: 10,
    };
    api = null;
    licenseApi = null;
    autoTrackingApi = null;
    videoMixerApi = null;
    cameraStates = new Map();
    autoTrackingStates = new Map();
    licenseData = [];
    videoMixerLayout = 1;
    videoMixerPgmCell = 1;
    videoMixerEnabled = false;
    videoMixerVolume = 100;
    pollTimer = null;
    isPolling = false;
    consecutiveErrors = 0;
    pollCycleCount = 0;
    MAX_CONSECUTIVE_ERRORS = 5;
    MPS_POLL_INTERVAL = 5;
    constructor(internal) {
        super(internal);
    }
    async init(config) {
        this.config = config;
        this.log('info', `Initializing connection to ${config.host}:${config.port}`);
        const logFn = (level, message) => {
            this.log(level, message);
        };
        this.api = new PanasonicAutoFramingApi(config, logFn);
        this.licenseApi = new LicenseApi(config, logFn);
        this.autoTrackingApi = new AutoTrackingApi(config, logFn);
        this.videoMixerApi = new VideoMixerApi(config, logFn);
        this.setActionDefinitions(getActions(this));
        this.setFeedbackDefinitions(getFeedbacks(this));
        this.setPresetDefinitions(getPresets());
        this.setVariableDefinitions(getVariableDefinitions());
        this.updateStatus(InstanceStatus.Connecting);
        this.log('info', `Starting connection to Media Production Suite at http://${config.host}:${config.port}`);
        this.startPolling();
    }
    async destroy() {
        this.stopPolling();
        this.api = null;
        this.licenseApi = null;
        this.autoTrackingApi = null;
        this.videoMixerApi = null;
        this.cameraStates.clear();
        this.autoTrackingStates.clear();
        this.licenseData = [];
    }
    async configUpdated(config) {
        this.config = config;
        if (this.api) {
            this.api.updateConfig(config);
        }
        if (this.licenseApi) {
            this.licenseApi.updateConfig(config);
        }
        if (this.autoTrackingApi) {
            this.autoTrackingApi.updateConfig(config);
        }
        if (this.videoMixerApi) {
            this.videoMixerApi.updateConfig(config);
        }
        this.stopPolling();
        this.consecutiveErrors = 0;
        this.updateStatus(InstanceStatus.Connecting);
        this.startPolling();
    }
    getConfigFields() {
        return getConfigFields();
    }
    startPolling() {
        this.stopPolling();
        this.pollCycleCount = 0;
        this.pollAllStates();
        this.pollTimer = setInterval(() => {
            this.pollAllStates();
        }, this.config.pollInterval);
    }
    async pollAllStates() {
        this.pollCycleCount++;
        await this.pollCameraStates();
        if (this.pollCycleCount === 1 || this.pollCycleCount % this.MPS_POLL_INTERVAL === 0) {
            await this.pollMpsServices();
        }
    }
    async pollMpsServices() {
        let mpsConnected = false;
        this.log('debug', 'Polling MPS services...');
        try {
            if (this.videoMixerApi) {
                this.log('debug', 'Polling Video Mixer API...');
                const vmEnabled = await this.videoMixerApi.getVmEnableStatus();
                if (vmEnabled.resp === 'ack' && vmEnabled.enable !== undefined) {
                    this.videoMixerEnabled = vmEnabled.enable === 1;
                    mpsConnected = true;
                }
                const pgmResponse = await this.videoMixerApi.getPgmCell();
                this.log('debug', `Video Mixer PGM Response: ${JSON.stringify(pgmResponse)}`);
                if (pgmResponse.resp === 'ack' && pgmResponse.cell !== undefined) {
                    const newCell = pgmResponse.cell;
                    if (this.videoMixerPgmCell !== newCell) {
                        this.log('info', `Video Mixer PGM Cell changed: ${this.videoMixerPgmCell} -> ${newCell}`);
                    }
                    this.videoMixerPgmCell = newCell;
                    mpsConnected = true;
                }
                const layoutResponse = await this.videoMixerApi.getMultiViewLayout();
                if (layoutResponse.resp === 'ack' && layoutResponse.layout !== undefined) {
                    this.videoMixerLayout = layoutResponse.layout;
                }
                const volumeResponse = await this.videoMixerApi.getAudioVolume();
                if (volumeResponse.resp === 'ack' && volumeResponse.volume !== undefined) {
                    this.videoMixerVolume = volumeResponse.volume;
                }
                const vmVariables = updateVideoMixerVariables(this.videoMixerPgmCell, this.videoMixerLayout, this.videoMixerEnabled, this.videoMixerVolume);
                this.setVariableValues(vmVariables);
            }
            if (this.licenseApi) {
                const licenseResponse = await this.licenseApi.getLicenseData();
                if (licenseResponse.Response === 'ack' && licenseResponse.LicenseData) {
                    this.licenseData = licenseResponse.LicenseData;
                    const licenseVariables = updateLicenseVariables(this.licenseData);
                    this.setVariableValues(licenseVariables);
                    mpsConnected = true;
                }
            }
            if (this.autoTrackingApi) {
                const maxCameras = this.config.cameraCount ?? 10;
                for (let cameraId = 1; cameraId <= maxCameras; cameraId++) {
                    try {
                        const response = await this.autoTrackingApi.cameraState(cameraId);
                        if (response.resp === 'ack') {
                            this.autoTrackingStates.set(cameraId, response);
                            const variables = updateVariablesFromAutoTracking(cameraId, response);
                            this.setVariableValues(variables);
                            mpsConnected = true;
                        }
                    }
                    catch {
                        this.log('debug', `Failed to poll Auto Tracking camera ${cameraId}`);
                    }
                }
            }
            if (mpsConnected) {
                this.consecutiveErrors = 0;
                this.updateStatus(InstanceStatus.Ok);
            }
            this.checkFeedbacks('vmPgmCell', 'vmEnabled', 'atTracking', 'atCameraConnected');
        }
        catch (error) {
            this.log('debug', `MPS services poll error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
        this.isPolling = false;
    }
    async pollCameraStates() {
        if (!this.api || this.isPolling)
            return;
        this.isPolling = true;
        try {
            const response = await this.api.framingState(0);
            if (response.Response === 'ack' && response.FramingState) {
                this.consecutiveErrors = 0;
                this.updateStatus(InstanceStatus.Ok);
                let updatedAny = false;
                for (const state of response.FramingState) {
                    const cameraId = state.camera_info?.id ?? 0;
                    if (cameraId > 0) {
                        this.cameraStates.set(cameraId, state);
                        const variables = updateVariablesFromState(cameraId, state);
                        this.setVariableValues(variables);
                        updatedAny = true;
                    }
                }
                if (updatedAny) {
                    this.checkFeedbacks();
                }
            }
            else if (response.Response === 'nack') {
                this.consecutiveErrors++;
                this.log('warn', `FramingState returned NACK: ${response.NACKDetail || 'Unknown error'}`);
                if (this.consecutiveErrors >= this.MAX_CONSECUTIVE_ERRORS) {
                    this.updateStatus(InstanceStatus.ConnectionFailure, response.NACKDetail || 'Repeated errors');
                }
                else {
                    await this.pollIndividualCameras();
                }
            }
        }
        catch (error) {
            this.consecutiveErrors++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.log('warn', `Connection error (${this.consecutiveErrors}/${this.MAX_CONSECUTIVE_ERRORS}): ${errorMessage}`);
            this.log('info', `Trying to reach http://${this.config.host}:${this.config.port}/cgi-bin/auto_framing`);
            if (this.consecutiveErrors >= this.MAX_CONSECUTIVE_ERRORS) {
                this.updateStatus(InstanceStatus.ConnectionFailure, `Cannot connect to ${this.config.host}:${this.config.port}`);
                this.log('error', `Failed to connect after ${this.MAX_CONSECUTIVE_ERRORS} attempts. Check IP address and ensure Media Production Suite is running.`);
            }
            else {
                this.updateStatus(InstanceStatus.Connecting, 'Retrying...');
            }
        }
        finally {
            this.isPolling = false;
        }
    }
    async pollIndividualCameras() {
        if (!this.api)
            return;
        let anySuccess = false;
        const maxCameras = this.config.cameraCount ?? 10;
        for (let cameraId = 1; cameraId <= maxCameras; cameraId++) {
            try {
                const response = await this.api.framingState(cameraId);
                if (response.Response === 'ack' && response.FramingState?.[0]) {
                    const state = response.FramingState[0];
                    this.cameraStates.set(cameraId, state);
                    const variables = updateVariablesFromState(cameraId, state);
                    this.setVariableValues(variables);
                    anySuccess = true;
                }
            }
            catch {
                this.log('debug', `Failed to poll camera ${cameraId}`);
            }
            if (cameraId < maxCameras) {
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
        }
        if (anySuccess) {
            this.consecutiveErrors = 0;
            this.updateStatus(InstanceStatus.Ok);
            this.checkFeedbacks();
        }
    }
}
runEntrypoint(PanasonicAutoFramingInstance, []);
