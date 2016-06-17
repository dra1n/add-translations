const fs = require('fs');
const csv = require('fast-csv');
const xml2js = require('xml2js');

const csvFilePath = "translations.csv";
const xliffFilePath = "fr.xliff";

const sax = require('sax');

function withDictionary(file, callback) {
  const dict = {};
  const stream = fs.createReadStream(file);

  const csvStream = csv()
  .on("data", function(data){
    dict[data[0]] = data[1];
  })
  .on("end", function(){
    callback(dict);
  });

  stream.pipe(csvStream);
}

sax.ENTITIES['lt'] = '&lt;'
sax.ENTITIES['gt'] = '&gt;'

function withXiff(file, callback) {
  const builder = new xml2js.Builder({xmldec: { 'version': '1.0', 'encoding': 'UTF-8', 'standalone': false}} );

  try {
    const fileData = fs.readFileSync(file, 'utf8');
    const parser = new xml2js.Parser()
    parser.parseString(fileData.substring(0, fileData.length), function (err, result) {
      callback(builder.buildObject(result, {version: '1.0', encoding: 'UTF-8', standalone: false}));
    });
  } catch (ex) {
    console.log("Unable to read file '" + file + "'.");
    console.log(ex);
  }
}

withDictionary(csvFilePath, function(dict) {
  withXiff(xliffFilePath, function(xliff) {
    //console.log(xliff);
    fs.writeFile('fr-parsed.txt', xliff, 'utf8')
    //console.log(xliff);
  })
});
