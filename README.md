# Wilma-api
> for starters, please do not use this in production environment. The sheer amount of technical debt that is present in this repository is just too much for anyone to reasonably contribute, or maintain it. On top of being built on Node and using extremely slow HTML parser, it doesn't use TypeScript and therefore lacks static typing for the parser code.

# Compiling
> Please just contact me if you are planning to compile the API; I'll be more than happy to let you experience the suffering that is Wilma's API.

The basic compile checklist however is:
- a running and configured MongoDB instance that the server can access to
- LOPS2021 and LOPS2016 course-mapping present in database
- teacher-mapping in database
- Google-project with Calendar-api enabled and configured
- following configuration files
    - `database/secret.json` that contains signature for jwt-session tokens, database conectiomn details, as well as api keys
    - `google/credentials.json` that contains your Google-projects credentials and scopes
    - `src/config.json` that contains the port for the express-api
 
# Documentation
> At this point, just contact me and I'll provide all the necessary details for how to use the API, and it's constantly changing and broken endpoints

# API-coverage
> While not perfect and quite undeterministic thanks to its nature, this API's coverage is close to Wilma's official closed API.

### This API currently covers the following features of the Wilma.
- Authentication/sessions
    > Create and manage sessions
- Absences
    > List student's absences
- Calendar
    > List upcoming school events
- Course-tray
    > List and manage student's course selections
- Gradebook
    > List student's grades from courses
- Homework
    > List student's current homework
- Upper secondary school curriculum (LOPS2021 & LOPS2016)
    > List information about all the current lops's courses
- Messages
    > List and create student's messages
- News/announcements
    > List school's announcements
- Schedule
    > Fetch student's schedule for specific dates/months
- Room-specific schedules
    > Fetch schedule for specific rooms
- Teachers
    > List school's teachers

### This API does **not** cover the following features of Wilma
- Accepting and managing your appointments (Tapahtumakutsut)
- Create absence-forms (Poissolot)
- List exams and exam results (Kokeet)
- List your applications and decisions (Hakemukset ja päätökset)
- List your printputs (Tulosteet)
- List your upcoming exams (Tentit)
- List your forms (Lomakkeet)


