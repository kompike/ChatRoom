var Chat = function(chatDivId, eventBus, userService) {
	
	var eventType = {
		registrationFailed : 'REGISTRATION_FAILED', 
		newUserAdded : 'NEW_USER_ADDED',
		userListUpdated : 'USER_LIST_UPDATED',
		userRegistered : 'USER_REGISTERED'
	}
	
	var _initChat = function() {
		
		var registrationDivId = chatDivId + '_registration';
		var usersDivId = chatDivId + '_users';
		
		var $chatDiv = $('<div/>').appendTo('body').attr('id', chatDivId)
			.append($('<div/>').attr('id', registrationDivId))
			.append($('<div/>').attr('id', usersDivId));
					
		var registrationComponent = new RegistrationFormComponent(registrationDivId);		
		var userListComponent = new UserListComponent(usersDivId);
		
		eventBus.subscribe(eventType.registrationFailed, registrationComponent.onRegistrationFailed);
		eventBus.subscribe(eventType.newUserAdded, userService.onUserAdded);
		eventBus.subscribe(eventType.userListUpdated, userListComponent.onUserRegistered);
		eventBus.subscribe(eventType.userRegistered, registrationComponent.onUserRegistered);
				
		registrationComponent.initialize();
		userListComponent.initialize();		
	};
	
	/* Inner classes */
	
	var RegistrationFormComponent = function(_rootDivId) {
	
		var _initialize = function() {
			
			var registrationFormBoxId = _rootDivId + "_box";			
			var buttonId = registrationFormBoxId + "_btn";			
			var errorDivId = registrationFormBoxId + "_err";
				
			$('#' + _rootDivId).html($('<div/>').attr('id', _rootDivId + '_box')
				.append($('<label/>').attr('for', 'nickname').text('Nickname'))
				.append($('<input/>').attr({'id': 'nickname', 'name' : 'nickname', 'type':'text'})).append('<br/>')
				.append($('<label/>').attr('for', 'password').text('Password'))
				.append($('<input/>').attr({'id': 'password', 'name' : 'password', 'type':'password'})).append('<br/>')
				.append($('<label/>').attr('for', 'repeat_password').text('Repeat password'))
				.append($('<input/>').attr({'id': 'repeat_password', 'name' : 'repeat_password', 'type':'password'})).append('<br/>')
				.append($('<div/>').attr('id', errorDivId)).append('<br/>')
				.append($('<button/>').attr('id', buttonId).text('Register')))
									
			$('#' + buttonId).click(function() {														
				var user = {
					"nickname" : $('#nickname').val(),
					"password" : $('#password').val(),
					"repeatPassword" : $('#repeat_password').val()
				};				
				eventBus.post(eventType.newUserAdded, user);					
			});
	
		};
		
		var _onRegistrationFailed = function(message) {
			_registrationFailed(message);
		}
		
		var _onUserRegistered = function() {
			_clearFields();
		}
		
		var _registrationFailed = function(message) {		
			$('#' + _rootDivId + '_box_err').html($('<span/>').text(message));
		};
		
		var _clearFields = function() {			
			$('#nickname').val('');
			$('#password').val('');
			$('#repeat_password').val('');
			$('#' + _rootDivId + '_box_err').html('');	
		};
		
		return {
			"initialize" : _initialize,
			"onUserRegistered" : _onUserRegistered,
			"onRegistrationFailed" : _onRegistrationFailed
		};
	}

	var UserListComponent = function(_rootDivId) {
		
		var _initialize = function() {		
			$('#' + _rootDivId).append($('<div/>').html('<h5>Available users</h5>').attr('id', _rootDivId + '_box'))
				.append($('<div/>').attr('id', _rootDivId+ '_box_list'));
		};
		
		var _onUserRegistered = function(userList) {
			_initUserList(userList);
		}
		
		var _initUserList = function(userList) {
			$('#' + _rootDivId + '_box_list').html('').append($('<ul/>'));
			
			for (var i = 0; i < userList.length; i++) {
				$('<li/>').appendTo('ul').text(userList[i]);
			}
		}
		
		return {
			"initialize" : _initialize, 
			"onUserRegistered": _onUserRegistered
		};	
	}
	
	return {"initChat" : _initChat};
}

define(function() {
	return Chat;
});