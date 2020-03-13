/* http보다 개선된 express 모듈을 이용한 서버구축!
express 모듈은 미들웨어가 많이 지원된다.
Node.js에서의 미들웨어는 함수로 정의되어 있다.
express framework가 실무에서 많이 사용됨!
*/
var express = require("express"); //외부 모듈 
var app = express(); //객체 생성 
var fs = require("fs");
var ejs = require("ejs"); //서버에서 해석 및 실행되는 ejs파일 제어 모듈 
                          //php, asp, jsp와 동일 
var bodyParser = require("body-parser");
var mysql = require("mysql"); //external

var conStr ={
    host:"localhost",
    user:"root",
    password:"1234",
    database:"ios"
}

//정적자원은 라우팅의 대상이 아니다. 따라서 정적자원의 위치를 지정하면 
//별도의 라우팅이 필용없다.(스프링의 경우엔 요청을 처리할 컨트롤러 지정이 필요없다.)
//__dirname : node.js의 전역변수 중 하나(웹서버의 루트 경로를 반환)
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended:true}));

//게시판 글등록 요청 처리 
app.post("/notice/regist", function(request, response){
    console.log("넘어온 파라미터는", request.body);

    var con = mysql.createConnection(conStr);
    con.connect();

    var sql = "insert into notice(title, writer, content) values(?,?,?)";
    con.query(sql, [request.body.title, request.body.writer, request.body.content], function(error, result, fields){
        if(error){
            console.log(error);
        }else{
            console.log("등록성공", result);
            response.redirect("/notice/list"); //지정한 url로 재접속을 명령!
        }
        con.end();
    });
});

/*
//게시판 목록 요청 - 클라이언트의 기종에 종속되면 안된다!
                 서버는 다양한 디바이스에 대응해야 한다!
                 데이터전송은 되도록이면 중립적 형태의 데이터로 보내야 한다.(XML,JSON)
app.get("/notice/list", function(request, response){
    console.log(request.query);

    fs.readFile("./notice/list.ejs", "utf8", function(error, data){
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        response.end(ejs.render(data, {params:request.query}));
    });
});
*/
//중립적으로 보내기
app.get("/notice/list", function(request, response){
    var con = mysql.createConnection(conStr);
    con.connect();
    var sql = "select * from notice order by notice_id desc";
    con.query(sql, function(error, result, fields){
        if(error){
            console.log(error);
        }else{
            //클라이언트의 종류를 알 수 없으므로, 중립적 형태의 데이터인 json으로 응답하자!
            console.log(result);
            var recode={
                list:result
            }
            response.writeHead(200, {"Content-Type":"text/json; charset=utf-8"});
            response.end(JSON.stringify(recode));
        }
        con.end()
    });
});

//글 한건 삭제 요청 처리 
app.get("/notice/del", function(request, response){
    var con = mysql.createConnection(conStr);
    con.connect();

    var sql="delete from notice where notice_id=?";
    console.log("넘겨받은 notice_id =", request.query.notice_id);
    console.log("넘겨받은 test =", request.query.test);

    con.query(sql, [request.query.notice_id], function(error, result, fields){
        if(error){
            console.log(error);
            
        }else{
            var json={
                code:1,
                msg:"삭제완료"
            }
            response.writeHead(200, {"Content-Type":"text/json"});
            response.end(JSON.stringify(json));
        }
        con.end();
    });
});


app.listen(7777, function(){
    console.log("The server is running at 7777 port...");
});
