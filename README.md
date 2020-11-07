# homebridge-window-cover

Supports "Xiaomi Youpin Smart Curtain Motor" window cover on HomeBridge Platform

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install python-miio using: apt install python-miio (on macOS: brew install python-miio).
3. Install this plugin.
4. Update your configuration file as bellow.

# Configuration

Configuration sample:

 ```
    {
        "bridge": {
            ...
        },
        
        "description": "...",

        "accessories": [
            {
                "accessory": "WindowCover",
                "name": "Window Cover Demo",
                "id": "123",
                "ip": "DEVICE_IP",
                "token": "DEVICE_TOKEN",
                "pythonPath": "/usr/local/bin/python3",
                "pythonScriptPath": "ABSOLUTE_PATH_TO_SCRIPT",
                "pythonScriptName": "SCRIPT_NAME.py"
            }
        ],

        "platforms":[]
    }
```

Note: `pythonPath` is optional argument if you have a few python installation (e.g. python2, python3).
