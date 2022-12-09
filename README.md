# WilmaAPI
Provides access to Wilma's public-api without need for an api-key. Mainly used for the funktionality of OtaWilma web-client.

## Documentation
### table of contents
- todo
- 
- 
- 

## Authentication
### Wilma's public-api
Wilma's public api uses mainly two methods of authentication: `Wilma2SID` and `StudentID`.
### `Wilma2SID` is used as the main method of authenticating requests to your personal information (e.g. your `messages` and `grades`). 

### `StudentID` is used as auhtentication for some seemingly random endpoints, and is **never** used without `Wilma2SID`.

### OtaWilma's public api

### Otawilma uses `jwt-tokens` to wrap both of Wilma's authentication methods into one encrypted `token`. All the OtaWilma api's use this as a way to fetch user's information from Wilma in order to format it to more generalized `json`-format.

<br>

## Errors
#### All the errors in Otawilma-api contain the same fields. All the successfull requests also will always return statuscode `200`. Invalid requests to endpoints will contain information about what went wrong.

### Example `401` error
````json5
{
    "err": "Received invalid jwt token",
    "status": 401
}
````

### Example `400` error
````json5
{
    "err": "Missing authentication parameters: [\"token\"]",
    "status": 401
}
````
````json5
{
    "err": "\"test\" is not allowed",
    "status": 400
}
````
etc.



<br>

## Authentication endpoints
## `/login`
### Required headers
`none`

### Example request
`POST /login`
````json5
{
    "username": "matti.heikkinen", // Wilma-user's username
    "password": "koira123" // Wilma-user's password
}
````
### Response
````json5
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbmZvIjoibm8gYml0Y2hlcyJ9.I7CS2JRvZ-KZsNYtQwfHIcoc_tJVzzXl5-VzyscbVTs" // valid encypted jwt-token
}
````

### jwt-token
#### Returned jwt-token will **only** contain the following fields
````json5
{
    "Wilma2SID": "f3e836e3653b766c0b9947704e940fa7",
    "StudentID": "student:271885:52024bac759892b02210915fg987f056",
    "username": "matti.heikkinen",
    "iat": 1669976169
}
````
#### The returned jwt-token will live as long as your Wilma-session. Most of the other endpoints will require this token as authentication. This can be achieved by including a valid jwt-token in headers. eg.
````json5
{

    //...
    "Content-Type": "application/json", // other headers
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbmZvIjoibm8gYml0Y2hlcyJ9.I7CS2JRvZ-KZsNYtQwfHIcoc_tJVzzXl5-VzyscbVTs" // "token" header, with jwt-token as the value
    //...
}
````

<br>

## `/logout`
#### Logs out of Wilma, invalidating the current jwt-token
## Required headers
`token`
## Example request
`POST /logout`

## Example response
````json5
{
    "success": true
}
````

<br>

## `/authenticate`
#### Validate the current session
## Required headers
`token`
## Example request
`POST /authenticate`

## Example response
````json5
{
    "valid": true,
    "iat": 1670229214, // Time of creation in [epoch]-format
    "username": "matti.heikkinen" // Username linked to the session
}
````

<br>

## Message endpoints

<br>

## `/messages/inbox`
#### Returns the list of received messages from Wilma. Messages sent by you are considered 'inbox-main' if someone has replied to them

## Required headers
`token`
## Example request
`GET /messages/inbox`

## Example response
````json5
[
    //...
    {
        "isEvent": false, // Is this message marked as appointment
        "id": 14120905, // Unique id of the message
        "recipients": "Piilotettu", // String representing the list of recipients
        "subject": "Lääkekemian kurssi 16.-18.1.2023 intensiivikurssina - muutama paikka vapaana!", // Title of the message
        "timeStamp": "2022-12-02 11:44", // Timestamp in [yyyy-mm-dd hh:mm]-format
        "new": false, // Has the message been loaded before?
        "senders": [
            {
                "name": "Vakkilainen Kirsi (VAK)", // Name of the teacher
                "href": "/profiles/teachers/3753" // full path to the teacher in Wilma. The last part is the 'teacherId'
            }
        ] // List of senders, can be an empty list, and the 'href'-field can be invalid
    }
    //...
]
````

<br>

## `/messages/outbox`
#### Returns the list of messages you've sent through Wilma

## Required headers
`token`
## Example request
`GET /messages/outbox`

## Example response
````json5
[
    //...
    {
        "isEvent": false, // Is this message marked as appointment
        "id": 14120905, // Unique id of the message
        "recipients": "Piilotettu", // String representing the list of recipients
        "subject": "Lääkekemian kurssi 16.-18.1.2023 intensiivikurssina - muutama paikka vapaana!", // Title of the message
        "timeStamp": "2022-12-02 11:44", // Timestamp in [yyyy-mm-dd hh:mm]-format
        "new": false, // Has the message been loaded before?
        "senders": [
            {
                "name": "Vakkilainen Kirsi (VAK)", // Name of the teacher
                "href": "/profiles/teachers/3753" // full path to the teacher in Wilma. The last part is the 'teacherId'
            }
        ] // List of senders, can be an empty list, and the 'href'-field can be invalid
    }
    //...
]
````

<br>

## `/messages/appointments`
#### Returns the list of received appointments in Wilma. **`IMPORTANT - OtaWilma-api doesn't support appointments, and can only tell weather the appointment is still enrollable or not. It is reccomened that you either provide link to the original Wilma or don't support this feature at all.`**

## Required headers
`token`
## Example request
`GET /messages/appointments`

## Example response
````json5
[
    //...
    {
        "isEvent": true, // Is this message marked as appointment
        "id": 13941302, // Unique id of the message
        "subject": "HYVINVOINTIVIIKKO: Mitä seksuaali- ja sukupuolivähemmistöistä jokaisen on hyvä tietää, luento ti 8.11. klo 12.00", // Title of the appointment
        "timeStamp": "2022-11-02 12:44", // Timestamp in [yyyy-mm-dd hh:mm]-format
        "senders": [
            {
                "name": "Korin Minna (KOR)", // Name of the teacher
                "href": "/profiles/teachers/10134" //full path to the teacher in Wilma. The last part is the 'teacherId'
            }
        ], // List of senders, can be an empty list, and the 'href'-field can be invalid
        "status": "ExpiredReg" // Wilma's appointment status (hence the weird values)
    },
    //...
]
````
#### Field 'status' can get the following values
#### `Applied` - student has enrolled for the appointment
#### `Full` - appointment is full
#### `ExpiredReg` - appointment has expired

<br>

## `/messages/:<id>`
#### Returns the content of the message

## Required headers
`token`
## Example request
`GET /messages/14120905`

## Example response
````json5
[ // Wilma (for some reason) returns a list of messages when requesting a single 
    //...
    {
        "fromWilma": true, // is the message from Wilma, insidicates weather the 'id' field is valid or not
        "id": 14009307, // Unique id of the message
        "subject": "Huominen ruotsintunti", // Title of the message
        "timeStamp": "2022-11-14 21:56", // Timestamp in [yyyy-mm-dd hh:mm]-format
        "recipients": "Viitanen Sari (VII)", // String representing the list of recipients
        "sender": "Matti meikäläläinen, 21Å", // Full name of the sender
        "content": "[__html]", // content of the message as html
        "replies": [
            {
                "id": "1s22:37", // The is of the reply (useless)
                "content": "[__html]", // Content of the reply as html
                "timeStamp": "2022-11-14 22:37", // Timestamp in [yyyy-mm-dd hh:mm]-format
                "sender": "Viitanen Sari (VII)" // sender's full name (and class if teh user is student)
            }
        ]
    }
    //...
] 
````

<br>

## Schedule endpoints

<br>

## `/schedule/week/:date`
#### Returns the schedule of the full week that includes the given date. Note that the `date` format is [mm-dd-yyyy]

## Required headers
`token`
## Example request
`GET /schedule/week/12-04-2022`

## Example response
````json5
{
    "week": 49, // Week-number based on Wilma's api. Not accurate
    "weekRange": [ // List of the weekdays that are contained in week. Yyou only need to know one of these to know the rest, which is mainly used for caching purposes.
        "04.12.2022",
        "05.12.2022",
        "06.12.2022",
        "07.12.2022",
        "08.12.2022",
        "09.12.2022",
        "10.12.2022"
    ],
    "days": { // dates work as keys
        "2022-12-04": { 
            "day": { // contains the informatiom about the specific day
                "date": 0, // index of the day. Sunday is '0' and Saturday '6'. 
                "caption": "Su 4.12", // Caption of the day in [Ww dd.mm] format
                "full": "Sunnuntai 2022-12-04" // Full caption of the day [] [Ww yyyy-mm-dd] format
            },
            "lessons": [], // List of lessons during this day
            "exams": [] // LIst of exams marked for this day
        },
        "2022-12-05": {
            "day": { // contains the informatiom about the specific day
                "date": 1, // index of the day. Sunday is '0' and Saturday '6'. 
                "caption": "Ma 5.12", // Caption of the day in [Ww dd.mm] format
                "full": "Maanantai 2022-12-05" // Full caption of the day [] [Ww yyyy-mm-dd] format
            },
            "lessons": [ // List of lessons during this day
                {
                    "start": "08:30", // Start of the lesson in [hh:mm] format
                    "startRaw": 510, // start of the lesson in minutes from 00:00:00.
                    "end": "09:45", // End of the lesson in [hh:mm] format
                    "endRaw": 585, // End of the lesson in minutes from 00:00:00.
                    "durationRaw": 75, // Duration of the lesson in minutes
                    "groups": [ // List of the groups that have a lesson at this specific time
                        {
                            "code": "MAA06.3", // Code of the group [course.<group>]
                            "name": "Derivaatta", // Name of the course
                            "class": "21A/21C/21D/21E/21F/21G/21H/21I/21K", // list of the classes that have students enrolled for this group
                            "teachers": [ // list of the teachers on this course.
                                {
                                    "id": 9244, // Id of the teacher
                                    "caption": "KAA", // Caption of the teacher
                                    "name": "Kaataja Jussi" // Name of the teacher
                                }
                            ],
                            "rooms": [ // List of the rooms used for this course.
                                {
                                    "id": 5366, // Id of the room
                                    "caption": "1315", // Caption of the room
                                    "name": "Fysiikka" // Name of the room
                                }
                            ]
                        }
                    ]
                },
                //...
            ],
            "exams": [] // List of the exams
        },
        //...
    }
}
````

<br>

## Gradebook endpoints

<br>

## `/gradebook`
#### Returns a map of user's grades.

## Required headers
`token`
## Example request
`GET /gradebook`

## Example response
````json5
{
    "Äidinkieli ja kirjallisuus, suomen kieli ja kirjallisuus": { // Subject string from Wilma
        "grade": "9", // Overall grade of the subject
        "points": "8", // Overall points (OP) from the subject
        "courses": {
            "ÄI01 Tekstien tulkinta ja kirjoittaminen": { // Name of the course
                "code": "ÄI01", // Code of the course
                "grade": "8", // Grade of the course
                "points": "2", // Points from the course
                "date": "01.10.2021", // Date of grading
                "teacher?": "Ulla Helenius-Aro", // Name of the teacher. Might be null
                "info?": null // Optional information about the grading
            },
            //...
        }
    },
    //...
    "overview": { // Last object is the overview
        "Suoritukset kurssityypeittäin": null, // [LOPS2016]
        "ECTS": null, // [LOPS2016]
        "Lu21 pakollinen moduuli": "65", // [LOPS2021]
        "Lu21 valtakunnallinen valinnainen moduuli": "10", // [LOPS2021]
        "Lu21 paikallinen opintojakso": "16", // [LOPS2021]
        "Lu21 temaattiset opinnot -opintojakso": "2", // [LOPS2021]
        "Yhteensä": "93", // [LOPS2021 & LOPS2021] Overall points
        "Keskiarvo": "8.81", // Average from all subjects
        "Lukuaineiden keskiarvo": "9.00" // Average from the mandatory subjects (doesn't include B-ruotsi)
    }
}
````

<br>

## Lops endpoints
#### `Note how these endpoints don't require the 'token' authentication`

<br>

## `/lops/:<lops>/courses/list`
#### Lists all the courses found in that LOPS. The lops can be either `LOPS2021` or `LOPS2016`.

## Required headers
`none`
## Example request
`GET /lops/LOPS2021/courses/list`

## Example response
````json5
{
    "Äidinkieli ja kirjallisuus, suomen kieli ja kirjallisuus": { // Subject string from Wilma
        "ÄI01": { // Code of the subject as key
            "subject": "Äidinkieli ja kirjallisuus, suomen kieli ja kirjallisuus", // Subject string from Wilma (again for caching purposes)
            "code": "ÄI01", // Code of the subject (again for caching purposes)
            "type": "c-type136", // Type of the course (more info below)
            "name": "Tekstien tulkinta ja kirjoittaminen" // Name of the course
        },
        //...
    },
    //...
}
````

## Color-code map
#### I did it so you don't have to... Hexadecimal colors are from Wilma's web-client
````css
.c-type25,
.c-type136 {
    background-color: #bfffbf;
    /*LOPS2021 - global mandatory course */
}

.c-type137 {
    background-color: #80ffff;
    /*LOPS2021 - global optional course */
}

.c-type119,
.c-type29,
.c-type138 {
    background-color: #bfbfff;
    /*LOPS2021 - diploma course */
}

.c-type141,
.c-type146,
.c-type151 {
    background-color: #8080c0;
    /*LOPS2021 - local optional course */
}

.c-type112,
.c-type66,
.c-type26,
.c-type65 {
    background-color: #e8e8ff;
    /*LOPS2016 - local optional course */
}

.c-type27 {
    background-color: #ffc1c1;
    /*LOPS2016 - global optional course */
}
````

<br>

## `/lops/:<lops>/courses/get/:<code>`
#### Returns information about the course. The 'lops' can be either `LOPS2021` or `LOPS2016`, and the 'code' can be any course that exists in specified LOPS

## Required headers
`none`
## Example request
`GET /lops/LOPS2021/courses/get/MAA01`

## Example response
#### Thanks to how Wilma's API is, the response may not or may contain more fields. The 
````json5
{
    "subject": "Matematiikan pitkä oppimäärä", // Subject of the course
    "code": "MAA01", // Code of the course
    "type": "c-type136", // Type of the course (see. 'color-code map' above)
    "name": "Luvut ja yhtälöt (MAY1)", // Name of the course
    "Tyyppi": "Lu21 pakollinen moduuli", // Type of the course
    "Opintopisteitä?": "2", // Points from the course. Field might not exists
    "Sisältö?": "Keskeiset sisällöt<br>polynomifunktio ja -yhtälö sekä polynomiepäyhtälö<br>2. asteen yhtälön ratkaisukaava<br>polynomien tulo ja binomikaavat (summan neliö, summan ja erotuksen tulo)<br>polynomien tekijät<br>potenssifunktio ja potenssiyhtälö (eksponenttina positiivinen kokonaisluku)<br>rationaalifunktiot ja -yhtälöt<br>juurifunktiot ja -yhtälöt", // Information about the course in html. Field might not exists
    "Tavoitteet?": "TavoitteetModuulin tavoitteena on, että opiskelija<br>tutustuu ilmiöiden matemaattiseen mallintamiseen polynomi-, rationaali- jajuurifunktioiden avulla, tuntee polynomi-, rationaali- ja juurifunktioiden ominaisuudet ja osaa ratkaista niihin liittyviä yhtälöitä sekä tietää polynomifunktion nollakohtien ja polynomin tekijöiden välisen yhteyden<br>osaa ratkaista yksinkertaisia polynomiepäyhtälöitä<br>osaa käyttää ohjelmistoja polynomi-, rationaali- ja juurifunktioiden tutkimisessa sekä polynomi-, rationaali- ja juuriyhtälöiden ja polynomiepäyhtälöidenratkaisemisessa sovellusten yhteydessä.", // More information about the course in html. Field might not exists
    "OPS?": "huomautus LOPS2021" // OPS information about the course. Field might not exists
}
````