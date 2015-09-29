// GENERAL HELPERS
var removeEvents = function(id){
	var old_element = document.getElementById(id);
	var new_element = old_element.cloneNode(true);
	old_element.parentNode.replaceChild(new_element, old_element);
}

// DATA

var DataManager = function(){
	this.data = [];

	this.initialize = function(){
		this.importData();
		this.sortData();
	};
	this.sortData = function(){
		this.data = _.sortBy(this.data, 'listName')
		_.each(this.data, function(a){
			a.listData = _.sortBy(_.sortBy(a.listData, 'item'), 'priority')
		})
	};
	this.addCategory = function(){
		var prompt = window.prompt('Name?');
		if (!prompt){return}
		this.data.push({ listName : prompt , listData : [] });
		this.sortData();
		this.submitData();
	};
	this.editCategory = function(id){
		var prompt = window.prompt('New Name?')
		if (!prompt){return}
		this.data[id].listName = prompt;
		this.sortData();
		this.submitData();
	};
	this.removeCategory = function(cat){
		this.data.splice(cat,1);
		this.submitData();
	};
	this.getData = function(id){
		return id ? this.data[id] : this.data;
	};
	this.submitData = function(){
		window.localStorage.items = JSON.stringify(this.getData())
	};
	this.addItem = function(cat) {
		var master = this;
		var prompt = window.prompt('Item\'s name? You can add multiple items by separating with commas')
		if (!prompt){return}
		var prompt = prompt.split(',')
		_.each(prompt, function(a){
			master.data[cat].listData.push({item:a, priority:0, done:false})
		})
		this.sortData();
		this.submitData();
	};
	this.importData = function(){
		try{
			this.data = $.parseJSON(window.localStorage.items)
		} catch(err){
			
		}
	};
	this.removeItem = function(catId, id){
		this.data[catId].listData.splice(id,1)
		this.submitData();
	};
	this.editPriority = function(cat, item){
		var prompt = window.prompt('Priority Number?')
		if (!prompt){return}
		this.data[cat].listData[item].priority = prompt;
		this.submitData();
	};
	this.itemList = function(cat, newList){
		this.data[cat].listData = newList;
		this.submitData();
	};
	this.achieved = function(cat, id){
		this.data[cat].listData[id].done = !this.data[cat].listData[id].done || false ;
		this.submitData();
	};
	this.resetCategory = function(cat){
		conf = window.confirm('Sure ?');
		if (!conf) {return}
		_.each(this.data[cat].listData, function(a, index){
			a.done = false;
		})
		this.submitData();
	}
}

//VIEWS

var renderCategories = function(){
	$('ui-btn').unbind()
	$('.btn-back').css('display','none')
	$('.list').html('');
	var dataMaster = new DataManager;
	dataMaster.initialize();
	var data = dataMaster.getData();
	$('.list').append(listMakerCategories(data));
	categoryEvents(dataMaster);

};

var renderList = function(i){
	removeEvents('listView')
	$('ui-btn').unbind()
	$('.btn-back').css('display','block')
	$('.list').empty();
	var dataMaster = new DataManager;
	dataMaster.initialize();
	var data = dataMaster.getData(i).listData;
	$('.list').append(listMakerItems(data));
	$('.ui-title').html(dataMaster.getData(i).listName)
	itemEvents(dataMaster, i);

	var whenReordered = function(e) {
		e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);
		dataMaster.itemList(i, rewriteItemList(dataMaster.getData(i).listData))
		renderList(i);
	};

	var list = document.querySelector('ul');
	new Slip(list);

	list.addEventListener('slip:reorder', whenReordered, false);
}

// VIEWS' HELPERS
	// ITEMS

var rewriteItemList = function(data){
	return _.map($('ul > li > .item'), function(a, i){
		return {item:a.firstChild.data, priority:i, done: _.find(data, function(it, ind){ return a.firstChild.data.trim() == it.item.trim()}).done }
	})
}

var listMakerItems = function(data){

	var data = _.sortBy(data, 'priority')
	var priority = function(data, fun){
		return fun(_.pluck(data, 'priority'))
	}
	var range = priority(data, _.max) - priority(data, _.min)
	var colorFunction = function(data){
		var range = priority(data, _.max) - priority(data, _.min)
		return function(itemPriority) {
			return Math.floor(((itemPriority - priority(data, _.min)) / range) * 100) || 0
		}
	}
	var result = _.map(data, function(a,i) {
		var coloration = !a.done ? 'rgb(0, 0, ' + colorFunction(data)(a.priority) + ')' : 'rgb(0, 128, 0)';
		return '<li id="' + i + '" class="ui-first-child ui-last-child">\
					<div class="behind">\
						<a id="' + i + '" class="ui-btn delete-btn pull-left">Delete</a>\
						<a href="#" id="' + i + '" class="ui-btn priority new-btn edit-btn pull-right">Priority</a>\
					</div>\
					<a id="' + i + '" style="background-color:' + coloration + '" href="#sessio" data-role="button" data-transition="slide" class="item ui-btn ui-btn-icon-left ' + (a.done ? 'ui-icon-check' : '') + '">' + a.item +'\
					</a>\
				</li>'
	})

	return result
};

var itemEvents = function(dataMaster, categoryID){
	var alternateCSS = function(item, A){
		return function(){
			$(this)
			.one('click', alternateCSS(item, $(this).css(item)))
			.css(item, A)
		}
	};
	$('.ui-btn').off()
	$('.btn-add').on('click',function(){
		dataMaster.addItem(categoryID);
		renderList(categoryID);
	})
	$('.priority.ui-btn').on('click', function(e){
		dataMaster.editPriority(categoryID, e.toElement.id);
		renderList(categoryID);
	})
	var data = _.sortBy(dataMaster.getData(categoryID).listData, 'priority')
	$('.delete-btn').on('click', function(e){
		dataMaster.removeItem(categoryID, e.toElement.id);
		renderList(categoryID);
	})
	$('.btn-back').on('click', function(){renderCategories()});
	$('.btn-reset').on('click', function(){
		dataMaster.resetCategory(categoryID)
		renderList(categoryID)
	});
	$('.ui-listview li > .item')
	.on('click', function(e){
		dataMaster.achieved(categoryID, e.toElement.id)
		renderList(categoryID)
	}) //alternateCSS('background-color', 'rgb(0, 128, 9)'))
	.on('touchstart', function(e) {
		$('.ui-listview li > a.open').css('left', '0px').removeClass('open') // close em all
		$(e.currentTarget).addClass('open')
		x = e.originalEvent.targetTouches[0].pageX // anchor point
	})
	.on('touchmove', function(e) {
		var change = e.originalEvent.targetTouches[0].pageX - x
		change = Math.min(Math.max(0, change), 170) *1.5
		if (Math.abs(change) > 50) {
			e.currentTarget.style.left = -(change > 0 ? 1 : -1) * 50 + change + 'px'
		}
	})
	.on('touchend', function(e) {
		var left = parseInt(e.currentTarget.style.left)
		var new_left;
		if (left < -35) {
			new_left = '-110px'
		} else if (left > 35) {
			new_left = '110px'
		} else {
			new_left = '0px'
		}
		$(e.currentTarget).animate({left: new_left}, 200)
	});
	$('.btn-reset').css('display','block')
}

// CATEGORIES

var listMakerCategories = function(data){
	return _.map(data, function(a,i) {
		return '<li class="ui-first-child ui-last-child">\
					<div class="behind">\
						<a id="' + i + '" href="#" class="ui-btn delete-btn pull-left">Delete</a>\
					</div>\
					<a data-role="button" data-transition="slide" id="' + i + '" class="btn-category ui-btn ui-icon-carat-r ui-btn-icon-right">' + a.listName +'</a>\
				</li>\
				';
	})
};

var categoryEvents = function(dataMaster) {

	$('.ui-btn').off()
	$('.delete-btn').on('click', function(e){
		dataMaster.removeCategory(e.toElement.id)
		renderCategories();
	})
	$('.btn-add').on('click',function(){
		dataMaster.addCategory();
		renderCategories();
	})
	$('.btn-category').on('click', function(e){
		renderList(e.toElement.id);
	});
	$('.edit-btn').on('click', function(e){
		dataMaster.editCategory(e.toElement.id);
		renderCategories();
	})

	$('.ui-listview li > a')
	.on('touchstart', function(e) {
		$('.ui-listview li > a.open').css('left', '0px').removeClass('open') // close em all
		$(e.currentTarget).addClass('open')
		x = e.originalEvent.targetTouches[0].pageX // anchor point
	})
	.on('touchmove', function(e) {
		var change = e.originalEvent.targetTouches[0].pageX - x
		change = Math.min(Math.max(0, change), 170) *1.5
		if (Math.abs(change) > 50) {
			e.currentTarget.style.left = -(change > 0 ? 1 : -1) * 50 + change + 'px'
		}
	})
	.on('touchend', function(e) {
		var left = parseInt(e.currentTarget.style.left)
		var new_left;
		if (left < -35) {
			new_left = '-110px'
		} else if (left > 35) {
			new_left = '110px'
		} else {
			new_left = '0px'
		}
		$(e.currentTarget).animate({left: new_left}, 200)
	})
	$('.btn-reset').css('display','none')
	$('.ui-title').html('checklister')
}

/*
var data = [{listName:'badminton',
listData:[
	{item:'Rackets',priority:0},
	{item:'Plastic Bags',priority:1},
	{item:'Shoes',priority:0},
	{item:'Socks',priority:0},
	{item:'Small Towel',priority:1},

	{item:'Big Towel', priority:2},
	{item:'Powder', priority:3},
	{item:'Clean short', priority:3},
	{item:'Soap', priority:3},
	{item:'Shampoo', priority:3},

	{item:'Money', priority:0},
	{item:'Wallet', priority:0},
	{item:'Room Keys', priority:0},
	{item:'Phone', priority:0}
]},{listName:'aze'}]

window.localStorage.items = JSON.stringify(data)
*/
// Initialize the Data into a new object

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
	// Application Constructor
	initialize: function() {
		if(!window.localStorage.items){

			var data = [{listName:'badminton',
			listData:[
				{item:'Rackets',priority:0, done:false},
				{item:'Plastic Bags',priority:1, done:false},
				{item:'Shoes',priority:0, done:false},
				{item:'Socks',priority:0, done:false},
				{item:'Small Towel',priority:1, done:false},

				{item:'Big Towel', priority:2, done:false},
				{item:'Powder', priority:3, done:false},
				{item:'Clean short', priority:3, done:false},
				{item:'Soap', priority:3, done:false},
				{item:'Shampoo', priority:3, done:false},

				{item:'Money', priority:0, done:false},
				{item:'Wallet', priority:0, done:false},
				{item:'Room Keys', priority:0, done:false},
				{item:'Phone', priority:0, done:false},
			]}]
			window.localStorage.items = JSON.stringify(data)
		}
		renderCategories();
		this.bindEvents();

	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady: function() {
		app.receivedEvent('deviceready');
	},
	// Update DOM on a Received Event
	receivedEvent: function(id) {
		var parentElement = document.getElementById(id);
		var listeningElement = parentElement.querySelector('.listening');
		var receivedElement = parentElement.querySelector('.received');

		listeningElement.setAttribute('style', 'display:none;');
		receivedElement.setAttribute('style', 'display:block;');

		console.log('Received Event: ' + id);
	}
};

app.initialize();
