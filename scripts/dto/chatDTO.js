var ChatDTO = function(name, owner, users, messages) {
		
	var _getId = function() {
		return this.id;
	}
	
	var _setId = function(chatId) {
		this.id = chatId;
	}	
	var _getName = function() {
		return name;
	}
	
	var _getOwner = function() {
		return owner;
	}
	
	var _getUsers = function() {
		return users;
	}
	
	var _getMessages = function() {
		return messages;
	}
	
	var _addUser = function(user) {
		users.push(user);
	}
	
	var _addMessage = function(message) {
		messages.push(message);
	}
	
	return {
		'getId': _getId,
		'setId': _setId,
		'getUsers': _getUsers,
		'getMessages': _getMessages,
		'addUser': _addUser,
		'getName': _getName,
		'addMessage': _addMessage,
		'getOwner': _getOwner
	};
};

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
	return ChatDTO;
});