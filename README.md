# companion-module-panasonic-mps

Bitfocus Companion module for controlling **Panasonic Media Production Suite** including Auto Framing Plugin, Auto Tracking Plugin, Video Mixer Plugin, and License API.

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)

## Getting Started

### Prerequisites

- Node.js v18 or later (v22 recommended)
- Yarn package manager
- Bitfocus Companion v3.0 or later

### Installation

1. Clone or download this module to your Companion development folder
2. Install dependencies:

```bash
yarn install
```

### Building

Build the module once:

```bash
yarn build
```

This compiles TypeScript to the `dist/` directory.

### Development

Run the compiler in watch mode:

```bash
yarn dev
```

Files will automatically recompile on save.

## Features

This module provides comprehensive control of the Panasonic Media Production Suite:

### Auto Framing Plugin (Port 1338)
- **Framing Control** - Enable/disable, start/stop, toggle tracking
- **Tracking Settings** - Speed, sensitivity, auto zoom, face search with toggle variants
- **Presets** - Advanced presets and target frames (20 slots each)
- **Target Selection** - Position-based and face recognition targeting
- **Frame Adjustment** - Pan, tilt, zoom controls (absolute and relative)
- **Area Configuration** - Auto start areas and mask areas

### Auto Tracking Plugin (Port 1337)
- **Tracking Control** - Enable/disable, lock/unlock tracking
- **Presets** - 100 preset slots for camera positions
- **Camera State** - Real-time status monitoring

### Video Mixer Plugin (Port 1337)
- **PGM Control** - Select program cell (1-4)
- **Multi-View Layout** - Switch between layout modes
- **DSK Effects** - Enable/disable downstream key
- **Audio Control** - Volume adjustment
- **Fade Effects** - Fade to black/white

### License API (Port 1337)
- **License Status** - Monitor activation status for all plugins

### Actions (60+)
Full control of all four APIs with comprehensive action coverage.

### Feedbacks (15)
- Auto Framing status indicators
- Auto Tracking state monitoring
- Video Mixer PGM and enable status
- License activation status

### Variables (150+)
- Camera states for Auto Framing and Auto Tracking
- Video Mixer configuration
- License status

### Presets (72)
- Pre-configured buttons for cameras 1-4
- Quick access to common operations

## API Coverage

### Auto Framing Plugin (15 commands)
FramingEnable, FramingStartStop, FramingState, TrackingControl, AutoFaceSearch, Preset, TargetFrame, TargetPosition, TargetFace, AutoZoom, AutoStartArea, MaskArea, FrameMapping, CurrentFrame, GetImage

### Auto Tracking Plugin (8 commands)
SetTrackingEnable, SetTrackingLock, PresetExec, PresetDelete, PresetRegist, CameraState, SetTrackingTarget, TrackingCameraList

### Video Mixer Plugin (11 commands)
GetPgmCell, SetPgmCell, SetMultiViewLayout, GetMultiViewLayout, SetVmEnable, GetVmEnableStatus, SetDskEnable, SetAudioVolume, GetAudioVolume, FadeOut, FadeIn

### License API (1 command)
GetLicenseData

## Compatibility

- **Companion**: v3.0+
- **Node.js**: v18+ (v22 recommended)
- **Panasonic Software**: Media Production Suite with Auto Framing, Auto Tracking, and Video Mixer Plugins

## License

MIT
