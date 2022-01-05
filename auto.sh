#/bin/zsh
open "https://dts.mitre.org/orgReport.aspx?txtDept=L261&amp;showdetail=0"
safari-ctl -j 'document.getElementsByTagName("HTML")[0].outerHTML' > test2.html