var UserService = function(eventBus, storageService) {
	
	var eventType = {
		registrationFailed : 'REGISTRATION_FAILED', 
		newUserAdded : 'NEW_USER_ADDED',
		userListUpdated : 'USER_LIST_UPDATED',
		userRegistered : 'USER_REGISTERED'
	}
	
	var _userCollection = 'users';
	
	var _addUser = function(user) {
		
		var userList = _getUsers();
		if (typeof userList === 'undefined') {
			storageService.createCollection(_userCollection);			
		}		
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
					var userDTO = new UserDTO(nickname, password);
					storageService.addItem(_userCollection, userDTO);					
					var userList = _getUsers();				
					eventBus.post(eventType.userRegistered, userDTO);
					eventBus.post(eventType.userListUpdated, userList);
				}				
			}
			
		}		
	}
		
	var _onUserAdded = function(user) {
		_addUser(user);
	}
	
	var _checkIfUserExists = function(user) {
		return storageService.findItemByName(_userCollection, user.nickname) !== null;
	}
	
	var _getUserByNickname = function(nickname) {
		var user = storageService.findItemByName(_userCollection, nickname);
		return user;
	}
	
	var _getUsers = function() {
		var users = storageService.findAll(_userCollection);
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