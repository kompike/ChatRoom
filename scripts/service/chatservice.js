var ChatService = function(eventBus, storageService) {
		
	var _chatCollection = 'chats';
	
	var _addChat = function(chat) {
		
		var chatList = _getAllChats();
		if (typeof chatList === 'undefined') {
			storageService.createCollection(_chatCollection);			
		}		
		if (_checkIfChatExists(chat)) {
			eventBus.post(EventType.chatCreationFailed, "Chat already exists");			
		} else if (chat.name.trim() === '') {
			eventBus.post(EventType.chatCreationFailed, "Chat name must be filled");
		} else {
			var chatDTO = new ChatDTO(chat.name, chat.owner, new Array(), new Array());
			storageService.addItem(_chatCollection, chatDTO);				
			var chatList = _getAllChats();
			eventBus.post(EventType.newChatCreated, chatList);
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
		console.log('Looking for all available chats...');
		if (typeof storageService.findAll(_chatCollection) === 'undefined') {
			storageService.createCollection(_chatCollection);
		}			
		var chatList = storageService.findAll(_chatCollection);
		return chatList;
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