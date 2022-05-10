"use strict";

const sizeOf = require('image-size');
const { mkdirSync, readdir, readdirSync, writeFileSync, stat } = require('fs');

var dimensions;
const photoSrc = './photos/';
const photoDist = './dist/';
const subAlbum = readdirSync(photoSrc);

for(var i in subAlbum) {
    const subAlbumSrc = photoSrc + subAlbum[i] + '/';
    const subAlbumDist = photoDist + subAlbum[i] + '/';
    const output = subAlbumDist + subAlbum[i] + '-list.json';
    try {
        mkdirSync(subAlbumDist, {recursive: true});
    } catch ({ code }) {
        if (code !== 'EEXIST') throw code;
    }

    readdir(subAlbumSrc, function (err, files) {
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
            stat(subAlbumSrc + files[index], function (err, stats) {
                if (err) {
                    return;
                }
                if (stats.isFile()) {
                    dimensions = sizeOf(subAlbumSrc + files[index]);
                    console.log(dimensions.width, dimensions.height);
                    arr.push(dimensions.width + '.' + dimensions.height + ' ' + files[index]);
                }
                iterator(index + 1);
            })
        }(0));
    });
}