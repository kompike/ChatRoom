var UserDTO = function(nickname, password) {
	
	var _getName = function() {
		return nickname;
	}
	
	return {
		nickname : nickname, 
		password : password,
		'getName': _getName
	};
}

define(function() {
	return UserDTO;
});