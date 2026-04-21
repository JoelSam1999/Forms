const SHEET_URL = "https://docs.google.com/spreadsheets/d/12r_xH6gWTLGQQNwG6ry4H6MqXogpOapE/export?format=csv&gid=1237684937";

let questions = [];

async function loadQuestions() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();

  const rows = text.trim().split("\n").slice(1); // skip header

  questions = rows.map(row => {
    const cols = row.split(",");

    return {
      question: cols[0]?.trim(),
      options: [
        cols[1]?.trim(),
        cols[2]?.trim(),
        cols[3]?.trim(),
        cols[4]?.trim()
      ],
      answer: cols[5]?.trim()
    };
  });

  displayQuiz();
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
