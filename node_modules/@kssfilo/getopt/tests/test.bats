#!/usr/bin/env bats

@test "--" {
	test $(./test.js -a before -- after -a arg ) == '["before","--","after","-a","arg"]'
}

@test "-a -a -a" {
	test $(./test.js -a -a -a ) == '{"a":3}'
}

@test "-c -c" {
	test $(./test.js -c -c  ) == '{"c":["",""]}' 
}

@test "-c -c Hello" {
	test $(./test.js -c -c hello ) == '{"c":["","hello"]}' 
}

@test "-c Hello -c" {
	test $(./test.js -c hello -c ) == '{"c":["hello",""]}' 
}
