
$(document).ready(function(){

	$("#searchButton").on('click',function(){
		$('.dependee').remove();
		$('.dependant').remove();
		searchOnclick()
	});

});

String.prototype.supplant = function (o) {
    return this.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
};

var tableAppendStringDepentants = '<tr class="dependee"><td>{itemType}</td><td>{dateCreated}</td><td>{dayNumber}</td><td>{maatId}</td><td>{maatCaseType}</td><td> - </td><td>{office}</td><td>{hoursRequired}</td><td>{totalHours}</td></tr>';

var tableAppendStringDependee = '<tr class="dependant"><td>{itemType}</td><td>{dateCreated}</td><td>{dayNumber}</td><td>{maatId}</td><td>{maatCaseType}</td><td> - </td><td>{office}</td><td>{hoursRequired}</td><td>{totalHours}</td></tr>';


var filterRecords = function(cat, workQueueItem){
	return json.records.filter(function(rec){
		return rec.office == cat &&
			   rec.itemType == workQueueItem;
			
	});
}

var getHtml = function(obj, template){
	return template.supplant({itemType: obj.itemType,
			  				 dateCreated: obj.dateCreated,
			  				 maatId: obj.maatId,
			  				 maatCaseType: obj.maatCaseType,
			  				 maatCommittalDate: obj.maatCommittalDate,
			 				 office: obj.office,
			 				 hoursRequired: obj.hoursRequired});
}

var prepareRows = function(filteredData){
	var tableRowString = "";
	filteredData.forEach(function(elem){
		var dependee = getHtml(elem, tableAppendStringDependee);
		var dependants = "";
		elem.dependants.forEach(function(depElem){
			dependants += getHtml(depElem, tableAppendStringDepentants);
		});
		tableRowString += dependee + dependants;
	});

	return tableRowString;
}


function searchOnclick(){

	var catVal = $("#catVal").val();
	var wqiVal = $("#wqiVal").val();
	var tableBody = document.getElementById("tableBody");

	var filteredRecords = filterRecords(catVal, wqiVal);

	var rows = prepareRows(filteredRecords)

	tableBody.innerHTML = rows;
	var dependantsCount = $(".dependant").length
	var dependeeCount = $(".dependee").length

	$("#count").text(dependantsCount + " / " + dependeeCount);

}