// 渲染层：看板、风险列表与归档区
const statuses = ["贴线中", "待阴干", "上金粉", "待交付"];
const today = new Date().toISOString().slice(0, 10);

const board = document.querySelector("#board");
const statusFilter = document.querySelector("#statusFilter");
const themeFilter = document.querySelector("#themeFilter");
const sortMode = document.querySelector("#sortMode");

function formatTime(iso) {
  return iso ? new Date(iso).toLocaleString() : "";
}

// 看板与风险列表只看待交付途中的作品，归档的一律移出
function activeWorks(works) {
  return works.filter(w => !w.archived);
}

function filteredWorks(works) {
  return activeWorks(works)
    .filter(w => !statusFilter.value || w.status === statusFilter.value)
    .filter(w => !themeFilter.value || w.theme.includes(themeFilter.value.trim()))
    .sort((a, b) => (a[sortMode.value] || "").localeCompare(b[sortMode.value] || ""));
}

function renderSummaries(works) {
  const current = activeWorks(works);
  const todayDry = current.filter(w => w.dryDate <= today && w.status === "待阴干");
  const defects = current.filter(w => w.defect);
  const delivery = [...current].sort((a, b) => a.delivery.localeCompare(b.delivery)).slice(0, 4);
  document.querySelector("#todayDry").innerHTML = todayDry.length ? todayDry.map(w => `<div class="item" onclick="showDetail('${w.id}')"><b>${w.theme}</b><div class="meta">${w.base} · ${w.dryDate}</div></div>`).join("") : `<div class="empty">暂无</div>`;
  document.querySelector("#defectList").innerHTML = defects.length ? defects.map(w => `<div class="item overdue" onclick="showDetail('${w.id}')"><b>${w.theme}</b><div class="meta">${w.defect}</div></div>`).join("") : `<div class="empty">暂无</div>`;
  document.querySelector("#deliveryList").innerHTML = delivery.length ? delivery.map(w => `<div class="item" onclick="showDetail('${w.id}')"><b>${w.theme}</b><div class="meta">${w.delivery} · ${w.status}</div></div>`).join("") : `<div class="empty">暂无</div>`;
}

function renderBoard(works) {
  const list = filteredWorks(works);
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
          <button class="violet" onclick="archiveWork('${w.id}')">归档</button>
        </div>
      </article>`).join("") : `<div class="empty">暂无作品</div>`}
    </section>`;
  }).join("");
}

function renderArchive(works) {
  const archived = works
    .filter(w => w.archived)
    .sort((a, b) => (b.delivery || "").localeCompare(a.delivery || ""));
  document.querySelector("#archiveList").innerHTML = archived.length ? archived.map(w => `<article class="item archived" onclick="showDetail('${w.id}')">
    <b>${w.theme}</b>
    <div class="meta">${w.base} · ${w.line} · 金粉：${w.gold}<br>交付：${w.delivery} · 归档于 ${formatTime(w.archivedAt)}<br>${w.defect ? "缺陷：" + w.defect : "缺陷：无"}</div>
    <div class="actions" onclick="event.stopPropagation()">
      <button class="violet" onclick="restoreWork('${w.id}')">恢复待交付</button>
    </div>
  </article>`).join("") : `<div class="empty">暂无归档作品</div>`;
}

function render(works) {
  renderSummaries(works);
  renderBoard(works);
  renderArchive(works);
}
