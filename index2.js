"use strict";

const sizeOf = require('image-size');
const path = require('path');
const { readdir, readdirSync, writeFileSync, stat } = require('fs');

var dimensions;
const photoSrc = './dist/';
const subAlbum = readdirSync(photoSrc);

for (var i in subAlbum) {
    const subAlbumSrc = photoSrc + subAlbum[i] + '/';
    const output = subAlbumSrc + subAlbum[i] + '-list.json';
    readdir(subAlbumSrc, function (err, files) {
        if (err) { return; }
        let arr = [];
        (function iterator(j) {
            if (j == files.length) {
                writeFileSync(output, JSON.stringify(arr));
                //writeFileSync(output, JSON.stringify(arr, null, "\t"));
                return;
            }
            stat(subAlbumSrc + files[j], function (err, stats) {
                if (err) {
                    return;
                }
                if (stats.isFile() && path.extname(files[j]) !== ".json") {
                    dimensions = sizeOf(subAlbumSrc + files[j]);
                    console.log(dimensions.width, dimensions.height, files[j]);
                    arr.push(dimensions.width + '.' + dimensions.height + ' ' + files[j]);
                }
                iterator(j + 1);
            })
        }(0));
    });
}