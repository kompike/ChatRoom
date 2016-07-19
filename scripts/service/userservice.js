var UserService = function(eventBus, storageService) {
	
	var _userCollection = 'users';
	
	var _addUser = function(user) {
		
		var userList = _getUsers();
		if (typeof userList === 'undefined') {
			storageService.createCollection(_userCollection);			
		}		
		if (_checkIfUserExists(user)) {
			eventBus.post(EventType.registrationFailed, "User already exists");			
		} else {			
			var nickname = user.nickname.trim();
			var password = user.password.trim();
			var repeatPassword = user.repeatPassword.trim();
			
			if (nickname === "" || password === "" || repeatPassword === "") {
				eventBus.post(EventType.registrationFailed, "All fields must be filled");				
			} else {
				if (password !== repeatPassword) {
					eventBus.post(EventType.registrationFailed, "Passwords must be equal");
				} else {
					var userDTO = new UserDTO(nickname, password);
					storageService.addItem(_userCollection, userDTO);					
					var userList = _getUsers();				
					eventBus.post(EventType.userRegistered, userDTO);
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
		var users = storageService.findAll( );
		return users;
	}
	
	var _loginUser = function(user) {
			
		if (!_checkIfUserExists(user)) {
			eventBus.post(EventType.loginFailed, "User not registered!");			
		} else {			
			var name = user.nickname;
			var pass = user.password;
			
			var userFromStorage = _getUserByNickname(name);
			var userPassword = userFromStorage.getPassword();
			
			if (pass !== userPassword) {
				eventBus.post(EventType.loginFailed, "Incorrect password");
			} else {			
				eventBus.post(EventType.userLoggedIn, userFromStorage);
			}
		}		
	}	
		
	var _onUserLogin = function(user) {
		_loginUser(user);
	}
	
	return {
		'onUserAdded' : _onUserAdded, 
		'onUserLogin' : _onUserLogin, 
		'getUsers' : _getUsers,
		'getUserByNickname' : _getUserByNickname
	};	
}

define(function() {
	return UserService;
});