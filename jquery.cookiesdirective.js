/* Cookies Directive - The rewrite. Now a jQuery plugin
 * Version: 2.0.1
 * Author: Ollie Phillips
 * 24 October 2013
 * Adjusted by: Max Alderson
 * For: Origin Software Solutions projects
 * Mostly adjusted to company needs, not suitable for broader use
 */

;(function($) {
	$.cookiesDirective = function(options) {
			
		// Default Cookies Directive Settings
		var settings = $.extend({
			//Options
			explicitConsent: true,
			position: 'top',
			duration: 0,
			limit: 0,
			message: null,
			fontAwesome5: false,				
			cookieScripts: null,
			privacyPolicyUri: 'privacy.html',
			scriptWrapper: function(){},	
			// Styling
			fontFamily: 'helvetica',
			fontColor: '#FFFFFF',
			fontSize: '13px',
			backgroundColor: '#000000',
			backgroundOpacity: '80',
			linkColor: '#CA0000',
			buttonText: 'Continue',
			defaultChecked: true,
			showButton: true,
			positionFixed: true,
			domain: '',
			crossColour: "rgba(0, 0, 0, 0.41)"
		}, options);
		
		// Perform consent checks
		if(!getCookie('cookiesDirective')) {
			if(settings.limit > 0) {
				// Display limit in force, record the view
				if(!getCookie('cookiesDisclosureCount')) {
					setCookie('cookiesDisclosureCount',1,1,settings.domain);		
				} else {
					var disclosureCount = getCookie('cookiesDisclosureCount');
					disclosureCount ++;
					setCookie('cookiesDisclosureCount',disclosureCount,1,settings.domain);
				}
				
				// Have we reached the display limit, if not make disclosure
				if(settings.limit >= getCookie('cookiesDisclosureCount')) {
					disclosure(settings);		
				}
			} else {
				// No display limit
				disclosure(settings);
			}		
			
			// If we don't require explicit consent, load up our script wrapping function
			if(!settings.explicitConsent) {
				settings.scriptWrapper.call();
			}	
		} else {
			// Cookies accepted, load script wrapping function
			settings.scriptWrapper.call();
		}		
	};
	
	// Used to load external javascript files into the DOM
	$.cookiesDirective.loadScript = function(options) {
		var settings = $.extend({
			uri: 		'', 
			appendTo: 	'body'
		}, options);	
		
		var elementId = String(settings.appendTo);
		var sA = document.createElement("script");
		sA.src = settings.uri;
		sA.type = "text/javascript";
		sA.onload = sA.onreadystatechange = function() {
			if ((!sA.readyState || sA.readyState == "loaded" || sA.readyState == "complete")) {
				return;
			} 	
		}
		switch(settings.appendTo) {
			case 'head':			
				$('head').append(sA);
			  	break;
			case 'body':
				$('body').append(sA);
			  	break;
			default: 
				$('#' + elementId).append(sA);
		}
	}	 
	
	// Helper scripts
	// Get cookie
	var getCookie = function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}
	
	// Set cookie
	var setCookie = function(name,value,days,domain) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		
		var fullDomain = "";
		
		if (domain !== "") {
		  fullDomain = ";domain=" + domain;
		}
		
		document.cookie = name+"="+value+expires+"; path=/" + fullDomain;
	}
	
	// Detect IE < 9
	var checkIE = function(){
		var version;
		if (navigator.appName == 'Microsoft Internet Explorer') {
	        var ua = navigator.userAgent;
	        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
	        if (re.exec(ua) != null) {
	            version = parseFloat(RegExp.$1);
			}	
			if (version <= 8.0) {
				return true;
			} else {
				if(version == 9.0) {
					if(document.compatMode == "BackCompat") {
						// IE9 in quirks mode won't run the script properly, set to emulate IE8	
						var mA = document.createElement("meta");
						mA.content = "IE=EmulateIE8";				
						document.getElementsByTagName('head')[0].appendChild(mA);
						return true;
					} else {
						return false;
					}
				}	
				return false;
			}		
	    } else {
			return false;
		}
	}

	// Disclosure routines
	var disclosure = function(options) {
		var settings = options;
		
		if(settings.positionFixed) {
			settings.css = 'fixed';
		}
		
		// IE 9 and lower has issues with position:fixed, either out the box or in compatibility mode - fix that
		if(checkIE() && settings.positionFixed) {
			settings.position = 'top';
			settings.css = 'absolute';
		}
		
		// Any cookie setting scripts to disclose
		var scriptsDisclosure = '';
		if (settings.cookieScripts) {
			var scripts = settings.cookieScripts.split(',');
			var scriptsCount = scripts.length;
			var scriptDisclosureTxt = '';
			if(scriptsCount>1) {
				for(var t=0; t < scriptsCount - 1; t++) {
					 scriptDisclosureTxt += scripts[t] + ', ';	
				}	
				scriptsDisclosure = ' We use ' +  scriptDisclosureTxt.substring(0,  scriptDisclosureTxt.length - 2) + ' and ' + scripts[scriptsCount - 1] + ' scripts, which all set cookies. ';
			} else {
				scriptsDisclosure = ' We use a ' + scripts[0] + ' script which sets cookies.';		
			}
		} 
		
		// Create overlay, vary the disclosure based on explicit/implied consent
		// Set our disclosure/message if one not supplied
		var html = ''; 
		html += '<div id="epd" style="display:none;">';
		html += '<div id="cookiesdirective" style="position:'+ settings.css +';'+ settings.position + ':-300px;left:0px;width:100%;'
		html += 'height:auto;background:' + settings.backgroundColor + ';opacity:.' + settings.backgroundOpacity + ';';
		html += '-ms-filter: “alpha(opacity=' + settings.backgroundOpacity + ')”; filter: alpha(opacity=' + settings.backgroundOpacity + ');';
		html += '-khtml-opacity: .' + settings.backgroundOpacity + '; -moz-opacity: .' + settings.backgroundOpacity + ';';
		html += 'color:' + settings.fontColor + ';font-family:' + settings.fontFamily + ';font-size:' + settings.fontSize + ';';
		html += 'text-align:center;z-index:1000;">';
		html += '<div style="position:relative;height:auto;width:90%;padding:10px;margin-left:auto;margin-right:auto;">';
			
		if(!settings.message) {
			if(settings.explicitConsent) {
				// Explicit consent message
				settings.message = 'Cookies help us optimize your experience. ';
				settings.message += 'They are also an essential part of some of the functionality of our website. ';
				settings.message += 'Areas of the website may not work correctly if you choose to delete or block these cookies. ';
				settings.message += '<a href="/privacy-policy-and-cookies" target="_blank">Read more</a>';
				settings.message += '<i id="impliedsubmit" class="fa fa-times" style="font-size:16px;margin-left:15px;color:rgba(0, 0, 0, 0.41);cursor:pointer;"></i>';
			} else {
				// Explicit consent message
				settings.message = 'Cookies help us optimize your experience. ';
				settings.message += 'They are also an essential part of some of the functionality of our website. ';
				settings.message += 'Areas of the website may not work correctly if you choose to delete or block these cookies. ';
				settings.message += '<a href="/privacy-policy-and-cookies" target="_blank">Read more</a>';
				if(settings.fontAwesome5){
					settings.message += '<i id="impliedsubmit" class="fas fa-times" style="font-size:16px;margin-left:15px;color:' + settings.crossColour + ';cursor:pointer;"></i>';
				}
				else
				{
					settings.message += '<i id="impliedsubmit" class="fa fa-times" style="font-size:16px;margin-left:15px;color:' + settings.crossColour + ';cursor:pointer;"></i>';
				}
			}		
		}	
		
		html += settings.message;
		
		// Build the rest of the disclosure for implied and explicit consent
		if(settings.explicitConsent && settings.showButton) {
			// Explicit consent disclosure
			html += scriptsDisclosure;
			html += '<div id="epdnotick" style="color:#ca0000;display:none;margin:2px;"><span style="background:#cecece;padding:2px;">You must tick the "I accept cookies from this site" box to accept</span></div>'
			html += '<div style="margin-top:5px;"><input type="checkbox" name="epdagree" id="epdagree"';
			if(settings.defaultChecked == true){
				html += ' checked ';
			}
			html += '/>&nbsp;';
			html += '<input type="submit" name="explicitsubmit" id="explicitsubmit" value="';
			html += settings.buttonText;
			html += '"/><br/></div></div>';
		
		} 
		
		html += '</div></div>';
		$('body').prepend(html);
		$("#epd").slideDown();
		
		// Serve the disclosure, and be smarter about branching
		var dp = settings.position.toLowerCase();
		if(dp != 'top' && dp!= 'bottom') {
			dp = 'top';
		}	
		var opts = new Array();
		if(dp == 'top') {
			opts['in'] = {'top':'0'};
			opts['out'] = {'top':'-300'};
		} else {
			opts['in'] = {'bottom':'0'};
			opts['out'] = {'bottom':'-300'};
		}		

		// Start animation
		$('#cookiesdirective').animate(opts['in'], 1000, function() {
			// Set event handlers depending on type of disclosure
			if(settings.explicitConsent) {
				// Explicit, need to check a box and click a button
				$('#explicitsubmit').click(function() {
					if($('#epdagree').is(':checked')) {	
						// Set a cookie to prevent this being displayed again
						setCookie('cookiesDirective',1,365,settings.domain);	
						// Close the overlay
						$('#cookiesdirective').animate(opts['out'],1000,function() { 
							// Remove the elements from the DOM and reload page
							$('#cookiesdirective').remove();
							location.reload(true);
						});
					} else {
						// We need the box checked we want "explicit consent", display message
						$('#epdnotick').css('display', 'block'); 
					}	
				});
			} else {
				// Implied consent, just a button to close it
				$('#impliedsubmit').click(function() {
					$("#epd").slideUp();
					// Set a cookie to prevent this being displayed again
					setCookie('cookiesDirective',1,365,settings.domain);	
					// Close the overlay
					$('#cookiesdirective').animate(opts['out'],1000,function() { 
						// Remove the elements from the DOM and reload page
						$('#cookiesdirective').remove();
					});
				});
			}	
			
			// Set a timer to remove the warning after 'settings.duration' seconds, set duration to 0 for infinite
			if(settings.duration != 0 ){
				setTimeout(function(){
					$('#cookiesdirective').animate({
						opacity:'0'
					},2000, function(){
						$('#cookiesdirective').css(dp,'-300px');
					});
				}, settings.duration * 1000);
			}
		});	
	}
})(jQuery);

