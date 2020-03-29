'use strict';
//node.jsに用意されたモジュールを呼び出す
//fsはFileSystemの略で、ファイルを扱うためのモジュール。
//readlineはファイルを1行ずつ読み込むためのモジュール。

const fs = require("fs");
const readline = require("readline");

//popu-pref.csvファイルから、ファイルの読み込みを行うStreamを生成し、
//それをreadlineオブジェクトのinputとして設定、rlオブジェクトを生成する。

const rs = fs.createReadStream("popu-pref.csv");
const rl = readline.createInterface({"input": rs,"output": {}});
const prefectureDataMap = new Map(); //key:都道府県 value: 集計データのオブジェクト
//Streamのインターフェースを利用する。rlオブジェクトでlineというイベントが発生したら、
//この無名関数をよぶ
rl.on("line",(lineString) => {
    
/*アロー関数の処理の中で、console.logを使っているので、lineイベントが発生したタイミングで、
コンソールに引数lineStringの内容が出力されることになる。*/
//引数lineStringで与えられた文字列を,で分割して、それをcolmunsという名前の配列にする。
    const columns = lineString.split(",");

//columnsの要素へアクセスして、集計年[0]都道府県[1]15〜19歳の人口[3]をそれぞれ変数に保存する。
//parseIntは文字列を整数値に変換する関数。
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    if (year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture);
        if(!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
    if (year === 2010) 
    {
            value.popu10 = popu;
    }
    if (year === 2015)
    {
        value.popu15 = popu;
    }
prefectureDataMap.set(prefecture, value);
      
    }
});
rl.on("close", () => {
    //都道府県ごとの変化率を計算する。
    //for of構文は、mapやarrayの中身をofの前に与えられた変数に代入してforループと同じことができる。
    for (let [key, value] of prefectureDataMap) {
        //集計データのオブジェクトvalueのchangeプロパティに、変化率を代入する。
        value.change = value.popu15 / value.popu10;
    }//Array.fromで連想配列を普通の配列に変換する処理を行う。
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });
    const rankingStrings = rankingArray.map(([key, value]) => {
        return key + ": " + value.popu10 + "=>" + value.popu15+ " 変化率:" + value.change;
    });
    console.log(rankingStrings);
});