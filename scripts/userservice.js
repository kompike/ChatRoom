var UserService = function(eventBus, userStorage) {
	
	var _addUser = function(user) {		
		if (_checkIfUserExists(user)) {			
			eventBus.post('Registration_failed', "User already exists");			
		} else {			
			var nickname = user.nickname;
			var password = user.password;
			var repeatPassword = user.repeatPassword;
			
			if (password !== repeatPassword) {
				eventBus.post('Registration_failed', "Passwords must be equal");
			} else {				
				userStorage.addUser(user);				
				var userList = _getUsers();				
				eventBus.post('User_created', userList);
				eventBus.post('User_list_updated', userList);
			}
		}		
	}
		
	var _onUserAdded = function(user) {
		_addUser(user);
	}
	
	var _checkIfUserExists = function(user) {
		var nickname = user.nickname;
		var list = _getUsers();
		return list.indexOf(nickname) > -1;
	}
	
	var _getUserByNickname = function(nickname) {
		var user = userStorage.getUserByNickname(nickname);
		return user;
	}
	
	var _getUsers = function() {
		var users = userStorage.getAllUsers()
		return users;
	}
	
	return {
		'addUser' : _addUser, 
		'onUserAdded' : _onUserAdded, 
		'getUsers' : _getUsers,
		'getUserByNickname' : _getUserByNickname
	};	
}

define(function() {
	return UserService;
});