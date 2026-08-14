import type { ModuleConfig } from './config.js'
import http from 'http'
import https from 'https'
import { URL } from 'url'

async function httpGet(
        urlString: string,
        accept: string,
        timeoutMs: number,
): Promise<{ status: number; contentType: string; data: Buffer }> {
        return new Promise((resolve, reject) => {
                const url = new URL(urlString)
                const isHttps = url.protocol === 'https:'
                const httpModule = isHttps ? https : http
                
                const options = {
                        hostname: url.hostname,
                        port: url.port || (isHttps ? 443 : 80),
                        path: url.pathname + url.search,
                        method: 'GET',
                        headers: { 'Accept': accept },
                        timeout: timeoutMs,
                }

                const request = httpModule.request(options, (response) => {
                        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                                httpGet(response.headers.location, accept, timeoutMs).then(resolve).catch(reject)
                                return
                        }

                        const chunks: Buffer[] = []
                        response.on('data', (chunk: Buffer) => chunks.push(chunk))
                        response.on('end', () => {
                                resolve({
                                        status: response.statusCode ?? 500,
                                        contentType: response.headers['content-type'] ?? '',
                                        data: Buffer.concat(chunks),
                                })
                        })
                        response.on('error', reject)
                })

                request.on('error', (error) => {
                        reject(error)
                })

                request.on('timeout', () => {
                        request.destroy(new Error('Request timeout'))
                })

                request.end()
        })
}

export interface ApiResponse {
        Command: string
        Parameter: string
        Response: 'ack' | 'nack'
        NACKDetail?: string
        FramingState?: FramingStateData[]
}

export interface FramingStateData {
        AutoFaceSearch: boolean
        AutoZoom: boolean
        FramingEnable: number
        FramingStartStop: number
        FramingStatus: number
        TargetFace: {
                list_id: number[]
                name: string[]
        }
        TrackingControl: {
                AutoZoomSpeed: number
                PanTiltSpeed: number
                Sensitivity: number
        }
        auto_start_area: {
                AutoStartAreaEnable: number
                polygon: number[][]
        }
        camera_info?: {
                IP_address: string
                PanTiltLimitUDLR: number[]
                guid: string
                id: number
                name: string
                powermode: number
        }
        mask_area: {
                polygon_array: number[][][]
        }
        person: PersonData[]
        ptz_status: {
                ptz_move: boolean
        }
        selected_id: number
        target_id: number[]
        target_frame: {
                pos_x: number
                pos_y: number
                zoom: number
        }
}

export interface PersonData {
        body: {
                height: number
                width: number
                x: number
                y: number
        }
        head: {
                height: number
                width: number
                x: number
                y: number
        }
        id: number
        name: string
}

export class PanasonicAutoFramingApi {
        private readonly ACTION_TIMEOUT_MS = 3000
        private readonly POLL_TIMEOUT_MS = 1000
        private readonly TIMEOUT_COOLDOWN_MS = 15000
        private config: ModuleConfig
        private log: (level: 'info' | 'warn' | 'error' | 'debug', message: string) => void
        private requestQueue: Promise<void> = Promise.resolve()
        private queuedRequestCount = 0
        private cooldownUntil = 0

        constructor(config: ModuleConfig, log: (level: 'info' | 'warn' | 'error' | 'debug', message: string) => void) {
                this.config = config
                this.log = log
        }

        updateConfig(config: ModuleConfig): void {
                this.config = config
                this.cooldownUntil = 0
        }

        canPoll(): boolean {
                return this.queuedRequestCount === 0 && Date.now() >= this.cooldownUntil
        }

        private buildUrl(cmd: string, params: Record<string, string | number>): string {
                const paramString = Object.entries(params)
                        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                        .join('&')
                return `http://${this.config.host}:${this.config.port}/cgi-bin/auto_framing?cmd=${cmd}&${paramString}`
        }

        private async runExclusive<T>(requestType: 'action' | 'poll', callback: () => Promise<T>): Promise<T> {
                if (requestType === 'poll' && !this.canPoll()) {
                        throw new Error('Polling skipped while Auto Framing API is busy or cooling down')
                }

                const previousRequest = this.requestQueue
                let releaseRequest!: () => void
                this.requestQueue = new Promise<void>((resolve) => {
                        releaseRequest = resolve
                })
                this.queuedRequestCount++

                await previousRequest

                try {
                        const cooldownRemaining = this.cooldownUntil - Date.now()
                        if (cooldownRemaining > 0) {
                                throw new Error(`Auto Framing API cooling down for ${Math.ceil(cooldownRemaining / 1000)} seconds`)
                        }

                        return await callback()
                } finally {
                        this.queuedRequestCount--
                        releaseRequest()
                }
        }

        async sendCommand(
                cmd: string,
                params: Record<string, string | number>,
                requestType: 'action' | 'poll' = 'action',
        ): Promise<ApiResponse> {
                const url = this.buildUrl(cmd, params)

                return this.runExclusive(requestType, async () => {
                        this.log('debug', `Sending command: ${url}`)

                        try {
                                const timeoutMs = requestType === 'poll' ? this.POLL_TIMEOUT_MS : this.ACTION_TIMEOUT_MS
                                const response = await httpGet(url, 'application/json', timeoutMs)

                                if (response.status < 200 || response.status >= 300) {
                                        throw new Error(`HTTP error: ${response.status}`)
                                }

                                const data = JSON.parse(response.data.toString()) as ApiResponse
                                this.log('debug', `Response: ${JSON.stringify(data)}`)

                                if (data.Response === 'nack') {
                                        this.log('warn', `Command ${cmd} returned NACK: ${data.NACKDetail || 'Unknown error'}`)
                                }

                                return data
                        } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                                if (errorMessage === 'Request timeout') {
                                        this.cooldownUntil = Date.now() + this.TIMEOUT_COOLDOWN_MS
                                        this.log('warn', 'Auto Framing API timed out; pausing requests for 15 seconds')
                                }
                                this.log('error', `Failed to send command ${cmd}: ${errorMessage}`)
                                throw error
                        }
                })
        }

        async framingEnable(id: number, enable: boolean): Promise<ApiResponse> {
                return this.sendCommand('FramingEnable', { id, enable: enable ? 'on' : 'off' })
        }

        async framingStartStop(id: number, process: 'start' | 'stop'): Promise<ApiResponse> {
                return this.sendCommand('FramingStartStop', { id, process })
        }

        async framingState(id: number): Promise<ApiResponse> {
                return this.sendCommand('FramingState', { id }, 'poll')
        }

        async trackingControl(
                id: number,
                options: { pt_speed?: number; z_speed?: number; sensitivity?: number }
        ): Promise<ApiResponse> {
                const params: Record<string, string | number> = { id }
                if (options.pt_speed !== undefined) params.pt_speed = options.pt_speed
                if (options.z_speed !== undefined) params.z_speed = options.z_speed
                if (options.sensitivity !== undefined) params.sensitivity = options.sensitivity
                return this.sendCommand('TrackingControl', params)
        }

        async autoFaceSearch(id: number, mode: 0 | 1): Promise<ApiResponse> {
                return this.sendCommand('AutoFaceSearch', { id, mode })
        }

        async preset(id: number, mode: 'set' | 'clear' | 'recall', preset_num: number): Promise<ApiResponse> {
                return this.sendCommand('Preset', { id, mode, preset_num })
        }

        async targetFrame(id: number, mode: 'set' | 'clear' | 'recall', preset_num: number): Promise<ApiResponse> {
                return this.sendCommand('TargetFrame', { id, mode, preset_num })
        }

        async targetPosition(
                id: number,
                mode: 'select' | 'plus' | 'minus',
                target_x: number,
                target_y: number,
                on_ref_cam?: number
        ): Promise<ApiResponse> {
                const params: Record<string, string | number> = { id, mode, target_x, target_y }
                if (on_ref_cam !== undefined) params.on_ref_cam = on_ref_cam
                return this.sendCommand('TargetPosition', params)
        }

        async targetFace(
                id: number,
                mode: 'select' | 'clear',
                options?: { face_id?: string; name?: string }
        ): Promise<ApiResponse> {
                const params: Record<string, string | number> = { id, mode }
                if (options?.face_id) params.face_id = options.face_id
                if (options?.name) params.name = options.name
                return this.sendCommand('TargetFace', params)
        }

        async autoZoom(id: number, mode: 0 | 1): Promise<ApiResponse> {
                return this.sendCommand('AutoZoom', { id, mode })
        }

        async autoStartArea(
                id: number,
                mode: 0 | 1,
                area?: { x: number; y: number; width: number; height: number }
        ): Promise<ApiResponse> {
                const params: Record<string, string | number> = { id, mode }
                if (area) {
                        params.area_x = area.x
                        params.area_y = area.y
                        params.area_width = area.width
                        params.area_height = area.height
                }
                return this.sendCommand('AutoStartArea', params)
        }

        async maskArea(
                id: number,
                area_id: number,
                area?: { x: number; y: number; width: number; height: number }
        ): Promise<ApiResponse> {
                const params: Record<string, string | number> = { id, area_id }
                if (area) {
                        params.area_x = area.x
                        params.area_y = area.y
                        params.area_width = area.width
                        params.area_height = area.height
                }
                return this.sendCommand('MaskArea', params)
        }

        async frameMapping(id: number): Promise<ApiResponse> {
                return this.sendCommand('FrameMapping', { id })
        }

        async currentFrame(
                id: number,
                mode: 'absolute' | 'relative',
                options?: { target_x?: number; target_y?: number; auto_zoom_ratio?: number }
        ): Promise<ApiResponse> {
                const params: Record<string, string | number> = { id, mode }
                if (options?.target_x !== undefined) params.target_x = options.target_x
                if (options?.target_y !== undefined) params.target_y = options.target_y
                if (options?.auto_zoom_ratio !== undefined) params.auto_zoom_ratio = options.auto_zoom_ratio
                return this.sendCommand('CurrentFrame', params)
        }

        getImageUrl(
                category: 'CurrentFrame' | 'TargetFrame' | 'AdvancedPreset',
                id: number,
                number?: number
        ): string {
                const params: Record<string, string | number> = { category, id }
                if (number !== undefined && (category === 'TargetFrame' || category === 'AdvancedPreset')) {
                        params.number = number
                }
                return this.buildUrl('GetImage', params)
        }

        async getImage(
                category: 'CurrentFrame' | 'TargetFrame' | 'AdvancedPreset',
                id: number,
                number?: number
        ): Promise<Buffer | null> {
                const url = this.getImageUrl(category, id, number)

                try {
                        return await this.runExclusive('action', async () => {
                                this.log('debug', `Getting image: ${url}`)
                                const response = await httpGet(url, 'image/jpeg', this.ACTION_TIMEOUT_MS)

                                if (response.status < 200 || response.status >= 300) {
                                        throw new Error(`HTTP error: ${response.status}`)
                                }

                                if (response.contentType.includes('image/jpeg')) {
                                        return response.data
                                } else {
                                        const data = JSON.parse(response.data.toString()) as ApiResponse
                                        if (data.Response === 'nack') {
                                                this.log('warn', `GetImage returned NACK: ${data.NACKDetail || 'Unknown error'}`)
                                        }
                                        return null
                                }
                        })
                } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                        this.log('error', `Failed to get image: ${errorMessage}`)
                        return null
                }
        }

        async clearMaskArea(id: number, area_id: number): Promise<ApiResponse> {
                return this.sendCommand('MaskArea', { id, area_id })
        }
}
