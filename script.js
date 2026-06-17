const SITE_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS30hnzMlKNn3KQp4ZDetB1xmt8oL8cT7b77t9i4z8D24PV9yzBJ9tBWq1pQgVFBdjTtbPcWngG_8o2/pub?gid=0&single=true&output=csv";

const PROFILE_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS30hnzMlKNn3KQp4ZDetB1xmt8oL8cT7b77t9i4z8D24PV9yzBJ9tBWq1pQgVFBdjTtbPcWngG_8o2/pub?gid=1870206096&single=true&output=csv";

const NEWS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS30hnzMlKNn3KQp4ZDetB1xmt8oL8cT7b77t9i4z8D24PV9yzBJ9tBWq1pQgVFBdjTtbPcWngG_8o2/pub?gid=1719756214&single=true&output=csv";

const SCHEDULE_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS30hnzMlKNn3KQp4ZDetB1xmt8oL8cT7b77t9i4z8D24PV9yzBJ9tBWq1pQgVFBdjTtbPcWngG_8o2/pub?gid=833776285&single=true&output=csv";

const CONTACT_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS30hnzMlKNn3KQp4ZDetB1xmt8oL8cT7b77t9i4z8D24PV9yzBJ9tBWq1pQgVFBdjTtbPcWngG_8o2/pub?gid=2088961688&single=true&output=csv";

const DISCOGRAPHY_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS30hnzMlKNn3KQp4ZDetB1xmt8oL8cT7b77t9i4z8D24PV9yzBJ9tBWq1pQgVFBdjTtbPcWngG_8o2/pub?gid=2047365638&single=true&output=csv";

document.addEventListener("DOMContentLoaded", () => {
  loadSite();
  loadProfile();
  loadNews();
  loadSchedule();
  loadContact();
  loadDiscography();
});

async function loadSite() {
  try {
    const rows = await fetchCsvObjects(SITE_CSV_URL);
    const siteSettings = rowsToSettings(rows);

    applySiteSettings(siteSettings);
  } catch (error) {
    console.error(error);
  }
}

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
    profileContent.innerHTML =
      '<p class="muted">プロフィールを読み込めませんでした。</p>';
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
      .sort(compareNewsItems);

    const displayNews = document.querySelector(".home-site-header")
      ? publicNews.slice(0, 2)
      : publicNews;

    renderNews(displayNews, newsList);
  } catch (error) {
    console.error(error);
    newsList.innerHTML =
      '<p class="muted">お知らせを読み込めませんでした。</p>';
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

    const displaySchedules = document.querySelector(".home-site-header")
      ? publicSchedules.slice(0, 2)
      : publicSchedules;

    renderSchedule(displaySchedules, scheduleList);
  } catch (error) {
    console.error(error);
    scheduleList.innerHTML =
      '<p class="muted">出演情報を読み込めませんでした。</p>';
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
    contactContent.innerHTML =
      '<p class="muted">お問い合わせ情報を読み込めませんでした。</p>';
  }
}

async function loadDiscography() {
  const discographyContent = document.querySelector("#discography-content");

  if (!discographyContent) {
    return;
  }

  try {
    const rows = await fetchCsvObjects(DISCOGRAPHY_CSV_URL);

    const publicDiscographyItems = rows
      .filter(
        (row) => isChecked(row["表示する"]) && row["ID"] && row["タイトル"],
      )
      .sort(compareDiscographyItems);

    renderDiscography(publicDiscographyItems, discographyContent);
  } catch (error) {
    console.error(error);
    discographyContent.innerHTML =
      '<p class="muted">ディスコグラフィーを読み込めませんでした。</p>';
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

function rowsToSettings(rows) {
  return rows.reduce((settings, row) => {
    const rawKey = row["設定キー"] || row["項目名"];
    const key = normalizeSiteSettingKey(rawKey);
    const value = row["値"];

    if (key && value) {
      settings[key] = value;
    }

    return settings;
  }, {});
}

function normalizeSiteSettingKey(key) {
  const keyText = String(key || "").trim();

  const keyMap = {
    サイトタイトル: "site_title",
    表示名: "artist_name",
    小見出し: "hero_label",
    説明文: "hero_description",
    コピーライト: "copyright",
  };

  return keyMap[keyText] || keyText;
}

function applySiteSettings(settings) {
  setText("#hero-label", settings.hero_label);
  setText("#artist-name", settings.artist_name);
  setText("#hero-description", settings.hero_description);
  setText("#copyright", settings.copyright);

  if (settings.site_title) {
    document.title = settings.site_title;
  }

  const description = document.querySelector('meta[name="description"]');

  if (description && settings.hero_description) {
    description.setAttribute("content", settings.hero_description);
  }
}

function setText(selector, value) {
  const element = document.querySelector(selector);

  if (!element || !value) {
    return;
  }

  element.textContent = value;
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
    container.innerHTML =
      '<p class="muted">現在、掲載中のお知らせはありません。</p>';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const detailId = params.get("id");

  if (detailId) {
    renderNewsDetail(newsItems, container, detailId);
    return;
  }

  container.innerHTML = newsItems
    .map((item, index) => createNewsCardHtml(item, index === 0))
    .join("");
}

function renderNewsDetail(newsItems, container, detailId) {
  const item = newsItems.find((newsItem) => getManagedId(newsItem) === detailId);

  if (!item) {
    container.innerHTML = `
      <p class="muted">指定されたお知らせが見つかりませんでした。</p>
      <p class="card-link"><a href="news.html">一覧に戻る</a></p>
    `;
    return;
  }

  container.innerHTML = createNewsDetailHtml(item);
}


function renderSchedule(scheduleItems, container) {
  if (scheduleItems.length === 0) {
    container.innerHTML =
      '<p class="muted">現在、掲載中の出演情報はありません。</p>';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const detailId = params.get("id");

  if (detailId) {
    renderScheduleDetail(scheduleItems, container, detailId);
    return;
  }

  container.innerHTML = scheduleItems
    .map((item, index) => createScheduleCardHtml(item, index === 0))
    .join("");
}

function renderScheduleDetail(scheduleItems, container, detailId) {
  const item = scheduleItems.find(
    (scheduleItem) => getManagedId(scheduleItem) === detailId,
  );

  if (!item) {
    container.innerHTML = `
      <p class="muted">指定された出演情報が見つかりませんでした。</p>
      <p class="card-link"><a href="schedule.html">一覧に戻る</a></p>
    `;
    return;
  }

  container.innerHTML = createScheduleDetailHtml(item);
}

function renderContact(contactItems, container) {
  if (contactItems.length === 0) {
    container.innerHTML =
      '<p class="muted">お問い合わせ情報は現在準備中です。</p>';
    return;
  }

  container.innerHTML = contactItems.map(createContactBlockHtml).join("");
}

function renderDiscography(discographyItems, container) {
  if (discographyItems.length === 0) {
    container.innerHTML =
      '<p class="muted">現在、掲載中の作品はありません。</p>';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const detailId = params.get("id");

  if (detailId) {
    renderDiscographyDetail(discographyItems, container, detailId);
    return;
  }

  renderDiscographyList(discographyItems, container, params.get("genre"));
}

function renderDiscographyList(discographyItems, container, currentGenre) {
  const genres = createDiscographyGenres(discographyItems);
  const selectedGenre = currentGenre || "ALL";
  const visibleItems =
    selectedGenre === "ALL"
      ? discographyItems
      : discographyItems.filter((item) => item["ジャンル"] === selectedGenre);

  const filterHtml = createDiscographyFilterHtml(genres, selectedGenre);

  const listHtml =
    visibleItems.length > 0
      ? `<div class="discography-grid">${visibleItems
          .map(createDiscographyCardHtml)
          .join("")}</div>`
      : '<p class="muted">このジャンルの作品は現在ありません。</p>';

  container.innerHTML = `
    ${filterHtml}
    ${listHtml}
  `;
}

function renderDiscographyDetail(discographyItems, container, detailId) {
  const item = discographyItems.find(
    (discographyItem) => discographyItem["ID"] === detailId,
  );

  if (!item) {
    container.innerHTML = `
      <p class="muted">指定された作品が見つかりませんでした。</p>
      <p class="card-link"><a href="discography.html">一覧に戻る</a></p>
    `;
    return;
  }

  container.innerHTML = createDiscographyDetailHtml(item);
}

function createDiscographyGenres(discographyItems) {
  const genres = discographyItems
    .map((item) => item["ジャンル"])
    .filter(Boolean);

  return [...new Set(genres)];
}

function createDiscographyFilterHtml(genres, selectedGenre) {
  const allClass = selectedGenre === "ALL" ? " is-active" : "";

  const genreLinks = genres
    .map((genre) => {
      const activeClass = genre === selectedGenre ? " is-active" : "";
      return `<a class="discography-filter-link${activeClass}" href="discography.html?genre=${encodeURIComponent(
        genre,
      )}">${escapeHtml(genre)}</a>`;
    })
    .join("");

  return `
    <nav class="discography-filter" aria-label="ディスコグラフィーフィルター">
      <a class="discography-filter-link${allClass}" href="discography.html">ALL</a>
      ${genreLinks}
    </nav>
  `;
}

function createDiscographyCardHtml(item) {
  const id = item["ID"];
  const title = escapeHtml(item["タイトル"] || "");
  const englishTitle = escapeHtml(item["英字タイトル"] || "");
  const genre = escapeHtml(item["ジャンル"] || "");
  const releaseDate = escapeHtml(item["発売日"] || "");
  const jacketUrl = item["ジャケット画像URL"] || "";

  const englishTitleHtml = englishTitle
    ? `<p class="discography-card-subtitle">${englishTitle}</p>`
    : "";
  const genreHtml = genre
    ? `<p class="discography-card-meta">${genre}</p>`
    : "";
  const releaseDateHtml = releaseDate
    ? `<p class="discography-card-date">${releaseDate}</p>`
    : "";

  return `
    <a class="discography-card" href="discography.html?id=${escapeAttribute(encodeURIComponent(id))}">
      <div class="discography-cover">
        ${createDiscographyCoverHtml(jacketUrl, title)}
      </div>
      <div class="discography-card-body">
        ${genreHtml}
        <h3>${title}</h3>
        ${englishTitleHtml}
        ${releaseDateHtml}
      </div>
    </a>
  `;
}

function createDiscographyDetailHtml(item) {
  const title = escapeHtml(item["タイトル"] || "");
  const englishTitle = escapeHtml(item["英字タイトル"] || "");
  const genre = escapeHtml(item["ジャンル"] || "");
  const releaseDate = escapeHtml(item["発売日"] || "");
  const description = escapeHtml(item["説明"] || "");
  const jacketUrl = item["ジャケット画像URL"] || "";

  const englishTitleHtml = englishTitle
    ? `<p class="discography-detail-subtitle">${englishTitle}</p>`
    : "";
  const genreHtml = genre ? `<span class="tag">${genre}</span>` : "";
  const releaseDateHtml = releaseDate
    ? `<p class="date">${releaseDate}</p>`
    : "";
  const descriptionHtml = description ? `<p>${description}</p>` : "";
  const trackListHtml = createDiscographyTrackListHtml(item);
  const serviceLinksHtml = createDiscographyServiceLinksHtml(item);

  return `
    <p class="card-link discography-back-link"><a href="discography.html">一覧に戻る</a></p>

    <article class="discography-detail">
      <div class="discography-detail-cover">
        ${createDiscographyCoverHtml(jacketUrl, title)}
      </div>

      <div class="discography-detail-body">
        <div class="card-meta">
          ${releaseDateHtml}
          ${genreHtml}
        </div>
        <h2>${title}</h2>
        ${englishTitleHtml}
        ${descriptionHtml}
        ${trackListHtml}
        ${serviceLinksHtml}
      </div>
    </article>
  `;
}

function createDiscographyCoverHtml(jacketUrl, altText) {
  const imageUrl = normalizeImageUrl(jacketUrl);

  if (imageUrl) {
    return `<img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(altText)}のジャケット画像" />`;
  }

  return '<div class="discography-no-image">No Image</div>';
}

function normalizeImageUrl(url) {
  const imageUrl = String(url || "").trim();

  if (!imageUrl) {
    return "";
  }

  if (!imageUrl.includes("drive.google.com")) {
    return imageUrl;
  }

  const fileIdMatch =
    imageUrl.match(/\/file\/d\/([^/]+)/) || imageUrl.match(/[?&]id=([^&]+)/);

  if (!fileIdMatch) {
    return imageUrl;
  }

  const fileId = fileIdMatch[1];

  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w800`;
}

function createDiscographyTrackListHtml(item) {
  const rawTrackList = String(
    item["トラックリスト"] || item["収録曲"] || item["Tracks"] || "",
  ).trim();

  if (!rawTrackList) {
    return "";
  }

  const tracks = rawTrackList
    .split(/\r?\n/)
    .map((track) => track.trim())
    .filter(Boolean);

  if (tracks.length === 0) {
    return "";
  }

  const trackItemsHtml = tracks
    .map((track) => {
      const normalizedTrack = track.replace(/^\d+[\.．、\)）\-\s]+/, "");
      const [title, time] = normalizedTrack
        .split(/\s*[|｜]\s*/)
        .map((value) => value.trim());

      const timeHtml = time
        ? `<span class="discography-track-time">${escapeHtml(time)}</span>`
        : "";

      return `
        <li>
          <span class="discography-track-title">${escapeHtml(title)}</span>
          ${timeHtml}
        </li>
      `;
    })
    .join("");

  return `
    <section class="discography-tracklist" aria-label="トラックリスト">
      <h3>- TrackList -</h3>
      <ol>
        ${trackItemsHtml}
      </ol>
    </section>
  `;
}

function createDiscographyServiceLinksHtml(item) {
  const summaryLinkUrl = String(
    item["配信まとめURL"] ||
      item["配信・購入URL"] ||
      item["スマートリンクURL"] ||
      "",
  ).trim();

  const summaryLinkHtml = summaryLinkUrl
    ? `
        <a
          class="discography-service-link discography-service-link-primary"
          href="${escapeAttribute(summaryLinkUrl)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>配信・購入はこちら</span>
        </a>
      `
    : "";

  const services = [
    ["Apple Music", item["Apple Music URL"], "聴く"],
    ["Spotify", item["Spotify URL"], "聴く"],
    ["Amazon Music", item["Amazon Music URL"], "聴く"],
    ["YouTube Music", item["YouTube Music URL"], "聴く"],
    ["LINE MUSIC", item["LINE MUSIC URL"], "聴く"],
    ["iTunes Store", item["iTunes Store URL"], "購入"],
  ];

  const otherLinkName = item["その他リンク名"] || "";
  const otherLinkUrl = item["その他リンクURL"] || "";

  if (otherLinkName && otherLinkUrl) {
    services.push([otherLinkName, otherLinkUrl, "開く"]);
  }

  const serviceLinksHtml = services
    .filter(([, url]) => url)
    .map(
      ([name, url, actionText]) => `
        <a class="discography-service-link" href="${escapeAttribute(
          url,
        )}" target="_blank" rel="noopener noreferrer">
          <span>${escapeHtml(name)}</span>
          <strong>${escapeHtml(actionText)}</strong>
        </a>
      `,
    )
    .join("");

  const links = [summaryLinkHtml, serviceLinksHtml].filter(Boolean).join("");

  if (!links) {
    return '<p class="muted">配信リンクは現在準備中です。</p>';
  }

  return `
    <div class="discography-services" aria-label="配信サービス">
      <h3>Streaming / Store</h3>
      <div class="discography-service-list">
        ${links}
      </div>
    </div>
  `;
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



function createNewsCardHtml(item, isLatest = false) {
  const id = getManagedId(item);
  const date = escapeHtml(item["公開日"] || "");
  const category = escapeHtml(item["種別"] || "");
  const title = escapeHtml(item["タイトル"] || "");
  const body = escapeHtml(item["本文"] || "");
  const linkText = escapeHtml(item["リンク文字"] || "");
  const linkUrl = item["リンクURL"] || "";

  const categoryHtml = category ? `<span class="tag">${category}</span>` : "";
  const latestBadgeHtml = isLatest ? '<span class="new-badge">NEW</span>' : "";
  const detailUrl = id
    ? `news.html?id=${escapeAttribute(encodeURIComponent(id))}`
    : "";

  if (detailUrl) {
    return `
      <a class="card card-clickable" href="${detailUrl}" aria-label="${title}の詳細を見る">
        <div class="card-meta">
          <p class="date">${date}</p>
          ${categoryHtml}
          ${latestBadgeHtml}
        </div>
        <h3>${title}</h3>
        <p>${body}</p>
      </a>
    `;
  }

  const linkHtml =
    linkText && linkUrl
      ? `<p class="card-link"><a href="${escapeAttribute(linkUrl)}" target="_blank" rel="noopener noreferrer">${linkText}</a></p>`
      : "";

  return `
    <article class="card">
      <div class="card-meta">
        <p class="date">${date}</p>
        ${categoryHtml}
        ${latestBadgeHtml}
      </div>
      <h3>${title}</h3>
      <p>${body}</p>
      ${linkHtml}
    </article>
  `;
}

function createNewsDetailHtml(item) {
  const date = escapeHtml(item["公開日"] || "");
  const category = escapeHtml(item["種別"] || "");
  const title = escapeHtml(item["タイトル"] || "");
  const summary = escapeHtml(item["本文"] || "");
  const detailBody = item["詳細本文"] || item["詳細"] || "";
  const imageUrl = item["画像URL"] || item["画像"] || "";
  const linkText = escapeHtml(item["リンク文字"] || "");
  const linkUrl = item["リンクURL"] || "";

  const categoryHtml = category ? `<span class="tag">${category}</span>` : "";
  const dateHtml = date ? `<p class="date">${date}</p>` : "";
  const summaryHtml = summary ? `<p class="detail-lead">${summary}</p>` : "";
  const detailBodyHtml = createTextBlockHtml(detailBody);
  const imageHtml = imageUrl
    ? `
      <figure class="detail-image news-detail-image">
        <img src="${escapeAttribute(normalizeImageUrl(imageUrl))}" alt="${title}">
      </figure>
    `
    : "";
  const linkHtml =
    linkText && linkUrl
      ? `<p class="card-link detail-main-link"><a href="${escapeAttribute(linkUrl)}" target="_blank" rel="noopener noreferrer">${linkText}</a></p>`
      : "";

  return `
    <p class="card-link detail-back-link"><a href="news.html">一覧に戻る</a></p>

    <article class="detail-card">
      ${imageHtml}

      <div class="detail-card-body">
        <div class="card-meta">
          ${dateHtml}
          ${categoryHtml}
        </div>

        <h2>${title}</h2>
        ${summaryHtml}
        ${detailBodyHtml}
        ${linkHtml}
      </div>
    </article>
  `;
}



function createScheduleCardHtml(item, isLatest = false) {
  const id = getManagedId(item);
  const date = escapeHtml(item["開催日"] || "");
  const openTime = escapeHtml(item["開場時刻"] || item["開場"] || "");
  const startTime = escapeHtml(item["開始時刻"] || "");
  const endTime = escapeHtml(item["終了時刻"] || "");
  const title = escapeHtml(item["イベント名"] || "");
  const venue = escapeHtml(item["会場名"] || "");
  const area = escapeHtml(item["地域"] || "");
  const ticketPrice = formatTicketPrice(item["チケット料金"] || item["料金"] || "");
  const linkText = escapeHtml(item["リンク文字"] || "");
  const linkUrl = item["リンクURL"] || "";

  const latestBadgeHtml = isLatest ? '<span class="new-badge">NEW</span>' : "";
  const timeText = createTimeText(startTime, endTime);
  const placeText = [venue, area].filter(Boolean).join(" / ");
  const detailUrl = id
    ? `schedule.html?id=${escapeAttribute(encodeURIComponent(id))}`
    : "";

  const timeParts = [];

  if (openTime) {
    timeParts.push(`開場：${openTime}`);
  }

  if (timeText) {
    timeParts.push(`開演：${timeText}`);
  }

  const timeHtml = timeParts.length
    ? `<p class="schedule-detail">${timeParts.join(" / ")}</p>`
    : "";

  const placeHtml = placeText
    ? `<p class="schedule-detail">${escapeHtml(placeText)}</p>`
    : "";

  const ticketPriceHtml = ticketPrice
    ? `<p class="schedule-detail">チケット：${escapeHtml(ticketPrice)}</p>`
    : "";

  if (detailUrl) {
    return `
      <a class="card card-clickable" href="${detailUrl}" aria-label="${title}の詳細を見る">
        <div class="card-meta">
          <p class="date">${date}</p>
          ${latestBadgeHtml}
        </div>
        <h3>${title}</h3>
        ${timeHtml}
        ${placeHtml}
        ${ticketPriceHtml}
      </a>
    `;
  }

  const linkHtml =
    linkText && linkUrl
      ? `<p class="card-link"><a href="${escapeAttribute(linkUrl)}" target="_blank" rel="noopener noreferrer">${linkText}</a></p>`
      : "";

  return `
    <article class="card">
      <div class="card-meta">
        <p class="date">${date}</p>
        ${latestBadgeHtml}
      </div>
      <h3>${title}</h3>
      ${timeHtml}
      ${placeHtml}
      ${ticketPriceHtml}
      ${linkHtml}
    </article>
  `;
}



function createScheduleDetailHtml(item) {
  const date = item["開催日"] || "";
  const openTime = item["開場時刻"] || item["開場"] || "";
  const startTime = item["開始時刻"] || "";
  const endTime = item["終了時刻"] || "";
  const title = item["イベント名"] || "";
  const venue = item["会場名"] || "";
  const area = item["地域"] || "";
  const address = item["住所"] || "";
  const price = formatTicketPrice(item["チケット料金"] || item["料金"] || "");
  const performers = item["出演者"] || item["出演"] || "";
  const detail = item["詳細"] || "";
  const detailBody = item["詳細本文"] || "";

  const imageUrl =
    item["イメージ画像URL"] ||
    item["イベント画像URL"] ||
    item["画像URL"] ||
    item["フライヤー画像URL"] ||
    "";

  const ticketLinkUrl = item["リンクURL"] || "";
  const ticketLinkText = item["リンク文字"] || "チケットはこちら";

  const eventSiteUrl =
    item["イベントHP URL"] ||
    item["イベントHPURL"] ||
    item["イベントURL"] ||
    item["イベントページURL"] ||
    "";

  const eventSiteText =
    item["イベントHPリンク文字"] ||
    item["イベントリンク文字"] ||
    "";

  const timeText = createTimeText(startTime, endTime);
  const placeText = [venue, area].filter(Boolean).join(" / ");

  const eventSiteInfoHtml =
    eventSiteUrl && eventSiteText
      ? `<a class="detail-info-link" href="${escapeAttribute(eventSiteUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(eventSiteText)}</a>`
      : "";

  const metaRows = [
    { label: "日程", value: date },
    { label: "開場", value: openTime },
    { label: "開演", value: timeText },
    { label: "会場", value: placeText },
    { label: "住所", value: address },
    { label: "チケット", value: price },
    { label: "出演", value: performers },
    { label: "イベントHP", html: eventSiteInfoHtml },
  ]
    .filter((row) => row.value || row.html)
    .map(
      (row) => `
        <div class="detail-info-row">
          <dt>${escapeHtml(row.label)}</dt>
          <dd>${row.html || escapeHtml(row.value)}</dd>
        </div>
      `,
    )
    .join("");

  const infoHtml = metaRows ? `<dl class="detail-info-list">${metaRows}</dl>` : "";
  const detailHtml = createTextBlockHtml(detail);
  const detailBodyHtml = createTextBlockHtml(detailBody);

  const imageHtml = imageUrl
    ? `
      <figure class="detail-image schedule-detail-image">
        <img src="${escapeAttribute(normalizeImageUrl(imageUrl))}" alt="${escapeAttribute(title)}のイメージ画像">
      </figure>
    `
    : "";

  const ticketLinkHtml =
    ticketLinkUrl && ticketLinkText
      ? `
        <div class="detail-action-links">
          <a class="ticket-button" href="${escapeAttribute(ticketLinkUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ticketLinkText)}</a>
        </div>
      `
      : "";

  return `
    <p class="card-link detail-back-link"><a href="schedule.html">一覧に戻る</a></p>

    <article class="detail-card">
      ${imageHtml}

      <div class="detail-card-body">
        <p class="date">${escapeHtml(date)}</p>
        <h2>${escapeHtml(title)}</h2>
        ${infoHtml}
        ${detailHtml}
        ${detailBodyHtml}
        ${ticketLinkHtml}
      </div>
    </article>
  `;
}


function getManagedId(item) {
  return String(item["管理ID"] || item["ID"] || "").trim();
}

function createTextBlockHtml(text) {
  const rawText = String(text || "").trim();

  if (!rawText) {
    return "";
  }

  const paragraphs = rawText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");

  return `<div class="detail-text">${paragraphs}</div>`;
}



function formatTicketPrice(value) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return "";
  }

  const normalizedNumber = rawValue
    .replace(/[０-９]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0),
    )
    .replace(/[,\s，円¥￥]/g, "");

  if (/^\d+$/.test(normalizedNumber)) {
    return `${Number(normalizedNumber).toLocaleString("ja-JP")}円`;
  }

  return rawValue;
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

  return rows.filter((currentRow) =>
    currentRow.some((cell) => cell.trim() !== ""),
  );
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

function compareDiscographyItems(a, b) {
  const dateResult = compareDateDesc(a["発売日"], b["発売日"]);

  if (dateResult !== 0) {
    return dateResult;
  }

  const orderA = parseSortOrder(a["並び順"]);
  const orderB = parseSortOrder(b["並び順"]);

  if (orderA !== null && orderB !== null && orderA !== orderB) {
    return orderA - orderB;
  }

  if (orderA !== null && orderB === null) {
    return -1;
  }

  if (orderA === null && orderB !== null) {
    return 1;
  }

  return String(a["タイトル"] || "").localeCompare(
    String(b["タイトル"] || ""),
    "ja",
  );
}

// 並び順ルール:
// - news: 公開日の新しい順。同じ日付なら表示順の小さい順。
// - schedule: 開催日の新しい順。同じ日付なら開始時刻の早い順。
// - profile/contact: 表示順の小さい順。
function compareNewsItems(a, b) {
  const dateResult = compareDateDesc(a["公開日"], b["公開日"]);

  if (dateResult !== 0) {
    return dateResult;
  }

  return compareBySortOrder(a, b);
}

function compareScheduleItems(a, b) {
  const dateResult = compareDateDesc(a["開催日"], b["開催日"]);

  if (dateResult !== 0) {
    return dateResult;
  }

  const timeResult = compareTimeAsc(a["開始時刻"], b["開始時刻"]);

  if (timeResult !== 0) {
    return timeResult;
  }

  return compareBySortOrder(a, b);
}

function compareBySortOrder(a, b) {
  const orderA = parseSortOrder(a["表示順"]);
  const orderB = parseSortOrder(b["表示順"]);

  if (orderA !== null && orderB !== null) {
    return orderA - orderB;
  }

  if (orderA !== null) {
    return -1;
  }

  if (orderB !== null) {
    return 1;
  }

  return 0;
}

function compareDateDesc(a, b) {
  const dateA = parseDateValue(a);
  const dateB = parseDateValue(b);

  if (dateA !== null && dateB !== null) {
    return dateB - dateA;
  }

  if (dateA !== null) {
    return -1;
  }

  if (dateB !== null) {
    return 1;
  }

  return 0;
}

function compareTimeAsc(a, b) {
  const timeA = parseTimeValue(a);
  const timeB = parseTimeValue(b);

  if (timeA !== null && timeB !== null) {
    return timeA - timeB;
  }

  if (timeA !== null) {
    return -1;
  }

  if (timeB !== null) {
    return 1;
  }

  return 0;
}

function parseSortOrder(value) {
  const order = Number.parseInt(String(value || "").trim(), 10);
  return Number.isFinite(order) ? order : null;
}

function parseDateValue(value) {
  const dateText = String(value || "").trim();

  if (!dateText) {
    return null;
  }

  const match = dateText.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return new Date(year, month - 1, day).getTime();
}

function parseTimeValue(value) {
  const timeText = String(value || "").trim();

  if (!timeText || timeText === "未定") {
    return null;
  }

  const match = timeText.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  return hour * 60 + minute;
}
