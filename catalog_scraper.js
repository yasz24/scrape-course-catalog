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
        var major = []
        var sectionReq = []
        var sectionIsOrReq = false
        var sectionIsRange = false
        var orRequirement = "";
        $('#programrequirementstextcontainer table.sc_courselist tr').each(function() {
        	var currentRow = $(this);
            if (currentRow.find("span.areaheader").length !== 0) {
                sectionIsRange = false
                //add the previous orRequirement to the course data
                if (orRequirement !== "") {
                    sectionReq.push(orRequirement);
                    orRequirement = "";
                    sectionIsOrReq = false;
                }
                if (sectionReq.length !== 0) {
                    major.push(sectionReq)
                    sectionReq = []
                }   
                let commentSpan = $(this);
                sectionReq.push(commentSpan.text());
            }
            if (currentRow.find("span.courselistcomment").length !== 0) {
                currentRow.find("span.courselistcomment").each(function() {
                    let commentSpan = $(this);
                    //should use regExp matching here
                    if (commentSpan.text().includes("Complete")) {
                        sectionIsOrReq = true;
                    }
                    if (commentSpan.text().includes("Complete 8 credits of CS, IS or DS classes that are not already required. Choose courses within the following ranges")) {
                        sectionIsRange = true;
                    }
                });
            }
            if (sectionIsRange) {
                if (currentRow.find("span.courselistcomment").length !== 0) {
                    let commentSpan = $(this);
                    let range = [];
                    commentSpan.find("a").each(function() {
                        let currentAnchor = $(this)
                        let courseNum = currentAnchor.text()
                        range.push(courseNum);
                    });
                    rangeString = range.join(" - ");
                    sectionReq.push(rangeString);
                }
            } else {
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
                        sectionReq.push(andRequirement);
                    }
                }
            }
        });
        if (orRequirement !== "") {
            sectionReq.push(orRequirement);
        }
        if (sectionReq.length !== 0) {
            major.push(sectionReq);
            sectionReq = []
        }  
        console.log(major);
    })
    .catch(function (err) {
        // Crawling failed or Cheerio choked...
    });
