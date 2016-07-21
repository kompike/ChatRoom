var MessageDTO = function(author, message, color) {
	
	var _getAuthor = function() {
		return author;
	}
	var _getMessage = function() {
		return message;
	}
	var _getColor = function() {
		return color;
	}
	
	return {
		'getAuthor': _getAuthor,
		'getMessage': _getMessage,
		'getColor': _getColor
	};
}

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
	return MessageDTO;
});