import type { ModuleConfig } from './config.js'
import http from 'http'
import https from 'https'
import { URL } from 'url'

async function httpGet(urlString: string): Promise<{ status: number; data: string }> {
	return new Promise((resolve, reject) => {
		const url = new URL(urlString)
		const isHttps = url.protocol === 'https:'
		const httpModule = isHttps ? https : http

		const options = {
			hostname: url.hostname,
			port: url.port || (isHttps ? 443 : 80),
			path: url.pathname + url.search,
			method: 'GET',
			headers: { Accept: 'application/json' },
			timeout: 10000,
		}

		const request = httpModule.request(options, (response) => {
			if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
				httpGet(response.headers.location).then(resolve).catch(reject)
				return
			}

			const chunks: Buffer[] = []
			response.on('data', (chunk: Buffer) => chunks.push(chunk))
			response.on('end', () => {
				resolve({
					status: response.statusCode ?? 500,
					data: Buffer.concat(chunks).toString('utf-8'),
				})
			})
			response.on('error', reject)
		})

		request.on('error', reject)
		request.on('timeout', () => {
			request.destroy()
			reject(new Error('Request timeout'))
		})

		request.end()
	})
}

export interface LicenseApiResponse {
	Command: string
	Response: 'ack' | 'nack'
	NACKDetail?: string
	LicenseData?: LicenseData[]
}

export interface LicenseData {
	PluginName: string
	LicenseState: 'Initial' | 'Activated' | 'Deactivated' | 'In Trial' | 'Trial Expired' | 'License Expired' | 'Duplicated'
	RemainDays: number | null
	TotalLicenseCount: number
	UsedLicenseCount: number
	LicensedDevice: LicensedDevice[] | null
}

export interface LicensedDevice {
	'IP Address': string
	Name: string
}

export class LicenseApi {
	private config: ModuleConfig
	private log: (level: 'info' | 'warn' | 'error' | 'debug', message: string) => void

	constructor(config: ModuleConfig, log: (level: 'info' | 'warn' | 'error' | 'debug', message: string) => void) {
		this.config = config
		this.log = log
	}

	updateConfig(config: ModuleConfig): void {
		this.config = config
	}

	private buildUrl(command: string, params: Record<string, string | number> = {}): string {
		const baseUrl = `http://${this.config.host}:${this.config.mpsPort}/cgi-bin/license`
		const queryParams = new URLSearchParams()
		queryParams.set('cmd', command)
		for (const [key, value] of Object.entries(params)) {
			queryParams.set(key, String(value))
		}
		return `${baseUrl}?${queryParams.toString()}`
	}

	private async sendCommand(command: string, params: Record<string, string | number> = {}): Promise<LicenseApiResponse> {
		const url = this.buildUrl(command, params)
		this.log('debug', `License API: ${url}`)

		try {
			const response = await httpGet(url)

			if (response.status < 200 || response.status >= 300) {
				throw new Error(`HTTP error: ${response.status}`)
			}

			const data = JSON.parse(response.data) as LicenseApiResponse
			return data
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			this.log('error', `License API error: ${errorMessage}`)
			throw error
		}
	}

	async getLicenseData(): Promise<LicenseApiResponse> {
		return this.sendCommand('GetLicenseData')
	}
}
