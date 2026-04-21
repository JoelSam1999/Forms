const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUkz1Fw9iO-qQKp1b_Fhvtc0jVENzNiu3-jVHEaWYdjKP7kOz7H8_Np6Q2THH9Sw/pub?output=csv";

let questions = [];

// ✅ Robust CSV parser (handles commas inside text)
function parseCSV(text) {
  const rows = text.trim().split("\n").slice(1);

  return rows.map(row => {
    const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

    return {
      question: cols[0]?.replace(/"/g, "").trim(),
      options: [
        cols[1]?.replace(/"/g, "").trim(),
        cols[2]?.replace(/"/g, "").trim(),
        cols[3]?.replace(/"/g, "").trim(),
        cols[4]?.replace(/"/g, "").trim()
      ],
      answer: cols[5]?.replace(/"/g, "").trim()
    };
  });
}

async function loadQuestions() {
  try {
    const res = await fetch(SHEET_URL);
    const text = await res.text();

    console.log("CSV Loaded:", text);

    questions = parseCSV(text);
    displayQuiz();

  } catch (err) {
    console.error(err);
    document.getElementById("quiz").innerText =
      "Error loading questions ❌";
  }
}

function displayQuiz() {
  const quizDiv = document.getElementById("quiz");
  quizDiv.innerHTML = "";

  questions.forEach((q, index) => {
    let html = `<p><strong>Q${index + 1}: ${q.question}</strong></p>`;

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
}

function submitQuiz() {
  let score = 0;

  questions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);

    if (selected && selected.value === q.answer) {
      score++;
    }
  });

  document.getElementById("result").innerText =
    `Your Score: ${score} / ${questions.length}`;
}

loadQuestions();
