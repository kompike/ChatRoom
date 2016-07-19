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

define(function() {
	return MessageDTO;
});