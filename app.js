// 应用层：状态、操作与事件
const seed = [
  { id: crypto.randomUUID(), base: "木胎香盒", theme: "海水江崖", line: "细线", progress: 70, dryDate: today, gold: "未处理", defect: "", delivery: "2026-06-26", status: "待阴干", note: "边线需保持低浮雕感", logs: ["创建作品"], archived: false, archivedAt: null },
  { id: crypto.randomUUID(), base: "脱胎盘", theme: "折枝梅", line: "混合线", progress: 95, dryDate: "2026-06-20", gold: "试扫粉", defect: "左侧枝干翘线", delivery: "2026-06-23", status: "上金粉", note: "客户要求金粉偏暗", logs: ["创建作品", "记录翘线"], archived: false, archivedAt: null },
  { id: crypto.randomUUID(), base: "竹胎笔筒", theme: "云雷纹", line: "中线", progress: 40, dryDate: "2026-06-24", gold: "未处理", defect: "", delivery: "2026-06-30", status: "贴线中", note: "", logs: ["创建作品"], archived: false, archivedAt: null }
];
let works = loadWorks(seed);
let activeId = null;

const form = document.querySelector("#workForm");
const dialog = document.querySelector("#detailDialog");

form.dryDate.value = today;
form.delivery.value = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
statusFilter.innerHTML = `<option value="">全部状态</option>` + statuses.map(s => `<option>${s}</option>`).join("");

function save() {
  saveWorks(works);
}

function updateStatus(id, status) {
  const work = works.find(w => w.id === id);
  if (!work || work.archived) return;
  work.status = status;
  if (status === "待阴干") work.dryDate = new Date().toISOString().slice(0, 10);
  if (status === "上金粉") work.gold = "已上金粉";
  if (status === "待交付") work.progress = 100;
  work.logs.push(`${new Date().toLocaleString()} 更新为 ${status}`);
  save();
  render(works);
}

function recordDefect(id, text) {
  const work = works.find(w => w.id === id);
  if (!work || work.archived) return;
  const value = text || prompt("输入断线/翘线位置");
  if (!value) return;
  work.defect = work.defect ? `${work.defect}; ${value}` : value;
  work.logs.push(`${new Date().toLocaleString()} 缺陷：${value}`);
  save();
  render(works);
}

// 只有进度 100%、交付日期已到且没有未处理缺陷的作品才能归档
function archiveBlockReasons(work) {
  const reasons = [];
  if (work.progress < 100) reasons.push(`贴线进度未到 100%（当前 ${work.progress}%）`);
  if (work.delivery > today) reasons.push(`交付日期 ${work.delivery} 还没到`);
  if (work.defect) reasons.push(`尚有缺陷未处理：${work.defect}`);
  return reasons;
}

function archiveWork(id) {
  const work = works.find(w => w.id === id);
  if (!work || work.archived) return;
  const reasons = archiveBlockReasons(work);
  if (reasons.length) {
    alert(`暂时不能归档：\n· ${reasons.join("\n· ")}`);
    return;
  }
  work.archived = true;
  work.archivedAt = new Date().toISOString();
  work.logs.push(`${new Date().toLocaleString()} 归档，胎体/纹样/金粉/缺陷/流转记录冻结`);
  save();
  render(works);
}

function restoreWork(id) {
  const work = works.find(w => w.id === id);
  if (!work || !work.archived) return;
  work.archived = false;
  work.archivedAt = null;
  work.status = "待交付";
  work.logs.push(`${new Date().toLocaleString()} 恢复为待交付`);
  save();
  render(works);
}

function showDetail(id) {
  activeId = id;
  const w = works.find(item => item.id === id);
  document.querySelector("#detailTitle").textContent = `${w.theme} · ${w.base}`;
  document.querySelector("#detailContent").innerHTML = `
    胎体材质：${w.base}<br>线条粗细：${w.line}<br>贴线进度：${w.progress}%<br>
    阴干日期：${w.dryDate}<br>金粉状态：${w.gold}<br>缺陷位置：${w.defect || "无"}<br>
    交付日期：${w.delivery}<br>当前状态：${w.status}<br>
    ${w.archived ? `归档时间：${formatTime(w.archivedAt)}<br>已归档：胎体、纹样、金粉、缺陷与流转记录已冻结<br>` : ""}
    备注：${w.note || "无"}<br>
    流转记录：${w.logs.join(" / ")}
  `;
  document.querySelector("#defectRow").style.display = w.archived ? "none" : "";
  document.querySelector("#saveDefect").style.display = w.archived ? "none" : "";
  document.querySelector("#defectInput").value = "";
  dialog.showModal();
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  works.unshift({
    id: crypto.randomUUID(),
    base: data.base,
    theme: data.theme,
    line: data.line,
    progress: Number(data.progress),
    dryDate: data.dryDate,
    gold: data.gold,
    defect: data.defect,
    delivery: data.delivery,
    status: data.status,
    note: data.note,
    logs: [`${new Date().toLocaleString()} 创建作品`],
    archived: false,
    archivedAt: null
  });
  form.reset();
  form.dryDate.value = today;
  form.delivery.value = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
  save();
  render(works);
});

document.querySelector("#saveDefect").addEventListener("click", () => {
  recordDefect(activeId, document.querySelector("#defectInput").value.trim());
  showDetail(activeId);
});
document.querySelector("#closeDialog").addEventListener("click", () => dialog.close());
document.querySelector("#clearFilters").addEventListener("click", () => {
  themeFilter.value = "";
  statusFilter.value = "";
  render(works);
});
[statusFilter, themeFilter, sortMode].forEach(el => el.addEventListener("input", () => render(works)));
document.querySelector("#exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(works, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "lacquer-thread-works.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

window.updateStatus = updateStatus;
window.recordDefect = recordDefect;
window.archiveWork = archiveWork;
window.restoreWork = restoreWork;
window.showDetail = showDetail;
save();
render(works);
