// 渲染层：风险列表、工序看板、归档区与详情弹窗
const board = document.querySelector("#board");
const archiveList = document.querySelector("#archiveList");
const archiveCount = document.querySelector("#archiveCount");
const dialog = document.querySelector("#detailDialog");

function fmtTime(iso) {
  return iso ? new Date(iso).toLocaleString() : "";
}

function renderSummaries() {
  const active = works.filter(w => !w.archived);
  const todayDry = active.filter(w => w.dryDate <= today && w.status === "待阴干");
  const defects = active.filter(w => w.defect);
  const delivery = [...active].sort((a, b) => a.delivery.localeCompare(b.delivery)).slice(0, 4);
  document.querySelector("#todayDry").innerHTML = todayDry.length ? todayDry.map(w => `<div class="item" onclick="showDetail('${w.id}')"><b>${w.theme}</b><div class="meta">${w.base} · ${w.dryDate}</div></div>`).join("") : `<div class="empty">暂无</div>`;
  document.querySelector("#defectList").innerHTML = defects.length ? defects.map(w => `<div class="item overdue" onclick="showDetail('${w.id}')"><b>${w.theme}</b><div class="meta">${w.defect}</div></div>`).join("") : `<div class="empty">暂无</div>`;
  document.querySelector("#deliveryList").innerHTML = delivery.map(w => `<div class="item" onclick="showDetail('${w.id}')"><b>${w.theme}</b><div class="meta">${w.delivery} · ${w.status}</div></div>`).join("");
}

function renderBoard() {
  const list = filtered();
  board.innerHTML = statuses.map(status => {
    const cards = list.filter(w => w.status === status);
    return `<section class="col">
      <h3><span>${status}</span><span>${cards.length}</span></h3>
      ${cards.length ? cards.map(w => `<article class="item ${w.defect ? "overdue" : ""}" onclick="showDetail('${w.id}')">
        <b>${w.theme}</b>
        <div class="meta">${w.base} · ${w.line}<br>进度 ${w.progress}% · 阴干 ${w.dryDate}<br>金粉：${w.gold} · 交付：${w.delivery}<br>${w.defect ? "缺陷：" + w.defect : "缺陷：无"}</div>
        <div class="actions" onclick="event.stopPropagation()">
          ${statuses.map(s => `<button class="${s === status ? "secondary" : ""}" onclick="updateStatus('${w.id}', '${s}')">${s}</button>`).join("")}
          <button class="warn" onclick="recordDefect('${w.id}')">记缺陷</button>
          ${status === "待交付" ? `<button class="violet" onclick="archiveWork('${w.id}')">归档</button>` : ""}
        </div>
      </article>`).join("") : `<div class="empty">暂无作品</div>`}
    </section>`;
  }).join("");
}

function renderArchive() {
  const list = works.filter(w => w.archived).sort((a, b) => b.delivery.localeCompare(a.delivery));
  archiveCount.textContent = list.length ? `（${list.length}）` : "";
  archiveList.innerHTML = list.length ? list.map(w => `<article class="item archived" onclick="showDetail('${w.id}')">
    <b>${w.theme}</b>
    <div class="meta">${w.base} · ${w.line}<br>交付：${w.delivery} · 归档：${fmtTime(w.archivedAt)}<br>金粉：${w.gold} · 缺陷：${w.defect || "无"}</div>
    <div class="actions" onclick="event.stopPropagation()">
      <button class="violet" onclick="restoreWork('${w.id}')">恢复待交付</button>
    </div>
  </article>`).join("") : `<div class="empty">暂无归档作品</div>`;
}

function showDetail(id) {
  activeId = id;
  const w = works.find(item => item.id === id);
  document.querySelector("#detailTitle").textContent = `${w.theme} · ${w.base}${w.archived ? "（已归档）" : ""}`;
  document.querySelector("#detailContent").innerHTML = `
    胎体材质：${w.base}<br>线条粗细：${w.line}<br>贴线进度：${w.progress}%<br>
    阴干日期：${w.dryDate}<br>金粉状态：${w.gold}<br>缺陷位置：${w.defect || "无"}<br>
    交付日期：${w.delivery}<br>当前状态：${w.status}<br>备注：${w.note || "无"}<br>
    ${w.archived ? `归档时间：${fmtTime(w.archivedAt)}<br>` : ""}
    流转记录：${w.logs.join(" / ")}
  `;
  document.querySelector("#defectInput").value = "";
  // 已归档作品冻结缺陷与流转记录，弹窗只读，仅提供恢复入口
  document.querySelector("#defectField").style.display = w.archived ? "none" : "";
  document.querySelector("#saveDefect").style.display = w.archived ? "none" : "";
  document.querySelector("#archiveBtn").style.display = w.archived ? "none" : "";
  document.querySelector("#restoreBtn").style.display = w.archived ? "" : "none";
  if (!dialog.open) dialog.showModal();
}

function render() {
  renderSummaries();
  renderBoard();
  renderArchive();
}
