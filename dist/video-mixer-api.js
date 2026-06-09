import http from 'http';
import https from 'https';
import { URL } from 'url';
async function httpGet(urlString, acceptType = 'text/plain') {
    return new Promise((resolve, reject) => {
        const url = new URL(urlString);
        const isHttps = url.protocol === 'https:';
        const httpModule = isHttps ? https : http;
        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: 'GET',
            headers: { Accept: acceptType },
            timeout: 10000,
        };
        const request = httpModule.request(options, (response) => {
            if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                httpGet(response.headers.location, acceptType).then(resolve).catch(reject);
                return;
            }
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                resolve({
                    status: response.statusCode ?? 500,
                    data: Buffer.concat(chunks),
                    contentType: response.headers['content-type'] ?? '',
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
export class VideoMixerApi {
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
        const baseUrl = `http://${this.config.host}:${this.config.mpsPort}/cgi-bin/video_mixer`;
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
            const colonIndex = part.indexOf(':');
            if (colonIndex > 0) {
                const key = part.substring(0, colonIndex).trim();
                const value = part.substring(colonIndex + 1).trim();
                if (!isNaN(Number(value))) {
                    result[key] = parseInt(value, 10);
                }
                else {
                    result[key] = value;
                }
            }
        }
        return result;
    }
    async sendCommand(command, params = {}) {
        const url = this.buildUrl(command, params);
        this.log('debug', `Video Mixer API: ${url}`);
        try {
            const response = await httpGet(url);
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return this.parseResponse(response.data.toString('utf-8'));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.log('error', `Video Mixer API error: ${errorMessage}`);
            throw error;
        }
    }
    async switchPgm(cell) {
        return this.sendCommand('SPGM', { cell });
    }
    async dsk(control) {
        return this.sendCommand('SDSK', { control });
    }
    async captureScreenshot(control, image) {
        const url = this.buildUrl('SCAP', { control, image });
        this.log('debug', `Video Mixer API: ${url}`);
        try {
            const response = await httpGet(url, image === 1 ? 'image/png' : 'text/plain');
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            if (image === 1 && response.contentType.includes('image/png')) {
                return response.data;
            }
            return this.parseResponse(response.data.toString('utf-8'));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.log('error', `Video Mixer API error: ${errorMessage}`);
            throw error;
        }
    }
    async captureAiBackground(input, bkgd) {
        return this.sendCommand('SAIB', { input, bkgd });
    }
    async getMultiViewLayout() {
        return this.sendCommand('QMVL');
    }
    async getMultiViewCell(cell) {
        return this.sendCommand('QMVC', { cell });
    }
    async getPgmCell() {
        return this.sendCommand('QPGM');
    }
    async getMultiViewImage(cell) {
        const url = this.buildUrl('QMVI', { cell });
        this.log('debug', `Video Mixer API: ${url}`);
        try {
            const response = await httpGet(url, 'image/png');
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            if (response.contentType.includes('image/png')) {
                return response.data;
            }
            return null;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.log('error', `Video Mixer API error: ${errorMessage}`);
            return null;
        }
    }
    async controlVolume(volume) {
        return this.sendCommand('SCVL', { volume });
    }
    async getAudioVolume() {
        return this.sendCommand('QVOL');
    }
    async getVmEnableStatus() {
        return this.sendCommand('QVME');
    }
}
