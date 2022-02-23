当一个仓库中，需要添加第三方的仓库，又想要保持和第三方仓库的提交一直，则可以使用  `git submodule`

### 添加
`git submodule add <url> <path>`

```js
git submodule add 地址 文件名
```

### 更新
```js
git submodule foreach git pull 
```

#### 删除子模块
有时子模块的项目维护地址发生了变化，或者需要替换子模块，就需要删除原有的子模块。

#### 删除子模块较复杂，步骤如下：

```js
rm -rf 子模块目录 删除子模块目录及源码
vi .gitmodules 删除项目目录下.gitmodules文件中子模块相关条目
vi .git/config 删除配置项中子模块相关条目
rm .git/module/* 删除模块下的子模块目录，每个子模块对应一个目录，注意只删除对应的子模块目录即可
执行完成后，再执行添加子模块命令即可，如果仍然报错，执行如下：

git rm --cached 子模块名称
```


[教程一](https://blog.csdn.net/guotianqing/article/details/82391665)

[教程二](https://www.jianshu.com/p/e27a978ddb88)

[教程三](https://www.cnblogs.com/jyroy/p/14367776.html)