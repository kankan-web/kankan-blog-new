# Spec Coding 工作流程使用指南

本文档说明如何使用 Spec Coding 工作流程进行开发。

---

## 目录结构

```
docs/
├── specs/                    # 阶段性规格说明（用户编写）
│   ├── TEMPLATE.md           # Spec 文档模板
│   ├── phase-1-foundation.md
│   ├── phase-2-types-and-utils.md
│   ├── phase-3-feishu-sync.md
│   ├── phase-4-frontend.md
│   ├── phase-5-layout.md
│   └── phase-6-deployment.md
├── plans/                    # 执行计划（AI 生成）
│   └── TEMPLATE.md
├── summaries/                # 执行总结（AI 生成）
│   └── TEMPLATE.md
├── other/                    # 参考文档
│   ├── design.md
│   └── implementation.md
└── progress.json             # 阶段追踪文件
```

---

## 工作流程

### 1. 查看当前阶段

查看 `docs/progress.json` 文件，了解当前项目进度：

```json
{
  "currentPhase": null,
  "phases": {
    "phase-1-foundation": {
      "status": "pending",
      ...
    }
  }
}
```

**状态说明：**
- `pending`: 待执行
- `planning`: 计划生成中
- `in-progress`: 执行中
- `reviewing`: 用户审核中
- `completed`: 已完成
- `blocked`: 被阻塞

---

### 2. 开始新阶段

**用户指令：**
```
开始 phase-1
```
或
```
生成 phase-1 的计划
```

**AI 会执行：**
1. 读取 `docs/specs/phase-1-foundation.md`
2. 使用 `writing-plans` skill 生成详细计划
3. 保存到 `docs/plans/2026-03-07-phase-1-plan.md`
4. 等待用户审核

---

### 3. 审核计划

**用户操作：**
1. 打开 `docs/plans/2026-03-07-phase-1-plan.md`
2. 仔细阅读计划内容
3. 提出修改意见或确认通过

**如需修改：**
```
请修改计划：
1. 任务 1.2 中增加 XXX
2. 任务 2.1 的实施步骤需要调整 XXX
```

**确认通过：**
```
计划确认，开始执行
```

---

### 4. 执行计划

**用户指令：**
```
执行计划
```
或
```
开始实施
```

**AI 会执行：**
1. 使用 `executing-plans` skill 执行计划
2. 按任务逐步实施
3. 在检查点暂停，等待用户确认
4. 完成所有任务后通知用户

**注意：** AI 不会自动提交代码到 Git

---

### 5. 用户审核和提交

**用户操作：**

1. **Code Review：**
   - 检查代码质量
   - 验证功能实现
   - 确认符合规范

2. **功能测试：**
   ```bash
   npm run dev
   # 或
   npm run build
   ```

3. **Git 提交：**
   ```bash
   git add .
   git commit -m "feat: 完成 phase-1 基础配置

   - 初始化 Next.js 项目
   - 创建目录结构
   - 安装核心依赖

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
   git push
   ```

---

### 6. 生成总结

**用户指令：**
```
生成总结
```
或
```
总结本阶段
```

**AI 会执行：**
1. 分析本阶段完成的工作
2. 统计修改的文件和代码行数
3. 记录遇到的问题和解决方案
4. 生成总结文档到 `docs/summaries/2026-03-07-phase-1-summary.md`
5. 更新 `docs/progress.json` 标记阶段完成

---

### 7. 进入下一阶段

**用户指令：**
```
进入下一阶段
```
或
```
开始 phase-2
```

**AI 会执行：**
1. 更新 `docs/progress.json`
2. 读取下一阶段的 spec 文档
3. 重复步骤 2-6

---

## 快速参考

### 常用指令

| 指令 | 说明 |
|------|------|
| `开始 phase-X` | 开始新阶段，生成计划 |
| `执行计划` | 执行当前计划 |
| `生成总结` | 生成本阶段总结 |
| `进入下一阶段` | 进入下一阶段 |

### ���件命名规范

- **Spec:** `phase-{number}-{name}.md`
- **Plan:** `phase-{number}-plan.md`
- **Summary:** `phase-{number}-summary.md`

### 阶段列表

1. **phase-1-foundation**: 项目初始化和基础配置
2. **phase-2-types-and-utils**: 类型定义和工具函数
3. **phase-3-feishu-sync**: 飞书同步脚本开发
4. **phase-4-frontend**: Next.js 前端开发
5. **phase-5-layout**: 布局和导航
6. **phase-6-deployment**: 部署配置和文档

---

## 注意事项

### AI 不应该做的事

- ❌ 自动提交代码到 Git
- ❌ 跳过用户审核环节
- ❌ 修改已完成阶段的代码（除非明确要求）
- ❌ 擅自扩大或缩小实施范围

### AI 应该做的事

- ✅ 严格遵循 spec 和 plan 的要求
- ✅ 在关键检查点等待用户确认
- ✅ 详细记录遇到的问题和解决方案
- ✅ 保持代码质量和项目规范
- ✅ 生成完整准确的总结文档

### 用户应该做的事

- ✅ 仔细审核 AI 生成的计划
- ✅ 在执行前确认计划无误
- ✅ 执行后进行 Code Review
- ✅ 测试功能是否正常
- ✅ 手动提交代码到 Git

---

## 示例流程

### 完整的一个阶段流程

```
用户: 开始 phase-1
AI: [读取 spec，生成 plan] 计划已生成，请审核

用户: [审核计划] 计划确认，开始执行
AI: [执行计划] 任务 1.1 完成，请确认

用户: 确认，继续
AI: [继续执行] 任务 1.2 完成，请确认

用户: 确认，继续
AI: [继续执行] 所有任务完成，请审核代码

用户: [Code Review + 测试]
用户: [Git 提交]
用户: 生成总结

AI: [生成总结] 总结已生成，phase-1 完成

用户: 进入下一阶段
AI: [更新状态] 准备开始 phase-2
```

---

## 故障排查

### 问题：AI 没有按照 spec 执行

**解决方案：**
- 检查 spec 文档是否清晰明确
- 在计划审核阶段提出修改意见
- 明确告诉 AI 哪里不符合预期

### 问题：计划生成不完整

**解决方案：**
- 检查 spec 文档是否包含足够的信息
- 要求 AI 补充缺失的部分
- 参考 `docs/plans/TEMPLATE.md` 模板

### 问题：总结文档不准确

**解决方案：**
- 提供更详细的信息给 AI
- 手动修改总结文档
- 下次执行时提醒 AI 注意记录

---

## 相关文档

- [Spec 文档模板](./specs/TEMPLATE.md)
- [Plan 文档模板](./plans/TEMPLATE.md)
- [Summary 文档模板](./summaries/TEMPLATE.md)
- [CLAUDE.md 工作流程规范](../CLAUDE.md#spec-coding-工作流程规范)

---

**最后更新：** 2026-03-07
