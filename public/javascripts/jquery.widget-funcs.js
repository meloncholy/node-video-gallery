/*!
 * jQuery UI 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI
 */
(function(c,j){function k(a,b){var d=a.nodeName.toLowerCase();if("area"===d){b=a.parentNode;d=b.name;if(!a.href||!d||b.nodeName.toLowerCase()!=="map")return false;a=c("img[usemap=#"+d+"]")[0];return!!a&&l(a)}return(/input|select|textarea|button|object/.test(d)?!a.disabled:"a"==d?a.href||b:b)&&l(a)}function l(a){return!c(a).parents().andSelf().filter(function(){return c.curCSS(this,"visibility")==="hidden"||c.expr.filters.hidden(this)}).length}c.ui=c.ui||{};if(!c.ui.version){c.extend(c.ui,{version:"1.8.16",
keyCode:{ALT:18,BACKSPACE:8,CAPS_LOCK:20,COMMA:188,COMMAND:91,COMMAND_LEFT:91,COMMAND_RIGHT:93,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,MENU:93,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38,WINDOWS:91}});c.fn.extend({propAttr:c.fn.prop||c.fn.attr,_focus:c.fn.focus,focus:function(a,b){return typeof a==="number"?this.each(function(){var d=
this;setTimeout(function(){c(d).focus();b&&b.call(d)},a)}):this._focus.apply(this,arguments)},scrollParent:function(){var a;a=c.browser.msie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(c.curCSS(this,"position",1))&&/(auto|scroll)/.test(c.curCSS(this,"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(c.curCSS(this,
"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))}).eq(0);return/fixed/.test(this.css("position"))||!a.length?c(document):a},zIndex:function(a){if(a!==j)return this.css("zIndex",a);if(this.length){a=c(this[0]);for(var b;a.length&&a[0]!==document;){b=a.css("position");if(b==="absolute"||b==="relative"||b==="fixed"){b=parseInt(a.css("zIndex"),10);if(!isNaN(b)&&b!==0)return b}a=a.parent()}}return 0},disableSelection:function(){return this.bind((c.support.selectstart?"selectstart":
"mousedown")+".ui-disableSelection",function(a){a.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}});c.each(["Width","Height"],function(a,b){function d(f,g,m,n){c.each(e,function(){g-=parseFloat(c.curCSS(f,"padding"+this,true))||0;if(m)g-=parseFloat(c.curCSS(f,"border"+this+"Width",true))||0;if(n)g-=parseFloat(c.curCSS(f,"margin"+this,true))||0});return g}var e=b==="Width"?["Left","Right"]:["Top","Bottom"],h=b.toLowerCase(),i={innerWidth:c.fn.innerWidth,innerHeight:c.fn.innerHeight,
outerWidth:c.fn.outerWidth,outerHeight:c.fn.outerHeight};c.fn["inner"+b]=function(f){if(f===j)return i["inner"+b].call(this);return this.each(function(){c(this).css(h,d(this,f)+"px")})};c.fn["outer"+b]=function(f,g){if(typeof f!=="number")return i["outer"+b].call(this,f);return this.each(function(){c(this).css(h,d(this,f,true,g)+"px")})}});c.extend(c.expr[":"],{data:function(a,b,d){return!!c.data(a,d[3])},focusable:function(a){return k(a,!isNaN(c.attr(a,"tabindex")))},tabbable:function(a){var b=c.attr(a,
"tabindex"),d=isNaN(b);return(d||b>=0)&&k(a,!d)}});c(function(){var a=document.body,b=a.appendChild(b=document.createElement("div"));c.extend(b.style,{minHeight:"100px",height:"auto",padding:0,borderWidth:0});c.support.minHeight=b.offsetHeight===100;c.support.selectstart="onselectstart"in b;a.removeChild(b).style.display="none"});c.extend(c.ui,{plugin:{add:function(a,b,d){a=c.ui[a].prototype;for(var e in d){a.plugins[e]=a.plugins[e]||[];a.plugins[e].push([b,d[e]])}},call:function(a,b,d){if((b=a.plugins[b])&&
a.element[0].parentNode)for(var e=0;e<b.length;e++)a.options[b[e][0]]&&b[e][1].apply(a.element,d)}},contains:function(a,b){return document.compareDocumentPosition?a.compareDocumentPosition(b)&16:a!==b&&a.contains(b)},hasScroll:function(a,b){if(c(a).css("overflow")==="hidden")return false;b=b&&b==="left"?"scrollLeft":"scrollTop";var d=false;if(a[b]>0)return true;a[b]=1;d=a[b]>0;a[b]=0;return d},isOverAxis:function(a,b,d){return a>b&&a<b+d},isOver:function(a,b,d,e,h,i){return c.ui.isOverAxis(a,d,h)&&
c.ui.isOverAxis(b,e,i)}})}})(jQuery);
;/*!
 * jQuery UI Widget 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
(function(b,j){if(b.cleanData){var k=b.cleanData;b.cleanData=function(a){for(var c=0,d;(d=a[c])!=null;c++)try{b(d).triggerHandler("remove")}catch(e){}k(a)}}else{var l=b.fn.remove;b.fn.remove=function(a,c){return this.each(function(){if(!c)if(!a||b.filter(a,[this]).length)b("*",this).add([this]).each(function(){try{b(this).triggerHandler("remove")}catch(d){}});return l.call(b(this),a,c)})}}b.widget=function(a,c,d){var e=a.split(".")[0],f;a=a.split(".")[1];f=e+"-"+a;if(!d){d=c;c=b.Widget}b.expr[":"][f]=
function(h){return!!b.data(h,a)};b[e]=b[e]||{};b[e][a]=function(h,g){arguments.length&&this._createWidget(h,g)};c=new c;c.options=b.extend(true,{},c.options);b[e][a].prototype=b.extend(true,c,{namespace:e,widgetName:a,widgetEventPrefix:b[e][a].prototype.widgetEventPrefix||a,widgetBaseClass:f},d);b.widget.bridge(a,b[e][a])};b.widget.bridge=function(a,c){b.fn[a]=function(d){var e=typeof d==="string",f=Array.prototype.slice.call(arguments,1),h=this;d=!e&&f.length?b.extend.apply(null,[true,d].concat(f)):
d;if(e&&d.charAt(0)==="_")return h;e?this.each(function(){var g=b.data(this,a),i=g&&b.isFunction(g[d])?g[d].apply(g,f):g;if(i!==g&&i!==j){h=i;return false}}):this.each(function(){var g=b.data(this,a);g?g.option(d||{})._init():b.data(this,a,new c(d,this))});return h}};b.Widget=function(a,c){arguments.length&&this._createWidget(a,c)};b.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",options:{disabled:false},_createWidget:function(a,c){b.data(c,this.widgetName,this);this.element=b(c);this.options=
b.extend(true,{},this.options,this._getCreateOptions(),a);var d=this;this.element.bind("remove."+this.widgetName,function(){d.destroy()});this._create();this._trigger("create");this._init()},_getCreateOptions:function(){return b.metadata&&b.metadata.get(this.element[0])[this.widgetName]},_create:function(){},_init:function(){},destroy:function(){this.element.unbind("."+this.widgetName).removeData(this.widgetName);this.widget().unbind("."+this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass+
"-disabled ui-state-disabled")},widget:function(){return this.element},option:function(a,c){var d=a;if(arguments.length===0)return b.extend({},this.options);if(typeof a==="string"){if(c===j)return this.options[a];d={};d[a]=c}this._setOptions(d);return this},_setOptions:function(a){var c=this;b.each(a,function(d,e){c._setOption(d,e)});return this},_setOption:function(a,c){this.options[a]=c;if(a==="disabled")this.widget()[c?"addClass":"removeClass"](this.widgetBaseClass+"-disabled ui-state-disabled").attr("aria-disabled",
c);return this},enable:function(){return this._setOption("disabled",false)},disable:function(){return this._setOption("disabled",true)},_trigger:function(a,c,d){var e=this.options[a];c=b.Event(c);c.type=(a===this.widgetEventPrefix?a:this.widgetEventPrefix+a).toLowerCase();d=d||{};if(c.originalEvent){a=b.event.props.length;for(var f;a;){f=b.event.props[--a];c[f]=c.originalEvent[f]}}this.element.trigger(c,d);return!(b.isFunction(e)&&e.call(this.element[0],c,d)===false||c.isDefaultPrevented())}}})(jQuery);
;

/*!
* JQuery Widget inheritance code by Danny Wachsstock
* Based on work by Richard Cornford, Douglas Crockford, Dean Edwards and John Resig
* http://bililite.com/blog/extending-jquery-ui-widgets/
*/

// Copyright (c) 2009 Daniel Wachsstock
// MIT license:
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

(function ($)
{
	// create the master widget
	$.widget("ui.widget", {
		// Aspect Oriented Programming tools from Justin Palmer's article
		yield: null,
		returnValues: {},
		before: function (method, f)
		{
			var original = this[method];
			this[method] = function ()
			{
				f.apply(this, arguments);
				return original.apply(this, arguments);
			};
		},
		after: function (method, f)
		{
			var original = this[method];
			this[method] = function ()
			{
				this.returnValues[method] = original.apply(this, arguments);
				return f.apply(this, arguments);
			}
		},
		around: function (method, f)
		{
			var original = this[method];
			this[method] = function ()
			{
				var tmp = this.yield;
				this.yield = original;
				var ret = f.apply(this, arguments);
				this.yield = tmp;
				return ret;
			}
		}
	});

	// from http://groups.google.com/group/comp.lang.javascript/msg/e04726a66face2a2 and
	// http://webreflection.blogspot.com/2008/10/big-douglas-begetobject-revisited.html
	var object = (function (F)
	{
		return (function (o)
		{
			F.prototype = o;
			return new F();
		});
	})(function () { });

	// create a widget subclass
	var OVERRIDE = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/;
	$.ui.widget.subclass = function subclass(name)
	{
		$.widget(name); // Slightly inefficient to create a widget only to discard its prototype, but it's not too bad
		name = name.split('.');

		var widget = $[name[0]][name[1]], superclass = this, superproto = superclass.prototype;

		var proto = arguments[0] = widget.prototype = object(superproto); // inherit from the superclass
		$.extend.apply(null, arguments); // and add other add-in methods to the prototype
		widget.subclass = subclass;

		// Subtle point: we want to call superclass init and destroy if they exist
		// (otherwise the user of this function would have to keep track of all that)
		for (key in proto) if (proto.hasOwnProperty(key)) switch (key)
		{
			case '_create':
				var create = proto._create;
				proto._create = function ()
				{
					superproto._create.apply(this);
					create.apply(this);
				};
				break;
			case '_init':
				var init = proto._init;
				proto._init = function ()
				{
					superproto._init.apply(this);
					init.apply(this);
				};
				break;
			case 'destroy':
				var destroy = proto.destroy;
				proto.destroy = function ()
				{
					destroy.apply(this);
					superproto.destroy.apply(this);
				};
				break;
			case 'options':
				var options = proto.options;
				proto.options = $.extend({}, superproto.options, options);
				break;
			default:
				if ($.isFunction(proto[key]) && $.isFunction(superproto[key]) && OVERRIDE.test(proto[key]))
				{
					proto[key] = (function (name, fn)
					{
						return function ()
						{
							var tmp = this._super;
							this._super = superproto[name];
							try { var ret = fn.apply(this, arguments); }
							finally { this._super = tmp; }
							return ret;
						};
					})(key, proto[key]);
				}
				break;
		}
	};
})(jQuery)

/**
* Cookie plugin
*
* Copyright (c) 2006 Klaus Hartl (stilbuero.de)
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
*/

/**
* Create a cookie with the given name and value and other optional parameters.
*
* @example $.cookie('the_cookie', 'the_value');
* @desc Set the value of a cookie.
* @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
* @desc Create a cookie with all available options.
* @example $.cookie('the_cookie', 'the_value');
* @desc Create a session cookie.
* @example $.cookie('the_cookie', null);
* @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
*       used when the cookie was set.
*
* @param String name The name of the cookie.
* @param String value The value of the cookie.
* @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
* @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
*                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
*                             If set to null or omitted, the cookie will be a session cookie and will not be retained
*                             when the the browser exits.
* @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
* @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
* @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
*                        require a secure protocol (like HTTPS).
* @type undefined
*
* @name $.cookie
* @cat Plugins/Cookie
* @author Klaus Hartl/klaus.hartl@stilbuero.de
*/


/**
* Get the value of a cookie with the given name.
*
* @example $.cookie('the_cookie');
* @desc Get the value of a cookie.
*
* @param String name The name of the cookie.
* @return The value of the cookie.
* @type String
*
* @name $.cookie
* @cat Plugins/Cookie
* @author Klaus Hartl/klaus.hartl@stilbuero.de
*/

jQuery.cookie = function (name, value, options)
{
	if (typeof value != 'undefined')
	{ // name and value given, set cookie
		options = options || {};
		if (value === null)
		{
			value = '';
			options.expires = -1;
		}
		var expires = '';
		if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString))
		{
			var date;
			if (typeof options.expires == 'number')
			{
				date = new Date();
				date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
			} else
			{
				date = options.expires;
			}
			expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
		}
		// CAUTION: Needed to parenthesize options.path and options.domain
		// in the following expressions, otherwise they evaluate to undefined
		// in the packed version for some reason...
		var path = options.path ? '; path=' + (options.path) : '';
		var domain = options.domain ? '; domain=' + (options.domain) : '';
		var secure = options.secure ? '; secure' : '';
		document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
	} else
	{ // only name given, get cookie
		var cookieValue = null;
		if (document.cookie && document.cookie != '')
		{
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++)
			{
				var cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) == (name + '='))
				{
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
};


/*!
* jQuery hashchange event - v1.3 - 7/21/2010
* http://benalman.com/projects/jquery-hashchange-plugin/
* 
* Copyright (c) 2010 "Cowboy" Ben Alman
* Dual licensed under the MIT and GPL licenses.
* http://benalman.com/about/license/
*/

// Script: jQuery hashchange event
//
// *Version: 1.3, Last updated: 7/21/2010*
// 
// Project Home - http://benalman.com/projects/jquery-hashchange-plugin/
// GitHub       - http://github.com/cowboy/jquery-hashchange/
// Source       - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.js
// (Minified)   - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.min.js (0.8kb gzipped)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
// 
// hashchange event - http://benalman.com/code/projects/jquery-hashchange/examples/hashchange/
// document.domain - http://benalman.com/code/projects/jquery-hashchange/examples/document_domain/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - 1.2.6, 1.3.2, 1.4.1, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-4, Chrome 5-6, Safari 3.2-5,
//                   Opera 9.6-10.60, iPhone 3.1, Android 1.6-2.2, BlackBerry 4.6-5.
// Unit Tests      - http://benalman.com/code/projects/jquery-hashchange/unit/
// 
// About: Known issues
// 
// While this jQuery hashchange event implementation is quite stable and
// robust, there are a few unfortunate browser bugs surrounding expected
// hashchange event-based behaviors, independent of any JavaScript
// window.onhashchange abstraction. See the following examples for more
// information:
// 
// Chrome: Back Button - http://benalman.com/code/projects/jquery-hashchange/examples/bug-chrome-back-button/
// Firefox: Remote XMLHttpRequest - http://benalman.com/code/projects/jquery-hashchange/examples/bug-firefox-remote-xhr/
// WebKit: Back Button in an Iframe - http://benalman.com/code/projects/jquery-hashchange/examples/bug-webkit-hash-iframe/
// Safari: Back Button from a different domain - http://benalman.com/code/projects/jquery-hashchange/examples/bug-safari-back-from-diff-domain/
// 
// Also note that should a browser natively support the window.onhashchange 
// event, but not report that it does, the fallback polling loop will be used.
// 
// About: Release History
// 
// 1.3   - (7/21/2010) Reorganized IE6/7 Iframe code to make it more
//         "removable" for mobile-only development. Added IE6/7 document.title
//         support. Attempted to make Iframe as hidden as possible by using
//         techniques from http://www.paciellogroup.com/blog/?p=604. Added 
//         support for the "shortcut" format $(window).hashchange( fn ) and
//         $(window).hashchange() like jQuery provides for built-in events.
//         Renamed jQuery.hashchangeDelay to <jQuery.fn.hashchange.delay> and
//         lowered its default value to 50. Added <jQuery.fn.hashchange.domain>
//         and <jQuery.fn.hashchange.src> properties plus document-domain.html
//         file to address access denied issues when setting document.domain in
//         IE6/7.
// 1.2   - (2/11/2010) Fixed a bug where coming back to a page using this plugin
//         from a page on another domain would cause an error in Safari 4. Also,
//         IE6/7 Iframe is now inserted after the body (this actually works),
//         which prevents the page from scrolling when the event is first bound.
//         Event can also now be bound before DOM ready, but it won't be usable
//         before then in IE6/7.
// 1.1   - (1/21/2010) Incorporated document.documentMode test to fix IE8 bug
//         where browser version is incorrectly reported as 8.0, despite
//         inclusion of the X-UA-Compatible IE=EmulateIE7 meta tag.
// 1.0   - (1/9/2010) Initial Release. Broke out the jQuery BBQ event.special
//         window.onhashchange functionality into a separate plugin for users
//         who want just the basic event & back button support, without all the
//         extra awesomeness that BBQ provides. This plugin will be included as
//         part of jQuery BBQ, but also be available separately.

(function ($, window, undefined)
{
	'$:nomunge'; // Used by YUI compressor.

	// Reused string.
	var str_hashchange = 'hashchange',

	// Method / object references.
doc = document,
fake_onhashchange,
special = $.event.special,

	// Does the browser support window.onhashchange? Note that IE8 running in
	// IE7 compatibility mode reports true for 'onhashchange' in window, even
	// though the event isn't supported, so also test document.documentMode.
doc_mode = doc.documentMode,
supports_onhashchange = 'on' + str_hashchange in window && (doc_mode === undefined || doc_mode > 7);

	// Get location.hash (or what you'd expect location.hash to be) sans any
	// leading #. Thanks for making this necessary, Firefox!
	function get_fragment(url)
	{
		url = url || location.href;
		return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
	};

	// Method: jQuery.fn.hashchange
	// 
	// Bind a handler to the window.onhashchange event or trigger all bound
	// window.onhashchange event handlers. This behavior is consistent with
	// jQuery's built-in event handlers.
	// 
	// Usage:
	// 
	// > jQuery(window).hashchange( [ handler ] );
	// 
	// Arguments:
	// 
	//  handler - (Function) Optional handler to be bound to the hashchange
	//    event. This is a "shortcut" for the more verbose form:
	//    jQuery(window).bind( 'hashchange', handler ). If handler is omitted,
	//    all bound window.onhashchange event handlers will be triggered. This
	//    is a shortcut for the more verbose
	//    jQuery(window).trigger( 'hashchange' ). These forms are described in
	//    the <hashchange event> section.
	// 
	// Returns:
	// 
	//  (jQuery) The initial jQuery collection of elements.

	// Allow the "shortcut" format $(elem).hashchange( fn ) for binding and
	// $(elem).hashchange() for triggering, like jQuery does for built-in events.
	$.fn[str_hashchange] = function (fn)
	{
		return fn ? this.bind(str_hashchange, fn) : this.trigger(str_hashchange);
	};

	// Property: jQuery.fn.hashchange.delay
	// 
	// The numeric interval (in milliseconds) at which the <hashchange event>
	// polling loop executes. Defaults to 50.

	// Property: jQuery.fn.hashchange.domain
	// 
	// If you're setting document.domain in your JavaScript, and you want hash
	// history to work in IE6/7, not only must this property be set, but you must
	// also set document.domain BEFORE jQuery is loaded into the page. This
	// property is only applicable if you are supporting IE6/7 (or IE8 operating
	// in "IE7 compatibility" mode).
	// 
	// In addition, the <jQuery.fn.hashchange.src> property must be set to the
	// path of the included "document-domain.html" file, which can be renamed or
	// modified if necessary (note that the document.domain specified must be the
	// same in both your main JavaScript as well as in this file).
	// 
	// Usage:
	// 
	// jQuery.fn.hashchange.domain = document.domain;

	// Property: jQuery.fn.hashchange.src
	// 
	// If, for some reason, you need to specify an Iframe src file (for example,
	// when setting document.domain as in <jQuery.fn.hashchange.domain>), you can
	// do so using this property. Note that when using this property, history
	// won't be recorded in IE6/7 until the Iframe src file loads. This property
	// is only applicable if you are supporting IE6/7 (or IE8 operating in "IE7
	// compatibility" mode).
	// 
	// Usage:
	// 
	// jQuery.fn.hashchange.src = 'path/to/file.html';

	$.fn[str_hashchange].delay = 50;
	/*
	$.fn[ str_hashchange ].domain = null;
	$.fn[ str_hashchange ].src = null;
	*/

	// Event: hashchange event
	// 
	// Fired when location.hash changes. In browsers that support it, the native
	// HTML5 window.onhashchange event is used, otherwise a polling loop is
	// initialized, running every <jQuery.fn.hashchange.delay> milliseconds to
	// see if the hash has changed. In IE6/7 (and IE8 operating in "IE7
	// compatibility" mode), a hidden Iframe is created to allow the back button
	// and hash-based history to work.
	// 
	// Usage as described in <jQuery.fn.hashchange>:
	// 
	// > // Bind an event handler.
	// > jQuery(window).hashchange( function(e) {
	// >   var hash = location.hash;
	// >   ...
	// > });
	// > 
	// > // Manually trigger the event handler.
	// > jQuery(window).hashchange();
	// 
	// A more verbose usage that allows for event namespacing:
	// 
	// > // Bind an event handler.
	// > jQuery(window).bind( 'hashchange', function(e) {
	// >   var hash = location.hash;
	// >   ...
	// > });
	// > 
	// > // Manually trigger the event handler.
	// > jQuery(window).trigger( 'hashchange' );
	// 
	// Additional Notes:
	// 
	// * The polling loop and Iframe are not created until at least one handler
	//   is actually bound to the 'hashchange' event.
	// * If you need the bound handler(s) to execute immediately, in cases where
	//   a location.hash exists on page load, via bookmark or page refresh for
	//   example, use jQuery(window).hashchange() or the more verbose 
	//   jQuery(window).trigger( 'hashchange' ).
	// * The event can be bound before DOM ready, but since it won't be usable
	//   before then in IE6/7 (due to the necessary Iframe), recommended usage is
	//   to bind it inside a DOM ready handler.

	// Override existing $.event.special.hashchange methods (allowing this plugin
	// to be defined after jQuery BBQ in BBQ's source code).
	special[str_hashchange] = $.extend(special[str_hashchange], {

		// Called only when the first 'hashchange' event is bound to window.
		setup: function ()
		{
			// If window.onhashchange is supported natively, there's nothing to do..
			if (supports_onhashchange) { return false; }

			// Otherwise, we need to create our own. And we don't want to call this
			// until the user binds to the event, just in case they never do, since it
			// will create a polling loop and possibly even a hidden Iframe.
			$(fake_onhashchange.start);
		},

		// Called only when the last 'hashchange' event is unbound from window.
		teardown: function ()
		{
			// If window.onhashchange is supported natively, there's nothing to do..
			if (supports_onhashchange) { return false; }

			// Otherwise, we need to stop ours (if possible).
			$(fake_onhashchange.stop);
		}

	});

	// fake_onhashchange does all the work of triggering the window.onhashchange
	// event for browsers that don't natively support it, including creating a
	// polling loop to watch for hash changes and in IE 6/7 creating a hidden
	// Iframe to enable back and forward.
	fake_onhashchange = (function ()
	{
		var self = {},
	timeout_id,

		// Remember the initial hash so it doesn't get triggered immediately.
	last_hash = get_fragment(),

	fn_retval = function (val) { return val; },
	history_set = fn_retval,
	history_get = fn_retval;

		// Start the polling loop.
		self.start = function ()
		{
			timeout_id || poll();
		};

		// Stop the polling loop.
		self.stop = function ()
		{
			timeout_id && clearTimeout(timeout_id);
			timeout_id = undefined;
		};

		// This polling loop checks every $.fn.hashchange.delay milliseconds to see
		// if location.hash has changed, and triggers the 'hashchange' event on
		// window when necessary.
		function poll()
		{
			var hash = get_fragment(),
	history_hash = history_get(last_hash);

			if (hash !== last_hash)
			{
				history_set(last_hash = hash, history_hash);

				$(window).trigger(str_hashchange);

			} else if (history_hash !== last_hash)
			{
				location.href = location.href.replace(/#.*/, '') + history_hash;
			}

			timeout_id = setTimeout(poll, $.fn[str_hashchange].delay);
		};

		// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
		// vvvvvvvvvvvvvvvvvvv REMOVE IF NOT SUPPORTING IE6/7/8 vvvvvvvvvvvvvvvvvvv
		// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
		$.browser.msie && !supports_onhashchange && (function ()
		{
			// Not only do IE6/7 need the "magical" Iframe treatment, but so does IE8
			// when running in "IE7 compatibility" mode.

			var iframe,
	iframe_src;

			// When the event is bound and polling starts in IE 6/7, create a hidden
			// Iframe for history handling.
			self.start = function ()
			{
				if (!iframe)
				{
					iframe_src = $.fn[str_hashchange].src;
					iframe_src = iframe_src && iframe_src + get_fragment();

					// Create hidden Iframe. Attempt to make Iframe as hidden as possible
					// by using techniques from http://www.paciellogroup.com/blog/?p=604.
					iframe = $('<iframe tabindex="-1" title="empty"/>').hide()

					// When Iframe has completely loaded, initialize the history and
					// start polling.
		.one('load', function ()
		{
			iframe_src || history_set(get_fragment());
			poll();
		})

					// Load Iframe src if specified, otherwise nothing.
		.attr('src', iframe_src || 'javascript:0')

					// Append Iframe after the end of the body to prevent unnecessary
					// initial page scrolling (yes, this works).
		.insertAfter('body')[0].contentWindow;

					// Whenever `document.title` changes, update the Iframe's title to
					// prettify the back/next history menu entries. Since IE sometimes
					// errors with "Unspecified error" the very first time this is set
					// (yes, very useful) wrap this with a try/catch block.
					doc.onpropertychange = function ()
					{
						try
						{
							if (event.propertyName === 'title')
							{
								iframe.document.title = doc.title;
							}
						} catch (e) { }
					};

				}
			};

			// Override the "stop" method since an IE6/7 Iframe was created. Even
			// if there are no longer any bound event handlers, the polling loop
			// is still necessary for back/next to work at all!
			self.stop = fn_retval;

			// Get history by looking at the hidden Iframe's location.hash.
			history_get = function ()
			{
				return get_fragment(iframe.location.href);
			};

			// Set a new history item by opening and then closing the Iframe
			// document, *then* setting its location.hash. If document.domain has
			// been set, update that as well.
			history_set = function (hash, history_hash)
			{
				var iframe_doc = iframe.document,
		domain = $.fn[str_hashchange].domain;

				if (hash !== history_hash)
				{
					// Update Iframe with any initial `document.title` that might be set.
					iframe_doc.title = doc.title;

					// Opening the Iframe's document after it has been closed is what
					// actually adds a history entry.
					iframe_doc.open();

					// Set document.domain for the Iframe document as well, if necessary.
					domain && iframe_doc.write('<script>document.domain="' + domain + '"</script>');

					iframe_doc.close();

					// Update the Iframe's hash, for great justice.
					iframe.location.hash = hash;
				}
			};

		})();
		// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
		// ^^^^^^^^^^^^^^^^^^^ REMOVE IF NOT SUPPORTING IE6/7/8 ^^^^^^^^^^^^^^^^^^^
		// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

		return self;
	})();

})(jQuery, this);

/**
* Effects (Video Gallery)
* 
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
*/

(function ($)
{
	function sortArgs(duration, easing, callback)
	{
		var fn;

		// Who needs arguments?
		fn = $.isFunction(callback) ? callback : $.isFunction(easing) ? easing : $.isFunction(duration) ? duration : null;

		// If easing but no duration supplied, only cope with default 2. 
		if (typeof easing !== "string" && (duration === "swing" || duration === "linear"))
		{
			easing = duration;
		}

		// Named jQuery durations are 'slow'=600, 'fast'=200, other=400
		if (typeof duration !== "number")
		{
			if (duration == "slow")
			{
				duration = 600;
			}
			else if (duration == "fast")
			{
				duration = 200;
			}
			else
			{
				duration = 400;
			}
		}

		return { duration: duration, easing: easing, callback: fn };
	}

	// A prettier transition that slides down (from full width) then fades in. 
	$.fn.slideFadeIn = function (duration, easing, callback)
	{
		var $this = this;
		var args = sortArgs(duration, easing, callback);
		var endOpacity = Number(this.css("opacity")) || 1;

		duration = args.duration;
		easing = args.easing;
		callback = args.callback;

		this.css("opacity", 0).slideDown(duration, easing, function ()
		{
			$this.animate({ opacity: endOpacity }, duration, easing, function ()
			{
				if (typeof callback == "function") callback();
			});
		});

		return this;
	};

	// Slide up (full width) and fade out. 
	$.fn.slideFadeOut = function (duration, easing, callback)
	{
		var $this = this;
		var args = sortArgs(duration, easing, callback);
		var endOpacity;

		duration = args.duration;
		easing = args.easing;
		callback = args.callback;

		this.animate(duration, function ()
		{
			endOpacity = $this.css("opacity");

			$(this).animate({ opacity: 0, height: "hide" }, duration, function ()
			{
				$(this).css("opacity", endOpacity);
				if (typeof callback == "function") callback();
			});
		});

		return this;
	};

	$.fn.slideFadeToggle = function (duration, easing, callback)
	{
		this.filter(":visible").length ? this.slideFadeOut(duration, easing, callback) : this.slideFadeIn(duration, easing, callback);
	};

	// Fade in and move slightly to the left (&agrave; la Windows 8)
	$.fn.nudgeFadeIn = function (duration, easing, callback)
	{
		var args = sortArgs(duration, easing, callback);
		var endOpacity = Number(this.css("opacity")) || 1;
		var endMarginLeft = Number(this.css("marginLeft")) || 0;
		var endMarginRight = Number(this.css("marginRight")) || 0;
		var nudgeSize = 25;

		duration = args.duration;
		easing = args.easing;
		callback = args.callback;

		this
		.css({ opacity: 0, marginLeft: endMarginLeft + nudgeSize + "px", marginRight: endMarginRight - nudgeSize + "px" })
		.show()
		.animate({ opacity: endOpacity, marginLeft: endMarginLeft + "px", marginRight: endMarginRight + "px" }, duration, easing, function ()
		{
			if (typeof callback == "function") callback();
		});

		return this;
	};
})(jQuery);


/**
* Slider Control (Video Gallery)
*
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
* 
* Options
* 
* min: min slider value
* max: max slider value
* step: step size in slider values
* vertical: make a vertical slider through op.vertical or data-style="vertical"
* invert: low values at bottom / on right of slider = inverted
* minNull: return null as minimum slider value?
* $target: slide event target $(element)
* clickSliderSpeed: time taken to move slider control on click
* dragSliderSpeed: time taken to move slider control on drag
* 
* Example: $(".Slider.Vertical").slider({ max: 3, minNull: true, invert: true, vertical: true, $target: $(".Results") });
*
* Very loosely based on jqDnR - Minimalistic Drag'n'Resize for jQuery.
*
* Copyright (c) 2007 Brice Burgess <bhb@iceburg.net>, http://www.iceburg.net
* Licensed under the MIT License:
* http://www.opensource.org/licenses/mit-license.php
* 
* $Version: 2007.08.19 +r2
*/

(function ($)
{
	$.fn.slider = function (ops)
	{
		return this.each(function ()
		{
			var $controlEl = $(this);
			var $sliderEl = $controlEl.append("<div />").children().last();
			var minPos = 0;
			var maxPos;
			var stepPos;
			var controlOffset;
			var sliderPosLeft;
			var sliderPosTop;
			var sliderHalfSize;

			var op = $.extend(
			{
				min: 0,
				max: 1,
				step: 1,
				padding: parseInt($controlEl.css("paddingTop")) + parseInt($sliderEl.css("marginTop")),
				vertical: typeof $controlEl.data("style") != "undefined" && $controlEl.data("style").toLowerCase() == "vertical",
				invert: false,
				minNull: false,
				$target: null,
				clickSliderSpeed: 75,
				dragSliderSpeed: 50
			}, ops);

			// Add another value to the slider
			if (op.minNull) op.min--;

			var val = op.invert ? op.max : op.min;
			var oldVal = op.invert ? op.max : op.min;

			if (op.vertical)
			{
				maxPos = $controlEl.outerHeight() - $sliderEl.outerHeight() - parseInt($sliderEl.css("marginBottom"));
				if (op.invert) $sliderEl.css("top", maxPos + "px");
				sliderPosLeft = $sliderEl.position().left;
				sliderHalfSize = Math.round($sliderEl.outerHeight() / 2);
			}
			else
			{
				maxPos = $controlEl.outerWidth() - $sliderEl.outerWidth() - parseInt($sliderEl.css("marginRight"));
				if (op.invert) $sliderEl.css("left", maxPos + "px");
				sliderPosTop = $sliderEl.position().top;
				sliderHalfSize = Math.round($sliderEl.outerWidth() / 2);
			}

			// Round later so don't accumulate errors.
			stepPos = (maxPos - minPos) / ((op.max - op.min) * op.step);

			this.value = function (newVal)
			{
				if (newVal === undefined)
				{
					if (op.invert)
					{
						if (op.minNull)
						{
							return val == op.max ? null : op.min + op.max - val;
						}
						else
						{
							return op.min + op.max - val;
						}
					}
					else
					{
						if (op.minNull)
						{
							return val == op.min ? null : val;
						}
						else
						{
							return val;
						}
					}
				}
				else
				{
					if (op.invert)
					{
						if (op.minNull)
						{
							val = newVal == null ? op.max : op.min + op.max - newVal;
						}
						else
						{
							val = op.min + op.max - newVal;
						}
					}
					else
					{
						if (op.minNull)
						{
							val = newVal == null ? op.min : newVal;
						}
						else
						{
							val = newVal;
						}
					}

					if (op.vertical)
					{
						sliderPosTop = Math.round((val - op.min) * stepPos);
					}
					else
					{
						sliderPosLeft = Math.round((val - op.min) * stepPos);
					}

					$sliderEl.css({ left: sliderPosLeft + "px", top: sliderPosTop + "px" });
				}
			};

			$sliderEl.mousedown(function (e)
			{
				setupVals();
				$(document).mousemove(drag).mouseup(stop);
				return false;
			});

			$controlEl.mousedown(function (e)
			{
				setupVals();
				moveSlider(e, true, op.clickSliderSpeed);
			}).mouseup(stop);

			function setupVals()
			{
				controlOffset = (op.vertical ? $controlEl.offset().top : $controlEl.offset().left) + op.padding;
			}

			function drag(e)
			{
				moveSlider(e, false, op.dragSliderSpeed);
			}

			function moveSlider(e, animate, speed)
			{
				// (Cursor position on page - control offset - half slider height / step size), then check is in slider range. 
				var newVal = Math.max(Math.min(Math.round(((op.vertical ? e.pageY : e.pageX) - controlOffset - sliderHalfSize) / stepPos) + op.min, op.max), op.min);

				if (op.vertical)
				{
					sliderPosTop = Math.round((newVal - op.min) * stepPos);
				}
				else
				{
					sliderPosLeft = Math.round((newVal - op.min) * stepPos);
				}

				if (newVal != val)
				{
					val = newVal;

					if (stepPos > 10 || animate)
					{
						$sliderEl.clearQueue().animate({ left: sliderPosLeft, top: sliderPosTop }, speed);
					}
					else
					{
						$sliderEl.offset({ left: sliderPosLeft, top: sliderPosTop });
					}
				}
				return false;
			}

			function stop()
			{
				if (oldVal != val)
				{
					if (op.$target != null) op.$target.trigger("slide");
					oldVal = val;
				}

				$(document).unbind("mousemove", drag).unbind("mouseup", stop);
			}
		});
	};
})(jQuery);


/**
* Slider Control (Video Gallery)
*
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
* 
* Options
* 
* min: min slider value
* max: max slider value
* step: step size in slider values
* vertical: make a vertical slider through op.vertical or data-style="vertical"
* invert: low values at bottom / on right of slider = inverted
* minNull: return null as minimum slider value?
* $target: slide event target $(element)
* clickSliderSpeed: time taken to move slider control on click
* dragSliderSpeed: time taken to move slider control on drag
* 
* Example: $(".Slider.Vertical").slider({ max: 3, minNull: true, invert: true, vertical: true, $target: $(".Results") });
*
* Very loosely based on jqDnR - Minimalistic Drag'n'Resize for jQuery.
*
* Copyright (c) 2007 Brice Burgess <bhb@iceburg.net>, http://www.iceburg.net
* Licensed under the MIT License:
* http://www.opensource.org/licenses/mit-license.php
* 
* $Version: 2007.08.19 +r2
*/

(function ($)
{
	$.fn.slider = function (ops)
	{
		return this.each(function ()
		{
			var $controlEl = $(this);
			var $sliderEl = $controlEl.append("<div />").children().last();
			var minPos = 0;
			var maxPos;
			var stepPos;
			var controlOffset;
			var sliderPosLeft;
			var sliderPosTop;
			var sliderHalfSize;

			var op = $.extend(
			{
				min: 0,
				max: 1,
				step: 1,
				padding: parseInt($controlEl.css("paddingTop")) + parseInt($sliderEl.css("marginTop")),
				vertical: typeof $controlEl.data("style") != "undefined" && $controlEl.data("style").toLowerCase() == "vertical",
				invert: false,
				minNull: false,
				$target: null,
				clickSliderSpeed: 75,
				dragSliderSpeed: 50
			}, ops);

			// Add another value to the slider
			if (op.minNull) op.min--;

			var val = op.invert ? op.max : op.min;
			var oldVal = op.invert ? op.max : op.min;

			if (op.vertical)
			{
				maxPos = $controlEl.outerHeight() - $sliderEl.outerHeight() - parseInt($sliderEl.css("marginBottom"));
				if (op.invert) $sliderEl.css("top", maxPos + "px");
				sliderPosLeft = $sliderEl.position().left;
				sliderHalfSize = Math.round($sliderEl.outerHeight() / 2);
			}
			else
			{
				maxPos = $controlEl.outerWidth() - $sliderEl.outerWidth() - parseInt($sliderEl.css("marginRight"));
				if (op.invert) $sliderEl.css("left", maxPos + "px");
				sliderPosTop = $sliderEl.position().top;
				sliderHalfSize = Math.round($sliderEl.outerWidth() / 2);
			}

			// Round later so don't accumulate errors.
			stepPos = (maxPos - minPos) / ((op.max - op.min) * op.step);

			this.value = function (newVal)
			{
				if (newVal === undefined)
				{
					if (op.invert)
					{
						if (op.minNull)
						{
							return val == op.max ? null : op.min + op.max - val;
						}
						else
						{
							return op.min + op.max - val;
						}
					}
					else
					{
						if (op.minNull)
						{
							return val == op.min ? null : val;
						}
						else
						{
							return val;
						}
					}
				}
				else
				{
					if (op.invert)
					{
						if (op.minNull)
						{
							val = newVal == null ? op.max : op.min + op.max - newVal;
						}
						else
						{
							val = op.min + op.max - newVal;
						}
					}
					else
					{
						if (op.minNull)
						{
							val = newVal == null ? op.min : newVal;
						}
						else
						{
							val = newVal;
						}
					}

					if (op.vertical)
					{
						sliderPosTop = Math.round((val - op.min) * stepPos);
					}
					else
					{
						sliderPosLeft = Math.round((val - op.min) * stepPos);
					}

					$sliderEl.css({ left: sliderPosLeft + "px", top: sliderPosTop + "px" });
				}
			};

			$sliderEl.mousedown(function (e)
			{
				setupVals();
				$(document).mousemove(drag).mouseup(stop);
				return false;
			});

			$controlEl.mousedown(function (e)
			{
				setupVals();
				moveSlider(e, true, op.clickSliderSpeed);
			}).mouseup(stop);

			function setupVals()
			{
				controlOffset = (op.vertical ? $controlEl.offset().top : $controlEl.offset().left) + op.padding;
			}

			function drag(e)
			{
				moveSlider(e, false, op.dragSliderSpeed);
			}

			function moveSlider(e, animate, speed)
			{
				// (Cursor position on page - control offset - half slider height / step size), then check is in slider range. 
				var newVal = Math.max(Math.min(Math.round(((op.vertical ? e.pageY : e.pageX) - controlOffset - sliderHalfSize) / stepPos) + op.min, op.max), op.min);

				if (op.vertical)
				{
					sliderPosTop = Math.round((newVal - op.min) * stepPos);
				}
				else
				{
					sliderPosLeft = Math.round((newVal - op.min) * stepPos);
				}

				if (newVal != val)
				{
					val = newVal;

					if (stepPos > 10 || animate)
					{
						$sliderEl.clearQueue().animate({ left: sliderPosLeft, top: sliderPosTop }, speed);
					}
					else
					{
						$sliderEl.offset({ left: sliderPosLeft, top: sliderPosTop });
					}
				}
				return false;
			}

			function stop()
			{
				if (oldVal != val)
				{
					if (op.$target != null) op.$target.trigger("slide");
					oldVal = val;
				}

				$(document).unbind("mousemove", drag).unbind("mouseup", stop);
			}
		});
	};
})(jQuery);


/**
* Form validator (Video Gallery)
*
* .Required: check not emtpy
* .Email: check it's an email (or empty; use .Required.Email for both)
* #submit: submit form element
* .ValidateAlert: alert messages container
*
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
*/

(function ($)
{
	$.fn.validateForm = function ()
	{
		var $alert = $(".ValidateAlert");

		return this.each(function ()
		{
			$(this).find(".Email").each(validate);
			$(this).find(".Required").each(validate);

			$(this).find("#submit")[0].checkForm = function ()
			{
				var $form = $(this).parents("form");

				// Total error count for top alert
				$alert.errors = 0;

				$form.find(".Email").each(function ()
				{
					if ($.trim(this.value) != "" && !this.value.match(/^\s*[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\s*$/i))
					{
						$(this).parent().addClass("Error");
						$alert.slideFadeIn();
						$alert.errors++;
					}
				});

				$form.find(".Required").each(function ()
				{
					if ($.trim(this.value) == "")
					{
						$(this).parent().addClass("Error");
						$alert.slideFadeIn();
						$alert.errors++;
					}
				});

				return $alert.errors == 0;
			};

			// this = el
			function validate()
			{
				var _this = this;
				var email = $(this).hasClass("Email");
				var required = $(this).hasClass("Required");
				var $parent = $(this).parent();
				// Track typing: only stick up an error if field is invalid and something has been entered (i.e. not just tabbing through).
				var typing = false;
				var oldValue = "";

				$(this).blur(function ()
				{
					validateField(typing);
					typing = false;
					oldValue = this.value;
				})
				.keyup(function ()
				{
					typing = typing || this.value != oldValue;
					// Remove error alert immediately if corrected.
					if ($(this).parent().hasClass("Error")) validateField(true);
				});

				function validateField(typing)
				{
					if (typing)
					{
						if ((email && (required || $.trim(_this.value) != "") && !_this.value.match(/^\s*[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\s*$/i)) || (required && $.trim(_this.value) == ""))
						{
							if (!$parent.hasClass("Error"))
							{
								$parent.addClass("Error");
								$alert.errors++;
							}
						}
						else if ($(_this).parent().hasClass("Error"))
						{
							$parent.removeClass("Error");

							if (--$alert.errors == 0)
							{
								$alert.slideFadeOut();
							}
						}
					}
				}
			}
		});
	};
})(jQuery);


