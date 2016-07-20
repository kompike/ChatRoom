var MessageDTO = function(author, message) {
	
	var _getAuthor = function() {
		return author;
	}
	var _getMessage = function() {
		return message;
	}
	
	return {
		'getAuthor': _getAuthor,
		'getMessage': _getMessage
	};
}

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
	return MessageDTO;
});