var Chat = function(chatDivId, eventBus, userService) {
	
	var _initChat = function() {
		
		var chatDiv = document.createElement("div");
		chatDiv.setAttribute("id", chatDivId);
		var registrationComponentDiv = document.createElement("div");
		registrationComponentDiv.setAttribute("id", chatDivId + '_registration');
		var userListComponentDiv = document.createElement("div");	
		userListComponentDiv.setAttribute("id", chatDivId + '_users');
		
		chatDiv.appendChild(registrationComponentDiv);
		chatDiv.appendChild(userListComponentDiv);
		document.body.appendChild(chatDiv);
					
		var registrationComponent = new RegistrationFormComponent(chatDivId + '_registration');		
		var userListComponent = new UserListComponent(chatDivId + '_users');
		
		eventBus.subscribe('Registration_failed', registrationComponent.onRegistrationFailed);
		eventBus.subscribe("New_user_added", userService.onUserAdded);
		eventBus.subscribe("User_list_updated", userListComponent.onUserRegistered);
		eventBus.subscribe("User_created", registrationComponent.onUserRegistered);
				
		registrationComponent.initialize();
		userListComponent.initialize();		
	};
	
	/* Inner classes */
	
	var RegistrationFormComponent = function(_rootDivId) {
	
		var _initialize = function() {
			
			var rootElement = document.getElementById(_rootDivId);			
			var registrationFormBoxId = _rootDivId + "_box";			
			var buttonId = registrationFormBoxId + "_btn";			
			var errorDivId = registrationFormBoxId + "_err";
				
			rootElement.innerHTML = '<div id="' + registrationFormBoxId + '">' +
				'<label for="nickname">Nickname</label>' +
				'<input id="nickname" name="nickname" type="text" /><br/>' +
				'<label for="password">Password</label>' +
				'<input id="password" name="password" type="password" /><br/>' +
				'<label for="repeat_password">Repeat password</label>' +
				'<input id="repeat_password" name="repeat_password" type="password" /><br/>' +
				'<div id="' + errorDivId + '"></div><br/>' +
				'<button id="' + buttonId + '">Register</button></div>';
						
			var button = document.getElementById(buttonId);
			
			button.onclick = function() {				
				var nickname = document.getElementById("nickname");
				var password = document.getElementById("password");
				var repeatedPassword = document.getElementById("repeat_password");			
														
				var user = {
					"nickname" : nickname.value,
					"password" : password.value,
					"repeatPassword" : repeatedPassword.value
				};				
				eventBus.post("New_user_added", user);				
			}
	
		};
		
		var _onRegistrationFailed = function(message) {
			_registrationFailed(message);
		}
		
		var _onUserRegistered = function() {
			_clearFields();
		}
		
		var _registrationFailed = function(message) {			
			var errorElement = document.getElementById(_rootDivId + '_box_err');			
			errorElement.innerHTML = '<span style="color:red; font-size:small">' + message + '</span>';
		};
		
		var _clearFields = function() {			
			document.getElementById("nickname").value = "";
			document.getElementById("password").value = "";
			document.getElementById("repeat_password").value = "";	
			document.getElementById(_rootDivId + "_box_err").innerHTML = "";	
		};
		
		return {
			"initialize" : _initialize,
			"onUserRegistered" : _onUserRegistered,
			"onRegistrationFailed" : _onRegistrationFailed
		};
	}

	var UserListComponent = function(_rootDivId) {
		
		var _initialize = function() {			
			var rootElement = document.getElementById(_rootDivId);			
			var userListBoxId = _rootDivId + "_box";			
			rootElement.innerHTML = '<div id="' + userListBoxId + '">Available users</div>';
			var listDiv = document.createElement("div");
			listDiv.setAttribute("id", userListBoxId + "_list");
			rootElement.appendChild(listDiv);
		};
		
		var _onUserRegistered = function(userList) {
			_initUserList(userList);
		}
		
		var _initUserList = function(userList) {			
			var rootElement = document.getElementById(_rootDivId + "_box_list");
			rootElement.innerHTML = "";			
			var ul = document.createElement("ul");
			
			for (var i = 0; i < userList.length; i++) {
				var li = document.createElement("li");
				li.appendChild(document.createTextNode(userList[i]));
				ul.appendChild(li);
			}
			
			rootElement.appendChild(ul);
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