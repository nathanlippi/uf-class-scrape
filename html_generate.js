var mysql = require('mysql'),
    $ = require('jquery'),
    fs = require('fs');

var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'password',
  database : 'uf_classes'
});
connection.connect();

var sql = "SELECT * FROM classes WHERE LENGTH(course_code) > 3 && course_code > 4999 && course_code < 8000 LIMIT 10000";

connection.query(sql, function(err, rows) {
    if(err) {
        console.log('UPDATE ERROR: '+JSON.stringify(err));
    } else {
        console.log('DATA RETRIEVED:'+JSON.stringify(rows));
        var html = generate_html(rows);
        write_to_file(html);
    }
});

function generate_html(rows) {
    var fields = ['course_title', 'course_code', 'dept_code', 'url', 
                  'credits', 'days', 'period', 'instructors'];

    var str = '<html><body><table border="1">';
    
    $.each(rows, function(i, row) {
            str += "<tr>";
            $.each(fields, function(i, field) {
                var data = '';
                if(typeof row[field] == 'string') {
                    data = row[field];
                    if(field == 'url')   
                        data = "<a href='"+data+"'>"+data+"</a>";
                }

                str += "<td>"+data+"</td>";
            });
            str += "</tr>";
        });
    str += "</table></body></html>";
    return str;
}

function write_to_file(text)
{
    fs.writeFile("./output.html", text, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    }); 
}
