//put data in another file
var data = [ [ 'Computer Science Overview', 'AND', 'CS 1200', 'CS 1210' ],
  [ 'Computer Science Fundamental Courses',
    'AND',
    'CS 1800%and%CS 1802',
    'CS 2500%and%CS 2501',
    'CS 2510%and%CS 2511',
    'CS 2800%and%CS 2801' ],
  [ 'Computer Science Required Courses',
    'AND',
    'CS 3000',
    'CS 3500',
    'CS 3650',
    'CS 3700',
    'CS 3800',
    'CS 4400',
    'CS 4500%and%CS 4501' ],
  [ 'Presentation Requirement', 'AND', 'THTR 1170' ],
  [ 'Computer Science Capstone',
    'OR',
    'CS 4100%or%CS 4300%or%CS 4410%or%CS 4150%or%CS 4550%or%CS 4991%or%IS 4900' ],
  [ 'Computer Science Elective Courses',
    'RANGE',
    'CS 2500-CS 5010',
    'IS 2000-IS 4900',
    'DS 2000-DS 4900' ],
  [ 'Mathematics Courses',
    'OR',
    'MATH 1341%or%MATH 1342%or%MATH 2331%or%MATH 3081' ],
  [ 'Computing and Social Issues',
    'OR',
    'ANTH 3418%or%IA 5240%or%INSH 2102%or%PHIL 1145%or%SOCL 1280%or%SOCL 3485%or%SOCL 4528' ],
  [ 'Electrical Engineering', 'AND', 'EECE 2160' ],
  [ 'Science Requirement',
    'OR',
    'BIOL 1111%and%BIOL 1112%or%BIOL 1113%and%BIOL 1114%or%BIOL 2301%and%BIOL 2302%or%CHEM 1211%and%CHEM 1212%and%CHEM 1213%or%CHEM 1214%and%CHEM 1215%and%CHEM 1216%or%ENVR 1200%and%ENVR 1201%or%ENVR 1202%and%ENVR 1203%or%ENVR 1200%and%ENVR 1201%or%ENVR 2310%and%ENVR 2311%or%ENVR 2340%and%ENVR 2341%or%ENVR 3300%and%ENVR 3301%or%ENVR 4500%and%ENVR 4501%or%ENVR 1202%and%ENVR 1203%or%ENVR 5242%and%ENVR 5243%or%PHYS 1145%and%PHYS 1146%or%PHYS 1147%and%PHYS 1148%or%PHYS 1151%and%PHYS 1152%and%PHYS 1153%or%PHYS 1155%and%PHYS 1156%and%PHYS 1157%or%PHYS 1161%and%PHYS 1162%and%PHYS 1163%or%PHYS 1165%and%PHYS 1166%and%PHYS 1167' ],
  [ 'College Writing', 'AND', 'ENGW 1111' ],
  [ 'Advanced Writing in the Disciplines',
    'AND',
    'ENGW 3302',
    'ENGW 3315' ] ]

function parseMajorData(data) {
  let sectionMap = {}
  data.forEach((section) => {
    if (section.length > 2) {
      let sectionName = section[0];
      let sectionType = section[1];
      if (sectionType === "AND") {
        sectionMap[sectionName] = createAndSection(sectionName, section.slice(2));
      } else if (sectionType === "OR") {
        //need to scrape and pass down the min credits, max credits
        sectionMap[sectionName] = createOrSection(sectionName, section.slice(2), 0 ,0);
      } else {
        //sectionMap[sectionName] = createRangeSection(sectionName, section.slice(2));
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
console.log(parseMajorData(data));
