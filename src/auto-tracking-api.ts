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
			headers: { Accept: 'text/plain' },
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

export interface AutoTrackingResponse {
	resp: 'ack' | 'nack'
	message?: string
}

export interface CameraStateResponse {
	resp: 'ack' | 'nack'
	id?: number
	connection?: number
	detection?: number
	tracking?: number
	lost?: number
	angle?: number
	preset?: number[]
	angle_type?: number
	target_position?: number[]
	target_position_area?: number[]
	pan_tilt_limit?: number[]
	face_recognition?: number
	auto_face_search?: number
	auto_zoom?: number
}

export class AutoTrackingApi {
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
		const baseUrl = `http://${this.config.host}:${this.config.mpsPort}/cgi-bin/auto_tracking`
		const queryParams = new URLSearchParams()
		queryParams.set('cmd', command)
		for (const [key, value] of Object.entries(params)) {
			queryParams.set(key, String(value))
		}
		return `${baseUrl}?${queryParams.toString()}`
	}

	private parseResponse(data: string): AutoTrackingResponse {
		const parts = data.split(',')
		const result: Record<string, string | number | number[]> = {}

		for (const part of parts) {
			const [key, value] = part.split(':')
			if (key && value !== undefined) {
				const trimmedKey = key.trim()
				const trimmedValue = value.trim()
				if (trimmedKey === 'preset' || trimmedKey === 'pan_tilt_limit' || trimmedKey === 'target_position' || trimmedKey === 'target_position_area') {
					result[trimmedKey] = trimmedValue.split(',').map((v) => parseInt(v.trim(), 10))
				} else if (!isNaN(Number(trimmedValue))) {
					result[trimmedKey] = parseInt(trimmedValue, 10)
				} else {
					result[trimmedKey] = trimmedValue
				}
			}
		}

		return result as unknown as AutoTrackingResponse
	}

	private async sendCommand(command: string, params: Record<string, string | number> = {}): Promise<AutoTrackingResponse> {
		const url = this.buildUrl(command, params)
		this.log('debug', `Auto Tracking API: ${url}`)

		try {
			const response = await httpGet(url)

			if (response.status < 200 || response.status >= 300) {
				throw new Error(`HTTP error: ${response.status}`)
			}

			return this.parseResponse(response.data)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			this.log('error', `Auto Tracking API error: ${errorMessage}`)
			throw error
		}
	}

	async cameraControl(id: number, control: 'start' | 'stop'): Promise<AutoTrackingResponse> {
		return this.sendCommand('CameraControl', { id, control })
	}

	async tracking(id: number, process: 'start' | 'stop'): Promise<AutoTrackingResponse> {
		return this.sendCommand('Tracking', { id, process })
	}

	async angle(id: number, mode: 'upper' | 'body' | 'full' | 'off'): Promise<AutoTrackingResponse> {
		return this.sendCommand('Angle', { id, mode })
	}

	async cameraState(id: number): Promise<CameraStateResponse> {
		const url = this.buildUrl('CameraState', { id })
		this.log('debug', `Auto Tracking API: ${url}`)

		try {
			const response = await httpGet(url)

			if (response.status < 200 || response.status >= 300) {
				throw new Error(`HTTP error: ${response.status}`)
			}

			const parts = response.data.split(',')
			const result: Record<string, number | number[] | string> = {}

			for (const part of parts) {
				const colonIndex = part.indexOf(':')
				if (colonIndex > 0) {
					const key = part.substring(0, colonIndex).trim()
					const value = part.substring(colonIndex + 1).trim()

					if (key === 'preset') {
						const presetValues: number[] = []
						let remaining = value
						for (let i = 0; i < 10 && remaining; i++) {
							const match = remaining.match(/^(\d+),?/)
							if (match) {
								presetValues.push(parseInt(match[1], 10))
								remaining = remaining.substring(match[0].length)
							}
						}
						result[key] = presetValues
					} else if (key === 'pan_tilt_limit') {
						const limitValues = value.split(',').slice(0, 4).map((v) => parseInt(v.trim(), 10))
						result[key] = limitValues
					} else if (!isNaN(Number(value))) {
						result[key] = parseInt(value, 10)
					} else {
						result[key] = value
					}
				}
			}

			return result as unknown as CameraStateResponse
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			this.log('error', `Auto Tracking API error: ${errorMessage}`)
			throw error
		}
	}

	async trackingControl(id: number, enable: 'on' | 'off'): Promise<AutoTrackingResponse> {
		return this.sendCommand('TrackingControl', { id, enable })
	}

	async cameraControlView(id: number, control: 'start' | 'stop'): Promise<AutoTrackingResponse> {
		return this.sendCommand('CameraControlView', { id, control })
	}

	async autoFaceSearch(id: number, mode: 0 | 1): Promise<AutoTrackingResponse> {
		return this.sendCommand('AutoFaceSearch', { id, mode })
	}

	async preset(id: number, mode: 'set' | 'clear' | 'recall', presetNum: number): Promise<AutoTrackingResponse> {
		return this.sendCommand('Preset', { id, mode, preset_num: presetNum })
	}
}
