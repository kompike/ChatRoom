var UserService = function(eventBus, userStorage) {
	
	var eventType = {
		registrationFailed : 'REGISTRATION_FAILED', 
		newUserAdded : 'NEW_USER_ADDED',
		userListUpdated : 'USER_LIST_UPDATED',
		userRegistered : 'USER_REGISTERED'
	}
	
	var _addUser = function(user) {		
		if (_checkIfUserExists(user)) {			
			eventBus.post(eventType.registrationFailed, "User already exists");			
		} else {			
			var nickname = user.nickname;
			var password = user.password;
			var repeatPassword = user.repeatPassword;
			
			if (nickname === "" || password === "" || repeatPassword === "") {
				eventBus.post(eventType.registrationFailed, "All fields must be filled");				
			} else {
				if (password !== repeatPassword) {
					eventBus.post(eventType.registrationFailed, "Passwords must be equal");
				} else {				
					userStorage.addUser(user);				
					var userList = _getUsers();				
					eventBus.post(eventType.userRegistered, user);
					eventBus.post(eventType.userListUpdated, userList);
				}				
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
		'onUserAdded' : _onUserAdded, 
		'getUsers' : _getUsers,
		'getUserByNickname' : _getUserByNickname
	};	
}

define(function() {
	return UserService;
});