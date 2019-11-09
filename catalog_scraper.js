var rp = require('request-promise');
var cheerio = require('cheerio');

module.exports = catalogToMajor;
//BUGS:
// - ENGW 3302 or ENGW3315 show up as separate orRequirements.

var parseMajorData = require('./parseMajor');

function catalogToMajor(link) {
    var options = {
        uri: link,
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    rp(options)
        .then(($) => scrapeMajorDataFromCatalog($))
        .then((scrapedMajor) => {
            //write the parse major data to database?
            let parsedMajorObject = parseMajorData(scrapedMajor);
            console.log("--------------------Parsed major object--------------------");
            console.log(JSON.stringify(parsedMajorObject));
        })
        .catch(function (err) {
            console.log(err)
        });
}

function scrapeMajorDataFromCatalog($) {
    return new Promise((resolve, reject) => {
        var major = [$('#content .page-title').text(), $('#edition').text().split(" ")[0]]
        var sectionReq = []
        var sectionIsOrReq = false
        var sectionIsRange = false
        var orRequirement = "";
        var hoursReq = "";
        $('#programrequirementstextcontainer table.sc_courselist tr').each(function() {
            var currentRow = $(this);
            //if (currentRow.find("span.areaheader").length !== 0 || currentRow.find("span.areasubheader").length !== 0) {
            if (currentRow.find("span.areaheader").length !== 0) {
                sectionIsRange = false
                sectionIsOrReq = false;
                hoursReq = "";
                //add the previous orRequirement to the course data
                if (orRequirement !== "") {
                    sectionReq.push(orRequirement);
                    orRequirement = "";
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
                        hoursReq = currentRow.find("td.hourscol").text();
                    }
                    if (commentSpan.text().includes("Complete 8 credits of CS, IS or DS classes that are not already required. Choose courses within the following ranges")) {
                        sectionIsRange = true;
                        hoursReq = currentRow.find("td.hourscol").text();
                    }
                });
            }
            if (sectionIsRange) {
                if (sectionReq.length === 1) {
                    sectionReq.push("RANGE");
                    sectionReq.push(hoursReq);
                }
                if (currentRow.find("span.courselistcomment").length !== 0) {
                    let commentSpan = $(this);
                    let range = [];
                    commentSpan.find("a").each(function() {
                        let currentAnchor = $(this)
                        let courseNum = currentAnchor.text()
                        range.push(courseNum);
                    });
                    if (range.length !== 0) {
                        rangeString = range.join("-");
                        sectionReq.push(rangeString);
                    }
                }
            } else {
                if (currentRow.find("td.codecol a").length !== 0) {
                    var andRequirement = "";
                    currentRow.find("td.codecol a").each(function() {
                        let currentAnchor = $(this)
                        let courseNum = currentAnchor.text()
                        if (andRequirement !== "") {
                            courseNum = "%and%" + courseNum
                        }
                        andRequirement += courseNum
                    });
                    if (sectionIsOrReq) {
                        if (sectionReq.length === 1) {
                            sectionReq.push("OR");
                            sectionReq.push(hoursReq);
                        }
                        if (orRequirement !== "") {
                            orRequirement += "%or%" + andRequirement;
                        }
                        else {
                            orRequirement = andRequirement;
                        }
                    } else {
                        if (sectionReq.length === 1) {
                            sectionReq.push("AND");
                        }
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
        console.log("--------------------Scraped major data--------------------");  
        console.log(major);
        resolve(major);
    });
}
//Computer Science
catalogToMajor('http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-science/bscs/#programrequirementstext');
//Biochemistry
//catalogToMajor('http://catalog.northeastern.edu/archive/2018-2019/undergraduate/science/biochemistry/biochemistry-bs/#programrequirementstext');
//Mathematics
//catalogToMajor('http://catalog.northeastern.edu/archive/2018-2019/undergraduate/science/mathematics/mathematics-bs/#programrequirementstext');
//HealthSciences
//catalogToMajor('http://catalog.northeastern.edu/archive/2018-2019/undergraduate/health-sciences/health-sciences/health-science-bs/#majorrequirementstext')