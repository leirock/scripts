'use strict';

hexo.extend.tag.register('album', function(args) {
  const cdnDomain = 'https://cdn.example.com'; //your cdn address
  const photoSrc = cdnDomain + '/album/' + args + '/';
  const jsonSrc = photoSrc + 'photolist.json';
  return `<style>.post-block{padding-left:10px;padding-right:10px;}</style>
  <div class="album" photo-src="${photoSrc}" json-src="${jsonSrc}"></div>`;
});
