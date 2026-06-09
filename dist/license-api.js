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
            headers: { Accept: 'application/json' },
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
export class LicenseApi {
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
        const baseUrl = `http://${this.config.host}:${this.config.mpsPort}/cgi-bin/license`;
        const queryParams = new URLSearchParams();
        queryParams.set('cmd', command);
        for (const [key, value] of Object.entries(params)) {
            queryParams.set(key, String(value));
        }
        return `${baseUrl}?${queryParams.toString()}`;
    }
    async sendCommand(command, params = {}) {
        const url = this.buildUrl(command, params);
        this.log('debug', `License API: ${url}`);
        try {
            const response = await httpGet(url);
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = JSON.parse(response.data);
            return data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.log('error', `License API error: ${errorMessage}`);
            throw error;
        }
    }
    async getLicenseData() {
        return this.sendCommand('GetLicenseData');
    }
}
