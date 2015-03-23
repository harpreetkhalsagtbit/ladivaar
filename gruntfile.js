'use strict';
var fs = require('fs');
module.exports = function(grunt) {
	grunt.initConfig({
		rename: {
	        renameDocxToZip: {
	            src: '@@All Siri Guru Granth Sahib in Gurmukhi, without Index.docx',
	            dest: '@@All Siri Guru Granth Sahib in Gurmukhi, without Index.zip'
	        },
	        renameZipToDocx: {
	            src: '@@All Siri Guru Granth Sahib in Gurmukhi, without Index.zip',
	            dest: '@@All Siri Guru Granth Sahib in Gurmukhi, without Index.docx'
	        }
	    },
	    unzip: {
			extractZipFile: {
		     src: '@@All Siri Guru Granth Sahib in Gurmukhi, without Index.zip',
		      dest: '@@All Siri Guru Granth Sahib in Gurmukhi, without Index'
			}
	    },
		convert: {
		    options: {
		      explicitArray: false,
		    },
		    xml2json: {
		        files: [
		          {
		            expand: true,
		            src: ['@@All Siri Guru Granth Sahib in Gurmukhi, without Index/word/document.xml'],
		            dest: './',
		            ext: '.json'
		          }
		        ]
		    }
		},
		'json-format': {
		    test: {
		        options: {
		            indent: 4
		        },
		        files: [
		            {
		                expand: true,
		                src:  ['./SGGS.json'],
		                dest: './'
		            }
		        ]
		    }
		}
	})

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

 // Load the plugin that provides the "rename" task.
  grunt.loadNpmTasks('grunt-rename');
  grunt.loadNpmTasks('grunt-zip');
grunt.loadNpmTasks('grunt-convert');
grunt.loadNpmTasks('grunt-json-format');

	grunt.registerTask('unicodeConversion', function() {
		var unicodeJsonObject = []
		var mappingObject = JSON.parse(fs.readFileSync('../Unicode-Input/lib/core/lang/punjabi/_jsonMaps/gurbaniAkharSlim.json').toString());
		var gurbaniJSON = JSON.parse(fs.readFileSync('@@All Siri Guru Granth Sahib in Gurmukhi, without Index/word/document.json').toString());
		var count = 1;
		if(gurbaniJSON && gurbaniJSON["w:document"] && gurbaniJSON["w:document"]["w:body"] && gurbaniJSON["w:document"]["w:body"]["w:p"]) {
			var _docContent = gurbaniJSON["w:document"]["w:body"]["w:p"]

			for(var i=0;i<_docContent.length;i++) {
				if(_docContent && _docContent[i] && _docContent[i]["w:r"] && _docContent[i]["w:r"]["w:t"] && _docContent[i]["w:r"]["w:t"]["_"]) {
					_docContent[i]["w:r"]["w:t"]["_"] = convertToUnicodeCLI(_docContent[i]["w:r"]["w:t"]["_"], mappingObject)
					var _panktiObj = {}

					if(_docContent[i]["w:r"] && _docContent[i]["w:r"]["w:rPr"] && _docContent[i]["w:r"]["w:rPr"]["w:rFonts"] && _docContent[i]["w:r"]["w:rPr"]["w:rFonts"]["w:ascii"] == "AnmolRaised") {
						_panktiObj["bold_Pankti"] = _docContent[i]["w:r"]["w:t"]["_"]
					} else {
						_panktiObj["arrayOfPankti"] = _docContent[i]["w:r"]["w:t"]["_"]
					}

					unicodeJsonObject.push(_panktiObj)
				} else if(_docContent && _docContent[i] && _docContent[i]["w:r"].length) {

					var obj = {
						"arrayOfPankti": []
					}

					for(var j=0;j<_docContent[i]["w:r"].length;j++) {
						var _panktiObj = {};

						if(_docContent[i]["w:r"][j] && _docContent[i]["w:r"][j]["w:t"] && _docContent[i]["w:r"][j]["w:t"]["_"]) {
							_docContent[i]["w:r"][j]["w:t"]["_"] = convertToUnicodeCLI(_docContent[i]["w:r"][j]["w:t"]["_"], mappingObject)
							if(_docContent[i]["w:r"] && _docContent[i]["w:r"][j]["w:rPr"] && _docContent[i]["w:r"][j]["w:rPr"]["w:rFonts"] && _docContent[i]["w:r"][j]["w:rPr"]["w:rFonts"]["w:ascii"] == "AnmolRaised") {
								_panktiObj["bold_Pankti"] = _docContent[i]["w:r"][j]["w:t"]["_"]
							} else {
								_panktiObj["pankti"] = _docContent[i]["w:r"][j]["w:t"]["_"]
							}

						}

						if(_docContent[i]["w:r"][j]["w:lastRenderedPageBreak"] == "") {
							_panktiObj["pageBreak"] = true
							_panktiObj["ang"] = ++count
						}
						obj["arrayOfPankti"].push(_panktiObj)
					}
					unicodeJsonObject.push(obj)
				}
			}
			gurbaniJSON["w:document"]["w:body"]["w:p"] = _docContent
		}
        fs.writeFileSync('SGGS.json', JSON.stringify(unicodeJsonObject));
	});
    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('default', ['rename:renameDocxToZip', 'unzip:extractZipFile', 'rename:renameZipToDocx', 'convert:xml2json', 'unicodeConversion', 'json-format:test']);
}

var convertToUnicodeCLI = function(text, mappingString) {
    for(var each in mappingString) {
        text = text.split(each).join(mappingString[each])
    }
    text = text.replace(/ਿ(\W)/g,'$1' + 'ਿ')
    text = text.replace(/ਿ੍(\W)/g,'੍$1' + 'ਿ')
    text = text.replace(/ੇ੍(\W)/g, function(replaceMe, nextChar){
        return '੍' + nextChar + 'ੇ'
    })
    text = text.replace(/ੀ੍(\W)/g, function(replaceMe, nextChar){
        return '੍' + nextChar + 'ੀ'
    })
    text = text.replace(/ੵੰ/g,"ੰੵ")
    // text = text.replace(/ੵਾ/g,"ਾੵ")
    text = text.replace(/ਿੵ/g,"ੵਿ")

    text = text.replace(/ੑਾ/g,"ਾੑ")
    text = text.replace(/ੑੀ/g,"ੀੑ")
    text = text.replace(/ੑੇ/g,"ੇੑ")

    // text = text.split('<ਬਰ>').join('</p><p>');
    // text = text.split('<ਬਰ>').join('</p><p>');
    // text = text.split('ਫ਼ਲਟ;').join('ੴ');
    // text = text.split('ƒ').join('ਨੂੰ');
    return text
}