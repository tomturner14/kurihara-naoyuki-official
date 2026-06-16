const PROFILE_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS30hnzMlKNn3KQp4ZDetB1xmt8oL8cT7b77t9i4z8D24PV9yzBJ9tBWq1pQgVFBdjTtbPcWngG_8o2/pub?gid=1870206096&single=true&output=csv";

const NEWS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS30hnzMlKNn3KQp4ZDetB1xmt8oL8cT7b77t9i4z8D24PV9yzBJ9tBWq1pQgVFBdjTtbPcWngG_8o2/pub?gid=1719756214&single=true&output=csv";

const SCHEDULE_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS30hnzMlKNn3KQp4ZDetB1xmt8oL8cT7b77t9i4z8D24PV9yzBJ9tBWq1pQgVFBdjTtbPcWngG_8o2/pub?gid=833776285&single=true&output=csv";

const CONTACT_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS30hnzMlKNn3KQp4ZDetB1xmt8oL8cT7b77t9i4z8D24PV9yzBJ9tBWq1pQgVFBdjTtbPcWngG_8o2/pub?gid=2088961688&single=true&output=csv";

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  loadNews();
  loadSchedule();
  loadContact();
});

async function loadProfile() {
  const profileContent = document.querySelector("#profile-content");

  if (!profileContent) {
    return;
  }

  try {
    const rows = await fetchCsvObjects(PROFILE_CSV_URL);

    const publicProfiles = rows
      .filter((row) => isChecked(row["表示する"]))
      .sort(compareBySortOrder);

    renderProfile(publicProfiles, profileContent);
  } catch (error) {
    console.error(error);
    profileContent.innerHTML = '<p class="muted">プロフィールを読み込めませんでした。</p>';
  }
}

async function loadNews() {
  const newsList = document.querySelector("#news-list");

  if (!newsList) {
    return;
  }

  try {
    const rows = await fetchCsvObjects(NEWS_CSV_URL);

    const publicNews = rows
      .filter((row) => isChecked(row["表示する"]))
      .sort(compareBySortOrder);

    renderNews(publicNews, newsList);
  } catch (error) {
    console.error(error);
    newsList.innerHTML = '<p class="muted">お知らせを読み込めませんでした。</p>';
  }
}

async function loadSchedule() {
  const scheduleList = document.querySelector("#schedule-list");

  if (!scheduleList) {
    return;
  }

  try {
    const rows = await fetchCsvObjects(SCHEDULE_CSV_URL);

    const publicSchedules = rows
      .filter((row) => isChecked(row["表示する"]))
      .sort(compareScheduleItems);

    renderSchedule(publicSchedules, scheduleList);
  } catch (error) {
    console.error(error);
    scheduleList.innerHTML = '<p class="muted">出演情報を読み込めませんでした。</p>';
  }
}

async function loadContact() {
  const contactContent = document.querySelector("#contact-content");

  if (!contactContent) {
    return;
  }

  try {
    const rows = await fetchCsvObjects(CONTACT_CSV_URL);

    const publicContacts = rows
      .filter((row) => isChecked(row["表示する"]))
      .sort(compareBySortOrder);

    renderContact(publicContacts, contactContent);
  } catch (error) {
    console.error(error);
    contactContent.innerHTML = '<p class="muted">お問い合わせ情報を読み込めませんでした。</p>';
  }
}

async function fetchCsvObjects(url) {
  const response = await fetch(`${url}&cacheBust=${Date.now()}`);

  if (!response.ok) {
    throw new Error(`CSVの取得に失敗しました: ${response.status}`);
  }

  const csvText = await response.text();
  return csvToObjects(csvText);
}

function renderProfile(profileItems, container) {
  if (profileItems.length === 0) {
    container.innerHTML = '<p class="muted">プロフィールは現在準備中です。</p>';
    return;
  }

  container.innerHTML = profileItems.map(createProfileBlockHtml).join("");
}

function renderNews(newsItems, container) {
  if (newsItems.length === 0) {
    container.innerHTML = '<p class="muted">現在、掲載中のお知らせはありません。</p>';
    return;
  }

  container.innerHTML = newsItems.map(createNewsCardHtml).join("");
}

function renderSchedule(scheduleItems, container) {
  if (scheduleItems.length === 0) {
    container.innerHTML = '<p class="muted">現在、掲載中の出演情報はありません。</p>';
    return;
  }

  container.innerHTML = scheduleItems.map(createScheduleCardHtml).join("");
}

function renderContact(contactItems, container) {
  if (contactItems.length === 0) {
    container.innerHTML = '<p class="muted">お問い合わせ情報は現在準備中です。</p>';
    return;
  }

  container.innerHTML = contactItems.map(createContactBlockHtml).join("");
}

function createProfileBlockHtml(item) {
  const title = escapeHtml(item["見出し"] || "");
  const body = escapeHtml(item["本文"] || "");

  const titleHtml = title && title !== "Profile" ? `<h3>${title}</h3>` : "";
  const bodyHtml = body ? `<p>${body}</p>` : "";

  return `
    <div class="profile-block">
      ${titleHtml}
      ${bodyHtml}
    </div>
  `;
}

function createContactBlockHtml(item) {
  const title = escapeHtml(item["見出し"] || "");
  const body = escapeHtml(item["本文"] || "");
  const linkText = escapeHtml(item["リンク文字"] || "");
  const linkUrl = item["リンクURL"] || "";

  const titleHtml = title && title !== "Contact" ? `<h3>${title}</h3>` : "";
  const bodyHtml = body ? `<p>${body}</p>` : "";

  const linkHtml =
    linkText && linkUrl
      ? `<p class="card-link"><a href="${escapeAttribute(linkUrl)}" target="_blank" rel="noopener noreferrer">${linkText}</a></p>`
      : "";

  return `
    <div class="contact-block">
      ${titleHtml}
      ${bodyHtml}
      ${linkHtml}
    </div>
  `;
}

function createNewsCardHtml(item) {
  const date = escapeHtml(item["公開日"] || "");
  const category = escapeHtml(item["種別"] || "");
  const title = escapeHtml(item["タイトル"] || "");
  const body = escapeHtml(item["本文"] || "");
  const linkText = escapeHtml(item["リンク文字"] || "");
  const linkUrl = item["リンクURL"] || "";

  const categoryHtml = category ? `<span class="tag">${category}</span>` : "";

  const linkHtml =
    linkText && linkUrl
      ? `<p class="card-link"><a href="${escapeAttribute(linkUrl)}" target="_blank" rel="noopener noreferrer">${linkText}</a></p>`
      : "";

  return `
    <article class="card">
      <div class="card-meta">
        <p class="date">${date}</p>
        ${categoryHtml}
      </div>
      <h3>${title}</h3>
      <p>${body}</p>
      ${linkHtml}
    </article>
  `;
}

function createScheduleCardHtml(item) {
  const date = escapeHtml(item["開催日"] || "");
  const startTime = escapeHtml(item["開始時刻"] || "");
  const endTime = escapeHtml(item["終了時刻"] || "");
  const title = escapeHtml(item["イベント名"] || "");
  const venue = escapeHtml(item["会場名"] || "");
  const area = escapeHtml(item["地域"] || "");
  const detail = escapeHtml(item["詳細"] || "");
  const linkText = escapeHtml(item["リンク文字"] || "");
  const linkUrl = item["リンクURL"] || "";

  const timeText = createTimeText(startTime, endTime);
  const placeText = [venue, area].filter(Boolean).join(" / ");

  const timeHtml = timeText ? `<p class="schedule-detail">${timeText}</p>` : "";
  const placeHtml = placeText ? `<p class="schedule-detail">${escapeHtml(placeText)}</p>` : "";
  const detailHtml = detail ? `<p>${detail}</p>` : "";

  const linkHtml =
    linkText && linkUrl
      ? `<p class="card-link"><a href="${escapeAttribute(linkUrl)}" target="_blank" rel="noopener noreferrer">${linkText}</a></p>`
      : "";

  return `
    <article class="card">
      <p class="date">${date}</p>
      <h3>${title}</h3>
      ${timeHtml}
      ${placeHtml}
      ${detailHtml}
      ${linkHtml}
    </article>
  `;
}

function createTimeText(startTime, endTime) {
  if (startTime && endTime) {
    return `${startTime}〜${endTime}`;
  }

  if (startTime) {
    return `${startTime}〜`;
  }

  if (endTime) {
    return `〜${endTime}`;
  }

  return "";
}

function compareBySortOrder(a, b) {
  const sortA = Number(a["表示順"] || a["sort_order"] || 9999);
  const sortB = Number(b["表示順"] || b["sort_order"] || 9999);

  return sortA - sortB;
}

function compareScheduleItems(a, b) {
  const sortResult = compareBySortOrder(a, b);

  if (sortResult !== 0) {
    return sortResult;
  }

  return String(a["開催日"] || "").localeCompare(String(b["開催日"] || ""));
}

function csvToObjects(csvText) {
  const rows = parseCsv(csvText);

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());

  return rows.slice(1).map((row) => {
    const item = {};

    headers.forEach((header, index) => {
      item[header] = row[index] ? row[index].trim() : "";
    });

    return item;
  });
}

function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i += 1;
      }

      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows.filter((currentRow) => currentRow.some((cell) => cell.trim() !== ""));
}

function isChecked(value) {
  return String(value).trim().toUpperCase() === "TRUE";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
