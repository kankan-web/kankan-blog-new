我想要做一个个人博客网站，但是大部分的博客网站都有这样一个问题：                                
  1。 要么自己提供在线编辑器                                                                      
  2。 要么就是本地书写好再进行部署                                                                
  目前一些第三方的编辑器如飞书文档、语雀文档、Ntions做的非常不错，在线编辑的效果非常好。          
  我希望博客样式能够自己来DIY，所以还是打算自己手动搭建，利用React+Typescript+tailwindss等技术。  
  最好希望能够使用服务端渲染技术来实现。也就是Next                                                
  我希望写作平台放在飞书文档上，博客采用自己的搭建的平台                                              
  希望能支持Github图床，因为这个免费                                                              
  请根据我上述的需求帮我想想如何解决。如果需要，请进行网络搜索。如果不确定我的需求，请向我提问。  
  我希望整个讨论过程能够总结为一份需求文档文档，以供下一步的执行  

---

根据现在这个docs下的文档，还有没有什么需要我决策的

---
阅读docs下的文件，我想采用spec coding的方式开始项目代码的执行，流程中可以使用到skill技术，来规范某一些模块的输出
你将以“多 Agent 协作”的方式，为我的个人博客项目制定 spec coding 计划。现在阶段只产出 spec 与任务拆分，不写代码。
请模拟以下角色并分别产出内容，最后由 Orchestrato汇总执行分配任务：

  1. 执行先驱：executing-plans
  2. 接口指南：api-design-principles
  3. ui/ux设计：frontend-design
  4. 代码研发阶段:vercel-react-best-practices和vercel-composition-patterns、fullstack-developer、agent-browser
  5. 代码审查阶段：code-reviewer、code-review-excellence
  6. 文档管家：update-docs
  
根据上述的描述，构建属于我的skill组合拳，每个subAgent都需要将分析的内容生成文档，存放于docs/subAgent目录下。

---
你是 Orchestrator（多 Agent 协作调度者），目标是为“个人博客项目”制定 **spec coding** 计划。当前阶段 **只产出 spec 与任务拆分，不写任何代码**。

注意：以下条目是“可调用的提示词 / skill”，用于规范子任务产出，并非角色人格：

* executing-plans
* api-design-principles
* frontend-design
* vercel-react-best-practices
* vercel-composition-patterns
* fullstack-developer
* agent-browser
* code-reviewer
* code-review-excellence
* update-docs

# 0) 核心原则：任务必须按「端到端价值切片（E2E Slices）」拆分

* 任何任务都必须归属某个 Slice（一个可交付的用户价值闭环），禁止按“模块/技术层”单独成组。
* subAgent 仍按专长提供输入，但最终任务列表必须以 Slice 为主线组织与排期。
* 每个 Slice 必须包含：用户路径、页面/交互、数据/契约、渲染与性能、质量门禁、文档更新（至少这些维度的任务条目）。

# 1) SSOT（单一事实源）— Orchestrator 先建立

在启动 subAgent 前，你必须在 `docs/` 创建/更新：

1. `docs/glossary.md`：术语表（实体命名、字段命名、禁用同义词）
2. `docs/domain-model.md`：领域模型（实体、字段、关系、状态机）
3. `docs/acceptance.md`：验收用例（按 Slice/场景列出）

后续所有 subAgent 只能引用 SSOT；如需变更，提交“变更建议”，由 Orchestrator 统一合并并记录到 `docs/decisions.md`。

# 2) Slice 目录（默认切片，可按项目实际调整）

你将以以下切片作为主线（MVP 优先）：

* Slice 1：公开阅读闭环（首页/列表 → 文章详情 → SEO/OG → 空态/错误态）
* Slice 2：内容发布闭环（草稿 → 预览 → 发布/撤回 → 权限）
* Slice 3：分类检索闭环（标签/分类 → 搜索 → 分页/过滤 → 结果页 SEO）
* Slice 4：运营管理闭环（后台管理入口 → 内容管理列表 → 基础统计/审计日志）
* Slice 5：体验与质量闭环（性能预算 → 可观测性 → E2E 测试用例 → CI 门禁）

规则：

* 每个 Slice 都必须给出：用户故事、非目标、边界、验收用例（写入 `docs/acceptance.md`）。
* 每个 Slice 的完成定义（Definition of Done）必须包含：功能验收 + 质量门禁 + 文档同步。

# 3) subAgent 的工作方式（不再“各写各的模块”）

你仍会启动 6 个 subAgent，但他们的输出必须围绕 Slice 来写：

* 每个 subAgent 文档必须按 Slice 分章：Slice 1/2/3/…，在每个 Slice 下提供自己的专长输入与任务条目。
* 禁止出现“API 模块任务”“前端模块任务”这种不落到 Slice 的拆分方式。
* 每个 subAgent 输出文件仍存放：`docs/subAgent/<subAgent-name>.md`

## A. spec-initiative（使用 executing-plans）

输出：`docs/subAgent/spec-initiative.md`
职责（按 Slice）：

* 每个 Slice 的里程碑、范围控制、风险、依赖、交付节奏
* 全局 DoD（完成定义）与验收模板

## B. spec-api（使用 api-design-principles）

输出：`docs/subAgent/spec-api.md`
职责（按 Slice）：

* 每个 Slice 所需的 API/数据契约/权限/错误格式（引用 `docs/domain-model.md`）
* 对 Slice 的契约验收点（contract checks）

## C. spec-ux（使用 frontend-design）

输出：`docs/subAgent/spec-ux.md`
职责（按 Slice）：

* 每个 Slice 的页面/路由/交互/状态（loading/empty/error）
* 可访问性与视觉规范如何满足该 Slice 的验收用例

## D. spec-dev（使用 vercel-react-best-practices + vercel-composition-patterns + fullstack-developer + agent-browser）

输出：`docs/subAgent/spec-dev.md`
职责（按 Slice）：

* 每个 Slice 的工程化落点：渲染策略、缓存/ISR、性能预算、目录边界建议
* 调研输出必须映射到某个 Slice（“为 Slice X 选型”），并给出触发切换条件

## E. spec-review（使用 code-reviewer + code-review-excellence）

输出：`docs/subAgent/spec-review.md`
职责（按 Slice）：

* 每个 Slice 的 review checklist 与测试策略（单测/集成/E2E）
* CI 门禁如何覆盖 Slice 的 DoD

## F. spec-docs（使用 update-docs）

输出：`docs/subAgent/spec-docs.md`
职责（按 Slice）：

* 每个 Slice 需要更新哪些文档（spec/ADR/README/变更日志）
* 文档更新触发条件与责任归属

# 4) 统一 Spec Schema（每个 subAgent 的每个 Slice 都必须包含）

对每个 Slice，必须按以下结构输出：

1. 用户故事（User Stories）
2. 范围/非目标（Scope/Non-goals）
3. 关键流程（Flow）
4. 契约与数据（Contract & Data）— 引用 SSOT
5. 页面与交互（UI/UX）
6. 质量要求（Quality: perf/security/accessibility）
7. 验收标准（Acceptance）— 写入/引用 `docs/acceptance.md`
8. 风险与缓解（Risks）
9. tasks.yaml（该 Slice 的任务清单）

# 5) tasks.yaml 模板（必须按 Slice 输出）

每个 subAgent 文档末尾追加 YAML（可多条），并且 slice 字段必填：

```yaml id="r7c2qk"
tasks:
  - id: <SLICE1-API-001>
    slice: <Slice 1>
    title: <任务标题（必须体现端到端价值点）>
    owner: <spec-initiative|spec-api|spec-ux|spec-dev|spec-review|spec-docs>
    depends_on: [<TASK-ID>, ...]
    output: [<将更新/生成的文档或产物名称>]
    done_when:
      - "<可验证验收点 1>"
      - "<可验证验收点 2>"
    notes: "<可选>"
```

命名建议：

* Slice 1：S1-*
* Slice 2：S2-*
* 以 owner 作为中缀：S1-UX-001 / S1-API-002 / S1-REV-003 …

# 6) Orchestrator 汇总输出（以 Slice 为目录组织）

在所有 subAgent 文档生成后，你必须输出：

1. `docs/spec.md`：按 Slice 汇总（Slice 1 → Slice 2 → …）
2. `docs/tasks.md`：按 Slice 汇总 tasks，并标注依赖、并行、关键路径
3. `docs/decisions.md`：关键决策 ADR（同样标注影响哪些 Slice）
4. `docs/subAgent/README.md`：说明“subAgent 只是提供 Slice 视角的输入”，最终以 Slice 为主线执行

# 7) 冲突与缺失处理

* 发现冲突：以 SSOT 为准，由 Orchestrator 在 `docs/decisions.md` 裁决并记录。
* 信息不足：写入 Open Questions，并给出默认方案 + 触发修改条件，但不阻塞 Slice 的任务拆分。
* 禁止出现脱离 Slice 的“模块任务列表”；任何任务必须能落到某个用户路径与验收用例。

---
你是 Orchestrator（多 Agent 协作调度者），目标是为"个人博客项目"制定 spec coding 计划。当前阶段 只产出 spec 与任务拆分，不写任何代码。                                                                                      
                                                                                                                                                                                                                              
  注意：以下条目是"可调用的提示词 / skill"，用于规范子任务产出，并非角色人格：                                                                                                                                                
                  
  - executing-plans
  - api-design-principles
  - frontend-design
  - vercel-react-best-practices
  - vercel-composition-patterns
  - fullstack-developer
  - agent-browser
  - code-reviewer
  - code-review-excellence

  0) 核心原则：任务必须按「端到端价值切片（E2E Slices）」拆分

  - 任何任务都必须归属某个 Slice（一个可交付的用户价值闭环），禁止按"模块/技术层"单独成组。
  - subAgent 仍按专长提供输入，但最终任务列表必须以 Slice 为主线组织与排期。
  - 每个 Slice 必须包含：用户路径、页面/交互、数据/契约、渲染与性能、质量门禁、文档更新（至少这些维度的任务条目）。

  1) SSOT（单一事实源）— Orchestrator 先建立

  在启动 subAgent 前，你必须在 docs/ 创建/更新：

  1. docs/glossary.md：术语表（实体命名、字段命名、禁用同义词）
  2. docs/domain-model.md：领域模型（实体、字段、关系、状态机）
  3. docs/acceptance.md：验收用例（按 Slice/场景列出）

  后续所有 subAgent 只能引用 SSOT；如需变更，提交"变更建议"，由 Orchestrator 统一合并并记录到 docs/decisions.md。

  2) Slice 目录（基于博客项目实际需求）

  你将以下切片作为主线（MVP 优先）：

  Slice 1：内容同步闭环（飞书写作 → API同步 → GitHub存储 → 状态管理）
  - 用户故事：作为博主，我在飞书写完文章后，手动触发同步，系统自动将文章和图片同步到GitHub
  - 范围：飞书API客户端、图片处理、同步脚本、GitHub Actions、同步状态记录
  - 验收：能成功同步飞书文档、自动下载并转存图片到CDN、记录同步状态、支持增量同步

  Slice 2：内容阅读闭环（首页 → 文章列表 → 文章详情 → Markdown渲染 → SEO）
  - 用户故事：作为访客，我能浏览首页文章列表，点击进入文章详情，阅读格式良好的内容
  - 范围：首页、文章详情页、Markdown渲染、代码高亮、响应式布局、元数据和SEO
  - 验收：首页展示最新文章、文章详情页正确渲染、代码高亮正常、移动端适配、SEO标签完整

  Slice 3：内容检索闭环（分类筛选 → 标签筛选 → 全站搜索 → 结果展示）
  - 用户故事：作为访客，我能通过分类、标签或搜索快速找到感兴趣的文章
  - 范围：分类页面、标签页面、搜索功能、搜索索引生成、筛选结果展示
  - 验收：分类和标签正确分组、搜索能找到相关文章、搜索结果高亮、空态处理

  Slice 4：用户交互闭环（评论 → 暗色模式 → 导航 → 阅读体验）
  - 用户故事：作为访客，我能评论文章、切换暗色模式、流畅导航、获得良好的阅读体验
  - 范围：Giscus评论集成、暗色模式切换、Header/Footer、目录导航、阅读进度、回到顶部
  - 验收：评论系统正常工作、暗色模式切换流畅、导航清晰、阅读体验优化

  Slice 5：部署和质量闭环（构建配置 → Vercel部署 → 性能优化 → 错误处理 → 监控）
  - 用户故事：作为开发者，我能顺利构建和部署博客，确保性能和稳定性
  - 范围：Next.js配置、Vercel部署、环境变量、性能优化、错误处理、构建验证
  - 验收：构建成功、部署正常、性能达标、错误有日志、可回滚

  规则：

  - 每个 Slice 都必须给出：用户故事、非目标、边界、验收用例（写入 docs/acceptance.md）。
  - 每个 Slice 的完成定义（Definition of Done）必须包含：功能验收 + 质量门禁 + 文档同步。

  3) subAgent 的工作方式（不再"各写各的模块"）

  你仍会启动 6 个 subAgent，但他们的输出必须围绕 Slice 来写：

  - 每个 subAgent 文档必须按 Slice 分章：Slice 1/2/3/4/5，在每个 Slice 下提供自己的专长输入与任务条目。
  - 禁止出现"API 模块任务""前端模块任务"这种不落到 Slice 的拆分方式。
  - 每个 subAgent 输出文件仍存放：docs/subAgent/<subAgent-name>.md

  A. spec-initiative（使用 executing-plans）

  输出：docs/subAgent/spec-initiative.md
  职责（按 Slice）：

  - 每个 Slice 的里程碑、范围控制、风险、依赖、交付节奏
  - 全局 DoD（完成定义）与验收模板

  B. spec-api（使用 api-design-principles）

  输出：docs/subAgent/spec-api.md
  职责（按 Slice）：

  - 每个 Slice 所需的 API/数据契约/权限/错误格式（引用 docs/domain-model.md）
  - 对 Slice 的契约验收点（contract checks）
  - 特别关注：Slice 1 的飞书API集成、文章数据结构、同步状态管理

  C. spec-ux（使用 frontend-design）

  输出：docs/subAgent/spec-ux.md
  职责（按 Slice）：

  - 每个 Slice 的页面/路由/交互/状态（loading/empty/error）
  - 可访问性与视觉规范如何满足该 Slice 的验收用例
  - 特别关注：Slice 2/3/4 的页面设计、响应式布局、暗色模式

  D. spec-dev（使用 vercel-react-best-practices + vercel-composition-patterns + fullstack-developer）

  输出：docs/subAgent/spec-dev.md
  职责（按 Slice）：

  - 每个 Slice 的工程化落点：渲染策略（SSG）、缓存/ISR、性能预算、目录边界建议
  - 调研输出必须映射到某个 Slice（"为 Slice X 选型"），并给出触发切换条件
  - 特别关注：Next.js App Router、静态生成、图片优化、搜索索引生成

  E. spec-review（使用 code-reviewer + code-review-excellence）

  输出：docs/subAgent/spec-review.md
  职责（按 Slice）：

  - 每个 Slice 的 review checklist 与测试策略（单测/集成/E2E）
  - CI 门禁如何覆盖 Slice 的 DoD
  - 特别关注：同步脚本的错误处理、Markdown渲染的安全性、搜索功能的准确性

  F. spec-docs（使用现有文档知识）

  输出：docs/subAgent/spec-docs.md
  职责（按 Slice）：

  - 每个 Slice 需要更新哪些文档（spec/ADR/README/变更日志）
  - 文档更新触发条件与责任归属
  - 确保与现有的 design.md、implementation.md、checklist.md 保持一致

  4) 统一 Spec Schema（每个 subAgent 的每个 Slice 都必须包含）

  对每个 Slice，必须按以下结构输出：

  1. 用户故事（User Stories）
  2. 范围/非目标（Scope/Non-goals）
  3. 关键流程（Flow）
  4. 契约与数据（Contract & Data）— 引用 SSOT
  5. 页面与交互（UI/UX）
  6. 质量要求（Quality: perf/security/accessibility）
  7. 验收标准（Acceptance）— 写入/引用 docs/acceptance.md
  8. 风险与缓解（Risks）
  9. tasks.yaml（该 Slice 的任务清单）

  5) tasks.yaml 模板（必须按 Slice 输出）

  每个 subAgent 文档末尾追加 YAML（可多条），并且 slice 字段必填：

  tasks:
    - id: <S1-SYNC-001>
      slice: <Slice 1: 内容同步闭环>
      title: <任务标题（必须体现端到端价值点）>
      owner: <spec-initiative|spec-api|spec-ux|spec-dev|spec-review|spec-docs>
      depends_on: [<TASK-ID>, ...]
      output: [<将更新/生成的文档或产物名称>]
      done_when:
        - "<可验证验收点 1>"
        - "<可验证验收点 2>"
      notes: "<可选>"

  命名建议：

  - Slice 1：S1-*（内容同步）
  - Slice 2：S2-*（内容阅读）
  - Slice 3：S3-*（内容检索）
  - Slice 4：S4-*（用户交互）
  - Slice 5：S5-*（部署质量）
  - 以 owner 作为中缀：S1-API-001 / S2-UX-002 / S3-DEV-003 …

  6) Orchestrator 汇总输出（以 Slice 为目录组织）

  在所有 subAgent 文档生成后，你必须输出：

  1. docs/spec.md：按 Slice 汇总（Slice 1 → Slice 2 → …）
  2. docs/tasks.md：按 Slice 汇总 tasks，并标注依赖、并行、关键路径
  3. docs/decisions.md：关键决策 ADR（同样标注影响哪些 Slice）
  4. docs/subAgent/README.md：说明"subAgent 只是提供 Slice 视角的输入"，最终以 Slice 为主线执行

  7) 冲突与缺失处理

  - 发现冲突：以 SSOT 为准，由 Orchestrator 在 docs/decisions.md 裁决并记录。
  - 信息不足：写入 Open Questions，并给出默认方案 + 触发修改条件，但不阻塞 Slice 的任务拆分。
  - 禁止出现脱离 Slice 的"模块任务列表"；任何任务必须能落到某个用户路径与验收用例。

  8) 项目上下文（基于现有文档）

  技术栈：
  - Next.js 16 (App Router)
  - React 19
  - TypeScript 5
  - TailwindCSS 4
  - 飞书开放平台 API
  - GitHub Actions
  - Vercel

  核心架构：
  - 飞书文档（写作） → GitHub Actions（同步） → Git 仓库（存储） → Vercel（部署）
  - 静态生成（SSG）+ jsDelivr CDN
  - 无数据库，文件系统作为数据源

  已有文档：
  - docs/plans/design.md：设计方案
  - docs/plans/implementation.md：实施计划
  - docs/checklist.md：配置清单
  - CLAUDE.md：项目说明

  重要约束：
  - 少量文章（<50篇），偶尔更新
  - 手动触发同步，1-2小时延迟可接受
  - 完全免费方案（Vercel + GitHub + jsDelivr）
  - 无后台管理，纯展示型博客