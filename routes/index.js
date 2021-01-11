var express = require('express');
var router = express.Router();
const mssql = require('mssql');
/* GET home page. */

/* naver id login */
var client_id = '7akXsWfmKDmEnrJ10h7y';
var client_secret = '4bcQL2s3Da';
var state = "RAMDOM_STATE";
var redirectURI = encodeURI("http://192.168.0.134:8087/callback");
var api_url = "";
var request = require('request');

/* JWT */
var jwt = require('jsonwebtoken');
var secret_key = 'yuriminfosysqw12qw12';   // JWT 시크릿키

var _accessToken;
var _refreshToken;

const config = {
    // "user"      : "sa",
    // "password"  : "qw12qw12)",
    // "server"    : "192.168.0.122",
    // "port"      : 1433,
    // "database"  : "aTEST",
    // "timezone"  : 'utc',
    // "options"   : {
    //     "encrypt" : false
    // }
    "user": "sa",
    "password": "qw12qw12",
    //"server"    : "192.168.0.135",
    "server": "192.168.0.134",
    // "server": "192.168.35.115",
    "port": 1433,
    "database": "aTEST",
    // "timezone"  : 'utc',
    "options": {
        encrypt: false, // Use this if you're on Windows Azure 
        enableArithAbort: true
    }
}

/* router.get('/', function (req, res, next) {
    res.render('login');
}) */

router.get('/chat', function (req, res, next) {
    res.render('chat');
})

// router.get('/', function(req, res, next) {
//     res.render('test', { title: 'Express' });
// });

router.get('/test', function (req, res, next) {
    console.log('good');
    res.render('test');
});

router.get('/mail', function (req, res, next) {
    console.log('get mail');
    mssql.connect(config, function (err) {

        var request = new mssql.Request();
        let query = "EXEC p__EML";
        request.query(query, function (err, result) {
            res.render('apps_mailbox', { data: result.recordset });
        })
    });
});

router.get('/sendMail', function (req, res, next) {
    console.log('send mail');
    // mssql.connect(config, function (err) {

    //     var request = new mssql.Request();
    //     let query = "EXEC p__EML";
    //     request.query(query,function(err, result){

    //     })
    // });

    res.render('send_mail');
});

router.get('/viewMail', function (req, res, next) {
    console.log('view mail');

    res.render('view_mail');
});

router.get('/contentMail', function (req, res, next) {
    console.log('content mail');

    res.render('content_mail');
});


router.get('/loginAPI', function (req, res, next) {
    console.log('login api test');

    res.render('login_api_test');
});

router.get('/loginapi/callback', function (req, res, next) {
    console.log('loginapi callback');

    res.render('loginapi_callback');
});

router.get('', function (req, res, next) {
    console.log('login api test');

    res.render('login_api_test');
});

router.get('/naverlogin', function (req, res, next) {
    console.log('naver login');

    res.render('naverlogin');
});

// 네이버 로그인 콜백(세션) : 토큰 조회
router.get('/callbackSession', function (req, res, next) {
    try {
        console.log('callback Session');
        code = req.query.code;
        state = req.query.state;
        api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
            + client_id + '&client_secret=' + client_secret + '&redirect_uri='
            + redirectURI + '&code=' + code + '&state=' + state;
        var options = {
            url: api_url,
            headers: { 'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret }
        };
        request.get(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var obj = JSON.parse(body);

                _accessToken = obj.access_token;
                _refreshToken = obj.refresh_token;

                console.log(_accessToken);
                console.log(_refreshToken);

                res.redirect('/memberSession');
                /* res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
                res.end(body); */
            } else {
                res.status(response.statusCode).end();
                console.log('error = ' + response.statusCode);
            }
        });
    }
    catch (err) {
        console.log(err);
    }
});

// 네이버 로그인 콜백(JWT) : 토큰 조회
router.get('/callbackJwt', function (req, res, next) {
    try {
        console.log('callback Jwt');
        code = req.query.code;
        state = req.query.state;
        api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
            + client_id + '&client_secret=' + client_secret + '&redirect_uri='
            + redirectURI + '&code=' + code + '&state=' + state;
        var options = {
            url: api_url,
            headers: { 'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret }
        };
        request.get(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var obj = JSON.parse(body);

                _accessToken = obj.access_token;
                _refreshToken = obj.refresh_token;

                console.log(_accessToken);
                console.log(_refreshToken);

                res.redirect('/memberJwt');
                /* res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
                res.end(body); */
            } else {
                res.status(response.statusCode).end();
                console.log('error = ' + response.statusCode);
            }
        });
    }
    catch (err) {
        console.log(err);
    }
});

// 사용자 정보 조회, MSSQL 데이터 INSERT (세션)
router.get('/memberSession', function (req, res, next) {
    try {
        console.log('memeber Session');
        var loginAccessToken = _accessToken;
        var header = "Bearer " + loginAccessToken; // Bearer 다음에 공백 추가

        // 세션에 토큰 넣기
        req.session.accessToken = _accessToken;
        req.session.refreshToken = _refreshToken;
        console.log(req.session);   // req.session -> 세션 사용
        req.session.save();

        var api_url = 'https://openapi.naver.com/v1/nid/me';
        var request = require('request');
        var options = {
            url: api_url,
            headers: { 'Authorization': header }
        };
        request.get(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var obj = JSON.parse(body);

                // 프로필 정보 가져오기
                var id = obj.response.id;
                var nickname = obj.response.nickname;
                var profile_image = obj.response.profile_image;
                var age = obj.response.age;
                var gender = obj.response.gender;
                var email = obj.response.email;
                var mobile = obj.response.mobile;
                var mobile_e164 = obj.response.mobile_e164;
                var name = obj.response.name;
                var birthday = obj.response.birthday;
                var birthyear = obj.response.birthyear;
                var fmDate = new Date();

                /* res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
                res.end(JSON.stringify(obj)); */

                // MSSQl에 프로필정보 저장
                mssql.connect(config, function (err) {
                    console.log('mssql connect');
                    var mssqlRequest = new mssql.Request();
                    var queryString = "EXEC p_SLI '" + _accessToken + "', '" + _refreshToken + "'";
                    mssqlRequest.query(queryString, function (err, result) {
                        var returnData = result.recordset;
                        console.log(returnData[0].p_result);
                        if (returnData[0].p_result == '자동로그인') {
                            console.log('There is');

                            // 자동로그인
                            res.redirect('/welcomesession');

                        } else if (returnData[0].p_result == '업데이트') {
                            console.log('accessToken update');

                            // accessToken update
                            var updateQuery = "EXEC p_SLI_U '" + _accessToken + "', '" + _refreshToken + "', '" + fmDate.toLocaleString() + "'";
                            mssqlRequest.query(updateQuery, function (err, updateResult) {
                                var returnData = result.recordset;
                                console.log(returnData);

                                req.session.accessToken = _accessToken;

                                // 자동로그인
                                res.redirect('/welcomesession');
                            });

                        } else if (returnData[0].p_result == '사용자등록') {
                            console.log('Insert');
                            var insertQuery = "INSERT INTO tSLI VALUES ('"
                                + id + "', '"
                                + nickname + "', '"
                                + profile_image + "', '"
                                + age + "', '"
                                + gender + "', '"
                                + email + "', '"
                                + mobile + "', '"
                                + mobile_e164 + "', '"
                                + name + "', '"
                                + birthday + "', '"
                                + birthyear + "', '"
                                + _accessToken + "', '"
                                + _refreshToken + "', '"
                                + fmDate.toLocaleString() + "');";
                            mssqlRequest.query(insertQuery, function (err, insertResult) {
                                console.log('OK');
                                res.redirect('/welcomesession');
                            })
                        }
                    })
                })
            } else {
                console.log('error');
                if (response != null) {
                    res.status(response.statusCode).end();
                    console.log('error = ' + response.statusCode);
                }
            }
        });
    }
    catch (err) {
        console.log(err);
    }
});

// 사용자 정보 조회, MSSQL 데이터 INSERT (Jwt)
router.get('/memberJwt', function (req, res, next) {
    console.log('memeber Jwt');
    var loginAccessToken = _accessToken;
    var header = "Bearer " + loginAccessToken; // Bearer 다음에 공백 추가

    // JWT 생성
    var token = jwt.sign({
        // 내용
        accessToken: _accessToken,
        refreshToken: _refreshToken
    },
        // 시크릿키(인증키)
        secret_key
        , {
            // 옵션
            expiresIn: '365days'
        });
    console.log("token : ", token);

    var api_url = 'https://openapi.naver.com/v1/nid/me';
    var request = require('request');
    var options = {
        url: api_url,
        headers: { 'Authorization': header }
    };
    request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var obj = JSON.parse(body);

            // 프로필 정보 가져오기
            var id = obj.response.id;
            var nickname = obj.response.nickname;
            var profile_image = obj.response.profile_image;
            var age = obj.response.age;
            var gender = obj.response.gender;
            var email = obj.response.email;
            var mobile = obj.response.mobile;
            var mobile_e164 = obj.response.mobile_e164;
            var name = obj.response.name;
            var birthday = obj.response.birthday;
            var birthyear = obj.response.birthyear;
            var fmDate = new Date();

            /* res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
            res.end(JSON.stringify(obj)); */

            // MSSQl에 프로필정보 저장
            mssql.connect(config, function (err) {
                console.log('mssql connect');
                var mssqlRequest = new mssql.Request();
                var queryString = "EXEC p_SLI '" + _accessToken + "', '" + _refreshToken + "'";
                mssqlRequest.query(queryString, function (err, result) {
                    var returnData = result.recordset;
                    console.log(returnData[0].p_result);
                    if (returnData[0].p_result == '자동로그인') {
                        console.log('There is');

                        res.clearCookie('user');
                        // JWT로 쿠키 생성
                        res.cookie("user", token, {
                            maxAge: 31557600000 // 1년
                        });
                        // 자동로그인
                        res.redirect('/welcomejwt');

                    } else if (returnData[0].p_result == '업데이트') {
                        console.log('accessToken update');

                        // accessToken update
                        var updateQuery = "EXEC p_SLI_U '" + _accessToken + "', '" + _refreshToken + "', '" + fmDate.toLocaleString() + "'";
                        mssqlRequest.query(updateQuery, function (err, updateResult) {
                            var returnData = result.recordset;
                            console.log(returnData);

                            res.clearCookie('user');
                            // JWT로 쿠키 생성
                            res.cookie("user", token, {
                                maxAge: 31557600000 // 1년
                            });

                            // 자동로그인
                            res.redirect('/welcomejwt');
                        });

                    } else if (returnData[0].p_result == '사용자등록') {
                        console.log('Insert');
                        var insertQuery = "INSERT INTO tSLI VALUES ('"
                            + id + "', '"
                            + nickname + "', '"
                            + profile_image + "', '"
                            + age + "', '"
                            + gender + "', '"
                            + email + "', '"
                            + mobile + "', '"
                            + mobile_e164 + "', '"
                            + name + "', '"
                            + birthday + "', '"
                            + birthyear + "', '"
                            + _accessToken + "', '"
                            + _refreshToken + "', '"
                            + fmDate.toLocaleString() + "');";
                        mssqlRequest.query(insertQuery, function (err, insertResult) {
                            console.log('OK');
                            // JWT로 쿠키 생성
                            res.cookie("user", token, {
                                maxAge: 31557600000 // 1년
                            });
                            res.redirect('/welcomejwt');
                        })
                    }
                })
            })
        } else {
            console.log('error');
            if (response != null) {
                res.status(response.statusCode).end();
                console.log('error = ' + response.statusCode);
            }
        }
    });
});


router.get('/welcomesession', function (req, res, next) {
    console.log('welcome session');

    res.render('welcome_session');
});

router.get('/welcomejwt', function (req, res, next) {
    console.log('welcome jwt');

    res.render('welcome_jwt');
});

//리치 에디트 글 화면 이후 글 작성으로 넘어갈 화면임
// router.get('/editor',function(req,res,next){
//     console.log('listen editor!!');
//     res.render('editor');
// })


//작성한 글 불러오기
router.get('/editor/:number', function (req, res) {

    try {
        let board_number = req.params.number;
        mssql.connect(config, function (err) {

            var request = new mssql.Request();
            let query = "SELECT C_i, C_Text FROM tC WHERE C_i = " + board_number + ";"
            request.query(query, function (err, result) {
                // res.json({data : result.recordset});
                console.log('testjson', result.recordset[0]);
                res.render('editor', { data: result.recordset[0] })
                // res.render('editor');
            })
        });
    } catch (err) {
        console.log('error fire', err)
    }
})


// //ckeditor
// router.get('/ckeditor',function(req,res,next){
//     console.log('ckeditor!');
//     res.render('ckeditor');
// })

router.post('/api/SaveDocument', function (req, res) {
    var fileAsBase64 = req.body.base64;
    var fileName = req.body.fileName;
    var format = req.body.format;
    var reason = req.body.reason;
    console.log('nice nice');
    fs.writeFile(`${fileName}.${getDocumentExtension(format)}`, fileAsBase64, 'base64', (err) => { });
    res.sendStatus(200);
});


function getDocumentExtension(format) {
    switch (format) {
        case '4': return "docx";
        case '2': return "rtf";
        case '1': return "txt";
    }
    return "docx";
}


////////  DevExtreme

//웹 에디터
// router.get('/dev',function(req,res){
//   res.render('dev_test');
// })


//드래그 테이블
router.get('/drag', function (req, res, next) {
    console.log('ckeditor!');
    res.render('board_drag');
})

module.exports = router;