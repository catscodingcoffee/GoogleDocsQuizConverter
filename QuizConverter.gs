//regular expressions created with Claude Code

function convertDocToForm() {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  
  var form = FormApp.create(doc.getName());
  form.setIsQuiz(true);
  
  var paragraphs = body.getParagraphs();
  
  var currentQuestion = '';
  var choices = [];
  var correctAnswerLetter = '';
  var questionCount = 0;
  
  for (var i = 0; i < paragraphs.length; i++) {
    var paraText = paragraphs[i].getText();
    
    // Google Docs uses vertical tab (\v or \u000b) for soft line breaks
    var lines = paraText.split(/[\n\r\v\u000b]+/);
    

    for (var j = 0; j < lines.length; j++) {
      var line = lines[j].trim();
      
      if (line === '') continue;
      
      
      // Check if this is a question
      if (/^\d+\.\s*/.test(line)) {
        // Save previous question if complete
        if (currentQuestion && choices.length > 0 && correctAnswerLetter) {
          addQuestionToForm(form, currentQuestion, choices, correctAnswerLetter);
          questionCount++;
        }
        
        currentQuestion = line.replace(/^\d+\.\s*/, '');
        choices = [];
        correctAnswerLetter = '';

      }
      // Check if this is a choice
      else if (/^[A-D]\.\s*/.test(line)) {
        var letter = line.charAt(0);
        var choiceText = line.replace(/^[A-D]\.\s*/, '');
        choices.push({
          letter: letter,
          text: choiceText
        });

      }
      // Check if this is the answer
      else if (/^Answer:\s*[A-D]$/i.test(line)) {
        correctAnswerLetter = line.replace(/^Answer:\s*/i, '').trim();

        if (currentQuestion && choices.length > 0) {
          addQuestionToForm(form, currentQuestion, choices, correctAnswerLetter);
          questionCount++;
          currentQuestion = '';
          choices = [];
          correctAnswerLetter = '';
        }
      }
    }
  }
  
  // Add last question
  if (currentQuestion && choices.length > 0 && correctAnswerLetter) {
    addQuestionToForm(form, currentQuestion, choices, correctAnswerLetter);
    questionCount++;
  }
  
  var ui = DocumentApp.getUi();
  if (questionCount > 0) {
    ui.alert('Quiz Form Created!', 
             'Total questions: ' + questionCount + '\n\n' +
             'Edit URL: ' + form.getEditUrl(),
             ui.ButtonSet.OK);
  } else {
    ui.alert('No Questions Found - Check Logs', ui.ButtonSet.OK);
  }
}

function addQuestionToForm(form, questionText, choices, correctLetter) {
  var item = form.addMultipleChoiceItem();
  item.setTitle(questionText);
  item.setPoints(1);
  
  var choiceObjects = choices.map(function(choice) {
    return item.createChoice(choice.text, choice.letter === correctLetter);
  });
  
  item.setChoices(choiceObjects);
}

function onOpen() {
  DocumentApp.getUi()
    .createMenu('Quiz Converter')
    .addItem('Convert to Google Form', 'convertDocToForm')
    .addToUi();
}
