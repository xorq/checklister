
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
		this.submitData();
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
		var prompt = window.prompt('Item\'s name?')
		if (!prompt){return}
		this.data[cat].listData.push({item:prompt, priority:0})
		this.sortData();
	};
	this.importData = function(){
		this.data = $.parseJSON(window.localStorage.items)
	};
	this.removeItem = function(catId, id){
		this.data[catId].listData.splice(id,1)
		this.submitData();
	}
	this.editPriority = function(cat, item){
		var prompt = window.prompt('Priority Number?')
		if (!prompt){return}
		this.data[cat].listData[item].priority = prompt;
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
	$('ui-btn').unbind()
	$('.btn-back').css('display','block')
	$('.list').html('');
	var dataMaster = new DataManager;
	dataMaster.initialize();
	var data = dataMaster.getData(i).listData;
	$('.list').append(listMakerItems(data));
	itemEvents(dataMaster, i);

}

// VIEWS' HELPERS
	// ITEMS

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
	return _.map(data, function(a,i) {
		return '<li class="ui-first-child ui-last-child">\
					<div class="behind">\
						<a id="' + i + '" class="ui-btn delete-btn pull-left">Delete</a>\
						<a href="#" id="' + i + '" class="ui-btn priority new-btn edit-btn pull-right">Priority</a>\
					</div>\
					<a style="background-color:rgb(0, 0, ' + colorFunction(data)(a.priority) + ')" href="#sessio" data-role="button" data-transition="slide" class="ui-btn ui-icon-carat-r ui-btn-icon-right">' + a.item +'\
						<h1 class="priority-index" style="position:absolute;z-index:200;top:6px;left:85%">' + a.priority + '</h1>\
					</a>\
					<div>\
						\
					</div>\
				</li>';
	})
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
	$('.ui-listview li > a')
	.one('click', alternateCSS('background-color', 'rgb(0, 128, 9)'))
	.on('touchstart', function(e) {
		$('.ui-listview li > a.open').css('left', '0px').removeClass('open') // close em all
		$(e.currentTarget).addClass('open')
		x = e.originalEvent.targetTouches[0].pageX // anchor point
	})
	.on('touchmove', function(e) {
		var change = e.originalEvent.targetTouches[0].pageX - x
		change = Math.min(Math.max(-170, change), 170) // restrict to -100px left, 0px right
		if (Math.abs(change) > 50) {
			e.currentTarget.style.left = -(change > 0 ? 1 : -1) * 50 + change + 'px'
		}
		 // disable scroll once we hit 10px horizontal slide
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
}

// CATEGORIES

var listMakerCategories = function(data){
	return _.map(data, function(a,i) {
		return '<li class="ui-first-child ui-last-child">\
					<div class="behind">\
						<a id="' + i + '" href="#" class="ui-btn new-btn edit-btn pull-left">Edit</a>\
						<a id="' + i + '" href="#" class="ui-btn delete-btn">Delete</a>\
					</div>\
					<a data-role="button" data-transition="slide" id="' + i + '" class="btn-category ui-btn ui-icon-carat-r ui-btn-icon-right">' + a.listName +'</a>\
				</li>';
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
		change = Math.min(Math.max(-170, change), 170)
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
}


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



// Initialize the Data into a new object
renderCategories();
	//eventMaker();
