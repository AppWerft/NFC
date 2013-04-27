exports.create = function(_callback) {
	var data = [];
	var pdfs = ['ET-Tauscher', 'ET-Leitungen', 'ET-Filter', 'ET-Elektro', 'Onboard-Diagnose', 'Schaltplan', 'Richtzeiten'];
	for (var i = 0; i < pdfs.length; i++) {
		data.push(Ti.UI.createPickerRow({
			title : pdfs[i]
		}));
	}
	_callback(pdfs[0] + '.pdf');
	var self = Ti.UI.createPicker({
		top : 0,
		left : 0,
		selectionIndicator : true
	});
	self.add(data);
	self.addEventListener('change', function(e) {
		_callback(self.getSelectedRow(0).title +'.pdf');
	});
	return self;
}
