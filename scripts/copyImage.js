'use strict';

var cheerio = require('cheerio');

const fs = require('hexo-fs');

/**
 * /Users/changan/Documents/study_projects/hexo-demo/blog/source/_posts/test-3.md
 *
 * {
 *   "fileName": "test-3.md",
 *   "dir": "/Users/changan/Documents/study_projects/hexo-demo/blog/source/_posts",
 *   "fileNameWithoutExt": "test-3"
 * }
 * @param path
 * @returns {{fileName: string, rootPath: string, dir: string}}
 */
function parsePath(path) {
    let splits = path.split("/")
    let fileName = splits[splits.length - 1]
    return {
        fileName: fileName,
        dir: path.split("/", splits.length - 1).join("/"),
        fileNameWithoutExt: fileName.substring(0, fileName.lastIndexOf(".")),
    }
}

hexo.extend.filter.register('new_post_path', function (data, replace) {
    let config = hexo.config;
    let parsed = parsePath(data);
    //hexo new post 请求创建一个同名目录，用于存放内容和资源目录
    let targetDir = parsed.dir + "/" + parsed.fileNameWithoutExt;
    if (fs.existsSync(targetDir)) {
        console.error("post [" + parsed.dir + "] already exists! plz use another name")
        throw targetDir + " already exists!";
    } else {
        console.debug("create dir %s", targetDir);
        fs.mkdirsSync(targetDir);
        //console.debug("create image dir %s", targetDir + "/" + config.post_image_dir);
        //fs.mkdirsSync(targetDir + "/" + config.post_image_dir);
    }
    return parsed.dir + "/" + parsed.fileNameWithoutExt + "/" + parsed.fileName;
});

//copy image to target dir
hexo.extend.filter.register('after_post_render', function (data) {
    let config = hexo.config;
    //2019/09/06/test/
    let parsed = parsePath(data.source);
    //image_dir
    let source_dir = hexo.base_dir + config.source_dir + "/_posts/" + parsed.fileNameWithoutExt + "/resource";
    let target_dir = hexo.base_dir + config.public_dir + "/" + data.path + "resource";
    fs.exists(source_dir).then((result) => {
        if (result) {
            console.debug("copy from %s to %s", source_dir, target_dir);
            fs.copyDir(source_dir, target_dir);
        }
    })
    return data;
});

hexo.extend.filter.register('post_permalink', function (data) {

    let splits = data.split("/")
    //2019/09/06/test/test/-->2019/09/06/test/
    let formatted = splits.slice(0, splits.length - 2).join("/")+"/"
    return formatted;
});



