exports.get = function(pdf) {
	if (pdf == undefined)
		return;
	var appFilePath = Ti.Filesystem.resourcesDirectory + pdf;
	var appFile = Ti.Filesystem.getFile(appFilePath);
	var tmpFile = undefined, newPath = undefined;
	var filenameBase = new Date().getTime();
	tmpFile = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory, filenameBase + '.pdf');
	tmpFile.write(appFile.read());
	if (Ti.Filesystem.isExternalStoragePresent()) {
		if (tmpFile.exists()) {
			var intent = Ti.Android.createIntent({
				action : Ti.Android.ACTION_VIEW,
				type : "application/pdf",
				data : tmpFile.nativePath
			});
			try {
				Ti.Android.currentActivity.startActivity(intent);
			} catch(e) {
				Ti.API.debug(e);
				alert('No apps PDF apps installed!');
			}
		} else {
			Ti.API.info('starting intent tmpFile exists: ' + tmpFile.exists());
			alert('Our file disappeared!');
		}
	}
	/*if (Ti.Filesystem.isExternalStoragePresent()) {
	try {
	tmpFile = Ti.Filesystem.createTempFile();
	newPath = tmpFile.nativePath + '.pdf';
	tmpFile.move(newPath);
	tmpFile = Ti.Filesystem.getFile(newPath);
	tmpFile.write(appFile.read());
	} catch(e) {
	}
	} else {
	alert('No external storage present');
	}

	var url = tmpFile.nativePath;
	console.log(url);*/
	// file:///data/data/de.appwerft.nfc/cache/tifile111111tmp.pdf

	// file:///sdcard/tifile-1868368160tmp.pdf
	return;
	var regex = /\/\/\/sdcard/;
	if (!regex.test(url)) {
		url = 'http://lab.min.uni-hamburg.de/store/nfc/' + pdf;
		Titanium.Platform.openURL(url);
		return;
	}
	try {
		Ti.Android.currentActivity.startActivity(Ti.Android.createIntent({
			action : Ti.Android.ACTION_VIEW,
			type : 'application/pdf',
			data : url
		}));
	} catch (err) {
		var alertDialog = Titanium.UI.createAlertDialog({
			title : 'No PDF Viewer',
			message : 'We tried to open a PDF but failed. Do you want to search the marketplace for a PDF viewer?',
			buttonNames : ['Yes', 'No'],
			cancel : 1
		});
		alertDialog.show();
		alertDialog.addEventListener('click', function(evt) {
			if (evt.index == 0) {
				Ti.Platform.openURL('http://search?q=pdf');
			}
		});
	}
}
