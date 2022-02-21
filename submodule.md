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

[教程一](https://blog.csdn.net/guotianqing/article/details/82391665)

[教程二](https://www.jianshu.com/p/e27a978ddb88)