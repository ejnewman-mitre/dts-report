# @kssfilo/getopt (forked from dresende's getopt)

## API

### setopt(options, [arguments])

Set the `options` for your program. If `arguments` is not set, `process.argv` is used.

Options is a string containing letters that correspond to the options you want. If a letter
is proceeded by a `:`, the option has a required argument. If a letter is proceeded by double
`:`, the option has an optional argument.

This function throws exceptions when an invalid option is set and when a required option is
not set.

### getopt(callback)

Callback will be called with 2 arguments, where the first is the option name (a letter) and
the second is the option parameter(s) or the number of times the option has appeared.

## Example

An example is worth 1000 words..

	$ test.js -ab -c 34 -d

    var opt = require('getopt');
    
    try {
		opt.setopt("abc:d::");  //-a -b is boolean, -c needs string -d accepts string but can be omitted
	} catch (e) {
		// exceptions object {type:<string>,opt:<string>} are thrown when an invalid option
		// is set or a required parameter is not set
		console.dir(e);
	}
    
    opt.getopt(function (o, p) {
    	switch (o) {
    		case "a":
    		case "b":
    			console.log("option %s set", o);  //p is number of count of the option
    			break;
    		case "c":
    			console.log("option c param = '%s'", p[0]);  //if user specified multiple times. p[1],p[2],... are used.
    			break;
    		case "d":
				if(p[0].length==0){
					console.log("option d set without string"); //p==[""] in this case
				}else{
					console.log("option d param = '%s'", p[0]); 
				}
				break;
    	}
    });

## About this version

This is forked version of dresende's great getopt module for double hyphen separator (--) support.

Difference from original version is 

- if double hyphen (--) is in arguments , remaining arguments will be pushed into the params array which able to get from opt.param() evenif that is started from hyphen(-)
- also stores double hyphen "--" into param() array for detecting separation point from user program.

e.g. 

	$ userprogram.js -a -b file1 -- file2 -a -c

will be

    console.log(opt.params());  #after opt.setopt(..)
	["file1","--","file2","-a","-c"]

I think that it is "breaking changes". so publishing by myself.

## Change Log

- 0.3.x : removes script name from param() array.
- 0.2.x : @kssfilo's version
- 0.1.0 : dresende's version
