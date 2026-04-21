const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUkz1Fw9iO-qQKp1b_Fhvtc0jVENzNiu3-jVHEaWYdjKP7kOz7H8_Np6Q2THH9Sw/pub?output=csv";

let quizData = {};
let chapters = [];
let currentChapter = 0;
let chapterScores = {};

// ✅ Robust CSV parser
function parseCSV(text) {
  const rows = text.trim().split("\n");

  const headers = rows[0].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
    .map(h => h.replace(/"/g, "").trim());

  return rows.slice(1).map(row => {
    const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
      .map(c => c.replace(/"/g, "").trim());

    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = cols[i];
    });

    return {
      question: obj["Question"],
      options: [
        obj["Option 1"],
        obj["Option 2"],
        obj["Option 3"],
        obj["Option 4"]
      ],
      answer: obj["Answer Key"],
      chapter: obj["Chapter"] || "Uncategorized"
    };
  });
}

// ✅ Load and group by chapter
async function loadQuestions() {
  try {
    const res = await fetch(SHEET_URL);
    const text = await res.text();

    const questions = parseCSV(text);

    questions.forEach(q => {
      if (!quizData[q.chapter]) {
        quizData[q.chapter] = [];
      }
      quizData[q.chapter].push(q);
    });

    chapters = Object.keys(quizData);

    if (chapters.length === 0) {
      document.getElementById("quiz").innerText = "No questions found ❌";
      return;
      
    console.log(quizData);
    }

    loadChapter();

  } catch (err) {
    console.error(err);
    document.getElementById("quiz").innerText = "Error loading questions ❌";
  }
}

// ✅ Load one chapter at a time
function loadChapter() {
  const chapter = chapters[currentChapter];
  const questions = quizData[chapter];

  const quizDiv = document.getElementById("quiz");
  quizDiv.innerHTML = `<h2>${chapter}</h2>`;

  questions.forEach((q, index) => {
    let html = `<p><b>${index + 1}. ${q.question}</b></p>`;

    q.options.forEach(opt => {
      html += `
        <label>
          <input type="radio" name="q${index}" value="${opt}">
          ${opt}
        </label><br>
      `;
    });

    quizDiv.innerHTML += html + "<br>";
  });

  quizDiv.innerHTML += `<button onclick="submitChapter()">Submit Chapter</button>`;
}

// ✅ Submit chapter
function submitChapter() {
  const chapter = chapters[currentChapter];
  const questions = quizData[chapter];

  let score = 0;

  questions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);

    if (
      selected &&
      selected.value.trim().toLowerCase() === q.answer.trim().toLowerCase()
    ) {
      score++;
    }
  });

  chapterScores[chapter] = {
    score,
    total: questions.length
  };

  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = `
    <h3>${chapter} Score: ${score}/${questions.length}</h3>
  `;

  if (currentChapter < chapters.length - 1) {
    resultDiv.innerHTML += `<button onclick="nextChapter()">Next Chapter →</button>`;
  } else {
    resultDiv.innerHTML += `<button onclick="showDashboard()">View Dashboard</button>`;
  }
}

// ✅ Next chapter
function nextChapter() {
  currentChapter++;
  document.getElementById("result").innerHTML = "";
  loadChapter();
}

// ✅ Final dashboard
function showDashboard() {
  let totalScore = 0;
  let totalQuestions = 0;

  let html = `<h2>Final Dashboard</h2>`;

  chapters.forEach(ch => {
    const data = chapterScores[ch];
    const percent = ((data.score / data.total) * 100).toFixed(1);

    totalScore += data.score;
    totalQuestions += data.total;

    html += `
      <p><b>${ch}</b>: ${data.score}/${data.total} (${percent}%)</p>
    `;
  });

  const overall = ((totalScore / totalQuestions) * 100).toFixed(1);

  html += `<h3>Overall Score: ${totalScore}/${totalQuestions} (${overall}%)</h3>`;

  document.getElementById("quiz").innerHTML = html;
  document.getElementById("result").innerHTML = "";
}

// 🚀 Start
loadQuestions();
