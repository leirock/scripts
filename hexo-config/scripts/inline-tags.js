'use strict';

const cdnDomain = hexo.config.cos_domain;

hexo.extend.tag.register('album', function (args) {
  const photoSrc = cdnDomain + '/' + hexo.config.custom_page_path.album + '/' + args + '/';
  const jsonSrc = photoSrc + args + '-list.json';
  return `
      <style>
          .post-block { 
              padding-left: 10px;
              padding-right: 10px;
          }
      </style>
      <div class="album" photo-src="${photoSrc}" json-src="${jsonSrc}"></div>
  `;
});