(function() {
    'use strict';

    window.TaitanLab = window.taitanLab || {};
    window.TaitanLab.Common = window.TaitanLab.Common || {};

    //共通関数
    window.TaitanLab.Common.Util = {

         testCall: function() {
             alert('呼び出しに成功しました');
         },

        /**
         * 数値文字列にカンマ区切りにする
         * @param  {string} numberString 数値文字列。
         * @returns {string} カンマ区切りの数値文字列
         */
        insertCommaDelimiter: function(numberString) {
            return String(numberString).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        },

        /**
         * カンマ区切りの数値文字列を数値にする
         * @param  {string} numberString 数値文字列。
         * @returns {number} カンマを取り除いた数値
         */
        removeCommaDelimiter: function(numberString) {
            return Number(numberString.replace(/,/g, ''));
        }
    };

})();
