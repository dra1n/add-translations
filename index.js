const fs = require('fs');
const csv = require('fast-csv');
const xml2js = require('xml2js');
const lens = require('lorgnette').lens;

const sax = require('sax');

sax.ENTITIES['lt'] = '&lt;'
sax.ENTITIES['gt'] = '&gt;'

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

function withXiff(file, callback) {
  try {
    const fileData = fs.readFileSync(file, 'utf8');
    const parser = new xml2js.Parser()
    parser.parseString(fileData.substring(0, fileData.length), function (err, result) {
      //callback();
      callback(result);
    });
  } catch (ex) {
    console.log("Unable to read file '" + file + "'.");
    console.log(ex);
  }
}

module.exports = function(csvFilePath, xliffFilePath, callback) {
  withDictionary(csvFilePath, function(dict) {
    withXiff(xliffFilePath, function(xliff) {
      const builder = new xml2js.Builder({xmldec: { 'version': '1.0', 'encoding': 'UTF-8', 'standalone': false}} );

      xliff['xliff']['file'].forEach(function(r) {
        r['body'].forEach(function(r) {
          r['trans-unit'].forEach(function(r) {
            const value = dict[r['source'][0]];

            if (value) {
              r['target'] = value;
            }
          });
        })
      });

      callback(builder.buildObject(xliff));
    })
  });
}
