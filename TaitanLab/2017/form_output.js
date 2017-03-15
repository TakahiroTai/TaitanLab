(function() {
    'use strict';

    var F_APPID = 'アプリID';
    var F_RESULT = '出力結果';

    var PART_STR = '\t'; //仕切り文字
    var RETURN_STR = '\r\n'; //改行文字
    var OPPART_STR = '@@@'; //複数選択値項目の仕切り文字

    // function getFieldData5(prop) {
    //     var type = prop.type;
    //     var required = prop.required ? "必須" : "";
    //     var op = (function(){
    //         var t1 = '[関連レコード一覧情報]';
    //         var t2 = '参照元アプリID：' + prop.referenceTable.relatedApp.app;
    //         var v = [t1, t2, '***表示フィールド***'];
    //         for (var i in prop.referenceTable.displayFields) {
    //             var option = prop.referenceTable.displayFields[i];
    //             v.push(option);
    //         }
    //         return v.join(OPPART_STR);
    //     })(prop);

    //     // return setRowData(prop.code, prop.label, type, op, required);
    //     return prop.label + PART_STR +
    //         prop.code + PART_STR +
    //         type + PART_STR +
    //         op + PART_STR +
    //         required;
    // }

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

    var createJsListTable = function(list) {
        var table ="<table class=\"table table-bordered\">\n";

        for (var i = 0; i < list.length; i++) {
            var infAry = list[i].split("\t");
            if (i === 0) {
                table = table + "<thead>\n";

                for (var m = 0; m < infAry.length; m++) {
                    table = table + "<th>" + escapeHTML(infAry[m]) + "</th>\n";
                }
                table.slice(0, -2);
                table = table + "</thead>\n" +
                "<tbody>\n";
            } else {
                table = table + "<tr>";
                for (var m = 0; m < infAry.length; m++) {
                    table = table + "<td>" + (function(data) {
                        if (!/\@\@\@/.test(data)) { return escapeHTML(data); }
                        return "<ul>" + data.split("@@@").map(function(op) {
                            return "<li>" + escapeHTML(op) + "</li>";
                        }).join("") + "</ul>";
                    })(infAry[m]) + "</td>";
                }
                table = table + "</tr>";

                if (i === list.length - 1) {
                    table = table + "</tbody>\n" +
                    "</table>";
                }
            }
        }
        return table;
    };

    var createHTML = function(list) {
        var filesAry = list.split("\n");
        var jsTable = createJsListTable(filesAry);  //出力する中身を作成
        return "<html>\n" +
            "<head>\n" +
            "<link\n" +
                "href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\"\n" +
                "rel=\"stylesheet\"\n" +
                "integrity=" +
                    "\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\"\n" +
                "crossorigin=\"anonymous\">\n" +
            "</head>\n" +
            "<body>\n" +
                "<h1>" + "設計情報" + "</h1>\n" +
                    jsTable +
            "</body>\n" +
        "</html>";
    };

    /**
     * HTML生成
     *
     */
    function exportHTML(exp_val) {
        var html = createHTML(exp_val);
        var htmlFile = new File([html], "JS-CSSリスト.html", {type: "text/html"});
        var url = URL.createObjectURL(htmlFile);
        window.open(url);
    }

    function getFieldData4(prop, istable) {
        var type = istable ? '[TABLE]' + prop.type : prop.type;
        var required = prop.required ? "必須" : "";
        var unique = prop.unique ? "重複禁止" : "";
        var op = (function() {
            var v = [];
            for (var i in prop.options) {
                if (!prop.options.hasOwnProperty(i)) { continue; }
                var option = prop.options[i];
                var index = parseInt(option.index, 10);
                v[index] = option.label;
            }
            return v.join(OPPART_STR);
        })(prop);
        return [prop.label, prop.code, type, op, required, unique].join(PART_STR);
    }

    function getFieldData3(prop, istable) {
        var type = istable ? '[TABLE]' + prop.type : prop.type;
        var required = prop.required ? "必須" : "";
        var unique = prop.unique ? "重複禁止" : "";
        var op = (function() {
            var v = [];
            for (var i in prop.options) {
                if (!prop.options.hasOwnProperty(i)) { continue; }
                var option = prop.options[i];
                v.push(option.label);
            }
            return v.join(OPPART_STR);
        })(prop);
        return [prop.label, prop.code, type, op, required, unique].join(PART_STR);
    }

    function getFieldData2(prop, istable) {
        var type = istable ? '[TABLE]LOOKUP_' + prop.type : 'LOOKUP_' + prop.type;
        var op = (function() {
            var v = ['***ルックアップ時のコピー先フィールド***'];
            var arr = prop.lookup.fieldMappings;
            for (var i in arr) {
                if (!arr.hasOwnProperty(i)) { continue; }
                v.push(arr[i].field);
            }
            return v.join(OPPART_STR);
        })(prop);
        var required = prop.required ? "必須" : "";
        var unique = prop.unique ? "重複禁止" : "";
        return [prop.label, prop.code, type, op, required, unique].join(PART_STR);
    }

    function getFieldData1(prop, istable) {
        var label = prop.label ? prop.label : "";
        var type = istable ? '[TABLE]' + prop.type : prop.type;
        var required = prop.required ? "必須" : "";
        var unique = prop.unique ? "重複禁止" : "";
        return [label, prop.code, type, '', required, unique].join(PART_STR);
    }

    function table2Csv(table, map) {
        var tablecsv = [];
        for (var i in table.fields) {
            if (!table.fields.hasOwnProperty(i)) { continue; }
            var prop = table.fields[i];

            switch (prop.type) {
                case 'SINGLE_LINE_TEXT':
                case 'NUMBER':
                    if (!prop.lookup) {
                        // 一行テキスト系
                        tablecsv[map[prop.code]] = getFieldData1(prop, true);
                    } else {
                        // ルックアップ
                        tablecsv[map[prop.code]] = getFieldData2(prop, true);
                    }
                    break;
                case 'RECORD_NUMBER':
                case '__ID__':
                case '__REVISION__':
                case 'CREATOR':
                case 'CREATED_TIME':
                case 'MODIFIER':
                case 'UPDATED_TIME':
                case 'CALC':
                case 'MULTI_LINE_TEXT':
                case 'RICH_TEXT':
                case 'FILE':
                case 'LINK':
                case 'DATE':
                case 'TIME':
                case 'DATETIME':
                case 'USER_SELECT':
                case 'STATUS_ASSIGNEE':
                case 'ORGANIZATION_SELECT':
                case 'GROUP_SELECT':
                    tablecsv[map[prop.code]] = getFieldData1(prop, true);
                    break;
                // case 'CATEGORY':
                    // tablecsv.push(getFieldData3(prop, true));
                    // tablecsv[map[prop.code]] = getFieldData3(prop, true);
                    // break;
                case 'REFERENCE_TABLE':
                    // csv.push(getFieldData4(prop));
                    break;
                // 複数選択系
                case 'CHECK_BOX':
                case 'DROP_DOWN':
                case 'RADIO_BUTTON':
                case 'MULTI_SELECT':
                    // tablecsv.push(getFieldData4(prop, true));
                    tablecsv[map[prop.code]] = getFieldData4(prop, true);
                    break;
                default:
                    break;
            }
        }
        return tablecsv;
    }

    function json2Csv(formdata, map) {
        var csv = ["表示名" + PART_STR + "フィールドコード" + PART_STR +
            "フィールドタイプ" + PART_STR + "選択肢" + PART_STR + "必須" + PART_STR + "重複"];
        var nodisp_fiels = [];

        for (var i in formdata.properties) {
            if (!formdata.properties.hasOwnProperty(i)) { continue; }
            var prop = formdata.properties[i];

            switch (prop.type) {
                case 'SUBTABLE':
                    var table = table2Csv(prop, map);
                    for (var t in table) {
                        csv[parseInt(t, 10)] = table[t];
                    }
                    break;
                case 'SINGLE_LINE_TEXT':
                case 'NUMBER':
                    if (!prop.lookup) {
                        // 一行テキスト系
                        csv[map[prop.code]] = getFieldData1(prop);
                    } else {
                        // ルックアップ
                        csv[map[prop.code]] = getFieldData2(prop);
                    }
                    break;
                // 一行テキスト系
                case 'RECORD_NUMBER':
                case '__ID__':
                case '__REVISION__':
                case 'CREATOR':
                case 'CREATED_TIME':
                case 'MODIFIER':
                case 'UPDATED_TIME':
                case 'CALC':
                case 'MULTI_LINE_TEXT':
                case 'RICH_TEXT':
                case 'FILE':
                case 'LINK':
                case 'DATE':
                case 'TIME':
                case 'DATETIME':
                case 'USER_SELECT':
                case 'STATUS_ASSIGNEE':
                case 'ORGANIZATION_SELECT':
                case 'GROUP_SELECT':
                    if (map[prop.code]) {
                        csv[map[prop.code]] = getFieldData1(prop);
                    } else {
                        nodisp_fiels.push(getFieldData1(prop));
                    }
                    break;
                // 複数選択系
                case 'CATEGORY':
                    if (map[prop.code]) {
                        csv[map[prop.code]] = getFieldData3(prop);
                    } else {
                        nodisp_fiels.push(getFieldData3(prop));
                    }
                    break;
                case 'REFERENCE_TABLE':
                    break;
                case 'CHECK_BOX':
                case 'DROP_DOWN':
                case 'RADIO_BUTTON':
                case 'MULTI_SELECT':
                    csv[map[prop.code]] = getFieldData4(prop);
                    break;
                default:
                    break;
            }
        }
        // レイアウトされていないフィールドを追加
        csv = csv.concat(nodisp_fiels);
        return csv;
    }

    function getLayoutOrder(formdata) {
        var field_map = [];
        var count = 1;
        for (var i in formdata.layout) {
            if (!formdata.layout.hasOwnProperty(i)) { continue; }
            var row = formdata.layout[i];

            if (row.type === 'SUBTABLE') {
                // SUBTABLE
                for (var j in row.fields) {
                    if (!row.fields.hasOwnProperty(j)) { continue; }
                    var fcode1 = row.fields[j].code;
                    var ftype1 = row.fields[j].type;

                    if (fcode1 && ftype1 !== 'REFERENCE_TABLE') {
                        field_map[fcode1] = count;
                        count++;
                    }
                }
            } else if (row.type === 'GROUP') {
                // GROUP
                for (var l in row.layout) {
                    if (!row.layout.hasOwnProperty(l)) { continue; }
                    var row2 = row.layout[l];
                    for (var t in row2.fields) {
                        if (!row2.fields.hasOwnProperty(t)) { continue; }
                        var fcode2 = row2.fields[t].code;
                        var ftype2 = row2.fields[t].type;

                        if (fcode2 && ftype2 !== 'REFERENCE_TABLE') {
                            field_map[fcode2] = count;
                            count++;
                        }
                    }
                }
            } else {
                // ROW
                for (var k in row.fields) {
                    if (!row.fields.hasOwnProperty(k)) { continue; }
                    var fcode3 = row.fields[k].code;
                    var ftype3 = row.fields[k].type;

                    if (fcode3 && ftype3 !== 'REFERENCE_TABLE') {
                        field_map[fcode3] = count;
                        count++;
                    }
                }
            }
        }
        return field_map;
    }

    function getFormLayoutMap() {
        function getFormLayoutData(record) {
            var body = {
                "app": record[F_APPID].value
            };
            return kintone.api(kintone.api.url("/k/v1/app/form/layout", true), "GET", body);
        }
        var event = kintone.app.record.get();
        var record = event.record;
        return getFormLayoutData(record).then(function(resp) {
            return getLayoutOrder(resp);
        });
    }

    function getFormDesign() {
        function getFormData(record) {
            var body = {
                "app": record[F_APPID].value
            };
            if (!record[F_APPID].value) {
                return Promise.reject(new Error(F_APPID + 'が入力されていません'));
            }
            return kintone.api(kintone.api.url("/k/v1/app/form/fields", true), "GET", body);
        }
        var event = kintone.app.record.get();
        var record = event.record;
        record[F_RESULT].value = '';
        kintone.app.record.set(event);

        getFormData(record).then(function(formdata) {
            return getFormLayoutMap().then(function(map) {
                return json2Csv(formdata, map);
            });
        }).then(function(array) {
            var csv = array.join(RETURN_STR);
            record[F_RESULT].value = csv;
            kintone.app.record.set(event);
            exportHTML(csv);
            return csv;
        }).catch(function(e) {
            console.log(e.message);
        });
    }

    function showButton(event) {
        var space = kintone.app.record.getSpaceElement('output_button');
        if (!document.getElementById('form_output')) {
            var button = document.createElement('button');
            button.id = 'form_output';
            button.innerText = '設計情報の取得';
            button.style.marginRight = '20px';
            space.appendChild(button);
            document.getElementById('form_output').addEventListener('click', getFormDesign, false);
        }
    }

    kintone.events.on(['app.record.create.show', 'app.record.edit.show'], showButton);
})();


