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

	it('create items with unique ids', function(){

		var storage = new StorageService();
		
		var areIdsUnique = false;
		var collectionName = 'test';
		
		storage.createCollection(collectionName);
		
		var idList = [];
		
		for (var i = 0; i < 100; i++) {
			var id = storage.addItem(collectionName, new Item('test'));
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
});