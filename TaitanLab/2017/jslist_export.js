(function(){'use strict';var p='\t';var q='\r\n';var r=kintone.app.getId();function exportHTML(f){var g={"&":"&amp;","'":"&#x27;","`":"&#x60;","\"":"&quot;","<":"&lt;",">":"&gt;"};var h=function(b){return b.replace(/[&"'`\\<>]/g,function(a){return g[a]})};var j=function(a){var b="<table id=\"table\">\n";var c=a[0].split(p);b=b+"<thead><tr class=\"header-row row\">\n";for(var m=0;m<c.length;m++){b=b+"<th class=\"cell\">"+h(c[m])+"</th>\n"}b=b+"</tr></thead>\n";b=b+"<tbody>\n";for(var i=1;i<a.length;i++){var d=a[i];var e=d.split(p);b=b+"<tr class=\"row\">\n";for(var m=0;m<e.length;m++){b=b+"<td class=\"body-cell cell\">"+h(e[m])+"</td>\n"}b=b+"</tr>\n"}b=b+"</tbody>\n"+"</table>\n";return b};var k=function(a){var b=a.split(q);var c="JS/CSSリスト(ID:"+r+")";var d=j(b);return"<html>\n"+"<head>\n"+"<meta charset=\"utf-8\">\n"+"<link\n"+"href=\"https://rawgit.com/TakahiroTai/TaitanLab/master/TaitanLab/2017/form_output.css\"\n"+"rel=\"stylesheet\"\n"+"crossorigin=\"anonymous\">\n"+"</head>\n"+"<body>\n"+"<div class=\"caption\">"+c+"</div>\n"+d+"</body>\n"+"</html>"};var l=k(f);var n=new File([l],"JS-CSSリスト.html",{type:"text/html"});var o=URL.createObjectURL(n);window.open(o)}function getFileData1(a,b){var c=b||"-";var d=a.type||"-";var e=a.url||(a.file?a.file.name:"(なし)");return[c,d,e].join(p)}function json2Csv(a){var b=["ファイル種別"+p+"区分"+p+"ファイル名"];var c=a.desktop;var d=c.js;var e=c.css;if(d.length===0&&e.length===0){b=b.concat(getFileData1({},""));return b}for(var m=0;m<d.length;m++){var f=d[m];b=b.concat(getFileData1(f,"JS"))}for(var n=0;n<e.length;n++){var g=e[n];b=b.concat(getFileData1(g,"CSS"))}return b}function getCustomizeData(){var a={"app":r};return kintone.api(kintone.api.url('/k/v1/preview/app/customize',true),'GET',a)}function exportJSList(){getCustomizeData().then(function(a){return json2Csv(a)}).then(function(a){var b=a.join(q);exportHTML(b)}).catch(function(e){alert(e.message);console.log(e)})}function createButton(a){if(!document.getElementById('output_js_button')){var b=document.createElement('button');b.id='output_js_button';b.innerText='JSリスト出力';b.style.marginRight='20px';a.appendChild(b);document.getElementById('output_js_button').addEventListener('click',exportJSList,false)}}function showButton(a){var b=kintone.app.record.getHeaderMenuSpaceElement();createButton(b)}function showButton2(a){var b=kintone.app.getHeaderMenuSpaceElement();createButton(b)}kintone.events.on(['app.record.detail.show'],showButton);kintone.events.on(['app.record.index.show'],showButton2)})();