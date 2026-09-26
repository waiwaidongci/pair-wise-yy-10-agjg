// 状态与交互：作品数据、工序流转、归档/恢复与事件绑定
const statuses = ["贴线中", "待阴干", "上金粉", "待交付"];
const today = new Date().toISOString().slice(0, 10);
let works = loadWorks();
let activeId = null;

const form = document.querySelector("#workForm");
const statusFilter = document.querySelector("#statusFilter");
const themeFilter = document.querySelector("#themeFilter");
const sortMode = document.querySelector("#sortMode");

form.dryDate.value = today;
form.delivery.value = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
statusFilter.innerHTML = `<option value="">全部状态</option>` + statuses.map(s => `<option>${s}</option>`).join("");

function save() {
  saveWorks(works);
}

function filtered() {
  return works
    .filter(w => !w.archived)
    .filter(w => !statusFilter.value || w.status === statusFilter.value)
    .filter(w => !themeFilter.value || w.theme.includes(themeFilter.value.trim()))
    .sort((a, b) => (a[sortMode.value] || "").localeCompare(b[sortMode.value] || ""));
}

function updateStatus(id, status) {
  const work = works.find(w => w.id === id);
  work.status = status;
  if (status === "待阴干") work.dryDate = new Date().toISOString().slice(0, 10);
  if (status === "上金粉") work.gold = "已上金粉";
  if (status === "待交付") work.progress = 100;
  work.logs.push(`${new Date().toLocaleString()} 更新为 ${status}`);
  save();
  render();
}

function recordDefect(id, text) {
  const work = works.find(w => w.id === id);
  const value = text || prompt("输入断线/翘线位置");
  if (!value) return;
  work.defect = work.defect ? `${work.defect}; ${value}` : value;
  work.logs.push(`${new Date().toLocaleString()} 缺陷：${value}`);
  save();
  render();
}

// 归档门槛：进度 100%、交付日期已到、缺陷记录为空
function archiveReasons(work) {
  const reasons = [];
  if (work.progress < 100) reasons.push(`贴线进度 ${work.progress}%，未达到 100%`);
  if (work.delivery > today) reasons.push(`交付日期 ${work.delivery} 还没到`);
  if (work.defect) reasons.push(`缺陷记录未清空：${work.defect}`);
  return reasons;
}

function archiveWork(id) {
  const work = works.find(w => w.id === id);
  if (!work || work.archived) return;
  const reasons = archiveReasons(work);
  if (reasons.length) {
    alert(`暂时无法归档：\n· ${reasons.join("\n· ")}`);
    return;
  }
  work.archived = true;
  work.archivedAt = new Date().toISOString();
  work.logs.push(`${new Date().toLocaleString()} 归档，胎体、纹样、金粉、缺陷与流转记录冻结`);
  save();
  render();
}

function restoreWork(id) {
  const work = works.find(w => w.id === id);
  if (!work || !work.archived) return;
  work.archived = false;
  work.archivedAt = null;
  work.status = "待交付";
  work.logs.push(`${new Date().toLocaleString()} 恢复为待交付`);
  save();
  render();
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
  render();
});

document.querySelector("#saveDefect").addEventListener("click", () => {
  recordDefect(activeId, document.querySelector("#defectInput").value.trim());
  showDetail(activeId);
});
document.querySelector("#archiveBtn").addEventListener("click", () => {
  archiveWork(activeId);
  const work = works.find(w => w.id === activeId);
  if (work && work.archived) showDetail(activeId);
});
document.querySelector("#restoreBtn").addEventListener("click", () => {
  restoreWork(activeId);
  showDetail(activeId);
});
document.querySelector("#closeDialog").addEventListener("click", () => dialog.close());
document.querySelector("#clearFilters").addEventListener("click", () => {
  themeFilter.value = "";
  statusFilter.value = "";
  render();
});
[statusFilter, themeFilter, sortMode].forEach(el => el.addEventListener("input", render));
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
window.showDetail = showDetail;
window.archiveWork = archiveWork;
window.restoreWork = restoreWork;
save();
render();
