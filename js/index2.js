
	var data = [
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
	];



	var listMaker = function(data){
		var data = _.sortBy(data, 'priority')
		var priority = function(data, fun){
			return fun(_.pluck(data, 'priority'))
		}
		var range = priority(data, _.max) - priority(data, _.min)

		var colorFunction = function(data){
			var range = priority(data, _.max) - priority(data, _.min)
			return function(itemPriority) {
				return Math.floor(((itemPriority - priority(data, _.min)) / range) * 100)
			}
		}

		return _.map(data, function(a,i) {
			return '<li class="ui-first-child ui-last-child">\
						<div class="behind">\
							<a href="#" class="ui-btn new-btn edit-btn pull-left">Priority</a>\
							<a href="#" class="ui-btn delete-btn">Delete</a>\
						</div>\
						<a style="background-color:rgb(0, 0, ' + colorFunction(data)(a.priority) + ')" href="#sessio" data-role="button" data-transition="slide" class="btn-game-name ui-btn ui-icon-carat-r ui-btn-icon-right">' + a.item +'</a>\
						<div>\
							<h1 style="position:absolute;z-index:200;top:10px;left:85%">' + a.priority + '</h1>\
						</div>\
					</li>';
		})
	};
	var parseColor = function(input) {
	    var m;
	    m = input.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
	    if( m) {
	        return [m[1],m[2],m[3]];
    	};	
	};

	var displaceArray = function(array) {
		var result = _.rest(array)
		result.push(array[0])
		return result
	};

	var permuteCSS = function(item) {
		return function(){
			$(this).one('click', permuteCSS(item, $(this).css(item)))
			$(this).css(item, displaceArray(parseColor($(this).css(item))))
		}
	}

	var alternateCSS = function(item, A){
		return function(){
			$(this).one('click', alternateCSS(item, $(this).css(item)))
			$(this).css(item, A)
		}
	};

	var eventMaker = function(){
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
			// e.currentTarget.style.left = new_left
			$(e.currentTarget).animate({left: new_left}, 200)
			
		});
		$('')

	}

	$('.list').append(listMaker(data));

	//$('.list').enhanceWithin()
	eventMaker();

