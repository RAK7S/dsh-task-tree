# dsh-task-tree

A small, opinionated task tree that lives **inside** DeepSeek Harness — not another app window.

它是一块挂在页面右下角的小面板：一个折叠按钮 + 一棵可以拖动的任务树。装完打开 DSH 就能看到。

---

## 它能做什么

- **树上长任务**：分组 → 任务，带优先级序号 `P1 P2 …`，一眼看得出先做哪个
- **语音入库**：按住麦克风说一句，自动转成文字填进输入框，确认后才变成任务条（不会误加）
- **拖动排序**：任务条直接拖到别的位置（同组内改优先级，跨组移动）
- **状态与废止**：进行中 / 卡住 / 跳过（废止）/ 待办 / 删除，点一下行即可
- **收起来也是活的**：收起后是一个小圆块，**也可以拖动**，位置会被记住
- **贴边自动收**：面板拖到屏幕边缘时会自动吸边
- **不抢焦点**：面板是页面浮层，不遮挡会话输入框，样式全部跟随 DSH 主题 token（深浅色都正常）

## 安装

### 插件市场

在 DSH 的插件市场里搜索 `task-tree` 安装即可。

### 手动

```bash
npm i dsh-task-tree
# 或把 release 里的 tgz 解压到 profile 的 node_modules
```

然后确认 profile 的 `package.json` 里：

```json
{
  "dsh": { "profile": { "bundles": ["...", "dsh-task-tree"] } },
  "dependencies": { "dsh-task-tree": "file:./node_modules/dsh-task-tree" }
}
```

重启 DSH 生效（client 代码是页面加载时取的）。

## 用法

1. 右下角小圆块 → 点开面板
2. 底部输入框打字，或点麦克风说话 → 松开后文字会填进来
3. 点「确认」→ 变成任务条（回车也可以）
4. 拖任务条调整顺序，点行右侧的状态点改状态
5. 拖动面板头部可以挪位置；拖到边上会自动收

## 数据放在哪

任务树写的是你工作区里的一个纯文本文件：

```
<workspace>/tasks/queue.md
```

每行一条任务，格式：

```
- [ ] T9 | 标题 | done_when: 完成条件 | needs: none | status: todo
```

所以你随时可以用编辑器改、用 git 管、用 `grep` 找。插件本身只做解析与写回，写前自动备份 `.bak`。

## 端口

宿主侧起一个只监听 `127.0.0.1` 的小 HTTP 服务（默认 3013，被占用时顺延到 3019），仅供面板读写任务树与调用系统的语音转写（`speechController`），不对外暴露。

## 权限

- 只读写 `<workspace>/tasks/queue.md`
- 语音转写调用 DSH 自带的 `speechController`（**本地**，音频不出机器）
- 不联网、不上传任何内容

## 已知限制

- 需要 DSH 0.2.1 及以上
- 语音转写依赖系统已启用的语音输入能力；没有时麦克风按钮会提示不可用
- 目前是单文件树（一个 workspace 一棵树）

## License

MIT © RAK7S
