(function() {

	function ccEntry() {
		$('body').append('<div id="lyra-bg" class="overlay"></div>');
		$('body').append('<div id="lyra-cc"></div>');

		$('#lyra-cc').load('lyra-cc.html', function() {
			var amount = $('#lyra-pay').data("amount");
			var currency = $('#lyra-pay').data("currency");
			amount = amount / 100;
			$('#lyra-go').html("Pay " + amount + ' ' + currency);
			$('#lyra-go').click( function() { alert('TODO'); } )
		});
	}

	$('#lyra-pay').click( ccEntry );
 
}());
