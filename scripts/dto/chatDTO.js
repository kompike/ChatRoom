var ChatDTO = function(name, users) {
	
	var _getName = function() {
		return name;
	}
	var _addUser = function(user) {
		users.push(user);
	}
	
	return {
		name : name, 
		users : [],
		'addUser': _addUser,
		'getName': _getName
	};
}

define(function() {
	return ChatDTO;
});