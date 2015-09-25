
	var data = [
	{item:'Rackets',priority:0},
	{item:'Plastic Bags',priority:0},
	{item:'Shoes',priority:0},
	{item:'Socks',priority:0},
	{item:'Small Towel',priority:0},

	{item:'Big Towel', priority:1},
	{item:'Powder', priority:1},
	{item:'Clean short', priority:1},
	{item:'Soap', priority:1},
	{item:'Shampoo', priority:1},

	{item:'Money', priority:2},
	{item:'Wallet', priority:2},
	{item:'Room Keys', priority:2},
	{item:'Phone', priority:2}
	];







	var listMaker = function(data){
		return _.map(data, function(a,i){
			return '\
			<li class="item ui-first-child ui-last-child" id=' + i + '>\
				<a>' + a.item + '</a>\
			</li>';
		})
	}
	var eventMaker = function(){
		$('.ui-listview li > a')
		.on('touchstart', function(e) {
			$('.ui-listview li > a.open').css('left', '0px').removeClass('open') // close em all
			$(e.currentTarget).addClass('open')
			x = e.originalEvent.targetTouches[0].pageX // anchor point
		})
		.on('touchmove', function(e) {
			var change = e.originalEvent.targetTouches[0].pageX - x
			change = Math.min(Math.max(-150, change), 150) // restrict to -100px left, 0px right
			if (Math.abs(change) > 50) {
				e.currentTarget.style.left = -(change > 0 ? 1 : -1) * 50 + change + 'px'
			}
			 // disable scroll once we hit 10px horizontal slide
		})
		.on('touchend', function(e) {
			var left = parseInt(e.currentTarget.style.left)
			var new_left;
			if (left < -35) {
				new_left = '-100px'
			} else if (left > 35) {
				new_left = '100px'
			} else {
				new_left = '0px'
			}
			// e.currentTarget.style.left = new_left
			$(e.currentTarget).animate({left: new_left}, 200)
			
		});







		}
	


	//$('.list').enhanceWithin()
	$('.list').append(listMaker(data));
	eventMaker();
