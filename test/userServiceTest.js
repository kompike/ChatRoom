var UserService = require('../scripts/service/userservice');
var StorageService = require('../scripts/service/storageservice');
var EventBus = require('../scripts/eventbus');
var events = require('../scripts/events');

var eventBus = new EventBus();

var test = require('unit.js');

/* TESTS */

describe('Testing user registration', function(){

	it('New user registered', function(){

		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		
		var expectedNickname = 'User';
		var registered = false;
		
		eventBus.subscribe(events.USER_REGISTERED, function(user) {
			registered = (user.getName() === expectedNickname);
		});
		
		var user = {
			"nickname":"User", 
			"password":"password", 
			"repeatPassword":"password"
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
	
	it('User already exists', function(){

		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);

		var expectedMessage = 'User already exists';
		var delivered = false;

		var expectedNickname = 'User';
		var registered = false;

		eventBus.subscribe(events.USER_REGISTERED, function(user) {
			registered = (user.getName() === expectedNickname);
		});

		eventBus.subscribe(events.REGISTRATION_FAILED, function(message) {
			delivered = (expectedMessage === message);
		});

		var user = {
			"nickname":"User", 
			"password":"password", 
			"repeatPassword":"password"
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
	
	it('Testing passwords equality', function(){
		
		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		
		var expectedMessage = 'Passwords must be equal';
		var delivered = false;
		
		eventBus.subscribe(events.REGISTRATION_FAILED, function(message) {
			delivered = (expectedMessage === message);
		});
		
		var user = {
			"nickname":"User", 
			"password":"password", 
			"repeatPassword":"pass"
		};
			
		userService.onUserAdded(user);
		
		var userFromStorage = userService.getUserByNickname('User');
		
		var userList = userService.getUsers();
		
		test
			.bool(delivered)
				.isTrue()
			.value(userFromStorage)
				.isNull()
			.array(userList)
				.isEmpty();
	});	

	it('Testing empty fields', function(){
		
		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		
		var expectedMessage = 'All fields must be filled';
		var delivered = false;
		
		eventBus.subscribe(events.REGISTRATION_FAILED, function(message) {
			delivered = (expectedMessage === message);
		});
		
		var user = {
			"nickname":"", 
			"password":"password", 
			"repeatPassword":"pass"
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
});

describe('Testing user login', function(){
	
	var storage = new StorageService();
	var userService = new UserService(eventBus, storage);
		
	var user = {
		"nickname":"User", 
		"password":"password", 
		"repeatPassword":"password"
	};
		
	userService.onUserAdded(user);

	it('Testing user login', function(){
		
		var expectedName = 'User';
		var delivered = false;
		
		eventBus.subscribe(events.LOGIN_SUCCESSFULL, function(user) {
			delivered = (user.getName() === expectedName);
		});
		
		userService.onUserLogin({
			"nickname":"User", 
			"password":"password"
		});
		
		test
			.bool(delivered)
				.isTrue();
	});	

	it('Testing not registered user login', function(){
		
		var expectedMessage = 'Incorrect login / password';
		var delivered = false;
		
		eventBus.subscribe(events.LOGIN_FAILED, function(message) {
			delivered = (message === expectedMessage);
		});
		
		userService.onUserLogin({
			"nickname":"User1", 
			"password":"password"
		});
		
		test
			.bool(delivered)
				.isTrue();
	});
	
	it('Testing incorrect password', function(){
		
		var expectedMessage = 'Incorrect login / password';
		var delivered = false;
		
		eventBus.subscribe(events.LOGIN_FAILED, function(message) {
			delivered = (message === expectedMessage);
		});
				
		userService.onUserLogin({
			"nickname":"User", 
			"password":"pass"
		});
		
		test
			.bool(delivered)
				.isTrue();
	});
});