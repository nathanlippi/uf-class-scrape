var scraper = require('scraper'),
    $ = require('jquery'),
    mysql = require('mysql');

var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'password',
  database : 'uf_classes'
});
connection.connect();

// Also can be retrieved using scraping (combo box)
var depts = ['accounts', 'advertis', 'aframstu', 'afrstudi', 'agribioe', 'agriedco', 'agriopma', 'agriture', 'agronomy', 'animalsc', 'anthropo', 'applphys', 'architec', 'arthisto', 'astronom', 'bibozobi', 'bibozobo', 'bibozozo', 'biomedeg', 'biostati', 'building', 'business', 'chemical', 'chemistr', 'civcseng', 'classicc', 'classicg', 'classicl', 'clinicap', 'computer', 'corrstud', 'denodiag', 'desconpl', 'digworld', 'economic', 'educahdo', 'educasep', 'educattl', 'electric', 'engingen', 'englishs', 'entomolo', 'envglohe', 'environm', 'envrhort', 'epidemio', 'european', 'famscien', 'finances', 'finearts', 'firstyrf', 'foodreso', 'foodscie', 'forestry', 'geograph', 'geoscien', 'healthed', 'healthop', 'healthpr', 'healthsa', 'historys', 'honorspr', 'horticul', 'industri', 'informat', 'interdis', 'interior', 'jewishst', 'journali', 'landscap', 'langaaaa', 'langakan', 'langamha', 'langarab', 'langchin', 'langczec', 'langdutc', 'langfren', 'langgerm', 'langhait', 'langhebr', 'langhind', 'langital', 'langjapa', 'langpoli', 'langruss', 'langswah', 'langviet', 'langwolo', 'langxhos', 'langyoru', 'latiname', 'lawschoo', 'linguist', 'manageme', 'marketin', 'masscomm', 'material', 'mathemat', 'mechaero', 'mediaaaa', 'medianat', 'medianes', 'medibioc', 'medicomm', 'mediemrg', 'medigene', 'medimole', 'medineur', 'medineus', 'medinsur', 'mediobst', 'mediopht', 'mediortr', 'mediotol', 'medipath', 'medipedi', 'mediphar', 'mediphas', 'mediphys', 'medipsyc', 'mediradi', 'mediraon', 'medisurg', 'medivals', 'microbio', 'miliafor', 'miliarmy', 'milinavy', 'musicapp', 'natresou', 'nuclearr', 'nursinga', 'nursingh', 'nursingw', 'occupati', 'packagsc', 'pharcchm', 'pharceop', 'pharcets', 'phardyna', 'pharprac', 'philosop', 'physical', 'physicss', 'plantpat', 'politica', 'psycholo', 'pubhealt', 'publicre', 'rehbsci2', 'religion', 'soccrimi', 'socsocio', 'soilwatr', 'spaporpo', 'spaporsp', 'speechlh', 'statcals', 'statisti', 'telecomm', 'theadanc', 'tourismr', 'urbanreg', 'veterina', 'wildlife', 'womenstu', 'writprog', 'writtenc'];

var dept_urls = [];

// Get dept-urls filled & formatted properly
$.each(depts, function(i, dept)
    {
        dept_urls.push("http://www.registrar.ufl.edu/soc/201208/all/"+dept+".htm"); });

var _course_code = '';
var _credits = '';
var _course_url = '';
var _course_title = '';
var _instructors = '';

scraper(dept_urls, function(err, $)
    {
        var table_rows = $('table:eq(1) tr');
        $.each(table_rows, function(i, row) {
            var course_code = $('td:eq(0) a', row).html();
            if(course_code == '')
                course_code == _course_code;

            if(typeof course_code == 'string' && course_code.length >= 8)
            {
                var credits = $.trim($('td:eq(6)', row).html());
                var days = $('td:eq(7)', row).html();
                var period = $('td:eq(8)', row).html();
                var course_title = $('td:eq(12) a', row).html();
                var course_url = $('td:eq(12) a', row).attr('href');
                var instructors = $('td:eq(13)', row).html();

                // The below mess of code could be done a lot more elegantly by
                // grouping data in objects
                if(credits == '')
                    credits = _credits;
                if(course_url == '')
                    course_url = _course_url;
                if(course_title == '')
                    course_title = _course_title;
                if(instructors == '')
                    instructors = _instructors;
                    
                _course_code = course_code;
                _credits = credits;
                _course_url = course_url;
                _course_title = course_title;
                _instructors = instructors;

                var course_obj = {
                    course_title: course_title,
                    course_code: course_code.split(' ')[1].replace(/\D/g, ''),
                    dept_code: course_code.split(' ')[0],
                    url: course_url,
                    credits: credits,
                    days: days,
                    period: period,
                    instructors: instructors
                };
                add_data(course_obj);
            }
            else {
                console.log('COURSE CODE MAY NOT BE CORRECT: '+course_code);
            }
        });
    }, {'reqPerSec': 2 });

function add_data(course_obj) {
    var sql = "INSERT IGNORE INTO classes SET ?";

    connection.query(sql, course_obj,
                     function(err, rows, fields) {
        if(err) {
            console.log('UPDATE ERROR: '+JSON.stringify(err));
        } else {
            console.log('DATA ADDED.');
        }
        console.log(JSON.stringify(course_obj));
    });
}
