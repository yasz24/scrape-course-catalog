var rp = require('request-promise');
var cheerio = require('cheerio');

var options = {
    uri: 'http://catalog.northeastern.edu/undergraduate/computer-information-science/computer-information-science-combined-majors/computer-science-mathematics-bs/#programrequirementstext',
    transform: function (body) {
        return cheerio.load(body);
    }
};

rp(options)
	.then(function ($) {
        var courseData = []
        $('#programrequirementstextcontainer table.sc_courselist tr').each(function() {
        	var currentRow = $(this);
        	currentRow.find("td.codecol a").each(function() {
        		var currentAnchor = $(this)
        		var courseNum = currentAnchor.text()
        		courseData.push(courseNum);
        	});
        });
        
        console.log(courseData);
    })
    .catch(function (err) {
        // Crawling failed or Cheerio choked...
    });
