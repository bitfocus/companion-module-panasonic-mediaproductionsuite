# Panasonic Media Production Suite

This module controls the **Panasonic Media Production Suite** including Auto Framing Plugin, Auto Tracking Plugin, Video Mixer Plugin, and License API.

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| **IP Address** | IP address of the PC running Media Production Suite | 192.168.0.200 |
| **Auto Framing Port** | Port for Auto Framing Plugin | 1338 |
| **MPS Port** | Port for License, Auto Tracking, and Video Mixer APIs | 1337 |
| **Poll Interval** | How often to poll camera status (ms) | 1000 |
| **Camera Count** | Maximum cameras to poll (1-100) | 10 |

## Requirements

- Panasonic Media Production Suite software installed
- Network connectivity to the PC running the software
- Cameras registered in a single group (not multiple groups) for Auto Framing API

---

## Auto Framing Plugin

### Actions

#### Framing Control
| Action | Description |
|--------|-------------|
| **Framing Enable** | Enable/disable Auto Framing for a camera |
| **Framing Enable Toggle** | Toggle Auto Framing enable/disable |
| **Framing Start** | Start tracking framing |
| **Framing Stop** | Stop tracking framing |
| **Framing Start/Stop Toggle** | Toggle tracking on/off |

#### Tracking Settings
| Action | Description |
|--------|-------------|
| **Tracking Control** | Set Pan/Tilt Speed, Zoom Speed, and Sensitivity (-2 to +2) |
| **Auto Face Search** | Enable/disable automatic face search |
| **Auto Face Search Toggle** | Toggle auto face search on/off |
| **Auto Zoom** | Enable/disable automatic zoom |
| **Auto Zoom Toggle** | Toggle auto zoom on/off |

#### Presets (Advanced Preset)
| Action | Description |
|--------|-------------|
| **Advanced Preset Recall** | Recall a saved preset (1-20) |
| **Advanced Preset Set** | Save current position to a preset |
| **Advanced Preset Clear** | Delete a preset |

#### Target Frame
| Action | Description |
|--------|-------------|
| **Target Frame Recall** | Recall a target frame preset (1-20) |
| **Target Frame Set** | Save current frame as target frame |
| **Target Frame Clear** | Clear a target frame preset |

#### Target Selection
| Action | Description |
|--------|-------------|
| **Target Position** | Select/add/remove targets by screen coordinates |
| **Target Position (Reference Camera)** | Target selection on reference camera |
| **Target Face Select** | Select face(s) for tracking by ID or name |
| **Target Face Clear** | Clear face selection |

#### Frame Adjustment
| Action | Description |
|--------|-------------|
| **Current Frame (Absolute)** | Set frame position using absolute coordinates |
| **Current Frame (Relative)** | Adjust frame position using relative values |
| **Pan Left/Right** | Pan the current frame |
| **Tilt Up/Down** | Tilt the current frame |
| **Zoom In/Out** | Adjust zoom level |

#### Area Configuration
| Action | Description |
|--------|-------------|
| **Auto Start Area** | Configure the auto start detection area |
| **Auto Start Area Toggle** | Toggle auto start area on/off |
| **Mask Area** | Configure mask areas (1-3) |
| **Mask Area Clear** | Clear a mask area |
| **Frame Mapping** | Execute frame mapping |

### Feedbacks

| Feedback | Description | Default Color |
|----------|-------------|---------------|
| **Framing Enabled** | True when Auto Framing is enabled | Green |
| **Framing Running** | True when tracking is actively running | Green |
| **Framing Status** | Check specific status (Stopped/Tracking/Lost/Searching) | Green |
| **Auto Zoom Enabled** | True when Auto Zoom is enabled | Cyan |
| **Auto Face Search Enabled** | True when Auto Face Search is enabled | Orange |
| **PTZ Moving** | True when camera is actively moving | Yellow |
| **Has Tracking Targets** | True when targets are being tracked | Purple |
| **Person Detected** | True when persons are detected in frame | Blue |
| **Auto Start Area Enabled** | True when Auto Start Area is active | Brown |

### Variables

Each camera (1-10) has the following variables. Replace `1` with the camera number:

| Variable | Description |
|----------|-------------|
| `$(panasonic-mps:cam1_name)` | Camera name |
| `$(panasonic-mps:cam1_ip)` | Camera IP address |
| `$(panasonic-mps:cam1_framing_enabled)` | Framing enable status |
| `$(panasonic-mps:cam1_framing_running)` | Running/Stopped |
| `$(panasonic-mps:cam1_framing_status)` | Status (Stopped/Tracking/Lost/Searching) |
| `$(panasonic-mps:cam1_auto_zoom)` | Auto Zoom On/Off |
| `$(panasonic-mps:cam1_auto_face_search)` | Auto Face Search On/Off |
| `$(panasonic-mps:cam1_person_count)` | Number of persons detected |
| `$(panasonic-mps:cam1_target_count)` | Number of active targets |
| `$(panasonic-mps:cam1_ptz_moving)` | Moving/Idle |
| `$(panasonic-mps:cam1_pt_speed)` | Pan/Tilt speed (-2 to +2) |
| `$(panasonic-mps:cam1_z_speed)` | Zoom speed (-2 to +2) |
| `$(panasonic-mps:cam1_sensitivity)` | Sensitivity (-2 to +2) |

---

## Auto Tracking Plugin

### Actions

| Action | Description |
|--------|-------------|
| **Set Tracking Enable** | Enable/disable auto tracking for a camera |
| **Set Tracking Lock** | Lock/unlock tracking |
| **Preset Exec** | Recall a preset (1-100) |
| **Preset Regist** | Register current position to a preset |
| **Preset Delete** | Delete a preset |
| **Set Tracking Target** | Set target coordinates for tracking |

### Feedbacks

| Feedback | Description | Default Color |
|----------|-------------|---------------|
| **Auto Tracking Enabled** | True when auto tracking is enabled | Green |
| **Auto Tracking Locked** | True when tracking is locked | Yellow |

### Variables

| Variable | Description |
|----------|-------------|
| `$(panasonic-mps:at_cam1_enabled)` | Auto Tracking enabled On/Off |
| `$(panasonic-mps:at_cam1_locked)` | Tracking lock status |
| `$(panasonic-mps:at_cam1_preset)` | Current preset number |

---

## Video Mixer Plugin

### Actions

| Action | Description |
|--------|-------------|
| **Set PGM Cell** | Select program cell (1-4) |
| **Set Multi-View Layout** | Change layout mode (1-4) |
| **Set VM Enable** | Enable/disable video mixer output |
| **Set DSK Enable** | Enable/disable downstream key |
| **Set Audio Volume** | Set audio volume (0-100) |
| **Fade Out** | Fade to black or white |
| **Fade In** | Fade from black or white |

### Feedbacks

| Feedback | Description | Default Color |
|----------|-------------|---------------|
| **Video Mixer PGM Cell** | True when specified cell is on program | Red |
| **Video Mixer Enabled** | True when video mixer is enabled | Green |

### Variables

| Variable | Description |
|----------|-------------|
| `$(panasonic-mps:vm_pgm_cell)` | Current PGM cell (1-4) |
| `$(panasonic-mps:vm_layout)` | Current layout mode |
| `$(panasonic-mps:vm_enabled)` | Video Mixer enabled/disabled |
| `$(panasonic-mps:vm_volume)` | Audio volume level |

---

## License API

### Actions

| Action | Description |
|--------|-------------|
| **Get License Data** | Query license status for all plugins |

### Feedbacks

| Feedback | Description | Default Color |
|----------|-------------|---------------|
| **License Active** | True when specified license is active | Green |

### Variables

| Variable | Description |
|----------|-------------|
| `$(panasonic-mps:license_autoframing)` | Auto Framing license status |
| `$(panasonic-mps:license_autotracking)` | Auto Tracking license status |
| `$(panasonic-mps:license_videomixer)` | Video Mixer license status |

---

## Presets

Pre-configured button presets are available for cameras 1-4:

- Enable/Disable framing
- Start/Stop/Toggle tracking
- Auto Zoom toggle
- Auto Face Search
- Frame Mapping
- Pan Left/Right controls
- Tilt Up/Down controls
- Zoom In/Out controls
- Advanced Preset recall (1-5)
- Target Frame recall (1-5)

---

## API Information

### Auto Framing Plugin
- Protocol: HTTP 1.1 GET requests
- Default Port: 1338
- Status update rate: ~5 Hz

### MPS Services (License, Auto Tracking, Video Mixer)
- Protocol: HTTP 1.1 GET requests
- Default Port: 1337
- Polling: Every 5 cycles (reduced load)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Connection Failed** | Verify IP address and ports; ensure Media Production Suite is running |
| **Commands Return NACK** | Check if camera is properly registered |
| **Status Not Updating** | Increase poll interval or check network connectivity |
| **Advanced Features Not Working** | Ensure PC_GPU mode is enabled and licensed |
| **Video Mixer Not Responding** | Verify MPS port (1337) is correct |

## Support

For issues with this module, please visit the Bitfocus Companion GitHub repository.

For issues with the Panasonic Media Production Suite, contact Panasonic support.
