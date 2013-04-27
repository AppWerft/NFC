// Example NFC Read/Write application
// NOTE: It will read any tag but only write mime plain text (text/plain) tags (unless changed)
Ti.UI.setBackgroundColor('#000');
var mainWindow = Titanium.UI.createWindow({
	title : 'NFC@hamburger-appwerft',
});
mainWindow.open();
console.log('9 mainWindow startet ######### NEW WINDOW #####');

var writeTagDialog = undefined, currentPdf = undefined;

var nfc = require('com.acktie.mobile.android.nfc');
Ti.API.info("14 Is NFC Supported: " + nfc.isNFCEnabled);

// If NFC is not enabled not point in init'ing
if (nfc.isNFCEnabled) {
	nfc.init();
}

mainWindow.add(require('pdfpicker').create(function(_pdf) {
	console.log('fromCallback: ' + _pdf);
	currentPdf = _pdf;
}));

var nfcFakeReadButton = Titanium.UI.createView({
	top : 80,
	backgroundColor : 'white',
	width : Ti.UI.FILL,
	height : Ti.UI.FILL,
});

nfcFakeReadButton.bg = Ti.UI.createImageView({
	width : Ti.UI.FILL,
	height : Ti.UI.SIZE,
	bottom : 0,
	duration : 600,
	images : ['/bg3.png', '/bg1.png', '/bg2.png', '/bg0.png']
});
nfcFakeReadButton.add(nfcFakeReadButton.bg);

var bgndx = 0;

var nfcWriteButton = Titanium.UI.createButton({
	title : 'Save2Tag',
	top : 3,
	height : 70,
	right : 0,
	width : '30%',
});

mainWindow.add(nfcFakeReadButton);
mainWindow.add(nfcWriteButton);

nfcFakeReadButton.addEventListener('click', function() {
	if (Ti.App.Properties.hasProperty('pdf')) {
		currentPdf = Ti.App.Properties.getString('pdf');
	}
	require('pdfviewer').get('pdf/' + currentPdf);
});

nfcWriteButton.addEventListener('click', function() {
	Ti.App.Properties.setString('pdf', currentPdf);

	console.log('64 Try2Write: ' + currentPdf);
	if (!nfc.isNFCEnabled) {
		alert("This device doesn't support NFC");
		return;
	}
	nfc.enableTagWriteMode();
	nfcFakeReadButton.bg.start();
	console.log('70 enableTagWriteMode ' + currentPdf);
	writeTagDialog = Ti.UI.createAlertDialog({
		title : 'Touch tag to write',
		buttonNames : ['Cancel']
	});
	writeTagDialog.addEventListener('click', function(e) {
		nfc.disableTagWriteMode();
		nfcFakeReadButton.bg.stop();
		nfc.enableForegroundDispatch();
	});
	writeTagDialog.show();
});

var activity = Ti.Android.currentActivity;
activity.addEventListener('create', function(e) {
	if (nfc.wasAppLaunchViaNFCIntent(nfc.ACTION_NDEF_DISCOVERED)) {
		currentPdf = readNFCData();
		if (currentPdf !== undefined) {
			console.log('86 readNFC from dispatcher' + currentPdf);
			require('pdfviewer').get('pdf/' + currentPdf);
		}
	}
});

activity.addEventListener('newIntent', function(e) {
	currentPDF = Ti.App.Properties.getString('pdf');
	console.log('94 newIntent happened _____________________ ' + currentPdf);
	var intent = e.intent;
	if (nfc.isWriteModeEnabled) {
		console.log('97 Write: ' + currentPdf);
		writeNFCData(currentPdf, intent);
	} else {
		var currentPdf = readNFCData(intent);
		if (currentPdf != undefined) {
			console.log('102 readNFC' + currentPdf);
			require('pdfviewer').get('pdf/' + currentPdf);
		}
	}
});

activity.addEventListener('pause', function(e) {
	Ti.API.info('109 Inside pause ' + currentPdf);
	if (nfc.isNFCEnabled)
		nfc.disableForegroundDispatch();
});

// If app is resumed re-enable dispatch
activity.addEventListener('resume', function(e) {
	Ti.API.info('116 Inside resume ' + currentPdf);
	if (nfc.isNFCEnabled)
		nfc.enableForegroundDispatch();
});

function readNFCData(intent) {
	if (intent === undefined) {
		intent = null;
	}
	var message = undefined

	// Determine if passed in intent or active intent (on the current activity) contain
	// NDEF messages.
	var containsMessages = nfc.containsKnownNdefMessages(intent);

	if (containsMessages) {
		// Parse the NDEF Messages out of the intent
		nfc.parse(intent);

		// Get the NDEF Message
		var message = nfc.getParsedNdefRecord(intent);
		Ti.API.info('Message: ' + message);
		if (message != null) {
			// Read the message
			Ti.API.info('Message text: ' + message.getTextResult());
			message = message.getTextResult();
		}
	}
	return message;
}

function writeNFCData(text, intent) {
	if (text == undefined || text == '') {
		nfcFakeReadButton.bg.stop();
		return;
	}
	console.log('WWWWWWWW     startWriting width ' + text);
	Ti.Media.vibrate();
	var ndefMessage = nfc.createPlainTextNFCData(text);
	nfc.writeToTag(ndefMessage, intent, function(result) {
		nfc.disableTagWriteMode();
		nfcFakeReadButton.bg.stop();

		nfc.enableForegroundDispatch();
		if (writeTagDialog != undefined) {
			writeTagDialog.hide();
			writeTagDialog = undefined;
		}
		if (result.result) {
			alert("Successfully wrote message to tag!");
		} else {
			alert("Failed to write to tag: " + result.message);
		}
	});
}