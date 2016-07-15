define = require('node-requirejs-define');

var test = require('unit.js');

var UserService = require('../scripts/userservice');
var UserStorage = require('../scripts/userstorage');
var EventBus = require('../scripts/eventbus');

var eventBus = new EventBus();
var userStorage = new UserStorage();

var userService = new UserService(eventBus, userStorage);

//

describe('Testing user registration', function(){	

	it('New user registered', function(){
		
		var firstUser = {
			"nickname":"User", 
			"password":"password", 
			"repeatPassword":"password"
		};
		
		userService.addUser(firstUser);

		var userList = userService.getUsers();
		
		test
			.array(userList)
				.isNotEmpty()
				.hasLength(1)
				.hasProperty(0, "User");
				
		var userFromStorage = userService.getUserByNickname(firstUser.nickname);
		
		test
			.object(userFromStorage)
				.isEqualTo(firstUser)
				.isNotEmpty()
				.hasProperties(['nickname', 'password', 'repeatPassword']);
	});

	it('User already exists', function(){

		var userList = userService.getUsers();
		
		test
			.array(userList)
				.isNotEmpty()
				.hasLength(1);
						
		var existingUser = {
			"nickname":"User", 
			"password":"password", 
			"repeatPassword":"password"
		};
		
		userService.addUser(existingUser);
		
		test
			.array(userList)
				.isNotEmpty()
				.hasLength(1)
				.hasProperty(0, "User")
				.hasNotProperty(1, "User");
	});

	it('Passwords must be equal', function(){

		var userList = userService.getUsers();
		
		test
			.array(userList)
				.isNotEmpty()
				.hasLength(1);
		
		var secondUser = {
			"nickname":"User1", 
			"password":"password", 
			"repeatPassword":"password1"
		};
				
		userService.addUser(secondUser);
		
		test
			.array(userList)
				.isNotEmpty()
				.hasLength(1)
				.hasProperty(0, "User")
				.hasNotProperty(1, "User1");
	});
});