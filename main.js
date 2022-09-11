$(document).ready(() => {
  $('#generateBtn').click(() => {
    $('#loading').css("visibility", "visible");
    setTimeout(async () => {
      await generateWord();
      $('#loading').css("visibility", "hidden");
    }, 500);
  });
});

let cachedCorpus = undefined;
let cachedWordDict = undefined;

async function readTextFile(file) {
  if (cachedCorpus !== undefined)
    return cachedCorpus;

  let contents;
  await $.ajax({
    url: file,
    success: (data) => {
      contents = data
      cachedCorpus = data
    }
  })

  return contents;
}

function make_pairs(corpus) {
  let pairs = [];
  corpus.forEach((word, i, corpus) => {

    pairs.push(corpus[i], corpus[i + 1])
  });
  return pairs;
}

let oldFaithAmt = 0;
async function generateWord() {

  let faithAmt = Number($('#faithMeter').val() / 100);
  if (faithAmt != oldFaithAmt) {
    oldFaithAmt = faithAmt;
    cachedWordDict = undefined;
  }

  corpus = (await readTextFile("bible.txt")).split(/\n| /);
  corpus = corpus.slice(0, faithAmt * corpus.length);

  pairs = corpus.map((_, index) => corpus.slice(index, index + 2))

  let wordDict = {}
  if (cachedWordDict == undefined) {
    pairs.forEach(([word1, word2]) => {
      if (Object.keys(wordDict).includes(word1)) {
        wordDict[word1].push(word2);
      } else {
        wordDict[word1] = [word2];
      }
    });

    cachedWordDict = wordDict;
  } else {
    wordDict = cachedWordDict;
  }

  let firstWord = corpus[Math.floor(Math.random() * corpus.length)];

  let verse = Math.floor(Math.random() * 24 + 1);
  verse += ":";
  verse += Math.floor(Math.random() * 24 + 1);

  let chain = [verse, firstWord];

  for (let i = 0; i < Math.random() * 30 + 10; i++) {
    let keys = Object.keys(wordDict);
    let words = wordDict[chain[chain.length - 1]];
    //console.log(words[Math.floor(Math.random() * words.length)]);
    chain.push(words[Math.floor(Math.random() * (words.length - 1))]);
  }

  let result = (chain.join(" "));

  let textArea = $('textarea#output');
  let oldText = textArea.val();
  if (oldText == "") {
    textArea.val(result);
  } else {
    textArea.val(oldText + "\n" + result + "\n");
  }
  textArea.css('this.style.height = "";this.style.height = this.scrollHeight + "px"');
  textArea.height(textArea[0].scrollHeight)
}
