(function() {
    'use strict';

    var PART_STR = '\t'; //仕切り文字
    var RETURN_STR = '\r\n'; //改行文字
    var APP_ID = kintone.app.getId();

    var escapeList = {
        "&": "&amp;",
        "'": "&#x27;",
        "`": "&#x60;",
        "\"": "&quot;",
        "<": "&lt;",
        ">": "&gt;"
    };

    /**
     * エスケープ処理
     *
     */
    var escapeHTML = function(src) {
        return src.replace(/[&"'`\\<>]/g, function(match) {
            return escapeList[match];
        });
    };

    var createTable = function(list) {
        var table ="<table id=\"table\">\n";
        var headerAry = list[0].split(PART_STR);

        //ヘッダー処理
        table = table + "<thead><tr class=\"header-row row\">\n";
        for (var m = 0; m < headerAry.length; m++) {
            table = table + "<th class=\"cell\">" + escapeHTML(headerAry[m]) + "</th>\n";
        }
        table = table + "</tr></thead>\n";

        //ボディ処理
        table = table + "<tbody>\n";
        for (var i = 1; i < list.length; i++) {
            var fileInf = list[i];
            var bodyAry = fileInf.split(PART_STR);

            table = table + "<tr class=\"row\">\n";
            for (var m = 0; m < bodyAry.length; m++) {
                table = table + "<td class=\"body-cell cell\">" + escapeHTML(bodyAry[m]) + "</td>\n";
            }
            table = table + "</tr>\n";
        }
        table = table + "</tbody>\n" +
        "</table>\n";

        return table;
    };

    var createHTML = function(csv) {
        var fileAry = csv.split(RETURN_STR);
        var title = "JS/CSSリスト(ID:" + APP_ID + ")";
        var table = createTable(fileAry);  //出力する中身を作成
        return "<html>\n" +
            "<head>\n" +
            "<link\n" +
                "href=\"https://rawgit.com/TakahiroTai/TaitanLab/master/TaitanLab/2017/form_output.css\"\n" +
                "rel=\"stylesheet\"\n" +
                // "integrity=" +
                //     "\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\"\n" +
                "crossorigin=\"anonymous\">\n" +
            "</head>\n" +
            "<body>\n" +
                "<div class=\"caption\">" + title + "</div>\n" +
                    table +
            "</body>\n" +
        "</html>";
    };

    /**
     * HTML生成
     *
     */
    function exportHTML(csv) {
        var html = createHTML(csv);
        var htmlFile = new File([html], "JS-CSSリスト.html", {type: "text/html"});
        var url = URL.createObjectURL(htmlFile);
        window.open(url);
    }

    function getFileData1(f_obj, type) {
        var type1 = type || "-";
        var type2 = f_obj.type || "-";
        var name = f_obj.url || (f_obj.file ? f_obj.file.name : "(なし)");
        return [type1, type2, name].join(PART_STR);
    }

    function json2Csv(cstm_data) {
        var csv = ["ファイル種別" + PART_STR + "区分" + PART_STR + "ファイル名"];

        var desktop = cstm_data.desktop;
        var d_js = desktop.js;
        var d_css = desktop.css;

        //js,cssが存在しないアプリの対応
        if (d_js.length === 0 && d_css.length === 0) {
            csv = csv.concat(getFileData1({}, ""));
            return csv;
        }

        //jsリスト作成
        for (var m = 0; m < d_js.length; m++) {
            var jsObj = d_js[m];
            csv = csv.concat(getFileData1(jsObj, "JS"));
        }

        //csssリスト作成
        for (var n = 0; n < d_css.length; n++) {
            var cssObj = d_css[n];
            csv = csv.concat(getFileData1(cssObj, "CSS"));
        }
        return csv;
    }

    function getCustomizeData() {
        var body = {
            "app": APP_ID
        };
        return kintone.api(kintone.api.url('/k/v1/preview/app/customize', true), 'GET', body);
    }

    /**
     * JSリスト出力処理(取得準備)
     *
     */
    function exportJSList(sp_id) {
        getCustomizeData().then(function(cstm_data) {
            return json2Csv(cstm_data);
        }).then(function(array) {
            var csv = array.join(RETURN_STR);
            exportHTML(csv);
        }).catch(function(e) {
            alert(e.message);
            console.log(e);
        });
    }

    function createButton(space) {
        if (!document.getElementById('output_js_button')) {
            var button = document.createElement('button');
            button.id = 'output_js_button';
            button.innerText = 'JSリスト出力';
            button.style.marginRight = '20px';
            space.appendChild(button);

            document.getElementById('output_js_button').addEventListener('click', exportJSList, false);
        }
    }

    /**
     * JSリスト出力処理(呼び出し)
     *
     */
    function showButton(event) {
        var space = kintone.app.record.getHeaderMenuSpaceElement();
        createButton(space);
    }

    function showButton2(event) {
        var space = kintone.app.getHeaderMenuSpaceElement();
        createButton(space);
    }

    kintone.events.on(['app.record.detail.show'], showButton);
    // kintone.events.on(['app.record.create.show', 'app.record.edit.show'], showButton);
    kintone.events.on(['app.record.index.show'], showButton2);
})();
