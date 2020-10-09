#!/usr/bin/env node

getopt=require('../lib/getopt');

options="ab:c::";

getopt.setopt(options);
var a=null
dump=function(obj){console.log(JSON.stringify(obj))};
opts={}

getopt.getopt(function(o,p){opts[o]=p});

if(getopt.params().indexOf("--")!=-1){
	dump(getopt.params());
}else{
	dump(opts);
}
process.exit(0);