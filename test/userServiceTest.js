var UserService = require('../scripts/service/userservice');
var StorageService = require('../scripts/service/storageservice');
var ErrorMessages = require('../scripts/errorMessages');
var EventBus = require('../scripts/eventbus');
var Events = require('../scripts/events');

var eventBus = new EventBus();

var test = require('unit.js');

/* TESTS */

describe('User registration service should', function(){

	it('allow to create new user', function(){

		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		
		var nickname = 'User';
		var password = 'password';
		var registered = false;
		
		var expectedUserId = 'user_0';
		
		eventBus.subscribe(Events.USER_REGISTERED, function(userId) {
			registered = (userId === expectedUserId);
		});
		
		var user = {
			'nickname': nickname, 
			'password': password, 
			'repeatPassword': password
		};
		
		userService.onUserAdded(user);		
				
		var userFromStorage = userService.getUserByNickname(user.nickname);
		var name = userFromStorage.getName();
		
		var userList = userService.getUsers();	
		
		test
			.object(userFromStorage)
				.isNotEmpty()
			.string(name)
				.is('User')
			.bool(registered)
				.isTrue()
			.array(userList)
				.isNotEmpty()
				.hasLength(1);
	});
	
	it('prohibit registation of already existing user', function(){

		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);

		var expectedMessage = ErrorMessages.USER_ALREADY_EXISTS;
		var delivered = false;

		var nickname = 'User';
		var password = 'password';
		var registered = false;
		
		var expectedUserId = 'user_0';

		eventBus.subscribe(Events.USER_REGISTERED, function(userId) {
			registered = (userId === expectedUserId);
		});

		eventBus.subscribe(Events.REGISTRATION_FAILED, function(message) {
			delivered = (expectedMessage === message);
		});
		
		var user = {
			'nickname': nickname, 
			'password': password, 
			'repeatPassword': password
		};

		userService.onUserAdded(user);
		
		var userList = userService.getUsers();
		
		test
			.bool(delivered)
				.isFalse()
			.bool(registered)
				.isTrue()
			.array(userList)
				.isNotEmpty()
				.hasLength(1);
		
		userService.onUserAdded(user);
		
		test
			.bool(delivered)
				.isTrue()
			.bool(registered)
				.isTrue()
			.array(userList)
				.isNotEmpty()
				.hasLength(1);
	});

	it('prohibit registration of user with whitespaces in nickname', function(){

		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		
		var expectedMessage = ErrorMessages.WHITESPACES_IN_NICKNAME_NOT_ALLOWED;
		var nickname = 'User 1';
		var delivered = false;
		
		eventBus.subscribe(Events.REGISTRATION_FAILED, function(message) {
			delivered = (expectedMessage === message);
		});
		
		var user = {
			'nickname': nickname, 
			'password': 'password', 
			'repeatPassword': 'password'
		};
			
		userService.onUserAdded(user);
		
		var userFromStorage = userService.getUserByNickname(nickname);
		
		var userList = userService.getUsers();
		
		test
			.bool(delivered)
				.isTrue()
			.value(userFromStorage)
				.isNull()
			.array(userList)
				.isEmpty();
	});
	
	it('prohibit registration of user with different passwords', function(){
		
		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		
		var expectedMessage = ErrorMessages.PASSWORDS_NOT_EQUAL;
		var nickname = 'User';
		var delivered = false;
		
		eventBus.subscribe(Events.REGISTRATION_FAILED, function(message) {
			delivered = (expectedMessage === message);
		});
		
		var user = {
			'nickname': nickname, 
			'password': 'password', 
			'repeatPassword': 'pass'
		};
			
		userService.onUserAdded(user);
		
		var userFromStorage = userService.getUserByNickname(nickname);
		
		var userList = userService.getUsers();
		
		test
			.bool(delivered)
				.isTrue()
			.value(userFromStorage)
				.isNull()
			.array(userList)
				.isEmpty();
	});	

	it('prohibit registration of user with empty fields', function(){
		
		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		
		var expectedMessage = ErrorMessages.EMPTY_FIELDS_NOT_ALLOWED;
		var delivered = false;
		
		eventBus.subscribe(Events.REGISTRATION_FAILED, function(message) {
			delivered = (expectedMessage === message);
		});
		
		var user = {
			'nickname': '', 
			'password': 'password', 
			'repeatPassword': 'pass'
		};
			
		userService.onUserAdded(user);
		
		var userFromStorage = userService.getUserByNickname('');
		
		var userList = userService.getUsers();
		
		test
			.bool(delivered)
				.isTrue()
			.value(userFromStorage)
				.isNull()
			.array(userList)
				.isEmpty();
	});	
	
	it('trim nickname while registering new user', function(){

		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);

		var expectedMessage = ErrorMessages.USER_ALREADY_EXISTS;
		var delivered = false;
		
		var expectedUserId = 'user_0';

		var nicknameWithWhitespaces = '    User   ';
		var nickname = 'User';
		var password = 'password';
		var registered = false;

		eventBus.subscribe(Events.USER_REGISTERED, function(userId) {
			registered = (userId === expectedUserId);
		});

		eventBus.subscribe(Events.REGISTRATION_FAILED, function(message) {
			delivered = (expectedMessage === message);
		});
		
		var user = {
			'nickname': nickname, 
			'password': password, 
			'repeatPassword': password
		};

		userService.onUserAdded(user);
		
		var userList = userService.getUsers();
		
		test
			.bool(delivered)
				.isFalse()
			.bool(registered)
				.isTrue()
			.array(userList)
				.isNotEmpty()
				.hasLength(1);
		
		var newUser = {
			'nickname': nicknameWithWhitespaces, 
			'password': password, 
			'repeatPassword': password
		};
		
		userService.onUserAdded(newUser);
		
		test
			.bool(delivered)
				.isTrue()
			.bool(registered)
				.isTrue()
			.array(userList)
				.isNotEmpty()
				.hasLength(1);
	});	
});

describe('User login service should', function(){
	
	var storage = new StorageService();
	var userService = new UserService(eventBus, storage);
	
	var nickname = 'User';
	var password = 'password';
	
	var user = {
		'nickname': nickname, 
		'password': password, 
		'repeatPassword': password
	};
		
	userService.onUserAdded(user);

	it('allow to register new user', function(){
		
		var expectedName = nickname;
		var delivered = false;
		
		eventBus.subscribe(Events.LOGIN_SUCCESSFULL, function(userName) {
			delivered = (userName === expectedName);
		});
		
		userService.onUserLogin({
			'nickname': nickname, 
			'password': password
		});
		
		test
			.bool(delivered)
				.isTrue();
	});	

	it('prohibit login of not registered user', function(){
		
		var expectedMessage = ErrorMessages.INCORRECT_CREDENTIALS;
		var delivered = false;
		
		eventBus.subscribe(Events.LOGIN_FAILED, function(message) {
			delivered = (message === expectedMessage);
		});
		
		userService.onUserLogin({
			'nickname': 'NotRegisteredUser', 
			'password': password
		});
		
		test
			.bool(delivered)
				.isTrue();
	});
	
	it('check password correctness', function(){
		
		var expectedMessage = ErrorMessages.INCORRECT_CREDENTIALS;
		var delivered = false;
		
		eventBus.subscribe(Events.LOGIN_FAILED, function(message) {
			delivered = (message === expectedMessage);
		});
		
		userService.onUserLogin({
			'nickname': nickname, 
			'password': 'IncorrectPassword'
		});
		
		test
			.bool(delivered)
				.isTrue();
	});
});