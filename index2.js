"use strict";

const sizeOf = require('image-size');
const path = require('path');
const { mkdirSync, readdir, readdirSync, writeFileSync } = require('fs');

const photoSrc = './dist/';
const photoDist = './dist/';
const subAlbum = readdirSync(photoSrc);

for (var i in subAlbum) {
    const subAlbumSrc = photoSrc + subAlbum[i] + '/';
    const subAlbumDist = photoDist + subAlbum[i] + '/';
    const output = subAlbumDist + subAlbum[i] + '-list.json';
    try {
        mkdirSync(subAlbumDist, { recursive: true });
    } catch ({ code }) {
        if (code !== 'EEXIST') throw code;
    }

    readdir(subAlbumSrc, function (err, files) {
        if (err) { return; }
        var dimensions;
        let arr = [];
        let imgext = ['.jpg', '.jpeg', '.png'];
        for (var j in files) {
            if (imgext.includes(path.extname(files[j]).toLowerCase())) {
                dimensions = sizeOf(subAlbumSrc + files[j]);
                console.log(dimensions.width, dimensions.height, files[j]);
                arr.push(dimensions.width + '.' + dimensions.height + ' ' + files[j]);
            }
            if (j == files.length - 1) {
                // minify JSON
                writeFileSync(output, JSON.stringify(arr));
                // not minify JSON
                //writeFileSync(output, JSON.stringify(arr, null, "\t"));
            }
        }
    });
}