var Chat = function(chatDivId, eventBus, userService, chatService) {
	
	var currentScope = {
		'currentUser' : null
	};
	
	var _initChat = function() {
		
		var registrationDivId = chatDivId + '_register';
		var userPageDivId = chatDivId + '_room';
		var loginDivId = chatDivId + '_login';
		
		$('<div/>').appendTo('body').attr('id', chatDivId);
					
		var registrationComponent = new RegistrationFormComponent(registrationDivId);		
		var userPageComponent = new UserPageComponent(userPageDivId);		
		var loginFormComponent = new LoginFormComponent(loginDivId);
		
		eventBus.subscribe(Events.USER_REGISTERED, loginFormComponent.initialize);
		eventBus.subscribe(Events.LOGIN_SUCCESSFULL, loginFormComponent.onUserLoggedIn);
		eventBus.subscribe(Events.LOGIN_SUCCESSFULL, userPageComponent.initialize);
		eventBus.subscribe(Events.NEW_USER_ADDITION, userService.onUserAdded);
		eventBus.subscribe(Events.LOGIN_ATTEMPT, userService.onUserLogin);
		eventBus.subscribe(Events.NEW_CHAT_CREATION, chatService.onChatAdded);
		eventBus.subscribe(Events.JOINING_CHAT, chatService.onUserJoined);
		eventBus.subscribe(Events.LEAVING_CHAT, chatService.onUserLeft);
		eventBus.subscribe(Events.ADDING_NEW_MESSAGE, chatService.onMessageAdded);
		
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
			
			eventBus.subscribe(Events.REGISTRATION_FAILED, _onRegistrationFailed);		
			eventBus.subscribe(Events.USER_REGISTERED, _onUserRegistered);
			
			$('#' + chatDivId).append($('<div/>').attr('id', chatDivId + '_register'))
			
			var registrationFormBoxId = _rootDivId + '_box';			
			var buttonId = registrationFormBoxId + '_btn';			
			var errorDivId = registrationFormBoxId + '_err';
				
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
						'nickname' : $('#' + _rootDivId + '_nickname').val(),
						'password' : $('#' + _rootDivId + '_password').val(),
						'repeatPassword' : $('#' + _rootDivId + '_repeat_password').val()
					};		
					eventBus.post(Events.NEW_USER_ADDITION, user);			
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
			'initialize' : _initialize
		};
	}
	
	var LoginFormComponent = function(_rootDivId) {
	
		var _initialize = function() {
			
			eventBus.subscribe(Events.LOGIN_FAILED, _onLoginFailed);
			
			$('#' + chatDivId).append($('<div/>').attr('id', _rootDivId))
			
			var loginFormBoxId = _rootDivId + '_box';			
			var buttonId = loginFormBoxId + '_btn';			
			var errorDivId = loginFormBoxId + '_err';
				
			$('#' + _rootDivId).html($('<div/>').attr('id', _rootDivId + '_box')
				.append($('<h5/>').html('Login form'))
				.append($('<label/>').attr('for', 'nickname').text('Nickname'))
				.append($('<input/>').attr({'id': _rootDivId + '_nickname', 'name' : 'nickname', 'type':'text'})).append('<br/>')
				.append($('<label/>').attr('for', 'password').text('Password'))
				.append($('<input/>').attr({'id': _rootDivId + '_password', 'name' : 'password', 'type':'password'})).append('<br/>')
				.append($('<div/>').attr('id', errorDivId)).append('<br/>')
				.append($('<button/>').attr('id', buttonId).text('Login').click(function() {														
					var user = {
						'nickname' : $('#' + _rootDivId + '_nickname').val(),
						'password' : $('#' + _rootDivId + '_password').val()
					};				
					eventBus.post(Events.LOGIN_ATTEMPT, user);			
				})))
				
			_onInputFieldEvent('input');		
		};
		
		var _onLoginFailed = function(message) {
			_loginFailed(message);
		}
		
		var _onUserLoggedIn = function(user) {
			currentScope.currentUser = user;
			$('#' + chatDivId + '_login').remove();
		}
		
		var _loginFailed = function(message) {		
			$('#' + _rootDivId + '_box_err').html($('<span/>').text(message));
		};
		
		return {
			'initialize' : _initialize,
			'onUserLoggedIn' : _onUserLoggedIn
		};
	}
	
	var UserPageComponent = function(_rootDivId) {
		
		var _initialize = function() {
			
			eventBus.subscribe(Events.CHAT_CREATION_FAILED, _onActionFailed);
			eventBus.subscribe(Events.CHAT_JOINING_FAILED, _onActionFailed);
			eventBus.subscribe(Events.CHAT_LEAVING_FAILED, _onActionFailed);
			eventBus.subscribe(Events.CHAT_LIST_UPDATED, _onChatListUpdated);
			eventBus.subscribe(Events.CHAT_CREATED, _onChatCreated);
			eventBus.subscribe(Events.USER_JOINED_CHAT, _onUserJoined);
			eventBus.subscribe(Events.USER_LEFT_CHAT, _onUserLeft);
			
			$('#' + chatDivId).append($('<div/>').attr('id', _rootDivId));
			$('#' + _rootDivId).append($('<div/>').attr('id', _rootDivId + '_header'));
			
			$('#' + _rootDivId + '_header')
				.append($('<h5/>').html('Hello ' + currentScope.currentUser + '!)'))
				.append($('<input/>').attr({'id': _rootDivId + '_chatName', 'name' : '_chatName', 'type':'text', 'placeholder':'Enter chat name...'}))
				.append($('<button/>').attr({'id': _rootDivId + '_add_chat', 'class' : 'add_chat'}).text('Add new chat').click(function(){
					var chatName = $('#' + _rootDivId + '_chatName').val();
					var chat = {
						'chatName' : chatName, 
						'owner' : currentScope.currentUser
					};
					eventBus.post(Events.NEW_CHAT_CREATION, chat);
				}))
				.append($('<div/>').attr('id', _rootDivId + '_box_err'))
				.append($('<div/>').attr('id', _rootDivId + '_box_success'))
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
					eventBus.post(Events.JOINING_CHAT, {
						'chatName' : $('#' + _rootDivId + '_chat_list').val(), 
						'user': currentScope.currentUser
					});
			}))
		}
		
		var _onChatListUpdated = function(chatList) {
			_initChatList(chatList);
			_clearChatNameField();
			_clearErrorField();
		}
		
		var _onChatCreated = function(message) {
			$('#' + _rootDivId + '_box_success').html($('<span/>').text(message));
		}
		var _onActionFailed = function(message) {
			_clearSuccessField();
			$('#' + _rootDivId + '_box_err').html($('<span/>').text(message));
		}
		
		var _onUserLeft = function(chatId) {
			_clearErrorField();
			_clearSuccessField();
			$('#' + chatId).remove();
		}
		
		var _onUserJoined = function(chatInfo) {
			new ChatComponent().init(chatInfo);
			_clearErrorField();
			_clearSuccessField();
		}
		
		var _clearChatNameField = function() {
			$('#' + _rootDivId + '_chatName').val('');
		}
		
		var _clearErrorField = function() {
			$('#' + _rootDivId + '_box_err').html('');
		}
		
		var _clearSuccessField = function() {
			$('#' + _rootDivId + '_box_success').html('');
		}
		
		var ChatComponent = function() {
			
			var _init = function(chatInfo) {
				
				var chatDivId = chatInfo.chatId;
					
				eventBus.subscribe(Events.MESSAGE_ADDING_FAILED, _onMessageAddingFailed);
				eventBus.subscribe(Events.MESSAGE_ADDED, _onMessageListUpdated);
				
				$('<div/>').appendTo('body').attr({'id': chatDivId, 'class' : 'chat_box'})
					.append($('<div/>').attr('class', 'chat_header').text('Chat ' + chatInfo.chatName)
						.append($('<span/>').text('x').css({'float':'right', 'color':'white', 'cursor':'pointer', 'title':'Leave chat'}).click(function() {
							var chatInfo = {
								'user': currentScope.currentUser,
								'chatId': chatDivId
							};
							eventBus.post(Events.LEAVING_CHAT, chatInfo);
						})))
					.append($('<div/>').attr({'id': chatDivId + '_body', 'class':'chat_body'}))
					.append($('<div/>').attr('id', chatDivId + '_message_err'))
					.append($('<input/>').attr({'id': chatDivId + '_input', 'class': 'message_text', 'type' : 'text', 'placeholder' : 'Type here!'})
						.css({'color' : '#000'}))
					.append($('<input/>').attr({'id': 'colorpicker_' + chatDivId}))
					.append($('<button/>').attr({'id': chatDivId + '_send', 'class' : 'send_message'}).text('Send').click(function(){
						var messageInfo = {
							'message': $('#' + chatDivId + '_input').val(),
							'user': currentScope.currentUser,
							'chatId': chatDivId,
							'color': $('#' + chatDivId + '_input').css('color')
						};
						eventBus.post(Events.ADDING_NEW_MESSAGE, messageInfo);
				}));
				
				$('#colorpicker_' + chatDivId).spectrum({
					color: '#000',
					showButtons: false,
					move: function(color) {
						$('#' + chatDivId + '_input').css({'color' : color.toHexString()});
					}
				});
				
				_onMessageListUpdated(chatInfo);
				
				_onInputFieldEvent('#' + chatDivId + '_input');
			}
		
			var _onMessageListUpdated = function(chatInfo) {
				var chatId = chatInfo.chatId;
				$('#' + chatId + '_body').html('');
				var list = chatInfo.messages;
				if (typeof list !== 'undefined') {
					for (var i = 0; i < list.length; i++) {
						var message = list[i];
						$('#' + chatId + '_body')
							.append($('<p/>')
								.append($('<span/>').text(message.getAuthor() + ': '))
								.append($('<span/>').append($('<pre/>').text(message.getMessage()).css({'color' : message.getColor()}))));
					}
					
					$('#' + chatId + '_input').val('');
					$('#' + chatId + '_message_err').html('');
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
	
	return {'initChat' : _initChat};
}

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
	return Chat;
});