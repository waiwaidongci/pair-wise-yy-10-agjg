// 存储层：localStorage 读写、种子数据与旧数据迁移
const storageKey = "zfl42Works";

function buildSeed() {
  const today = new Date().toISOString().slice(0, 10);
  return [
    { id: crypto.randomUUID(), base: "木胎香盒", theme: "海水江崖", line: "细线", progress: 70, dryDate: today, gold: "未处理", defect: "", delivery: "2026-06-26", status: "待阴干", note: "边线需保持低浮雕感", logs: ["创建作品"], archived: false, archivedAt: null },
    { id: crypto.randomUUID(), base: "脱胎盘", theme: "折枝梅", line: "混合线", progress: 95, dryDate: "2026-06-20", gold: "试扫粉", defect: "左侧枝干翘线", delivery: "2026-06-23", status: "上金粉", note: "客户要求金粉偏暗", logs: ["创建作品", "记录翘线"], archived: false, archivedAt: null },
    { id: crypto.randomUUID(), base: "竹胎笔筒", theme: "云雷纹", line: "中线", progress: 40, dryDate: "2026-06-24", gold: "未处理", defect: "", delivery: "2026-06-30", status: "贴线中", note: "", logs: ["创建作品"], archived: false, archivedAt: null }
  ];
}

// 旧数据没有归档字段，首次打开时补上未归档状态，其余字段原样保留
function migrateWork(work) {
  if (typeof work.archived !== "boolean") work.archived = false;
  if (!("archivedAt" in work)) work.archivedAt = null;
  if (!Array.isArray(work.logs)) work.logs = [];
  return work;
}

function loadWorks() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return buildSeed();
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return buildSeed();
  return parsed.map(migrateWork);
}

function saveWorks(works) {
  localStorage.setItem(storageKey, JSON.stringify(works));
}
