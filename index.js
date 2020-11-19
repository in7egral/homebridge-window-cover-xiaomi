var request = require("request");
var PythonShell = require('python-shell');

var Service, Characteristic;

module.exports = function(homebridge) {
	console.log("homebridge API version: " + homebridge.version);
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	// TODO: change name to homebridge-mi-curtain
	homebridge.registerAccessory("homebridge-window-cover", "WindowCover", WindowCover);
};


function WindowCover(log, config) {
	this.service = new Service.WindowCovering(this.name);
	this.log = log;
	this.name = config.name || "Window cover";
	this.id = config.id || 0;
	this.token = config.token;
	this.ip = config.ip;
	this.pythonScriptPath = config.pythonScriptPath;
	this.pythonScriptName = config.pythonScriptName;
	this.pythonPath = config.pythonPath;
	this.targetNotSet = true;

	// Required Characteristics
	this.currentPosition = 100;
	this.targetPosition = 100;

	//Characteristic.PositionState.DECREASING = 0;
	//Characteristic.PositionState.INCREASING = 1;
	//Characteristic.PositionState.STOPPED = 2;

	this.positionState = Characteristic.PositionState.STOPPED;
	this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);

	// Optional Characteristics
	//this.holdPosition = Characteristic.HoldPosition;
	//this.targetHorizontalTiltAngle = Characteristic.TargetHorizontalTiltAngle;
	//this.targetVerticalTiltAngle = Characteristic.TargetVerticalTiltAngle;
	//this.currentHorizontalTiltAngle = Characteristic.CurrentHorizontalTiltAngle;
	//this.currentVerticalTiltAngle = Characteristic.CurrentVerticalTiltAngle;
	//this.obstructionDetected = Characteristic.ObstructionDetected;

}

WindowCover.prototype = {
	//Start
	identify: function(callback) {
		this.log("Identify requested!");
		callback(null);
	},
	// Required
	getCurrentPosition: function(callback) {
		var error = null;

		if (this.pythonScriptPath !== undefined) {
			var options = {};
			options.args = [ this.ip, this.token ];
			options.scriptPath = this.pythonScriptPath
			options.pythonPath = this.pythonPath

			this.log("getCurrentPosition, ask the device");
			PythonShell.run(this.pythonScriptName, options, function (err, results) {
				if (err) {
					this.log("Script Error", options.scriptPath, options.args, err);
					callback(err);
				} else {
					// results is an array consisting of messages collected during execution
					//console.log('Success ! Results: %j', results);
					if (Array.isArray(results) && results.length > 0) {
						this.currentPosition = results[0];
						if (this.targetNotSet) {
							this.targetPosition = this.currentPosition;
							this.targetNotSet = false;
						}
					}
					else {
						this.currentPosition = 100;
					}
					this.service.setCharacteristic(Characteristic.CurrentPosition, this.currentPosition);
					this.log("currentPosition is now %d", this.currentPosition);
					this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);
					callback(error, this.currentPosition); // success
				}
			}.bind(this));
		} else {
			this.log("getCurrentPosition, last known value: ", this.currentPosition);
			callback(error, this.currentPosition);
		}
	},

	getName: function(callback) {
		this.log("getName :", this.name);
		var error = null;
		callback(error, this.name);
	},

	getTargetPosition: function (callback) {
		if (this.targetNotSet) {
			if(this.pythonScriptPath !== undefined) {
				var options = {};
				options.args = [ this.ip, this.token ];
				options.scriptPath = this.pythonScriptPath
				options.pythonPath = this.pythonPath

				this.log("getTargetPosition, ask the device");
				PythonShell.run(this.pythonScriptName, options, function (err, results) {
					if (err) {
						this.log("Script Error", options.scriptPath, options.args, err);
						callback(err);
					} else {
						// results is an array consisting of messages collected during execution
						//console.log('Success ! Results: %j', results);
						if (Array.isArray(results) && results.length > 0) {
							this.targetPosition = results[0];
						}
						else {
							this.targetPosition = 100;
						}
						this.log("targetPosition is now %d", this.targetPosition);
						callback(error, this.targetPosition); // success
					}
				}.bind(this));
				this.targetNotSet = false;
			}
		}
		if (this.targetNotSet) {
			this.log("getTargetPosition, known:", this.targetPosition);
			var error = null;
			callback(error, this.targetPosition);
		}
	},

	setTargetPosition: function (value, callback) {
		this.log("setTargetPosition from %s to %s", this.targetPosition, value);
		this.targetPosition = value;
		this.targetNotSet = false;

		if (this.targetPosition > this.currentPosition) {
			this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.INCREASING);
		} else if (this.targetPosition < this.currentPosition) {
			this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.DECREASING);
		} else { // this.targetPosition = this.currentPosition
			this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);
		}		

		if (this.pythonScriptPath !== undefined) {
			var options = {};
			options.args = [ this.ip, this.token, this.targetPosition ];
			options.scriptPath = this.pythonScriptPath
			options.pythonPath = this.pythonPath

			PythonShell.run(this.pythonScriptName, options, function (err, results) {
				if (err) {
					this.log("Script Error", options.scriptPath, options.args, err);
					callback(err);
				} else {
					// results is an array consisting of messages collected during execution
					//console.log('Success ! Results: %j', results);
					this.currentPosition = this.targetPosition;
					this.service.setCharacteristic(Characteristic.CurrentPosition, this.currentPosition);
					this.log("currentPosition is now %d", this.currentPosition);
					this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);
					callback(null); // success
				}
			}.bind(this));
		} else {
			this.log("Fake Success");
			this.currentPosition = this.targetPosition;
			this.service.setCharacteristic(Characteristic.CurrentPosition, this.currentPosition);
			this.log("currentPosition is now %d", this.currentPosition);
			this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);
			callback(null); // success
		}
	},

	getPositionState: function(callback) {
		this.log("getPositionState:", this.positionState);
		var error = null;
		callback(error, this.positionState);
	},

	getServices: function() {

		// you can OPTIONALLY create an information service if you wish to override
		// the default values for things like serial number, model, etc.
		var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, "Xiaomi Lumi")
			.setCharacteristic(Characteristic.Model, "Smart Curtain Controller")
			.setCharacteristic(Characteristic.SerialNumber, "hello");

		this.service
			.getCharacteristic(Characteristic.Name)
			.on('get', this.getName.bind(this));

		// Required Characteristics
		this.service
			.getCharacteristic(Characteristic.CurrentPosition)
			.on('get', this.getCurrentPosition.bind(this));

 		this.service
			.getCharacteristic(Characteristic.TargetPosition)
			.on('get', this.getTargetPosition.bind(this))
			.on('set', this.setTargetPosition.bind(this));

		this.service
			.getCharacteristic(Characteristic.PositionState)
			.on('get', this.getPositionState.bind(this));

		// Optional Characteristics
		//TODO
	
		return [informationService, this.service];
	}
};
