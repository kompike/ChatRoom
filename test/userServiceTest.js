define = require('node-requirejs-define');

var test = require('unit.js');

var UserService = require('../scripts/service/userservice');
var UserStorage = require('../scripts/service/storageservice');
var EventBus = require('../scripts/eventbus');
var UserDTO = require('../scripts/dto/userDTO');

//

describe('Testing user registration', function(){	

	it('New user registered', function(){

		var eventBus = new EventBus();
		var userStorage = new UserStorage();

		var userService = new UserService(eventBus, userStorage);
		
		var firstUser = {
			"nickname":"User", 
			"password":"password", 
			"repeatPassword":"password"
		};
		
		userService.onUserAdded(firstUser);

		var userList = userService.getUsers();
		
		test
			.array(userList)
				.isNotEmpty()
				.hasLength(1);
				
		var userFromStorage = userService.getUserByNickname(firstUser.nickname);
		
		test
			.object(userFromStorage)
				.isNotEmpty()
				.hasProperties(['nickname', 'password']);
	});

	it('User already exists', function(){

		var eventBus = new EventBus();
		var userStorage = new UserStorage();

		var userService = new UserService(eventBus, userStorage);
		var userList = userService.getUsers();
	});

	it('Passwords must be equal', function(){

		var eventBus = new EventBus();
		var userStorage = new UserStorage();

		var userService = new UserService(eventBus, userStorage);
		var userList = userService.getUsers();
	});

	it('All fields must be filled', function(){

		var eventBus = new EventBus();
		var userStorage = new UserStorage();

		var userService = new UserService(eventBus, userStorage);
		var userList = userService.getUsers();
	});
});