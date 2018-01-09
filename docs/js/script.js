
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

var tableAppendStringDepentants = '<tr class="dependee"><td>{itemType}</td><td>{dateCreated}</td>' + 
                                  '<td>{dayNumber}</td><td>{maatId}</td><td>{maatCaseType}</td><td> ' +
                                  '- </td><td>{office}</td><td class="hoursRequired">{hoursRequired}</td>' +
                                  '<td class="totalHours">{totalHours}</td></tr>';

var tableAppendStringDependee = '<tr class="dependant"><td>{itemType}</td><td>{dateCreated}</td><td>{dayNumber}</td>' +
                                '<td>{maatId}</td><td>{maatCaseType}</td><td> - </td><td>{office}</td>' + 
                                '<td class="hoursRequired">{hoursRequired}</td>' +
                                '<td class="totalHours">{totalHours}</td></tr>';


var filterRecords = function(cat, workQueueItem){
	return json.records.filter(function(rec){
		return rec.office == cat &&
			   rec.itemType == workQueueItem;
			
	});
}

function calcBusinessDays(dDate1, dDate2) { // input given as Date objects
        var iWeeks, iDateDiff, iAdjust = 0;
        if (dDate2 < dDate1) return -1; // error code if dates transposed
        var iWeekday1 = dDate1.getDay(); // day of week
        var iWeekday2 = dDate2.getDay();
        iWeekday1 = (iWeekday1 == 0) ? 7 : iWeekday1; // change Sunday from 0 to 7
        iWeekday2 = (iWeekday2 == 0) ? 7 : iWeekday2;
        if ((iWeekday1 > 5) && (iWeekday2 > 5)) iAdjust = 1; // adjustment if both days on weekend
        iWeekday1 = (iWeekday1 > 5) ? 5 : iWeekday1; // only count weekdays
        iWeekday2 = (iWeekday2 > 5) ? 5 : iWeekday2;

        // calculate differnece in weeks (1000mS * 60sec * 60min * 24hrs * 7 days = 604800000)
        iWeeks = Math.floor((dDate2.getTime() - dDate1.getTime()) / 604800000)

        if (iWeekday1 <= iWeekday2) {
          iDateDiff = (iWeeks * 5) + (iWeekday2 - iWeekday1)
        } else {
          iDateDiff = ((iWeeks + 1) * 5) - (iWeekday1 - iWeekday2)
        }

        iDateDiff -= iAdjust // take into account both days on weekend

        return (iDateDiff + 1); // add 1 because dates are inclusive
}


function changeToAmericanDate(dateString){
	var dateArray = dateString.split("/");
	return dateArray[1] + "/" + dateArray[0] + "/" + dateArray[2]
}

var getHtml = function(obj, template){

	var daysNum = calcBusinessDays(new Date(changeToAmericanDate(obj.dateCreated))
		                         , new Date());

	return template.supplant({itemType: obj.itemType,
			  				 dateCreated: obj.dateCreated,
			  				 dayNumber: daysNum,
			  				 maatId: obj.maatId,
			  				 maatCaseType: obj.maatCaseType,
			  				 maatCommittalDate: obj.maatCommittalDate,
			 				 office: obj.office,
			 				 hoursRequired: obj.hoursRequired});
}



var prepareRows = function(filteredData){
	var tableRowString = "";
	var totalsArray = [];
	var totals = 0;
	filteredData.forEach(function(elem){
		totals += elem.hoursRequired;
		totalsArray.push(totals)
		elem.dependants.forEach(function(depElem){
			totals += depElem.hoursRequired;
			totalsArray.push(totals)
		});
	});

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

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}


var appendTotals = function(){
	var hoursRequired = $(".hoursRequired");
	var totalHours = $(".totalHours");

	var totalsArray = [];

	var totalsHolder = []
	var runningTotal = null;


	for (var i = 0; i < hoursRequired.length; i++) {

		if (hoursRequired[i].parentElement.className == "dependant") {
			
			totalsArray.push(totalsHolder);
			runningTotal = null;
			totalsHolder = [];
		} 

		runningTotal += parseFloat(hoursRequired[i].innerText);

		totalsHolder.push(Math.round(runningTotal * 100) / 100);
	    
	}

	totalsArray.forEach(function(array){
		array.reverse();
	});

	totalsArray = [].concat.apply([], totalsArray);

	for (var i = 0; i < totalHours.length; i++) {
	    totalHours[i].innerText = totalsArray[i];
	}



}

var getTotalHours = function(){
	var hoursRequired = $(".hoursRequired");

	var runningTotal = 0;

		for (var i = 0; i < hoursRequired.length; i++) {

		runningTotal += parseFloat(hoursRequired[i].innerText);    
	}

	return (Math.round(runningTotal * 100) / 100);
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



	$("#count").text(dependantsCount + " of " + dependeeCount + " in total - " + getTotalHours() + "hrs total work" );

	 appendTotals();

}