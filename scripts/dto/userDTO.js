var UserDTO = function(nickname, password) {
	
	var _getId = function() {
		return this.id;
	}
	
	var _setId = function(userId) {
		this.id = userId;
	}	
	
	var _getName = function() {
		return nickname;
	}
	
	var _getPassword = function() {
		return password;
	}
	
	return {
		'getId': _getId,
		'setId': _setId,
		'getName': _getName,
		'getPassword': _getPassword
	};
};

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
	return UserDTO;
});