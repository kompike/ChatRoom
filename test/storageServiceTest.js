var StorageService = require('../scripts/service/storageservice');

var Item = function(name) {
	
	var _setId = function(id) {
		this.id = id;
	}
	var _getId = function() {
		return this.id;
	}
	
	var _getName = function() {
		return name;
	}
	
	return {
		'getId': _getId,
		'setId': _setId,
		'getName': _getName
	}
}

var test = require('unit.js');

/* TESTS */

describe('Storage service should', function(){

	it('be able to create new collection', function(){

		var storage = new StorageService();
		var collectionName = 'test';
		
		var cretedCollection = storage.createCollection(collectionName);
		
		test
			.string(cretedCollection)
				.isEqualTo(collectionName);
	});

	it('be able to create new item', function(){

		var storage = new StorageService();
		var collectionName = 'test';
		
		storage.createCollection(collectionName);
		
		var id = storage.addItem(collectionName, new Item('testItem'));
		
		var itemList = storage.findAll(collectionName);
		
		test
			.string(id)
				.isEqualTo('test_0')
			.array(itemList)
				.isNotEmpty()
				.hasLength(1);
	});

	it('create items with unique ids', function(){

		var storage = new StorageService();
		
		var areIdsUnique = false;
		var collectionName = 'test';
		
		storage.createCollection(collectionName);
		
		var idList = [];
		
		for (var i = 0; i < 100; i++) {
			var id = storage.addItem(collectionName, new Item('testItem'));
			idList.push(id);
		}
		
		var uniqueIds = idList.filter(function(item, position){
			return idList.indexOf(item) == position;
		});
		
		areIdsUnique = (idList.lenght === uniqueIds.lenght);
		
		test
			.bool(areIdsUnique)
				.isTrue();
	});

	it('be able to find all items of given collection', function(){

		var storage = new StorageService();
		
		var collectionName = 'test';
		
		storage.createCollection(collectionName);
		
		var itemsNumber = 100;
		
		for (var i = 0; i < itemsNumber; i++) {
			storage.addItem(collectionName, new Item('testItem'));
		}
		
		var itemList = storage.findAll(collectionName);
		
		test
			.array(itemList)
				.isNotEmpty()
				.hasLength(itemsNumber);
	});

	it('return "undefined" if collection with given name does not exist', function(){

		var storage = new StorageService();
		
		var collectionName = 'test';
		
		storage.createCollection(collectionName);
		
		var itemsNumber = 100;
		
		for (var i = 0; i < itemsNumber; i++) {
			storage.addItem(collectionName, new Item('testItem'));
		}
		
		var itemList = storage.findAll('fakeCollectionName');
		
		test
			.value(itemList)
				.isUndefined();
	});

	it('be able to find item by name', function(){

		var storage = new StorageService();
		
		var collectionName = 'test';
		
		storage.createCollection(collectionName);
		
		var itemName = 'testItem';
		
		storage.addItem(collectionName, new Item(itemName));
		
		var itemFromStorage = storage.findItemByName(collectionName, itemName);
		var itemFromStorageName = itemFromStorage.getName();
		
		test
			.object(itemFromStorage)
				.isNotEmpty()
			.string(itemFromStorageName)
				.isEqualTo(itemName);
	});

	it('be able to find item by id', function(){

		var storage = new StorageService();
		
		var collectionName = 'test';
		
		storage.createCollection(collectionName);
		
		var itemId = storage.addItem(collectionName, new Item('testItem'));
		
		var itemFromStorage = storage.findItemById(collectionName, itemId);
		var itemFromStorageId = itemFromStorage.getId();
		
		test
			.object(itemFromStorage)
				.isNotEmpty()
			.string(itemFromStorageId)
				.isEqualTo(itemId);
	});

	it('return null if item by given name does not exist', function(){

		var storage = new StorageService();
		
		var collectionName = 'test';
		
		storage.createCollection(collectionName);
		
		storage.addItem(collectionName, new Item('testItem'));
		
		var itemFromStorage = storage.findItemByName(collectionName, 'fakeItem');
		
		test
			.value(itemFromStorage)
				.isNull();
	});

	it('return null if item by given id does not exist', function(){

		var storage = new StorageService();
		
		var collectionName = 'test';
		
		storage.createCollection(collectionName);
		
		var itemId = storage.addItem(collectionName, new Item('testItem'));
		
		var itemFromStorage = storage.findItemById(collectionName, 'fakeId');
		
		test
			.value(itemFromStorage)
				.isNull();
	});
});