var Chat = function(chatDivId, eventBus, userService, chatService) {
	
	var currentUser = null;
	
	var _initChat = function() {
		
		var registrationDivId = chatDivId + '_register';
		var userPageDivId = chatDivId + '_room';
		var loginDivId = chatDivId + '_login';
		
		$('<div/>').appendTo('body').attr('id', chatDivId);
					
		var registrationComponent = new RegistrationFormComponent(registrationDivId);		
		var userPageComponent = new UserPageComponent(userPageDivId);		
		var loginFormComponent = new LoginFormComponent(loginDivId);
		
		eventBus.subscribe(events.USER_REGISTERED, loginFormComponent.initialize);
		eventBus.subscribe(events.LOGIN_SUCCESSFULL, loginFormComponent.onUserLoggedIn);
		eventBus.subscribe(events.LOGIN_SUCCESSFULL, userPageComponent.initialize);
		eventBus.subscribe(events.NEW_USER_ADDING, userService.onUserAdded);
		eventBus.subscribe(events.LOGIN_ATTEMPT, userService.onUserLogin);
		eventBus.subscribe(events.NEW_CHAT_CREATING, chatService.onChatAdded);
		eventBus.subscribe(events.JOINING_CHAT, chatService.onUserJoined);
		eventBus.subscribe(events.LEAVING_CHAT, chatService.onUserLeaved);
		eventBus.subscribe(events.ADDING_NEW_MESSAGE, chatService.onMessageAdded);
		
		registrationComponent.initialize();		
	};
	
	var _onInputFieldEvent = function(inputDivId) {				
		$(inputDivId).keydown(function (event) {
			var parent = $(this).parent();
			if (event.ctrlKey && event.which == 13) {
				parent.children('button').click();
			}
		});
	}
	
	/* Inner classes */
	
	var RegistrationFormComponent = function(_rootDivId) {
	
		var _initialize = function() {
			
			eventBus.subscribe(events.REGISTRATION_FAILED, _onRegistrationFailed);		
			eventBus.subscribe(events.USER_REGISTERED, _onUserRegistered);
			
			$('#' + chatDivId).append($('<div/>').attr('id', chatDivId + '_register'))
			
			var registrationFormBoxId = _rootDivId + "_box";			
			var buttonId = registrationFormBoxId + "_btn";			
			var errorDivId = registrationFormBoxId + "_err";
				
			$('#' + _rootDivId).html($('<div/>').attr('id', _rootDivId + '_box')
				.append($('<h5/>').html('Registration form'))
				.append($('<label/>').attr('for', 'nickname').text('Nickname'))
				.append($('<input/>').attr({'id': _rootDivId + '_nickname', 'name' : 'nickname', 'type':'text'})).append('<br/>')
				.append($('<label/>').attr('for', 'password').text('Password'))
				.append($('<input/>').attr({'id': _rootDivId + '_password', 'name' : 'password', 'type':'password'})).append('<br/>')
				.append($('<label/>').attr('for', 'repeat_password').text('Repeat password'))
				.append($('<input/>').attr({'id': _rootDivId + '_repeat_password', 'name' : 'repeat_password', 'type':'password'})).append('<br/>')
				.append($('<div/>').attr('id', errorDivId)).append('<br/>')
				.append($('<button/>').attr('id', buttonId).text('Register').click(function() {														
					var user = {
						"nickname" : $('#' + _rootDivId + '_nickname').val(),
						"password" : $('#' + _rootDivId + '_password').val(),
						"repeatPassword" : $('#' + _rootDivId + '_repeat_password').val()
					};		
					eventBus.post(events.NEW_USER_ADDING, user);			
				})))
				
			_onInputFieldEvent('input');	
		};
		
		var _onUserRegistered = function(message) {			
			$('#' + chatDivId + '_register').remove();
		}
		
		var _onRegistrationFailed = function(message) {
			_registrationFailed(message);
		}
		
		var _registrationFailed = function(message) {		
			$('#' + _rootDivId + '_box_err').html($('<span/>').text(message));
		};
		
		return {
			"initialize" : _initialize
		};
	}
	
	var LoginFormComponent = function(_rootDivId) {
	
		var _initialize = function() {
			
			eventBus.subscribe(events.LOGIN_FAILED, _onLoginFailed);
			
			$('#' + chatDivId).append($('<div/>').attr('id', _rootDivId))
			
			var loginFormBoxId = _rootDivId + "_box";			
			var buttonId = loginFormBoxId + "_btn";			
			var errorDivId = loginFormBoxId + "_err";
				
			$('#' + _rootDivId).html($('<div/>').attr('id', _rootDivId + '_box')
				.append($('<h5/>').html('Login form'))
				.append($('<label/>').attr('for', 'nickname').text('Nickname'))
				.append($('<input/>').attr({'id': _rootDivId + '_nickname', 'name' : 'nickname', 'type':'text'})).append('<br/>')
				.append($('<label/>').attr('for', 'password').text('Password'))
				.append($('<input/>').attr({'id': _rootDivId + '_password', 'name' : 'password', 'type':'password'})).append('<br/>')
				.append($('<div/>').attr('id', errorDivId)).append('<br/>')
				.append($('<button/>').attr('id', buttonId).text('Login').click(function() {														
					var user = {
						"nickname" : $('#' + _rootDivId + '_nickname').val(),
						"password" : $('#' + _rootDivId + '_password').val()
					};				
					eventBus.post(events.LOGIN_ATTEMPT, user);			
				})))
				
			_onInputFieldEvent('input');		
		};
		
		var _onLoginFailed = function(message) {
			_loginFailed(message);
		}
		
		var _onUserLoggedIn = function(user) {
			currentUser = user.getName();
			$('#' + chatDivId + '_login').remove();
		}
		
		var _loginFailed = function(message) {		
			$('#' + _rootDivId + '_box_err').html($('<span/>').text(message));
		};
		
		return {
			"initialize" : _initialize,
			"onUserLoggedIn" : _onUserLoggedIn
		};
	}
	
	var UserPageComponent = function(_rootDivId) {
		
		var _initialize = function() {
			
			eventBus.subscribe(events.CHAT_CREATION_FAILED, _onActionFailed);
			eventBus.subscribe(events.USER_JOINING_FAILED, _onActionFailed);
			eventBus.subscribe(events.USER_LEAVING_FAILED, _onActionFailed);
			eventBus.subscribe(events.CHAT_CREATED, _onChatCreated);
			eventBus.subscribe(events.USER_JOINED, _onUserJoined);
			eventBus.subscribe(events.CHAT_LEAVED, _onChatLeaved);
			
			$('#' + chatDivId).append($('<div/>').attr('id', _rootDivId));
			$('#' + _rootDivId).append($('<div/>').attr('id', _rootDivId + '_header'));
			
			$('#' + _rootDivId + '_header')
				.append($('<h5/>').html('Hello ' + currentUser + '!)'))
				.append($('<input/>').attr({'id': _rootDivId + '_chatName', 'name' : '_chatName', 'type':'text', 'placeholder':'Enter chat name...'}))
				.append($('<button/>').attr({'id': _rootDivId + '_add_chat', 'class' : 'add_chat'}).text('Add new chat').click(function(){
					var chatName = $('#' + _rootDivId + '_chatName').val();
					var chat = {
						'name' : chatName, 
						'owner' : currentUser
					};
					eventBus.post(events.NEW_CHAT_CREATING, chat);
				}))
				.append($('<div/>').attr('id', _rootDivId + '_box_err'))
				.append($('<div/>').attr('id', _rootDivId + '_drop'));
				
			_onInputFieldEvent('#' + _rootDivId + '_chatName');	
		}
		
		var _initChatList = function(chatList) {
			
			$('#' + _rootDivId + '_drop').html('').append($('<span/>').attr('class', 'select-label').append($('<select/>').attr('id', _rootDivId + '_chat_list')));
						
			for (var i = 0; i < chatList.length; i++) {
				$('#' + _rootDivId + '_chat_list').append($('<option/>').val(chatList[i].getName()).text(chatList[i].getName()));
			}
			
			$('#' + _rootDivId + '_drop')
				.append($('<button/>').attr({'id': _rootDivId + '_join_chat', 'class' : 'join_chat'}).text('Join chat').click(function(){
					eventBus.post(events.JOINING_CHAT, {
						'chatName' : $('#' + _rootDivId + '_chat_list').val(), 
						'user': currentUser
					});
			}))
		}
		
		var _onChatCreated = function(chatList) {
			_initChatList(chatList);
			_clearFields();
		}
		
		var _onActionFailed = function(message) {
			$('#' + _rootDivId + '_box_err').html($('<span/>').text(message));
		}
		
		var _onChatLeaved = function(chatId) {
			_clearFields();
			$('#' + chatId).remove();
		}
		
		var _onUserJoined = function(chatInfo) {
			new ChatComponent().init(chatInfo);
			_clearErrorField();
		}
		
		var _clearFields = function() {
			_clearErrorField();
			$('#' + _rootDivId + '_chatName').val('');
		}
		
		var _clearErrorField = function() {
			$('#' + _rootDivId + '_box_err').html('');
		}
		
		var ChatComponent = function() {
			
			var _init = function(chatInfo) {
				
				var chatDivId = chatInfo.id;
				var chatName = chatInfo.chatName;
					
				eventBus.subscribe(events.MESSAGE_ADDING_FAILED, _onMessageAddingFailed);
				eventBus.subscribe(events.MESSAGE_ADDED, _onMessageListUpdated);
				
				$('<div/>').appendTo('body').attr({'id': chatDivId, 'class' : 'chat_box'})
					.append($('<div/>').attr('class', 'chat_header').text('Chat ' + chatName)
						.append($('<span/>').text('x').css({'float':'right', 'color':'white', 'cursor':'pointer', 'title':'Leave chat'}).click(function() {
							var chatInfo = {
								'user': currentUser,
								'chatId': chatDivId
							};
							eventBus.post(events.LEAVING_CHAT, chatInfo);
						})))
					.append($('<div/>').attr({'id': chatDivId + '_body', 'class':'chat_body'}))
					.append($('<div/>').attr('id', chatDivId + '_message_err'))
					.append($('<input/>').attr({'id': chatDivId + '_input', 'class': 'message_text', 'type' : 'text', 'placeholder' : 'Type here!'}))
					.append($('<input/>').attr({'id': 'colorpicker'}))
					.append($('<button/>').attr({'id': chatDivId + '_send', 'class' : 'send_message'}).text('Send').click(function(){
						var messageInfo = {
							'message': $('#' + chatDivId + '_input').val(),
							'user': currentUser,
							'chatId': chatDivId
						};
						eventBus.post(events.ADDING_NEW_MESSAGE, messageInfo);
				}));
				
				$("#colorpicker").spectrum({
					color: "#000",
					change: function(color) {
						$('#' + chatDivId + '_input').css({'backgroundColor' : color.toHexString()});
					}
				});
				
				_onMessageListUpdated(chatInfo);
				
				_onInputFieldEvent('#' + chatDivId + '_input');
			}
		
			var _onMessageListUpdated = function(chatInfo) {
				$('#' + chatInfo.id + '_body').html('');
				var list = chatInfo.messages;
				if (typeof list !== 'undefined') {
					for (var i = 0; i < list.length; i++) {
						var message = list[i];
						$('#' + chatInfo.id + '_body')
							.append($('<p>' + message.getAuthor() + ' : ' + message.getMessage() + '</p>'));
					}
					
					$('#' + chatInfo.id + '_input').val('');
					$('#' + chatInfo.id + '_message_err').html('');
				}				
			}
			
			var _onMessageAddingFailed = function(errorMessage) {
				$('#' + errorMessage.chatId + '_message_err').html($('<span/>').text(errorMessage.message));
			}
			
			return {
				'init' : _init
			}
			
		}
		
		return {
			'initialize' : _initialize
		};
	}
	
	return {"initChat" : _initChat};
}

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
	return Chat;
});