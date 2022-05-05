"use strict";
const { mkdirSync, readdir, writeFileSync, stat } = require('fs');
const sizeOf = require('image-size');

var dimensions;

const folders = ['guangzhou', 'hongkong', 'taiwan'];

for(var i in folders) {
    try {
        mkdirSync('dist/' + folders[i], {recursive: true});
    } catch ({ code }) {
        if (code !== 'EEXIST') throw code;
    }

    const path = 'photos/' + folders[i];
    const output = 'dist/' + folders[i] + '/photolist.json';

    readdir(path, function (err, files) {
        if (err) {
            return;
        }
        let arr = [];
        (function iterator(index) {
            if (index == files.length) {
                writeFileSync(output, JSON.stringify(arr));
                //writeFileSync(output, JSON.stringify(arr, null, "\t"));
                return;
            }
            stat(path + "/" + files[index], function (err, stats) {
                if (err) {
                    return;
                }
                if (stats.isFile()) {
                    dimensions = sizeOf(path + "/" + files[index]);
                    console.log(dimensions.width, dimensions.height);
                    arr.push(dimensions.width + '.' + dimensions.height + ' ' + files[index]);
                }
                iterator(index + 1);
            })
        }(0));
    });

}