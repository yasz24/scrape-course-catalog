var rp = require('request-promise');
var cheerio = require('cheerio');

var options = {
    uri: 'http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-science/bscs/#programrequirementstext',
    transform: function (body) {
        return cheerio.load(body);
    }
};

rp(options)
	.then(function ($) {
        var courseData = []
        $('#programrequirementstextcontainer table.sc_courselist tr').each(function() {
        	var currentRow = $(this);
            
            if (currentRow.find("td.codecol a").length !== 0) {
                var requirement = "";
                currentRow.find("td.codecol a").each(function() {
                    let currentAnchor = $(this)
                    let courseNum = currentAnchor.text()
                    if (requirement !== "") {
                        courseNum = " and " + courseNum
                    }
                    requirement += courseNum
                });
                courseData.push(requirement);
            }
        });
        
        console.log(courseData);
    })
    .catch(function (err) {
        // Crawling failed or Cheerio choked...
    });
