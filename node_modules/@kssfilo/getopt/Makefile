BATS=node_modules/.bin/bats

test:|$(BATS)
	cd tests;../$(BATS) test.bats

clean:
	-@rm -r package-lock.json node_modules 2>/dev/null;true

$(BATS):
	npm i
