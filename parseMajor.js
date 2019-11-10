module.exports = parseMajorData;


function parseMajorData(data) {
  let majorName = data[0];
  let edition = data[1];
  data = data.slice(2);
  let requirementGroups = [];
  let requirementGroupMap = {}
  let major = {
    name: majorName,
    yearVersion: edition,
    isLanguageRequired: false,
    totalCreditsRequired: 0,
    nupaths: []
  }
  data.forEach((section) => {
    if (section.length > 2) {
      let requirementGroupName = section[0];
      requirementGroups.push(requirementGroupName);
      let requirementGroupType = section[1];
      if (requirementGroupType === "AND") {
        requirementGroupMap[requirementGroupName] = createAndSection(requirementGroupName, section.slice(2));
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
        if (requirementGroupType === "OR") {
          requirementGroupMap[requirementGroupName] = createOrSection(requirementGroupName, section.slice(3), minCredit, maxCredit);
        } else {
          requirementGroupMap[requirementGroupName] = createRangeSection(requirementGroupName, section.slice(3), minCredit, maxCredit);
        }
      }
    }
  });
  major['requirementGroups'] =  requirementGroups;
  major['requirementGroupMap'] = requirementGroupMap;
  return major
}

function createAndSection(requirementGroupName, reqList) {
  let ANDSection = {type: "AND", name: requirementGroupName}
  let requirements = [];
  reqList.forEach((requirement) => {
    let splitAndArray = requirement.split("%and%");
    if (splitAndArray.length > 1) {
      processAndSplit(splitAndArray, requirements);
    } else {
      let splitOrArray = requirement.split("%or%");
      if (splitOrArray.length > 1) {
        processOrSplit(splitOrArray, requirements)
      } else {
        let splitBySpace = requirement.split(String.fromCharCode(160));
        let IRequiredCourse = {'type': "COURSE", 'classId': parseInt(splitBySpace[1]), 'subject': splitBySpace[0]};
        requirements.push(IRequiredCourse);
      }
    }
  });
  ANDSection['requirements'] = requirements
  return ANDSection
}

function createOrSection(requirementGroupName, reqList, minCredits, maxCredits) {
  let ORSection = {type: "OR", name: requirementGroupName, numCreditsMin: minCredits, numCreditsMax: maxCredits}
  let requirements = [];
  reqList.forEach((requirement) => {
    let splitOrArray = requirement.split("%or%");
    if (splitOrArray.length > 1) {
      processOrSplit(splitOrArray, requirements)
    } else {
      let splitAndArray = requirement.split("%and%");
      if (splitAndArray.length > 1) {
        processAndSplit(splitAndArray, requirements);
      } else {
        let splitBySpace = requirement.split(String.fromCharCode(160));
        let IRequiredCourse = {'type': "COURSE", 'classId': parseInt(splitBySpace[1]), 'subject': splitBySpace[0]};
        requirements.push(IRequiredCourse);
      }
    }
  });
  ORSection['requirements'] = requirements
  return ORSection
}

function createRangeSection(requirementGroupName, reqList, minCredits, maxCredits) {
  let RangeSection = {type: "RANGE", name: requirementGroupName, numCreditsMin: minCredits, numCreditsMax: maxCredits}
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

function processAndSplit(splitAndArray, requirements) {
  let IAndCourse = {'type': "AND"};
  let andCourses = []
  splitAndArray.forEach((conjunctiveClause) => {
    let splitOrArray = conjunctiveClause.split("%or%");
    if (splitOrArray.length > 1) {
      let IOrCourse = {'type': "OR"};
      let orCourses = []
      splitOrArray.forEach((disjunctiveClause) => {
        let splitBySpace = disjunctiveClause.split(String.fromCharCode(160));
        let IRequiredCourse = {'type': "COURSE", 'classId': parseInt(splitBySpace[1]), 'subject': splitBySpace[0]};
        orCourses.push(IRequiredCourse);
      });
      IOrCourse['courses'] = orCourses;
      andCourses.push(IOrCourse);
    } else {
      let splitBySpace = conjunctiveClause.split(String.fromCharCode(160));
      let IRequiredCourse = {'type': "COURSE", 'classId': parseInt(splitBySpace[1]), 'subject': splitBySpace[0]};
      andCourses.push(IRequiredCourse);
    }
  });
  IAndCourse['courses'] = andCourses;
  requirements.push(IAndCourse);
}

function processOrSplit(splitOrArray, requirements) {
  let IOrCourse = {'type': "OR"};
  let orCourses = []
  splitOrArray.forEach((disjunctiveClause) => {
    let splitAndArray = disjunctiveClause.split("%and%");
    if (splitAndArray.length > 1) {
      let IAndCourse = {'type': "AND"};
      let andCourses = []
      splitAndArray.forEach((conjunctiveClause) => {
        let splitBySpace = conjunctiveClause.split(String.fromCharCode(160));
        let IRequiredCourse = {'type': "COURSE", 'classId': parseInt(splitBySpace[1]), 'subject': splitBySpace[0]};
        andCourses.push(IRequiredCourse);
      });
      IAndCourse['courses'] = andCourses;
      orCourses.push(IAndCourse);
    } else {
      let splitBySpace = disjunctiveClause.split(String.fromCharCode(160));
      let IRequiredCourse = {'type': "COURSE", 'classId': parseInt(splitBySpace[1]), 'subject': splitBySpace[0]};
      orCourses.push(IRequiredCourse);
    }
  });
  IOrCourse['courses'] = orCourses;
  requirements.push(IOrCourse);
}
