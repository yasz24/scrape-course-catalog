var rp = require('request-promise');
var cheerio = require('cheerio');

//BUGS:
// - ENGW 3302 or ENGW3315 show up as separate orRequirements.
var options = {
    uri: 'http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-science/bscs/#programrequirementstext',
    transform: function (body) {
        return cheerio.load(body);
    }
};

rp(options)
	.then(function ($) {
        var courseData = []
        var sectionIsOrReq = false
        var orRequirement = "";
        $('#programrequirementstextcontainer table.sc_courselist tr').each(function() {
        	var currentRow = $(this);
            if (currentRow.find("span.areaheader").length !== 0) {
                //add the previous orRequirement to the course data
                if (orRequirement !== "") {
                    courseData.push(orRequirement);
                    orRequirement = "";
                    sectionIsOrReq = false;
                }   
                let commentSpan = $(this);
                courseData.push(commentSpan.text());
            }
            if (currentRow.find("span.courselistcomment").length !== 0) {
                currentRow.find("span.courselistcomment").each(function() {
                    let commentSpan = $(this);
                    if (commentSpan.text().includes("Complete")) {
                        sectionIsOrReq = true;
                    }
                });
            }
            if (currentRow.find("td.codecol a").length !== 0) {
                var andRequirement = "";
                currentRow.find("td.codecol a").each(function() {
                    let currentAnchor = $(this)
                    let courseNum = currentAnchor.text()
                    if (andRequirement !== "") {
                        courseNum = " and " + courseNum
                    }
                    andRequirement += courseNum
                });
                if (sectionIsOrReq) {
                        if (orRequirement !== "") {
                            orRequirement += " or " + andRequirement;
                        }
                        else {
                            orRequirement = andRequirement;
                        }
                } else {
                        courseData.push(andRequirement);
                }
            }
        });
        if (orRequirement !== "") {
            courseData.push(orRequirement);
        }
        console.log(courseData);
    })
    .catch(function (err) {
        // Crawling failed or Cheerio choked...
    });
