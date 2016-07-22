if (typeof define !== 'function') {
    var UserDTO = require('../dto/userDTO');
	var Events = require('../events');
	var ErrorMessages = require('../errorMessages');
}

var UserService = function(eventBus, storageService) {
		
	var _userCollection = 'user';
	
	var _addUser = function(user) {
		
		var newUserId = null;
		var userList = _getUsers();
		var nickname = user.nickname.trim();
		if (typeof userList === 'undefined') {
			storageService.createCollection(_userCollection);			
		}		
		if (_checkIfUserExists(nickname)) {
			eventBus.post(Events.REGISTRATION_FAILED, ErrorMessages.USER_ALREADY_EXISTS);			
		} else if (nickname.indexOf(' ') > 0) {
			eventBus.post(Events.REGISTRATION_FAILED, ErrorMessages.WHITESPACES_IN_NICKNAME_NOT_ALLOWED);				
		} else {			
			var password = user.password;
			var repeatPassword = user.repeatPassword;
			
			if (nickname === "" || password === "" || repeatPassword === "") {
				eventBus.post(Events.REGISTRATION_FAILED, ErrorMessages.EMPTY_FIELDS_NOT_ALLOWED);				
			} else {
				if (password !== repeatPassword) {
					eventBus.post(Events.REGISTRATION_FAILED, ErrorMessages.PASSWORDS_NOT_EQUAL);
				} else {
					var userDTO = new UserDTO(nickname, password);
					newUserId = storageService.addItem(_userCollection, userDTO);			
					eventBus.post(Events.USER_REGISTERED, newUserId);
				}				
			}			
		}
		
		return newUserId;
	}
		
	var _onUserAdded = function(user) {
		return _addUser(user);
	}
	
	var _checkIfUserExists = function(nickname) {
		return storageService.findItemByName(_userCollection, nickname) !== null;
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
		
		var name = user.nickname;
		if (!_checkIfUserExists(name)) {
			eventBus.post(Events.LOGIN_FAILED, ErrorMessages.INCORRECT_CREDENTIALS);			
		} else {			
			var pass = user.password;			
			var userFromStorage = _getUserByNickname(name);
			var userPassword = userFromStorage.getPassword();
			
			if (pass !== userPassword) {
				eventBus.post(Events.LOGIN_FAILED, ErrorMessages.INCORRECT_CREDENTIALS);
			} else {			
				eventBus.post(Events.LOGIN_SUCCESSFULL, name);
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