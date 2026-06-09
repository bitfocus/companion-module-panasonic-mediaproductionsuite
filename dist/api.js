import http from 'http';
import https from 'https';
import { URL } from 'url';
async function httpGet(urlString, accept) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlString);
        const isHttps = url.protocol === 'https:';
        const httpModule = isHttps ? https : http;
        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: 'GET',
            headers: { 'Accept': accept },
            timeout: 10000,
        };
        const request = httpModule.request(options, (response) => {
            if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                httpGet(response.headers.location, accept).then(resolve).catch(reject);
                return;
            }
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                resolve({
                    status: response.statusCode ?? 500,
                    contentType: response.headers['content-type'] ?? '',
                    data: Buffer.concat(chunks),
                });
            });
            response.on('error', reject);
        });
        request.on('error', (error) => {
            reject(error);
        });
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
        request.end();
    });
}
export class PanasonicAutoFramingApi {
    config;
    log;
    constructor(config, log) {
        this.config = config;
        this.log = log;
    }
    updateConfig(config) {
        this.config = config;
    }
    buildUrl(cmd, params) {
        const paramString = Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        return `http://${this.config.host}:${this.config.port}/cgi-bin/auto_framing?cmd=${cmd}&${paramString}`;
    }
    async sendCommand(cmd, params) {
        const url = this.buildUrl(cmd, params);
        this.log('debug', `Sending command: ${url}`);
        try {
            const response = await httpGet(url, 'application/json');
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = JSON.parse(response.data.toString());
            this.log('debug', `Response: ${JSON.stringify(data)}`);
            if (data.Response === 'nack') {
                this.log('warn', `Command ${cmd} returned NACK: ${data.NACKDetail || 'Unknown error'}`);
            }
            return data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.log('error', `Failed to send command ${cmd}: ${errorMessage}`);
            throw error;
        }
    }
    async framingEnable(id, enable) {
        return this.sendCommand('FramingEnable', { id, enable: enable ? 'on' : 'off' });
    }
    async framingStartStop(id, process) {
        return this.sendCommand('FramingStartStop', { id, process });
    }
    async framingState(id) {
        return this.sendCommand('FramingState', { id });
    }
    async trackingControl(id, options) {
        const params = { id };
        if (options.pt_speed !== undefined)
            params.pt_speed = options.pt_speed;
        if (options.z_speed !== undefined)
            params.z_speed = options.z_speed;
        if (options.sensitivity !== undefined)
            params.sensitivity = options.sensitivity;
        return this.sendCommand('TrackingControl', params);
    }
    async autoFaceSearch(id, mode) {
        return this.sendCommand('AutoFaceSearch', { id, mode });
    }
    async preset(id, mode, preset_num) {
        return this.sendCommand('Preset', { id, mode, preset_num });
    }
    async targetFrame(id, mode, preset_num) {
        return this.sendCommand('TargetFrame', { id, mode, preset_num });
    }
    async targetPosition(id, mode, target_x, target_y, on_ref_cam) {
        const params = { id, mode, target_x, target_y };
        if (on_ref_cam !== undefined)
            params.on_ref_cam = on_ref_cam;
        return this.sendCommand('TargetPosition', params);
    }
    async targetFace(id, mode, options) {
        const params = { id, mode };
        if (options?.face_id)
            params.face_id = options.face_id;
        if (options?.name)
            params.name = options.name;
        return this.sendCommand('TargetFace', params);
    }
    async autoZoom(id, mode) {
        return this.sendCommand('AutoZoom', { id, mode });
    }
    async autoStartArea(id, mode, area) {
        const params = { id, mode };
        if (area) {
            params.area_x = area.x;
            params.area_y = area.y;
            params.area_width = area.width;
            params.area_height = area.height;
        }
        return this.sendCommand('AutoStartArea', params);
    }
    async maskArea(id, area_id, area) {
        const params = { id, area_id };
        if (area) {
            params.area_x = area.x;
            params.area_y = area.y;
            params.area_width = area.width;
            params.area_height = area.height;
        }
        return this.sendCommand('MaskArea', params);
    }
    async frameMapping(id) {
        return this.sendCommand('FrameMapping', { id });
    }
    async currentFrame(id, mode, options) {
        const params = { id, mode };
        if (options?.target_x !== undefined)
            params.target_x = options.target_x;
        if (options?.target_y !== undefined)
            params.target_y = options.target_y;
        if (options?.auto_zoom_ratio !== undefined)
            params.auto_zoom_ratio = options.auto_zoom_ratio;
        return this.sendCommand('CurrentFrame', params);
    }
    getImageUrl(category, id, number) {
        const params = { category, id };
        if (number !== undefined && (category === 'TargetFrame' || category === 'AdvancedPreset')) {
            params.number = number;
        }
        return this.buildUrl('GetImage', params);
    }
    async getImage(category, id, number) {
        const url = this.getImageUrl(category, id, number);
        this.log('debug', `Getting image: ${url}`);
        try {
            const response = await httpGet(url, 'image/jpeg');
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            if (response.contentType.includes('image/jpeg')) {
                return response.data;
            }
            else {
                const data = JSON.parse(response.data.toString());
                if (data.Response === 'nack') {
                    this.log('warn', `GetImage returned NACK: ${data.NACKDetail || 'Unknown error'}`);
                }
                return null;
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.log('error', `Failed to get image: ${errorMessage}`);
            return null;
        }
    }
    async clearMaskArea(id, area_id) {
        return this.sendCommand('MaskArea', { id, area_id });
    }
}
