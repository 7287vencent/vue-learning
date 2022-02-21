#!/bin/bash
# 更新所有
# git submodule foreach git pull 

# 提交


now_time=$(date "+%Y-%m-%d %H:%M:%S")
# echo $now_time
commint="fix(项目): ${now_time} 合并更新"
echo $commint

git add .

git commit -m "${commint}"

git push