# 挂载 OneDrive
# rclone mount onedrive:/Web/ /www/workspace/onedrive/ --allow-other --vfs-cache-mode writes

#-------------------------------------------
# 0. 初始化设置
#-------------------------------------------

# 使用前需要把本脚本中五处 {XXXXXXXX} 的相关参数填入

# 清空日志
cat /dev/null > /www/server/panel/plugin/webhook/script/{XXXXXXXX}.log

# 开始计时
start=$(date +%s)

# 设置 Telegram Bot 变量
TOKEN={XXXXXXXX}
CHAT_ID={XXXXXXXX}
MODE="HTML" #解析模式，可选HTML或Markdown
URL="https://api.telegram.org/bot${TOKEN}/sendMessage"
BTPANEL="https://{XXXXXXXX}"
BLOG="https://pinlyu.com"

# 从 OneDrive 同步
rclone sync --onedrive-chunk-size=500M --transfers=10 onedrive:/Web/ /www/workspace/onedrive/
echo '
------------------------------
[0] 初始化设置完成
------------------------------'


#-----------------------------------------------
# 1. 更新相册（后台完成）
#-----------------------------------------------
{
# # album-1 生成相册 JSON -- /www/workspace/album/
cd /www/workspace/album/
yarn && yarn build
if [ $? -ne 0 ]; then
    MESSAGE='
🔴 <b>相册更新失败</b>

[album-1] 生成相册 JSON 失败，前往 <a href="'${BTPANEL}'">检查</a>'
    curl -s -o /dev/null -X POST $URL -d chat_id=${CHAT_ID}  -d parse_mode=${MODE} -d text="${MESSAGE}" -d disable_web_page_preview=true
    exit
else
    echo '
------------------------------
[album-1] 生成相册信息成功
------------------------------'
fi

# album-2 同步图片到 COS -- /www/workspace/onedrive/cos/
cd /www/workspace/onedrive/cos/
coscmd upload -rfs --delete ./  /
if [ $? -ne 0 ]; then
    MESSAGE='
🔴 <b>博客更新失败</b>

[album-2] 同步图片到 COS 失败，前往 <a href="'${BTPANEL}'">检查</a>'
    curl -s -o /dev/null -X POST $URL -d chat_id=${CHAT_ID}  -d parse_mode=${MODE} -d text="${MESSAGE}" -d disable_web_page_preview=true
    exit
else
    echo '
------------------------------
[album-2] 同步图片到 COS 成功
------------------------------'
fi
}&


#-------------------------------------------
# 2. 更新博客（除相册）
#-------------------------------------------
# post-1 从 GitHub 同步 -- /www/workspace/hexo/
cd /www/workspace/hexo/
git pull && rsync -avz --delete /www/workspace/onedrive/posts/   source/_posts/
if [ $? -ne 0 ]; then
    MESSAGE='
🔴 <b>博客更新失败</b>

[post-1] 从 GitHub 同步失败，前往 <a href="'${BTPANEL}'">检查</a>'
    curl -s -o /dev/null -X POST $URL -d chat_id=${CHAT_ID}  -d parse_mode=${MODE} -d text="${MESSAGE}" -d disable_web_page_preview=true
    exit
else
    echo '
------------------------------
[post-1] 从 GitHub 同步成功
------------------------------'
fi

# post-2 Hexo 构建 -- /www/workspace/hexo/
yarn && yarn build
if [ $? -ne 0 ]; then
    MESSAGE='
🔴 <b>博客更新失败</b>

[post-2] Hexo 构建失败，前往 <a href="'${BTPANEL}'">检查</a>'
    curl -s -o /dev/null -X POST $URL -d chat_id=${CHAT_ID}  -d parse_mode=${MODE} -d text="${MESSAGE}" -d disable_web_page_preview=true
    exit
else
    echo '
------------------------------
[post-2] Hexo 构建成功
------------------------------'
fi

# post-3 部署网页到网站目录 -- /www/workspace/hexo/
rm -rf public/images
rsync -avz --delete public/ /www/wwwroot/blog/
if [ $? -ne 0 ]; then
    MESSAGE='
🔴 <b>博客更新失败</b>

[post-3] 部署网页到网站目录失败，前往 <a href="'${BTPANEL}'">检查</a>'
    curl -s -o /dev/null -X POST $URL -d chat_id=${CHAT_ID}  -d parse_mode=${MODE} -d text="${MESSAGE}" -d disable_web_page_preview=true
    exit
else
    echo '
------------------------------
[post-3] 部署网页到网站目录成功
------------------------------'
fi

# post-4 同步文章到 GitHub -- /www/workspace/hexo/
git config user.name "leirock"
git config user.email "19180725+leirock@users.noreply.github.com"
git add .
git commit -m "Update posts"
git push origin main
if [ $? -ne 0 ]; then
    MESSAGE='
🔴 <b>博客更新失败</b>

[post-4] 同步文章到 GitHub 失败，前往 <a href="'${BTPANEL}'">检查</a>'
    curl -s -o /dev/null -X POST $URL -d chat_id=${CHAT_ID}  -d parse_mode=${MODE} -d text="${MESSAGE}" -d disable_web_page_preview=true
    exit
else
    echo '
------------------------------
[post-4] 同步文章到 GitHub 成功
------------------------------'
fi


#-------------------------------------------
# 3. 收尾任务
#-------------------------------------------
# 推送到百度 -- /www/workspace/hexo/public/
cd public
curl -H 'Content-Type:text/plain' --data-binary @sitemap.txt "http://data.zz.baidu.com/urls?site=https://pinlyu.com&token={XXXXXXXX}"
cd ../
yarn clean

# 等待相册后台更新完成 
wait
#-------------------------------------------


end=$(date +%s)
take=$(( end - start ))
if (($take < 60)); then
    take_min='';
    take_sec=$take;
else
    take_min=$(($take / 60))' 分 ';
    take_sec=$(($take % 60));
fi

MESSAGE='
✅ <b>博客更新成功</b>

已完成以下任务，共耗时 '${take_min}${take_sec}' 秒：

· 更新文章与相册
· 同步到 GitHub
· 同步图片到 COS

点击访问 <a href="'${BLOG}'">频率</a>'
curl -s -o /dev/null -X POST $URL -d chat_id=${CHAT_ID}  -d parse_mode=${MODE} -d text="${MESSAGE}" -d disable_web_page_preview=true
