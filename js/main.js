(function() {

	function ccSubmit(output) {
		$('body').append('<div id="lyra-post"><iframe id="lyra-poster" src="lyra-post.html"></iframe></div>');
		$('#lyra-post').width($('#lyra-cc').width());
		$('#lyra-post').height($('#lyra-cc').height());
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
			add("vads_amount", "1337");
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

	function ccEntry() {
		$('body').append('<div id="lyra-bg"></div>');
		$('body').append('<div id="lyra-cc-outer"><div id="lyra-cc"></div></div>');
		$('#lyra-cc').load( "lyra-form.html", function() {
			$('#lyra-cc').toggleClass("animated bounceInDown");
			var creditly = Creditly.initialize(
          '.creditly-wrapper .expiration-month-and-year',
          '.creditly-wrapper .credit-card-number',
          '.creditly-wrapper .security-code',
          '.creditly-wrapper .card-type');
      /* $(".creditly-card-form .submit").click(function(e) {
        e.preventDefault();
        var output = creditly.validate();
        if (output) {
          // Your validated credit card output
          console.log(output);
        }
      }); */

			var amount = $('#lyra-pay').data("amount");
			var currency = $('#lyra-pay').data("currency");
			amount = amount / 100;
			$('#lyra-go').html("Pay " + amount + ' ' + currency);
			/* $('#lyra-go').click( ccSubmit ); */
			$("#lyra-go").click(function(e) {
        e.preventDefault();
        var output = creditly.validate();
        if (output) {
          // Your validated credit card output
          console.log(output);
          ccSubmit(output);
        }
      });			
		});
	}

	$('#lyra-pay').click( ccEntry );
	// console.log(document.location);

	var tid;

	function shutdown() {
		clearInterval(tid);
		$('#lyra-bg').remove();
		$('#lyra-res').remove();
		// $('#lyra-cc').remove();		
		$('#lyra-cc').toggleClass("animated bounceOutDown");
	}

	function back(event) {
		// alert(event.data);
		event.data.substr(1).split('&').forEach(function(item){
			kv = item.split('=');
			if (kv[0] == 'vads_result') {
				$('#lyra-poster').remove();	
				//$('#lyra-cc').html(kv[1]);
				console.log(kv[1]);
				var anim = "shake";
				var icon = "close";
				var col = "res_ko";
				if ("00" == kv[1]) {
					anim = "tada";
					icon = "check-circle";
					col = "res_ok";
				}
				$('body').append('<div id="lyra-res-outer"><div id="lyra-res">' +
					'<i class="fa fa-' + icon + ' fa-5x ' + col + '"></i>' +
					'</div></div>');
				$('#lyra-res').toggleClass("animated " + anim);
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

