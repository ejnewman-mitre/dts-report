const applescript = require('applescript');
applescript.execFile('savefile.scpt', function(err, rtn) {
  if (err) {
    console.log(err)
  }
});