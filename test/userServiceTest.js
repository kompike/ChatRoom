var UserService = require('../scripts/service/userservice');
var StorageService = require('../scripts/service/storageservice');
var EventBus = require('../scripts/eventbus');
var EventType = require('../scripts/events');

var test = require('unit.js');

//

describe('Testing successfull user registration', function(){
	
	var eventBus = new EventBus();

	var storage = new StorageService();
	var userService = new UserService(eventBus, storage);
	
	var expectedNickname = 'User';
	var registered = false;
	
	eventBus.subscribe(EventType.userRegistered, function(user) {
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

	it('New user registered', function(){		
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
});

describe('Testing already existing user registration', function(){
	
	var eventBus = new EventBus();

	var storage = new StorageService();
	var userService = new UserService(eventBus, storage);
	
	var expectedMessage = 'User already exists';
	var delivered = false;
	
	var expectedNickname = 'User';
	var registered = false;
	
	eventBus.subscribe(EventType.userRegistered, function(user) {
		registered = (user.getName() === expectedNickname);
	});
	
	eventBus.subscribe(EventType.registrationFailed, function(message) {
		delivered = (expectedMessage === message);
	});
	
	var user = {
		"nickname":"User", 
		"password":"password", 
		"repeatPassword":"password"
	};
	
	userService.onUserAdded(user);	
	userService.onUserAdded(user);
	
	var userList = userService.getUsers();	

	it('User already exists', function(){		
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

describe('Testing passwords equality', function(){
	
	var eventBus = new EventBus();

	var storage = new StorageService();
	var userService = new UserService(eventBus, storage);
	
	var expectedMessage = 'Passwords must be equal';
	var delivered = false;
	
	eventBus.subscribe(EventType.registrationFailed, function(message) {
		delivered = (expectedMessage === message);
	});
	
	var user = {
		"nickname":"User", 
		"password":"password", 
		"repeatPassword":"pass"
	};
		
	userService.onUserAdded(user);
	
	var userList = userService.getUsers();

	it('Testing passwords equality', function(){
		test
			.bool(delivered)
				.isTrue()
			.array(userList)
				.isEmpty();
	});	
});

describe('Testing empty fields', function(){
	
	var eventBus = new EventBus();

	var storage = new StorageService();
	var userService = new UserService(eventBus, storage);
	
	var expectedMessage = 'All fields must be filled';
	var delivered = false;
	
	eventBus.subscribe(EventType.registrationFailed, function(message) {
		delivered = (expectedMessage === message);
	});
	
	var user = {
		"nickname":"", 
		"password":"password", 
		"repeatPassword":"pass"
	};
		
	userService.onUserAdded(user);
	
	var userList = userService.getUsers();

	it('Testing empty fields', function(){
		test
			.bool(delivered)
				.isTrue()
			.array(userList)
				.isEmpty();
	});	
});

describe('Testing user login', function(){
	
	var eventBus = new EventBus();

	var storage = new StorageService();
	var userService = new UserService(eventBus, storage);
	
	var expectedName = 'User';
	var delivered = false;
	var registered = false;
	
	eventBus.subscribe(EventType.userRegistered, function(user) {
		registered = (user.getName() === expectedName);
	});
	
	eventBus.subscribe(EventType.userLoggedIn, function(user) {
		delivered = (user.getName() === expectedName);
	});
	
	var user = {
		"nickname":"User", 
		"password":"password", 
		"repeatPassword":"password"
	};
		
	userService.onUserAdded(user);
	
	userService.onUserLogin({
		"nickname":"User", 
		"password":"password"
	});

	it('Testing user login', function(){
		test
			.bool(delivered)
				.isTrue()
			.bool(registered)
				.isTrue();
	});	
});

describe('Testing not registered user login', function(){
	
	var eventBus = new EventBus();

	var storage = new StorageService();
	var userService = new UserService(eventBus, storage);
	
	var expectedMessage = 'User not registered!';
	var delivered = false;
	
	eventBus.subscribe(EventType.loginFailed, function(message) {
		delivered = (message === expectedMessage);
	});
	
	var user = {
		"nickname":"User", 
		"password":"password", 
		"repeatPassword":"password"
	};
		
	userService.onUserAdded(user);
	
	userService.onUserLogin({
		"nickname":"User1", 
		"password":"password"
	});

	it('Testing not registered user login', function(){
		test
			.bool(delivered)
				.isTrue();
	});	
});

describe('Testing incorrect password login', function(){
	
	var eventBus = new EventBus();

	var storage = new StorageService();
	var userService = new UserService(eventBus, storage);
	
	var expectedMessage = 'Incorrect password';
	var expectedName = 'User';
	var delivered = false;
	var registered = false;
	
	eventBus.subscribe(EventType.userRegistered, function(user) {
		registered = (user.getName() === expectedName);
	});
	
	
	eventBus.subscribe(EventType.loginFailed, function(message) {
		delivered = (message === expectedMessage);
	});
	
	var user = {
		"nickname":"User", 
		"password":"password", 
		"repeatPassword":"password"
	};
		
	userService.onUserAdded(user);
	
	userService.onUserLogin({
		"nickname":"User", 
		"password":"pass"
	});

	it('Testing incorrect password login', function(){
		test
			.bool(registered)
				.isTrue()
			.bool(delivered)
				.isTrue();
	});
});