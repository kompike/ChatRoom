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
}

define(function() {
	return UserDTO;
});