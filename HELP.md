# Panasonic Media Production Suite Module

This module provides control of Panasonic Media Production Suite plugins including:

- **Auto Framing Plugin** (Web API v1.11.1)
- **License API** - Plugin license monitoring
- **Auto Tracking Plugin** - Camera auto tracking control
- **Video Mixer Plugin** - Video switching and DSK control

## Configuration

- **IP Address**: The IP address of the PC running Media Production Suite
- **Auto Framing Port**: Port for Auto Framing Plugin API (default: 1338)
- **MPS Port**: Port for License, Auto Tracking, and Video Mixer APIs (default: 1337)
- **Poll Interval**: How often to poll for camera status updates (default: 1000ms)
- **Camera Count**: Maximum number of cameras to poll (default: 10)

## Auto Framing Actions

### Basic Controls
- **Framing Enable** - Enable/disable Auto Framing for a camera
- **Framing Start/Stop** - Start or stop tracking
- **Framing Start/Stop Toggle** - Toggle tracking state

### Tracking Controls
- **Tracking Control** - Set pan/tilt speed, zoom speed, and sensitivity
- **Auto Face Search** - Enable/disable automatic face detection
- **Auto Zoom** - Enable/disable automatic zoom adjustment

### Preset Management
- **Advanced Preset Recall/Set/Clear** - Manage advanced presets (1-20)
- **Target Frame Recall/Set/Clear** - Manage target frame presets (1-20)

### Target Selection
- **Target Position** - Select/add/remove targets at coordinates
- **Target Face Select/Clear** - Select faces by ID or name

### PTZ Control
- **Pan/Tilt Control** - Move camera pan/tilt
- **Zoom Control** - Control camera zoom
- **Pan/Tilt/Zoom Stop** - Stop camera movement

### Area Controls
- **Auto Start Area** - Enable/disable auto start area
- **Mask Area** - Enable/disable mask areas (1-3)

## Auto Tracking Actions

- **Camera Control** - Enable/disable Auto Tracking function
- **Tracking** - Start/stop the tracking process
- **Angle** - Set camera angle mode (Upper, Body, Full, Off)
- **Tracking Control** - Alternative tracking on/off command
- **Auto Face Search** - Enable/disable auto face search
- **Preset** - Set/clear/recall camera presets (1-100)
- **Get Camera State** - Retrieve current auto tracking state

## Video Mixer Actions

- **Switch PGM** - Switch PGM to a specific cell (1-14, where 13=A, 14=B)
- **DSK Control** - Turn Down Stream Key on/off
- **Capture Screenshot** - Capture PGM or KEY video image
- **Capture AI Background** - Capture background image for AI Keying
- **Get Multi View Layout** - Get current layout setting
- **Get PGM Cell** - Get current PGM selection
- **Control Volume** - Set output audio volume (0-100)
- **Get Enable Status** - Check if Video Mixer is enabled

## License Actions

- **Get License Data** - Retrieve license status of all plugins

## Feedbacks

### Auto Framing Feedbacks
- **Framing Enabled** - Camera has Auto Framing enabled
- **Framing Running** - Tracking is currently active
- **Framing Status** - Check for specific status (Stopped/Tracking/Lost/Searching)
- **Auto Zoom Enabled** - Auto Zoom is on
- **Auto Face Search Enabled** - Auto Face Search is on
- **PTZ Moving** - Camera PTZ is moving
- **Has Tracking Targets** - Camera has active targets
- **Person Detected** - Person detected in frame
- **Auto Start Area Enabled** - Auto Start Area is enabled

### Auto Tracking Feedbacks
- **Tracking Active** - Auto Tracking is currently tracking
- **Detection Active** - Person detection is active
- **Camera Connected** - Camera is connected for Auto Tracking

### Video Mixer Feedbacks
- **PGM Cell Active** - Check if specific cell is active as PGM
- **Video Mixer Enabled** - Video Mixer is enabled

### License Feedbacks
- **Plugin Activated** - Check if specific plugin has activated license

## Variables

### Per-Camera Variables (cam1 through cam10)
- `cam{N}_name` - Camera name
- `cam{N}_ip` - Camera IP address
- `cam{N}_framing_enabled` - Framing enabled status
- `cam{N}_framing_running` - Framing running status
- `cam{N}_framing_status` - Current framing status text
- `cam{N}_auto_zoom` - Auto Zoom status
- `cam{N}_auto_face_search` - Auto Face Search status
- `cam{N}_person_count` - Number of detected persons
- `cam{N}_target_count` - Number of active targets
- `cam{N}_ptz_moving` - PTZ movement status
- `cam{N}_target_zoom` - Current target zoom level
- `cam{N}_pt_speed` - Pan/Tilt speed setting
- `cam{N}_z_speed` - Zoom speed setting
- `cam{N}_sensitivity` - Sensitivity setting
- `cam{N}_at_tracking` - Auto Tracking status
- `cam{N}_at_detection` - Auto Tracking detection status
- `cam{N}_at_connection` - Auto Tracking connection status
- `cam{N}_at_angle` - Auto Tracking angle mode

### Video Mixer Variables
- `vm_pgm_cell` - Current PGM cell number
- `vm_layout` - Current Multi View layout
- `vm_enabled` - Video Mixer enabled status

### License Variables
- `license_autoframing` - Auto Framing license status
- `license_autotracking` - Auto Tracking license status
- `license_videomixer` - Video Mixer license status

## Notes

- Cameras must be registered in a single group (not multiple groups) for the Auto Framing API to work properly
- The module polls camera states at the configured interval
- Auto Tracking presets support 1-100 (vs 1-20 for Auto Framing)
- Video Mixer cells 13 and 14 correspond to inputs A and B respectively
