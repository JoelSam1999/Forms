function doGet(e) {
  // Handle undefined e safely
  e = e || {};
  
  // If no parameter, redirect to one with parameter
  if (!e.parameter || !e.parameter.app) {
    const url = ScriptApp.getService().getUrl();
    return HtmlService.createHtmlOutput(
      `<script>window.location.href = "${url}?app=quiz";</script>`
    );
  }

  // Normal app load
  return HtmlService
    .createHtmlOutputFromFile("index")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

function getQuizData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  const data = sheet.getDataRange().getValues();

  data.shift(); // remove header

  let grouped = {};

  data.forEach(row => {
    const correctAnswer = row[0]; // ✅ TEXT answer
    const question = row[1];
    const options = [row[2], row[3], row[4], row[5]];
    const chapter = row[6];

    if (!chapter || !question || !correctAnswer) return;

    if (!grouped[chapter]) {
      grouped[chapter] = [];
    }

    grouped[chapter].push({
      question: question,
      options: options,
      correctAnswer: correctAnswer // ✅ store text
    });
  });

  return grouped;
}
