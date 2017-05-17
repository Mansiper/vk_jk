// ==UserScript==
// @name vk_jk
// @description Hotkeys for news feed in VK (https://github.com/Mansiper/vk_jk)
// @author Mansiper
// @license MIT
// @version 1.4
// @include https://vk.com/*
// ==/UserScript==
(function (window, undefined) {  
	var w;
	if (typeof unsafeWindow != undefined)
		w = unsafeWindow
	else w = window;

	if (w.self != w.top) return;
  
  var curObjId = '';

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
	
	function onJKKeyDown(e) {
		if (!document.location.href.startsWith('https://vk.com/feed')) return;
		
		e = e || window.event;
		var code = (e.keyCode || e.which);
		if (e.ctrlKey || e.shiftKey || e.altKey) return;
		var found = false;
		
		var loopMove = function(post) {
			if (post == undefined) return false;
			if (post.id == '') {
				post = post.firstChild;
				if (post == undefined || post.id == '') return false;
			}
			var hasAdv = post.id.startsWith('ads_');
			if (!hasAdv) {
				var classes = post.classList;
				for (var j = 0; j < classes.length; j++)
					hasAdv = hasAdv || classes[j].startsWith('_ads');
			}
			if (!hasAdv)	//not interested invisible posts
				hasAdv = post.style['display'].startsWith('none') || post.hidden;
			if ((found || curObjId == '') && hasAdv)
				return false;
			else if ((found || curObjId == '') && !hasAdv) {
				window.scroll(0, findPos(document.getElementById(post.id)));
				curObjId = post.id;
				return true;
			}
			found = post.id == curObjId;
			return false;
		}
		
		if (code == 74/*j*/) {
			var feed = document.getElementById('feed_rows').getElementsByClassName('feed_row');
			for (var i = 0; i < feed.length; i++)
				if (loopMove(feed[i].firstChild)) return;
		} else if (code == 75/*k*/) {
			var feed = document.getElementById('feed_rows').getElementsByClassName('feed_row');
			for (var i = feed.length-1; i >= 0; i--)
				if (loopMove(feed[i].firstChild)) return;
		} else if (code == 76/*l*/) {
			var btn = document.getElementById('feed_new_posts');
			btn.click();
			curObjId = '';
		} else if (code == 77/*m*/) {
			var btn = document.getElementById('show_more_link');
			btn.click();
		} else if (code == 78/*n*/) {
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
		} else if (code == 80/*p*/) {
			if (curObjId == '') return;
			var post = document.getElementById(curObjId);
			var btn = post.getElementsByClassName('ui_actions_menu_item')[0];
			if (btn == undefined) return;
			btn.click();
			setTimeout(function() { ignoreCurrentPost(post) }, 500);
		}
	}
	document.body.onkeydown = function(e) { onJKKeyDown(e); };
})(window);