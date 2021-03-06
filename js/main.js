(function() {

	function ccSubmit(output) {
		$('body').append('<div id="lyra-post"><iframe id="lyra-poster" src="lyra-post.html"></iframe></div>');
		//$('#lyra-post').width($('#lyra-cc').width());
		//$('#lyra-post').height($('#lyra-cc').height());
		$('#lyra-cc').toggleClass("animated bounceInDown");
		$('#lyra-poster').load(function() {
			var url = document.location.origin + document.location.pathname	 + 'lyra-back.html';
			// var url = 'lyra-back.html';			
			// var form = $('#lyra-poster').contents().find('#lyra-form');
			var iframe = document.getElementById('lyra-poster');
			var iframe_data = '';
			
			var p = {};
			function add(key, value) {
				p[key] = value;
				// form.append('<input type="hidden" name="' + key + '" value="' + value + '">');
				iframe_data += '<input type="hidden" name="' + key + '" value="' + value + '">';
			}
			
			add("vads_action_mode", "SILENT");
			//add("vads_action_mode", "INTERACTIVE");
			add("vads_amount", $('#lyra-pay').data("amount"));
			add("vads_capture_delay", "0");
			add("vads_card_number", output['number']);
			add("vads_ctx_mode", "TEST");
			add("vads_currency", "978");
			add("vads_cvv", output['security_code']);
			add("vads_expiry_month", output['expiration_month']);
			add('vads_expiry_year', output['expiration_year']);
			add('vads_page_action', "PAYMENT");
			add('vads_payment_cards', "CB");
			add('vads_payment_config', "SINGLE");
			add('vads_return_mode', "GET");
			add('vads_site_id', "91335531" /*"29035693"*/);
			var now = new Date();
			var mm = '' + (now.getUTCMonth() + 1);
			while(mm.length < 2) mm = "0" + mm;
			var dd = '' + now.getUTCDate();
			while(dd.length < 2) dd = "0" + dd;
			var hh = '' + now.getUTCHours();
			while(hh.length < 2) hh = "0" + hh;
			var nn = '' + now.getUTCMinutes();
			while(nn.length < 2) nn = "0" + nn;
			var ss = '' + now.getUTCSeconds();
			while(ss.length < 2) ss = "0" + ss;
			add('vads_trans_date', now.getUTCFullYear() + mm + dd + hh + nn + ss);
			add('vads_trans_id', hh + nn + ss);
			add('vads_url_cancel', url);
			add('vads_url_error', url);
			add('vads_url_refused', url);
			add('vads_url_success', url);
			add('vads_version', "V2");
			var sigcnt = "";
			for(var idx in p) { 
				sigcnt += p[idx] + '+'; 
			};
			sigcnt += "8627912856153542" /*"1910412435639844"*/;
			console.log(sigcnt);
			add("signature", sha1(sigcnt));

			iframe.contentWindow.postMessage(iframe_data, '*');
			
			// form.submit();
			// $('#lyra-poster').contents().find('#lyra-form').append('Hey, ive changed content of body! Yay!!!');
		});
	}

	function digitsOnly(e) {
        // Allow: backspace, delete, tab, escape, enter
        if ($.inArray(e.keyCode, [8, 9, 27, 13, 110, 190]) !== -1 ||
            // Allow: Ctrl+A, Command+A
            (e.keyCode == 65 && ( e.ctrlKey === true || e.metaKey === true ) ) || 
            // Allow: home, end, left, right, down, up
            (e.keyCode >= 35 && e.keyCode <= 40)) {
                return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
	}

	var timerFormInvalid;
	function formInvalid() {
		clearInterval(timerFormInvalid);
		$('#lyra-pp').toggleClass("animated swing");
		$('#PayButton').removeAttr("disabled");
	}
	

	function ccCheck() {
		$('#PayButton').attr("disabled", "disabled");
		var output = {};
		var ok = true;
		var num = $("#CreditCardNumber").val();
		num = num.replace(/[ \/]/g, '');
		if (num.length != 16) {
			ok = false;
		} else {
			output['number'] = num;
		}
		var mmyy = $("#ExpiryDate").val();
		mmyy = mmyy.replace(/[ \/]/g, '');
		if (mmyy.length != 4) {
			ok = false;
		} else {
			var mm = mmyy.substring(0,2);
			var yy = mmyy.substring(2,4);
			if (mm < "01" || mm > "12") {
				ok = false;
			} else {
				output['expiration_month'] = mm;
				output['expiration_year'] = "20" + yy;
			}
		}
		var sc = $("#SecurityCode").val();
		sc = sc.replace(/[ \/]/g, '');
		if (sc.length < 3) {
			ok = false;
		} else {
			output['security_code'] = sc;
		}

		if (ok) {
			ccSubmit(output);
		} else {
			$('#lyra-pp').toggleClass("animated swing");
			timerFormInvalid = setInterval(formInvalid, 2000);
		}
	}


	function ccEntry() {
		$('body').append('<div id="lyra-bg"></div>');
		$('body').append('<div id="lyra-cc-outer"><div id="lyra-cc"></div></div>');
		$('#lyra-cc').load( "lyra-form.html", function() {
			$('#lyra-cc').toggleClass("animated bounceInDown");
			var amount = $('#lyra-pay').data("amount");
			var currency = $('#lyra-pay').data("currency");
			amount = amount / 100;
			$('#PayButton').html("Pay " + amount + ' ' + currency);
			/* $('#lyra-go').click( ccSubmit ); */
			$("#CreditCardNumber").keydown(digitsOnly);
			$("#CreditCardNumber").keyup(function (e) {
				digitsOnly(e);
				var text = $(this).val();
				if (text.length > 16+3)
					text = text.substr(0, 16+3);
				var digits = text;
				digits = digits.replace(/ /g,'');

				if (digits.length > 12) {
					text = digits.substring(0, 4) + ' ' + digits.substring(4, 8) + ' ' + digits.substring(8,12) + ' ' + digits.substring(12);
				} else if (digits.length > 8) {
					text = digits.substring(0, 4) + ' ' + digits.substring(4, 8) + ' ' + digits.substring(8);
				} else if (digits.length > 4) {
					text = digits.substring(0, 4) + ' ' + digits.substring(4);
				} 
				if (e.keyCode == 8 || e.keyCode == 9) {
				} else {
					if (text.length == 4 || text.length == 9 || text.length == 14) {
						text += ' ';
					}
				}				
				$(this).val(text);
		    });
		    $("#ExpiryDate").keydown(digitsOnly);
			$("#ExpiryDate").keyup(function (e) {
				digitsOnly(e);
				var text = $(this).val();
				if (text.length > 4+3)
					text = text.substr(0, 4+3);
				var digits = text;
				digits = digits.replace(/[ \/]/g,'');

				if (digits.length > 2) {
					text = digits.substring(0, 2) + ' / ' + digits.substring(2);
				} else {
					text = digits;
				}

				if (e.keyCode == 8 || e.keyCode == 9) {
				} else {
					if (text.length == 2 && digits.length == 2) {
						text += ' / ';
					}
				}
				$(this).val(text);
		    });
		    $("#SecurityCode").keydown(digitsOnly);
			$("#SecurityCode").keyup(function (e) {
				digitsOnly(e);
				var text = $(this).val();
				if (text.length > 4)
					text = text.substr(0, 4);
				$(this).val(text);
		    });

			$(document).keypress(function(e) {
				if (e.keyCode == 13) {
					ccCheck();
					e.preventDefault();
				}
			});

			$("#PayButton").click(ccCheck);
		});
	}

	$('#lyra-pay').click( ccEntry );
	// ccEntry();

	var tid;

	function shutdown() {
		clearInterval(tid);
		tid = setInterval(goodbye, 2000);
		// $('#lyra-bg').remove();
		// $('#lyra-res').remove();
		// $('#lyra-cc').remove();		
		$('#lyra-cc').toggleClass("animated bounceOutDown");
	}

	function goodbye() {
		$('#lyra-bg').remove();
	}

	function back(event) {
		// alert(event.data);
		$('#PayButton').removeAttr("disabled");
		event.data.substr(1).split('&').forEach(function(item){
			kv = item.split('=');
			if (kv[0] == 'vads_result') {
				$('#lyra-poster').remove();	
				$('#PayButton').toggleClass('btn-primary');
				if ("00" == kv[1]) {
					$('#PayButton').toggleClass('btn-success');
					$('#PayButton').html('<span class="align-middle">SUCCESS</span>');
					$('#PayButton').click(function() {});
					$('#PayButton').toggleClass("animated tada");
				} else {
					$('#PayButton').toggleClass('btn-danger');
					$('#PayButton').html('<span class="align-middle">FAILURE</span>');
					$('#PayButton').click(function() {});
					$('#PayButton').toggleClass("animated shake");
				}
				tid = setInterval(shutdown, 3000);
			}
		});
	}

	if ('addEventListener' in window) {
		window.addEventListener('message', back);	
	} else if ('attachEvent' in window) {
		window.attachEvent('onMessage', back);	
	}


//////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////


	function sha1(str) {
	  //  discuss at: http://phpjs.org/functions/sha1/
	  // original by: Webtoolkit.info (http://www.webtoolkit.info/)
	  // improved by: Michael White (http://getsprink.com)
	  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  //    input by: Brett Zamir (http://brett-zamir.me)
	  //   example 1: sha1('Kevin van Zonneveld');
	  //   returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'

	  var rotate_left = function(n, s) {
	    var t4 = (n << s) | (n >>> (32 - s));
	    return t4;
	  };

	  /*var lsb_hex = function (val) {
	   // Not in use; needed?
	    var str="";
	    var i;
	    var vh;
	    var vl;

	    for ( i=0; i<=6; i+=2 ) {
	      vh = (val>>>(i*4+4))&0x0f;
	      vl = (val>>>(i*4))&0x0f;
	      str += vh.toString(16) + vl.toString(16);
	    }
	    return str;
	  };*/

	  var cvt_hex = function(val) {
	    var str = '';
	    var i;
	    var v;

	    for (i = 7; i >= 0; i--) {
	      v = (val >>> (i * 4)) & 0x0f;
	      str += v.toString(16);
	    }
	    return str;
	  };

	  var blockstart;
	  var i, j;
	  var W = new Array(80);
	  var H0 = 0x67452301;
	  var H1 = 0xEFCDAB89;
	  var H2 = 0x98BADCFE;
	  var H3 = 0x10325476;
	  var H4 = 0xC3D2E1F0;
	  var A, B, C, D, E;
	  var temp;

	  // utf8_encode
	  str = unescape(encodeURIComponent(str));
	  var str_len = str.length;

	  var word_array = [];
	  for (i = 0; i < str_len - 3; i += 4) {
	    j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
	    word_array.push(j);
	  }

	  switch (str_len % 4) {
	  case 0:
	    i = 0x080000000;
	    break;
	  case 1:
	    i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
	    break;
	  case 2:
	    i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
	    break;
	  case 3:
	    i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) <<
	      8 | 0x80;
	    break;
	  }

	  word_array.push(i);

	  while ((word_array.length % 16) != 14) {
	    word_array.push(0);
	  }

	  word_array.push(str_len >>> 29);
	  word_array.push((str_len << 3) & 0x0ffffffff);

	  for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
	    for (i = 0; i < 16; i++) {
	      W[i] = word_array[blockstart + i];
	    }
	    for (i = 16; i <= 79; i++) {
	      W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
	    }

	    A = H0;
	    B = H1;
	    C = H2;
	    D = H3;
	    E = H4;

	    for (i = 0; i <= 19; i++) {
	      temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
	      E = D;
	      D = C;
	      C = rotate_left(B, 30);
	      B = A;
	      A = temp;
	    }

	    for (i = 20; i <= 39; i++) {
	      temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
	      E = D;
	      D = C;
	      C = rotate_left(B, 30);
	      B = A;
	      A = temp;
	    }

	    for (i = 40; i <= 59; i++) {
	      temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
	      E = D;
	      D = C;
	      C = rotate_left(B, 30);
	      B = A;
	      A = temp;
	    }

	    for (i = 60; i <= 79; i++) {
	      temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
	      E = D;
	      D = C;
	      C = rotate_left(B, 30);
	      B = A;
	      A = temp;
	    }

	    H0 = (H0 + A) & 0x0ffffffff;
	    H1 = (H1 + B) & 0x0ffffffff;
	    H2 = (H2 + C) & 0x0ffffffff;
	    H3 = (H3 + D) & 0x0ffffffff;
	    H4 = (H4 + E) & 0x0ffffffff;
	  }

	  temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
	  return temp.toLowerCase();
	}

}());
