// 存储层：localStorage 读写与旧数据迁移
const STORAGE_KEY = "zfl42Works";

// 旧数据没有归档字段，首次打开时补上未归档状态，其余字段原样保留
function migrateWork(work) {
  return {
    ...work,
    logs: Array.isArray(work.logs) ? work.logs : [],
    archived: work.archived === true,
    archivedAt: work.archivedAt || null
  };
}

function loadWorks(seed) {
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch (error) {
    stored = null;
  }
  const works = Array.isArray(stored) ? stored : seed;
  return works.map(migrateWork);
}

function saveWorks(works) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
}
