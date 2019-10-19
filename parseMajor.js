

module.exports = parseMajorData;


// function catalogToMajor(catalogLink) {

//   scrapeMajorDataFromCatalog(catalogLink).then(function(majorData) {
//     console.log(majorData);
//   });
// }

function parseMajorData(data) {
  let sectionMap = {}
  data.forEach((section) => {
    if (section.length > 2) {
      let sectionName = section[0];
      let sectionType = section[1];
      if (sectionType === "AND") {
        sectionMap[sectionName] = createAndSection(sectionName, section.slice(2));
      } else {
        //need to scrape and pass down the min credits, max credits
        let minCredit = 0;
        let maxCredit = 0;
        let creditSplitArr = section[2].split("-");
        minCredit = creditSplitArr[0];
        maxCredit = creditSplitArr[0];

        if (creditSplitArr.length > 1) {
          maxCredit = creditSplitArr[1];
        }
        if (sectionType === "OR") {
          sectionMap[sectionName] = createOrSection(sectionName, section.slice(3), minCredit, maxCredit);
        } else {
          sectionMap[sectionName] = createRangeSection(sectionName, section.slice(3), minCredit, maxCredit);
        }
      }
    }
  });
  return sectionMap
}

function createAndSection(sectionName, reqList) {
  let ANDSection = {type: "AND", name: sectionName}
  let requirements = [];
  reqList.forEach((requirement) => {
    let splitAndArray = requirement.split("%and%");
    if (splitAndArray.length > 1) {
        let IAndCourse = {'type': "AND"};
        let andCourses = []
        splitAndArray.forEach((conjunctiveClause) => {
          let splitOrArray = conjunctiveClause.split("%or%");
          if (splitOrArray.length > 1) {
            let IOrCourse = {'type': "OR"};
            let orCourses = []
            splitOrArray.forEach((disjunctiveClause) => {
              let splitBySpace = disjunctiveClause.split(String.fromCharCode(160));
              let IRequiredCourse = {'type': "COURSE", 'classId': splitBySpace[1], 'subject': splitBySpace[0]};
              orCourses.push(IRequiredCourse);
            });
            IOrCourse['courses'] = orCourses;
            andCourses.push(IOrCourse);
          } else {
            let splitBySpace = conjunctiveClause.split(String.fromCharCode(160));
            let IRequiredCourse = {'type': "COURSE", 'classId': splitBySpace[1], 'subject': splitBySpace[0]};
            andCourses.push(IRequiredCourse);
          }
        });
        IAndCourse['courses'] = andCourses;
        requirements.push(IAndCourse);
    } else {
      let splitBySpace = requirement.split(String.fromCharCode(160));
      let IRequiredCourse = {'type': "COURSE", 'classId': splitBySpace[1], 'subject': splitBySpace[0]};
      requirements.push(IRequiredCourse);
    }
  });
  ANDSection['requirements'] = requirements
  return ANDSection
}

function createOrSection(sectionName, reqList, minCredits, maxCredits) {
  let ORSection = {type: "OR", name: sectionName, numCreditsMin: minCredits, numCreditsMax: maxCredits}
  let requirements = [];
  reqList.forEach((requirement) => {
    let splitOrArray = requirement.split("%or%");
    if (splitOrArray.length > 1) {
        let IOrCourse = {'type': "OR"};
        let orCourses = []
        splitOrArray.forEach((disjunctiveClause) => {
          let splitAndArray = disjunctiveClause.split("%and%");
          if (splitAndArray.length > 1) {
            let IAndCourse = {'type': "AND"};
            let andCourses = []
            splitAndArray.forEach((conjunctiveClause) => {
              let splitBySpace = conjunctiveClause.split(String.fromCharCode(160));
              let IRequiredCourse = {'type': "COURSE", 'classId': splitBySpace[1], 'subject': splitBySpace[0]};
              andCourses.push(IRequiredCourse);
            });
            IAndCourse['courses'] = andCourses;
            orCourses.push(IAndCourse);
          } else {
            let splitBySpace = disjunctiveClause.split(String.fromCharCode(160));
            let IRequiredCourse = {'type': "COURSE", 'classId': splitBySpace[1], 'subject': splitBySpace[0]};
            orCourses.push(IRequiredCourse);
          }
        });
        IOrCourse['courses'] = orCourses;
        requirements.push(IOrCourse);
    } else {
      let splitBySpace = requirement.split(String.fromCharCode(160));
      let IRequiredCourse = {'type': "COURSE", 'classId': splitBySpace[1], 'subject': splitBySpace[0]};
      requirements.push(IRequiredCourse);
    }
  });
  ORSection['requirements'] = requirements
  return ORSection
}

function createRangeSection(sectionName, reqList, minCredits, maxCredits) {
  let RangeSection = {type: "RANGE", name: sectionName, numCreditsMin: minCredits, numCreditsMax: maxCredits}
  let requirements = [];
  reqList.forEach((requirement) => {

    let splitArray = requirement.split("-");
    if (splitArray.length > 1) {
      let lowerTuple = splitArray[0].split(String.fromCharCode(160));
      let subject = lowerTuple[0];
      let rangeStart = lowerTuple[1]
      let rangeEnd = splitArray[1].split(String.fromCharCode(160))[1];
      let ISubjectRange = { subject: subject, idRangeStart: rangeStart, idRangeEnd: rangeEnd}
      requirements.push(ISubjectRange);
    } 
  });
  RangeSection['requirements'] = requirements
  return RangeSection
}

//catalogToMajor('http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-science/bscs/#programrequirementstext');

//console.log(parseMajorData(data));
