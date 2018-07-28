// ==UserScript==
// @name vk_jk
// @description Hotkeys for news feed in VK (https://github.com/Mansiper/vk_jk)
// @author Mansiper
// @license MIT
// @version 1.7
// @include https://vk.com/*
// ==/UserScript==
(function (window, undefined) {  
	var w;
	if (typeof unsafeWindow != undefined)
		w = unsafeWindow
	else w = window;

	if (w.self != w.top) return;
  
  var curObjId = '';
  var isInFriendsList = false;

	function findPos(obj) {
		var curtop = 0;
		if (obj.offsetParent) {
			do {
				curtop += obj.offsetTop;
			} while (obj = obj.offsetParent);
		return [curtop-42/*header*/-14/*gap*/];
		}
	}
	
	function ignoreCurrentPost() {
		var post = document.getElementById(curObjId);
		var btn = post.getElementsByClassName('flat_button')[1];
		btn.click();
		post.hidden = true;
	}

	function arrayContainsCount(classList, contains) {
		var cnt = 0;
		classList.forEach(el => el.indexOf(contains) >= 0 ? cnt++ : false);
		return cnt;
	}

	function feedsList() {
		var feed = document.getElementById('feed_rows').getElementsByClassName('feed_row');
		var feedArr = Array.from(feed);
		return feedArr.filter(el =>
			el.firstChild.id && el.firstChild.id.startsWith('post') &&
			arrayContainsCount(el.firstChild.classList, '_ads') == 0 &&
			el.getElementsByClassName('wall_marked_as_ads').length == 0 &&
			!el.hidden)
		array.forEach(el => el.startsWith(''));
	}

	function altKeysActions(code) {
		if (code < 49/*1*/ || code > 57/*9*/ && code < 97/*1num*/ || code > 105/*9num*/) return;
		//menu actions
		var sideBarItems = document.getElementById('side_bar_inner').getElementsByTagName('li');
		var itemNum = code - 97;
		if (itemNum < 0)
			itemNum = code - 49;
		if (sideBarItems[itemNum])
			sideBarItems[itemNum].firstChild.click();
	}
	
	function onJKKeyDown(e) {
		e = e || window.event;
		var code = (e.keyCode || e.which);
		if (!e.ctrlKey && !e.shiftKey && e.altKey)
			return altKeysActions(code);
		
		if (!document.location.href.startsWith('https://vk.com/feed') ||
				document.activeElement.tagName !== 'BODY')
			return;
		
		if (e.ctrlKey || e.shiftKey || e.altKey) return;
		var found = false;
		
		var loopMove = function(post) {
			if (post == undefined) return false;
			if (post.id == '') {
				post = post.firstChild;
				if (post == undefined || post.id == '') return false;
			}
			if (found || curObjId == '') {
				window.scroll(0, findPos(document.getElementById(post.id)));
				curObjId = post.id;
				return true;
			}
			found = post.id == curObjId;
			return false;
		}

		//if not friends hotkeys
		if (isInFriendsList && [70, 39, 37, 65].indexOf(code) == -1)
			isInFriendsList = false;
		
		if (code == 74/*j*/) {	//next
			var feed = feedsList();
			for (var i = 0; i < feed.length; i++)
				if (loopMove(feed[i].firstChild)) return;
		} else if (code == 75/*k*/) {	//prev
			var feed = feedsList();
			for (var i = feed.length-1; i >= 0; i--)
				if (loopMove(feed[i].firstChild)) return;
		} else if (code == 76/*l*/) {	//load new (go to top)
			var btn = document.getElementById('feed_new_posts');
			btn.click();
			curObjId = '';
			window.scrollTo(0, 0);
		} else if (code == 77/*m*/) {	//load more (in bottom)
			var btn = document.getElementById('show_more_link');
			btn.click();
		} else if (code == 78/*n*/) {	//open in new tab
			if (curObjId == '') return;
			var post = document.getElementById(curObjId);
			var link = post.getElementsByClassName('post_link')[0].href;
			//thanks to http://stackoverflow.com/a/11389138
			var a = document.createElement("a");
			a.href = link;
			var evt = document.createEvent("MouseEvents");
			evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0,
																	true, false, false, false, 0, null);
			a.dispatchEvent(evt);
		} else if (code == 80/*p*/) {	//block
			if (curObjId == '') return;
			var post = document.getElementById(curObjId);
			var btn = post.getElementsByClassName('ui_actions_menu_item')[0];
			if (btn == undefined) return;
			btn.click();
			setTimeout(function() { ignoreCurrentPost(post) }, 500);
		} else if (code == 67/*c*/) {	//show comments
			location = 'https://vk.com/feed?section=comments';
		} else if (code == 70/*f*/) {	//show potential friends
			var feed = document.getElementById('feed_rows').getElementsByClassName('feed_row');
			for (var i = 0; i < feed.length; i++)
				if (feed[i].firstChild.classList.contains('feed_friends_recomm')) {
					isInFriendsList = true;
					window.scroll(0, findPos(feed[i].firstChild));
				}
		} else if (isInFriendsList) {
			if (code == 39 /*right*/) {	//slide friends right
				var btn = document.getElementsByClassName('ui_gallery__arrow_right')[0];
				if (btn.classList.contains('ui_gallery__arrow_visible'))
					btn.click();
			} else if (code == 37 /*left*/) {	//slide friends left
				var btn = document.getElementsByClassName('ui_gallery__arrow_left')[0];
				if (btn.classList.contains('ui_gallery__arrow_visible'))
					btn.click();
			} else if (code == 65 /*a*/) {	//open all possible friends
				var btn = document.getElementsByClassName('feed_friends_recomm__all')[0];
				btn.click();
			}
		}
	}
	document.body.onkeydown = function(e) { onJKKeyDown(e); };
})(window);