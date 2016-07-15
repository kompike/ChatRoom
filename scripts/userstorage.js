var UserStorage = function() {
	
	var _userList = {};
	
	var _addUser = function(user) {	
		var nickname = user.nickname;		
		_userList[nickname] = user;
		console.log("User added");
	}
	
	var _getUserByNickname = function(nickname) {
		var user = _userList[nickname];
		return user;
	}
	
	var _getAllUsers = function() {
		return Object.keys(_userList);
	}
	
	return {
		'addUser' : _addUser,
		'getAllUsers' : _getAllUsers,
		'getUserByNickname' : _getUserByNickname
	};
	
}

define(function() {
	return UserStorage;
});