var ChatService = function(eventBus, storageService) {
	
	var eventType = {
		chatAlreadyExists : 'CHAT_ALREADY_EXISTS',
		newChatCreated : 'NEW_CHAT_CREATED'
	}
	
	var _chatCollection = 'chats';
	
	var _addChat = function(chat) {
		
		var chatList = _getUsers();
		if (typeof chatList === 'undefined') {
			storageService.createCollection(_chatCollection);			
		}		
		if (_checkIfChatExists(chat)) {
			eventBus.post(eventType.chatAlreadyExists, "Chat already exists");			
		} else {
			var chatDTO = new chatDTO(chat.name, new Array());
			storageService.addItem(_chatCollection, chatDTO);					
			var chatList = _getUsers();
			eventBus.post(eventType.newChatCreated, chatList);
		}		
	}
		
	var _onChatAdded = function(chat) {
		_addChat(chat);
	}
	
	var _checkIfChatExists = function(chat) {
		return storageService.findItemByName(_chatCollection, chat.name) !== null;
	}
	
	var _getChatByName = function(chatName) {
		var chat = storageService.findItemByName(_chatCollection, chatName);
		return chat;
	}
	
	var _getAllChats = function() {
		var chats = storageService.findAll(_chatCollection);
		return chats;
	}
	
	return {
		'onChatAdded' : _onChatAdded, 
		'getAllChats' : _getAllChats,
		'getChatByName' : _getChatByName		
	};	
}

define(function() {
	return ChatService;
});