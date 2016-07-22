var UserService = require('../scripts/service/userservice');
var StorageService = require('../scripts/service/storageservice');
var EventBus = require('../scripts/eventbus');
var events = require('../scripts/events');

var eventBus = new EventBus();

var test = require('unit.js');

/* TESTS */

describe('User registration service should', function(){

	it('Register new user', function(){

		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		
		var nickname = 'User';
		var password = 'password';
		var registered = false;
		
		var expectedNickname = nickname;
		
		eventBus.subscribe(events.USER_REGISTERED, function(user) {
			registered = (user.getName() === expectedNickname);
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
	
	it('Avoid registering already existing user', function(){

		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);

		var expectedMessage = 'User already exists';
		var delivered = false;

		var nickname = 'User';
		var password = 'password';
		var registered = false;

		eventBus.subscribe(events.USER_REGISTERED, function(user) {
			registered = (user.getName() === nickname);
		});

		eventBus.subscribe(events.REGISTRATION_FAILED, function(message) {
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

	it('Avoid registering user with whitespaces in nickname', function(){

		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		
		var expectedMessage = 'Nickname can not contain whitespaces';
		var nickname = 'User 1';
		var delivered = false;
		
		eventBus.subscribe(events.REGISTRATION_FAILED, function(message) {
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
	
	it('Check passwords equality', function(){
		
		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		
		var expectedMessage = 'Passwords must be equal';
		var nickname = 'User';
		var delivered = false;
		
		eventBus.subscribe(events.REGISTRATION_FAILED, function(message) {
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

	it('Check empty fields', function(){
		
		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		
		var expectedMessage = 'All fields must be filled';
		var delivered = false;
		
		eventBus.subscribe(events.REGISTRATION_FAILED, function(message) {
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
	
	it('Trim nickname while registering new user', function(){

		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);

		var expectedMessage = 'User already exists';
		var delivered = false;

		var nicknameWithWhitespaces = '    User   ';
		var nickname = 'User';
		var password = 'password';
		var registered = false;

		eventBus.subscribe(events.USER_REGISTERED, function(user) {
			registered = (user.getName() === nickname);
		});

		eventBus.subscribe(events.REGISTRATION_FAILED, function(message) {
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

	it('Login registered user', function(){
		
		var expectedName = nickname;
		var delivered = false;
		
		eventBus.subscribe(events.LOGIN_SUCCESSFULL, function(user) {
			delivered = (user.getName() === expectedName);
		});
		
		userService.onUserLogin({
			'nickname': nickname, 
			'password': password
		});
		
		test
			.bool(delivered)
				.isTrue();
	});	

	it('Avoid login not registered user', function(){
		
		var expectedMessage = 'Incorrect login / password';
		var delivered = false;
		
		eventBus.subscribe(events.LOGIN_FAILED, function(message) {
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
	
	it('Check password correctness', function(){
		
		var expectedMessage = 'Incorrect login / password';
		var delivered = false;
		
		eventBus.subscribe(events.LOGIN_FAILED, function(message) {
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