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
