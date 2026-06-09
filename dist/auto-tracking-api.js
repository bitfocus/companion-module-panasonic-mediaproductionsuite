import http from 'http';
import https from 'https';
import { URL } from 'url';
async function httpGet(urlString) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlString);
        const isHttps = url.protocol === 'https:';
        const httpModule = isHttps ? https : http;
        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: 'GET',
            headers: { Accept: 'text/plain' },
            timeout: 10000,
        };
        const request = httpModule.request(options, (response) => {
            if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                httpGet(response.headers.location).then(resolve).catch(reject);
                return;
            }
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                resolve({
                    status: response.statusCode ?? 500,
                    data: Buffer.concat(chunks).toString('utf-8'),
                });
            });
            response.on('error', reject);
        });
        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
        request.end();
    });
}
export class AutoTrackingApi {
    config;
    log;
    constructor(config, log) {
        this.config = config;
        this.log = log;
    }
    updateConfig(config) {
        this.config = config;
    }
    buildUrl(command, params = {}) {
        const baseUrl = `http://${this.config.host}:${this.config.mpsPort}/cgi-bin/auto_tracking`;
        const queryParams = new URLSearchParams();
        queryParams.set('cmd', command);
        for (const [key, value] of Object.entries(params)) {
            queryParams.set(key, String(value));
        }
        return `${baseUrl}?${queryParams.toString()}`;
    }
    parseResponse(data) {
        const parts = data.split(',');
        const result = {};
        for (const part of parts) {
            const [key, value] = part.split(':');
            if (key && value !== undefined) {
                const trimmedKey = key.trim();
                const trimmedValue = value.trim();
                if (trimmedKey === 'preset' || trimmedKey === 'pan_tilt_limit' || trimmedKey === 'target_position' || trimmedKey === 'target_position_area') {
                    result[trimmedKey] = trimmedValue.split(',').map((v) => parseInt(v.trim(), 10));
                }
                else if (!isNaN(Number(trimmedValue))) {
                    result[trimmedKey] = parseInt(trimmedValue, 10);
                }
                else {
                    result[trimmedKey] = trimmedValue;
                }
            }
        }
        return result;
    }
    async sendCommand(command, params = {}) {
        const url = this.buildUrl(command, params);
        this.log('debug', `Auto Tracking API: ${url}`);
        try {
            const response = await httpGet(url);
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return this.parseResponse(response.data);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.log('error', `Auto Tracking API error: ${errorMessage}`);
            throw error;
        }
    }
    async cameraControl(id, control) {
        return this.sendCommand('CameraControl', { id, control });
    }
    async tracking(id, process) {
        return this.sendCommand('Tracking', { id, process });
    }
    async angle(id, mode) {
        return this.sendCommand('Angle', { id, mode });
    }
    async cameraState(id) {
        const url = this.buildUrl('CameraState', { id });
        this.log('debug', `Auto Tracking API: ${url}`);
        try {
            const response = await httpGet(url);
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const parts = response.data.split(',');
            const result = {};
            for (const part of parts) {
                const colonIndex = part.indexOf(':');
                if (colonIndex > 0) {
                    const key = part.substring(0, colonIndex).trim();
                    const value = part.substring(colonIndex + 1).trim();
                    if (key === 'preset') {
                        const presetValues = [];
                        let remaining = value;
                        for (let i = 0; i < 10 && remaining; i++) {
                            const match = remaining.match(/^(\d+),?/);
                            if (match) {
                                presetValues.push(parseInt(match[1], 10));
                                remaining = remaining.substring(match[0].length);
                            }
                        }
                        result[key] = presetValues;
                    }
                    else if (key === 'pan_tilt_limit') {
                        const limitValues = value.split(',').slice(0, 4).map((v) => parseInt(v.trim(), 10));
                        result[key] = limitValues;
                    }
                    else if (!isNaN(Number(value))) {
                        result[key] = parseInt(value, 10);
                    }
                    else {
                        result[key] = value;
                    }
                }
            }
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.log('error', `Auto Tracking API error: ${errorMessage}`);
            throw error;
        }
    }
    async trackingControl(id, enable) {
        return this.sendCommand('TrackingControl', { id, enable });
    }
    async cameraControlView(id, control) {
        return this.sendCommand('CameraControlView', { id, control });
    }
    async autoFaceSearch(id, mode) {
        return this.sendCommand('AutoFaceSearch', { id, mode });
    }
    async preset(id, mode, presetNum) {
        return this.sendCommand('Preset', { id, mode, preset_num: presetNum });
    }
}
