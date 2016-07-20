var EventBus = function(){

	var _subscribers = {};
	
	var _post = function(eventType, someEvent) {
			
		var eventTypeSubscribers = _subscribers[eventType];
		
		if (eventTypeSubscribers == undefined) {
			
			console.log("Subscribers not found for eventType : " + eventType);
			
		} else {
			
			for (var i = 0; i < eventTypeSubscribers.length; i++) {
				
				var callback = function(callbackIndex) {
					
					setTimeout(function() {
					
						var currentCallback = eventTypeSubscribers[callbackIndex];
						
						currentCallback(someEvent);
						
					}, 0);
					
				}
				
				callback(i);				
			}
		}	
	};
	
	var _subcribe = function(eventType, callback) {
		
		if (typeof (_subscribers[eventType]) === 'undefined') {
			
			_subscribers[eventType] = [];
			
		}
		
		if (typeof (callback) === 'function') {
			
			_subscribers[eventType].push(callback);
			
		} else {
			
			console.log("Callback must be function for event type : " + eventType);
			
		}		
	};
	
	return {
		"post": _post, 
		"subscribe": _subcribe
	};
}

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
	return EventBus;
});