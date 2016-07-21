if (typeof define !== 'function') {
    var UserDTO = require('../dto/userDTO');
	var events = require('../events');
	var errorMessages = require('../errormessages');
}

var UserService = function(eventBus, storageService) {
		
	var _userCollection = 'user';
	
	var _addUser = function(user) {
		
		var newUserId = null;
		var userList = _getUsers();
		if (typeof userList === 'undefined') {
			storageService.createCollection(_userCollection);			
		}		
		if (_checkIfUserExists(user)) {
			eventBus.post(events.REGISTRATION_FAILED, errorMessages.USER_ALREADY_EXISTS);			
		} else {			
			var nickname = user.nickname.trim();
			var password = user.password;
			var repeatPassword = user.repeatPassword;
			
			if (nickname === "" || password === "" || repeatPassword === "") {
				eventBus.post(events.REGISTRATION_FAILED, errorMessages.EMPTY_FIELDS_NOT_ALLOWED);				
			} else {
				if (password !== repeatPassword) {
					eventBus.post(events.REGISTRATION_FAILED, errorMessages.PASSWORDS_NOT_EQUAL);
				} else {
					var userDTO = new UserDTO(nickname, password);
					newUserId = storageService.addItem(_userCollection, userDTO);			
					eventBus.post(events.USER_REGISTERED, userDTO);
				}				
			}			
		}
		
		return newUserId;
	}
		
	var _onUserAdded = function(user) {
		return _addUser(user);
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
	
	var _loginUser = function(user) {
			
		if (!_checkIfUserExists(user)) {
			eventBus.post(events.LOGIN_FAILED, errorMessages.INCORRECT_CREDENTIALS);			
		} else {			
			var name = user.nickname;
			var pass = user.password;
			
			var userFromStorage = _getUserByNickname(name);
			var userPassword = userFromStorage.getPassword();
			
			if (pass !== userPassword) {
				eventBus.post(events.LOGIN_FAILED, errorMessages.INCORRECT_CREDENTIALS);
			} else {			
				eventBus.post(events.LOGIN_SUCCESSFULL, userFromStorage);
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

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
	return UserService;
});