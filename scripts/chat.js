var Chat = function(chatDivId, eventBus, userService, chatService) {
	
	var currentUser = null;
	
	var _initChat = function() {
		
		var registrationDivId = chatDivId + '_registration';
		var chatRoomDivId = chatDivId + '_chats';
		var loginDivId = chatDivId + '_login';
		
		$('<div/>').appendTo('body').attr('id', chatDivId);
					
		var registrationComponent = new RegistrationFormComponent(registrationDivId);		
		var chatRoomComponent = new ChatRoomComponent(chatRoomDivId);		
		var loginFormComponent = new LoginFormComponent(loginDivId);
		
		eventBus.subscribe(EventType.registrationFailed, registrationComponent.onRegistrationFailed);
		eventBus.subscribe(EventType.newUserAdded, userService.onUserAdded);
		eventBus.subscribe(EventType.userRegistered, loginFormComponent.initialize);
		eventBus.subscribe(EventType.loginFailed, loginFormComponent.onLoginFailed);
		eventBus.subscribe(EventType.userLoggedIn, loginFormComponent.onUserLoggedIn);
		eventBus.subscribe(EventType.userLoggedIn, chatRoomComponent.initialize);
		eventBus.subscribe(EventType.login, userService.onUserLogin);
		eventBus.subscribe(EventType.chatCreation, chatService.onChatAdded);
		eventBus.subscribe(EventType.chatCreationFailed, chatRoomComponent.onChatCreationFailed);
		eventBus.subscribe(EventType.chatListUpdated, chatRoomComponent.onChatCreated);
		eventBus.subscribe(EventType.joinChat, chatRoomComponent.onChatJoined);
		eventBus.subscribe(EventType.onUserJoined, chatService.onUserJoined);
		eventBus.subscribe(EventType.onMessageAdded, chatService.onMessageAdded);
		eventBus.subscribe(EventType.onChatCreated, chatService.onMessageListCreated);		
		eventBus.subscribe(EventType.messageAddingFailed, chatRoomComponent.onMessageAddingFailed);			
		eventBus.subscribe(EventType.messageListCreated, chatRoomComponent.onMessageListCreated);
		eventBus.subscribe(EventType.messageAdded, chatRoomComponent.onMessageAdded);
				
		registrationComponent.initialize();		
	};
	
	/* Inner classes */
	
	var RegistrationFormComponent = function(_rootDivId) {
	
		var _initialize = function() {
			
			$('#' + chatDivId).append($('<div/>').attr('id', chatDivId + '_registration'))
			
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
					eventBus.post(EventType.newUserAdded, user);			
				})))
	
		};
		
		var _onRegistrationFailed = function(message) {
			_registrationFailed(message);
		}
		
		var _registrationFailed = function(message) {		
			$('#' + _rootDivId + '_box_err').html($('<span/>').text(message));
		};
		
		return {
			"initialize" : _initialize,
			"onRegistrationFailed" : _onRegistrationFailed
		};
	}
	
	var LoginFormComponent = function(_rootDivId) {
	
		var _initialize = function() {
			$('#' + chatDivId + '_registration').remove();
			
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
					eventBus.post(EventType.login, user);			
				})))
	
		};
		
		var _onLoginFailed = function(message) {
			_loginFailed(message);
		}
		
		var _onUserLoggedIn = function(user) {
			currentUser = user.getName();
		}
		
		var _loginFailed = function(message) {		
			$('#' + _rootDivId + '_box_err').html($('<span/>').text(message));
		};
		
		return {
			"initialize" : _initialize,
			"onLoginFailed" : _onLoginFailed,
			"onUserLoggedIn" : _onUserLoggedIn
		};
	}
	
	var ChatRoomComponent = function(_rootDivId) {
		
		var _initialize = function() {
			
			$('#' + chatDivId + '_login').remove();
			$('#' + chatDivId).append($('<div/>').attr('id', _rootDivId));
			$('#' + _rootDivId).append($('<div/>').attr('id', _rootDivId + '_header'));
			
			$('#' + _rootDivId + '_header')
				.append($('<h5/>').html('Hello ' + currentUser + '!)'))
				.append($('<button/>').attr({'id': _rootDivId + '_add_chat', 'class' : 'add_chat'}).text('Add new chat').click(function(){
					var chatName = $('#' + _rootDivId + '_chatName').val();
					var chat = {
						name : chatName, 
						owner : currentUser
					};
					eventBus.post(EventType.chatCreation, chat);
				}))
				.append($('<input/>').attr({'id': _rootDivId + '_chatName', 'name' : '_chatName', 'type':'text', 'placeholder':'Enter chat name...'}))
				.append($('<div/>').attr('id', _rootDivId + '_box_err'))
				.append($('<div/>').attr('id', _rootDivId + '_drop'));
		}
		
		var _initChatList = function(chatList) {
			
			$('#' + _rootDivId + '_drop').html('').append($('<select/>').attr('id', _rootDivId + '_chat_list'));
			
			$('#' + _rootDivId + '_chat_list').change(function() {
				_checkChatJoin();
			});
			
			for (var i = 0; i < chatList.length; i++) {
				$('#' + _rootDivId + '_chat_list').append($('<option/>').val(chatList[i].getName()).text(chatList[i].getName()));
			}
			
			$('#' + _rootDivId + '_drop')
				.append($('<button/>').attr({'id': _rootDivId + '_join_chat', 'class' : 'join_chat'}).text('Join chat').click(function(){
					var name = $('#' + _rootDivId + '_chat_list').val();
					$(this).prop('disabled', true).text('Joined');
					console.log('Join chat pressed');
					eventBus.post(EventType.joinChat, name);
			}))
			
			_checkChatJoin();
		}
		
		var _joinChat = function(chatName) {
			
			var chatData = {
				'chatName':chatName, 
				'user':currentUser
			};
			
			eventBus.post(EventType.onUserJoined, chatData);
			
			$('<div/>').appendTo('body').attr({'id': chatName, 'class' : 'chat_box'})
				.append($('<div/>').attr('class', 'chat_header').text('Chat ' + chatName)
					.append($('<span/>').text('x').css({'float':'right', 'color':'white'}).click(function() {
						$('#' + chatName).remove();
						_checkChatJoin();
					})))
				.append($('<div/>').attr({'id': chatName + '_body', 'class':'chat_body'}))
				.append($('<div/>').attr('id', chatName + '_message_err'))
				.append($('<input/>').attr({'id': chatName + '_input', 'class': 'message_text', 'type' : 'text', 'placeholder' : 'Type here!'}))
				.append($('<button/>').attr({'id': chatName + '_send', 'class' : 'send_message'}).text('Send').click(function(){
					var message = $('#' + chatName + '_input').val();
					
					var messageData = {
						'chatName' : chatName,
						'user' : currentUser,
						'message' : message
					};
					
					eventBus.post(EventType.onMessageAdded, messageData);
			}));
			
			eventBus.post(EventType.onChatCreated, chatName);
		}
		
		var _onChatCreated = function(chatList) {
			_initChatList(chatList);
			_clearFields();
		}
		
		var _onChatJoined = function(chatName) {
			_joinChat(chatName);
			_clearFields();
		}
		
		var _onChatCreationFailed = function(message) {
			$('#' + _rootDivId + '_box_err').html($('<span/>').text(message));
		}
		
		var _clearFields = function() {
			$('#' + _rootDivId + '_chatName').val('');
			$('#' + _rootDivId + '_box_err').html('');
		}
		
		var _checkChatJoin = function() {
			var selectedChatId = $('#' + _rootDivId + '_chat_list').val();		
			if ($('#' + selectedChatId).is(":visible")) {
				$('#' + _rootDivId + '_join_chat').prop('disabled', true).text('Joined');
			} else {
				$('#' + _rootDivId + '_join_chat').prop('disabled', false).text('Join chat');					
			}
		}
		
		var _onMessageListCreated = function(messageData) {
			var messageList = messageData.messageList;
			var chatName = messageData.chatName;
			$('#' + chatName + '_body').html('');
			for (var i = 0; i < messageList.length; i++) {
				$('<p>' + messageList[i].getAuthor() + ' : ' + messageList[i].getMessage() + '</p>').appendTo('#' + chatName + '_body');					
			}
		}
	
		var _onMessageAdded = function(messageData) {
			var messageText = messageData.message.getMessage();
			var author = messageData.message.getAuthor();
			var chatName = messageData.chatName;
			$('<p>' + author + ' : ' + messageText + '</p>').appendTo('#' + chatName + '_body');
			$('#' + chatName + '_input').val('');
			$('#' + chatName + '_message_err').html('');
		}
		
		var _onMessageAddingFailed = function(errorData) {
			$('#' + errorData.chatName + '_message_err').html($('<span/>').text(errorData.errorMessage));
		}
		
		return {
			'initialize' : _initialize, 
			'onChatCreationFailed' : _onChatCreationFailed, 
			'onChatCreated' : _onChatCreated, 
			'onChatJoined' : _onChatJoined,
			'onMessageListCreated' : _onMessageListCreated,
			'onMessageAdded' : _onMessageAdded,
			'onMessageAddingFailed' : _onMessageAddingFailed
		};
	}
	
	return {"initChat" : _initChat};
}


define(function() {
	return Chat;
});