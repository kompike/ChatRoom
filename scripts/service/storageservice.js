var StorageService = function() {
	
	var _collectionStorage = {};
	
	var _createCollection = function(collectionName) {
		_collectionStorage[collectionName] = [];
		
		return collectionName;
	}
	
	var _addItem = function(collectionName, item) {
		
		_collectionStorage[collectionName].push(item);
	}
	
	var _findAll = function(collectionName) {
		
		var itemList = _collectionStorage[collectionName];
		
		return itemList;
	}
	
	var _findItemByName = function(collectionName, itemName) {
		
		var itemList = _collectionStorage[collectionName];
		var itemByName = null;
		
		for (var i = 0; i < itemList.length; i++) {
			if (itemList[i].getName() === itemName) {
				itemByName = itemList[i];
				return itemByName;
			}
		}
		return null;
	}
	
	var _findItemById = function(collectionName, itemId) {
		
		var itemList = _collectionStorage[collectionName];
		var itemById = null;
		for (var i = 0; i < itemList.length; i++) {
			if (itemList[i].getId() === itemId) {
				itemById = itemList[i];
				return;
			}
		}
		
		return itemById;
	}
	
	var _deleteItem = function(collectionName, item) {		
		var itemList = _collectionStorage[collectionName];
		var index = itemList.indexOf(item);
		itemList.splice(index, 1);
	}
	
	return {
		'createCollection' : _createCollection,
		'addItem' : _addItem,
		'findAll' : _findAll,
		'findItemById' : _findItemById,
		'findItemByName' : _findItemByName,
		'deleteItem' : _deleteItem
	};
	
}

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
	return StorageService;
});