var UserDTO = function(nickname, password) {
	
	var _getName = function() {
		return nickname;
	}
	
	var _getPassword = function() {
		return password;
	}
	
	return {
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