import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    affiliationLab: "瀚文研究院 软件工程实验室",
    affiliationUniv: "瀚江大学 计算机科学系",
    meta: "瀚文论文工坊 · 第 3 稿 · 2026 年 11 月",
    abstract:
      "Git 把仓库的全部历史保存为一张以内容哈希寻址的有向无环图。本文从工作区、暂存区与仓库这三棵树出发，依次剖析由 blob、tree、commit 构成的对象模型，比较三方合并与变基对提交图的不同影响，并用一个增量压缩模型说明打包文件为何远小于松散对象之和。文中的四张流程图均可逐步播放，打印时展开为分图。",
    secIntro: "引言",
    introP1:
      "版本控制系统记录一组文件随时间的演变。早期的 SCCS {cRochkind} 与 RCS {cTichy} 以单个文件为单位保存增量，CVS 与 Subversion 则把仓库集中到一台服务器上。2005 年 4 月，Git 的第一个提交 {cTorvalds} 选择了另一条路：每次提交保存整个目录树的快照，所有对象都以内容的哈希值命名 {cOSullivan}。",
    introP2:
      "这一设计让分支几乎没有成本，也让历史的完整性可以被校验。下文中，{secTrees}介绍三棵树，{secObjects}剖析对象模型，{secBranch}讨论分支与合并，{secRebase}讨论变基，{secPack}用一个简单模型解释打包文件为何远小于松散对象之和。每张流程图都可以逐步播放，正文里的图号链接会把图切到它所说的那一步。",
    secRelated: "相关工作",
    relatedP1:
      "版本控制的研究长期围绕存储与差异两条线展开。SCCS 与 RCS 以文件为单位保存增量 {cRochkind}{cTichy}，CVS 与 Subversion 把版本库集中到服务器；Git 反过来保存完整快照，用内容哈希把快照组织成 Merkle DAG {cMerkle}。这一选择让分支与合并在对象层几乎不产生额外数据，也把差异计算推迟到真正需要时再做 {cMyers}。",
    relatedP2:
      "仓库挖掘社区随后发现，提交图并不等于开发过程：Bird 等人指出，合并与变基会让提交的作者、时间与拓扑关系偏离真实协作 {cBird}；Chacon 与 Straub 则从实践角度总结了对象模型如何影响分支策略与代码审查 {cChacon}。本文不提出新的挖掘方法，而是把对象模型、三棵树与历史改写放进同一套图示，作为教学与工具设计的共同基础。",
    secTrees: "三棵树",
    treesP1:
      "日常使用 Git 时，同一个文件同时存在于三个地方：可以直接编辑的工作区、记录下一次提交内容的暂存区（索引），以及保存全部历史的仓库 {figTrees}。修改文件只影响工作区 {figTreesEdit}；git add 把内容写入对象库并更新索引 {figTreesAdd}；git commit 再由索引生成提交，让当前分支前移 {figTreesCommit}。git restore 与 git switch 沿相反方向，用仓库里的版本覆盖另外两处 {figTreesRestore}。",
    secIndex: "索引是下一次提交的草稿",
    indexP1:
      "索引不是可有可无的中间层。它让一次提交只包含工作区的部分改动，也缓存了文件的大小与修改时间，使 git status 不必重新哈希每一个文件。理解了索引，{secObjects}中 tree 对象的来历也就顺理成章：git commit 只是把索引原样写成一棵 tree。",
    secObjects: "对象模型",
    objectsP1:
      "Git 的对象库只有四种对象：blob、tree、commit 与 tag。每个对象的名字是其类型、长度与内容拼接后的 SHA-1 值，见{eqId}：",
    termContent: "content：在图 2 中查看只保存内容的 blob",
    termType: "type：在图 2 中查看三种对象类型",
    objectsP2:
      "blob 只保存内容 {figObjectsBlob}，tree 把文件名映射到 blob 和子 tree {figObjectsTree}，commit 指向一棵根 tree 并记录父提交 {figObjectsCommit}。名字由内容决定，相同的内容只存一份；修改一个文件时，只有它到根的路径上的对象需要重新生成，其余部分原样共享 {figObjectsShare}。",
    secIntegrity: "完整性与哈希算法",
    integrityP1:
      "对象之间以哈希相互引用，构成 Merkle 结构 {cMerkle}：任何一个字节的改动都会改变根 tree 与提交的 id，因此一个提交 id 就足以校验它代表的整个快照。2017 年公布的首个完整 SHA-1 碰撞 {cStevens} 促使 Git 加入碰撞检测，并开始向 SHA-256 过渡 {cHashTransition}。",
    secBranch: "分支与合并",
    branchP1:
      "在 Git 中，分支只是一个指向某个提交的引用 {figBranchMain}。创建分支就是写入一个新引用 {figBranchFeature}；两条分支各自前进之后 {figBranchDiverge}，git merge 先求出它们最近的公共祖先 {figBranchBase}，再以它为基准做三方合并 {figBranchMerge}。",
    branchP2:
      "三方合并逐个文件比较「基准 → ours」与「基准 → theirs」两组差异。行级差异的计算可以追溯到 diff 工具最早的实现 {cHunt}，Git 默认采用 Myers 的 O(ND) 算法 {cMyers}。两边改动不重叠的部分自动合并，重叠之处作为冲突留给作者解决。",
    secRebase: "变基与历史改写",
    rebaseP1:
      "变基是合并之外的另一种整合方式。仍从分叉的历史出发 {figRebaseStart}，git rebase 先选出 feature 独有的提交 {figRebasePick}，把它们逐个重放到 main 之上 {figRebaseReplay}，最后移动 feature 引用 {figRebaseMove}，得到一条没有合并提交的线性历史。",
    rebaseP2:
      "重放得到的是新对象：父提交变了，提交 id 随之改变，原来的 F1、F2 只是不再可达。因此对已被他人取用的提交执行变基，会迫使协作者处理两份内容相同而 id 不同的历史；对仓库挖掘研究而言，变基还会抹去开发过程的真实顺序 {cBird}。",
    secPack: "打包与增量压缩",
    packP1:
      "按{eqId}命名的松散对象各自独立压缩，一个文件的每个版本都是一份完整副本。git gc 把对象写入打包文件，并对相似的对象做增量压缩 {cMacDonald}：只保留一份完整版本，其余版本保存相对它的差异。{eqPack}给出一个粗略的模型，其中 n 为修订次数，r 为每次修订改动的比例，c 为 zlib 压缩率，δ 为每个增量的固定开销：",
    termN: "n：修订次数，点击把图 5 切到 120 次修订",
    termR: "r：每次改动的比例，点击把图 5 切到改动 40%",
    packP2:
      "{figPack}按这一模型画出两种存储方式的累计体积。每次改动较小时，打包文件几乎不随修订增长 {figPackMany}；即使每次改写四成内容，打包仍能省下一半以上的空间 {figPackHeavy}。拖动图下方的滑块，可以比较其他参数下的差距。",
    secConclusion: "结论",
    conclusionP1:
      "Git 的核心可以概括为一句话：以内容寻址的不可变对象，加上少量可变的引用。三棵树决定数据如何进入对象库，Merkle 结构保证历史的完整性，分支、合并与变基都只是在这张有向无环图上移动引用或追加对象。理解这一模型，比记住任何一条命令都更能帮助开发者预判 Git 的行为 {cChacon}。",
    secAck: "致谢",
    ackP1: "感谢瀚文论文工坊的同事在两轮内审中提出的意见，分支与变基两张图的版式据此重绘。",
  },
  en: {
    affiliationLab: "Software Engineering Lab, HanWen Institute",
    affiliationUniv: "Department of Computer Science, Hanjiang University",
    meta: "HanPaper Studio · Draft 3 · November 2026",
    abstract:
      "Git stores the entire history of a repository as a directed acyclic graph addressed by content hashes. Starting from the three trees, namely the working tree, the index and the repository, we examine the object model of blobs, trees and commits, contrast how three-way merges and rebases reshape the commit graph, and use a delta compression model to explain why a packfile is far smaller than the loose objects it replaces. All four flow figures can be played step by step and unfold into sub-figures in print.",
    secIntro: "Introduction",
    introP1:
      "A version control system records how a set of files evolves over time. Early systems such as SCCS {cRochkind} and RCS {cTichy} stored deltas file by file, while CVS and Subversion centralized the repository on one server. The first commit of Git in April 2005 {cTorvalds} took a different path: every commit is a snapshot of the whole directory tree, and every object is named by the hash of its content {cOSullivan}.",
    introP2:
      "This design makes branches nearly free and makes the integrity of history verifiable. The rest of the paper covers the three trees in {secTrees}, the object model in {secObjects}, branching and merging in {secBranch}, rebasing in {secRebase}, and, in {secPack}, a simple model of why a packfile is far smaller than the loose objects it replaces. Every flow figure can be played step by step, and figure references in the text switch the figure to the step they mention.",
    secRelated: "Related Work",
    relatedP1:
      "Research on version control has long followed two threads: storage and differencing. SCCS and RCS stored deltas file by file {cRochkind}{cTichy}, while CVS and Subversion centralized the repository on a server; Git instead stores complete snapshots and organizes them into a Merkle DAG with content hashes {cMerkle}. This choice makes branching and merging nearly free at the object layer and defers differencing until it is actually needed {cMyers}.",
    relatedP2:
      "The repository-mining community later observed that the commit graph is not the development process: Bird et al. show that merges and rebases make commit authorship, timestamps and topology diverge from real collaboration {cBird}, while Chacon and Straub summarize from practice how the object model shapes branching strategies and code review {cChacon}. This paper proposes no new mining method; it puts the object model, the three trees and history rewriting into one set of diagrams as a shared basis for teaching and tool design.",
    secTrees: "The Three Trees",
    treesP1:
      "In everyday use the same file lives in three places at once: the working tree you edit, the index that records the content of the next commit, and the repository that keeps the full history {figTrees}. Editing a file touches only the working tree {figTreesEdit}; git add writes the content into the object store and updates the index {figTreesAdd}; git commit then turns the index into a commit and advances the current branch {figTreesCommit}. git restore and git switch work in the opposite direction, overwriting the other two places with the version from the repository {figTreesRestore}.",
    secIndex: "The Index as a Draft of the Next Commit",
    indexP1:
      "The index is not an optional layer in between. It lets a commit include only part of the changes in the working tree, and it caches file sizes and modification times so that git status need not rehash every file. With the index in mind, the origin of tree objects in {secObjects} follows naturally: git commit writes the index out as a tree, unchanged.",
    secObjects: "The Object Model",
    objectsP1:
      "Git's object store holds only four kinds of objects: blobs, trees, commits and tags. Each object is named by the SHA-1 of its type, length and content concatenated, as in {eqId}:",
    termContent: "content: see the blob, which stores content only, in Figure 2",
    termType: "type: see the three object types in Figure 2",
    objectsP2:
      "A blob stores content only {figObjectsBlob}, a tree maps file names to blobs and subtrees {figObjectsTree}, and a commit points to a root tree and records its parents {figObjectsCommit}. Because names derive from content, identical content is stored once; editing one file regenerates only the objects on its path to the root, and everything else is shared {figObjectsShare}.",
    secIntegrity: "Integrity and the Hash Function",
    integrityP1:
      "Objects refer to each other by hash, forming a Merkle structure {cMerkle}: changing any single byte changes the ids of the root tree and of the commit, so one commit id suffices to verify the entire snapshot it stands for. The first full SHA-1 collision, published in 2017 {cStevens}, led Git to add collision detection and to begin a transition to SHA-256 {cHashTransition}.",
    secBranch: "Branching and Merging",
    branchP1:
      "In Git a branch is only a reference to a commit {figBranchMain}. Creating a branch writes a new reference {figBranchFeature}; once two branches have moved on independently {figBranchDiverge}, git merge first finds their nearest common ancestor {figBranchBase} and then performs a three-way merge against it {figBranchMerge}.",
    branchP2:
      "A three-way merge compares, file by file, the changes from base to ours with those from base to theirs. Line-level differencing goes back to the earliest diff implementation {cHunt}, and Git uses Myers' O(ND) algorithm by default {cMyers}. Non-overlapping changes merge automatically; overlapping ones are left to the author as conflicts.",
    secRebase: "Rebasing and Rewriting History",
    rebaseP1:
      "Rebasing is the other way to integrate work. Starting again from a diverged history {figRebaseStart}, git rebase selects the commits unique to feature {figRebasePick}, replays them one by one on top of main {figRebaseReplay}, and finally moves the feature ref {figRebaseMove}, producing a linear history without a merge commit.",
    rebaseP2:
      "Replaying produces new objects: the parents change, so the commit ids change, and the original F1 and F2 merely become unreachable. Rebasing commits that others have already fetched therefore forces collaborators to reconcile two histories with identical content but different ids, and for repository mining it erases the actual order in which work happened {cBird}.",
    secPack: "Packing and Delta Compression",
    packP1:
      "Loose objects, named as in {eqId}, are compressed independently, so every version of a file is a full copy. git gc writes objects into a packfile and delta-compresses similar ones {cMacDonald}: one version is kept in full and the others as differences against it. {eqPack} gives a rough model, where n is the number of revisions, r the fraction changed per revision, c the zlib compression ratio and δ a fixed overhead per delta:",
    termN: "n: number of revisions; click to set Figure 5 to 120 revisions",
    termR: "r: fraction changed per revision; click to set Figure 5 to 40%",
    packP2:
      "{figPack} plots the cumulative size of both layouts under this model. When each revision changes little, the packfile barely grows {figPackMany}; even when every revision rewrites 40% of the file, packing still saves more than half of the space {figPackHeavy}. Drag the slider below the figure to compare other settings.",
    secConclusion: "Conclusion",
    conclusionP1:
      "Git's core fits in one sentence: immutable, content-addressed objects plus a few mutable references. The three trees decide how data enters the object store, the Merkle structure guarantees the integrity of history, and branching, merging and rebasing only move references or append objects in a directed acyclic graph. Understanding this model predicts Git's behaviour better than memorizing any command {cChacon}.",
    secAck: "Acknowledgements",
    ackP1: "We thank our colleagues at HanPaper Studio for their comments in two rounds of internal review, which led to the redrawn branching and rebasing figures.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanpaper-components-git-paper",
  content: t(content),
};

export default dictionary;
