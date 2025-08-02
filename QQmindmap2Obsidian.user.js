// ==UserScript==
// @name         QQ Mind Map to Obsidian Converter (Simple)
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Bidirectional conversion between QQ Mind Map and Obsidian Markdown
// @author       Your Name
// @match        *://naotu.qq.com/mindcal/*
// @match        *://docs.qq.com/mind/*
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @require      https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.3.8/purify.min.js
// ==/UserScript==

!function(r){var e="object"==typeof exports&&exports,a="object"==typeof module&&module&&module.exports==e&&module,t="object"==typeof global&&global;t.global!==t&&t.window!==t||(r=t);var c=/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,l=/[\x01-\x7F]/g,i=/[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g,n=/<\u20D2|=\u20E5|>\u20D2|\u205F\u200A|\u219D\u0338|\u2202\u0338|\u2220\u20D2|\u2229\uFE00|\u222A\uFE00|\u223C\u20D2|\u223D\u0331|\u223E\u0333|\u2242\u0338|\u224B\u0338|\u224D\u20D2|\u224E\u0338|\u224F\u0338|\u2250\u0338|\u2261\u20E5|\u2264\u20D2|\u2265\u20D2|\u2266\u0338|\u2267\u0338|\u2268\uFE00|\u2269\uFE00|\u226A\u0338|\u226A\u20D2|\u226B\u0338|\u226B\u20D2|\u227F\u0338|\u2282\u20D2|\u2283\u20D2|\u228A\uFE00|\u228B\uFE00|\u228F\u0338|\u2290\u0338|\u2293\uFE00|\u2294\uFE00|\u22B4\u20D2|\u22B5\u20D2|\u22D8\u0338|\u22D9\u0338|\u22DA\uFE00|\u22DB\uFE00|\u22F5\u0338|\u22F9\u0338|\u2933\u0338|\u29CF\u0338|\u29D0\u0338|\u2A6D\u0338|\u2A70\u0338|\u2A7D\u0338|\u2A7E\u0338|\u2AA1\u0338|\u2AA2\u0338|\u2AAC\uFE00|\u2AAD\uFE00|\u2AAF\u0338|\u2AB0\u0338|\u2AC5\u0338|\u2AC6\u0338|\u2ACB\uFE00|\u2ACC\uFE00|\u2AFD\u20E5|[\xA0-\u0113\u0116-\u0122\u0124-\u012B\u012E-\u014D\u0150-\u017E\u0192\u01B5\u01F5\u0237\u02C6\u02C7\u02D8-\u02DD\u0311\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C9\u03D1\u03D2\u03D5\u03D6\u03DC\u03DD\u03F0\u03F1\u03F5\u03F6\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E\u045F\u2002-\u2005\u2007-\u2010\u2013-\u2016\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203A\u203E\u2041\u2043\u2044\u204F\u2057\u205F-\u2063\u20AC\u20DB\u20DC\u2102\u2105\u210A-\u2113\u2115-\u211E\u2122\u2124\u2127-\u2129\u212C\u212D\u212F-\u2131\u2133-\u2138\u2145-\u2148\u2153-\u215E\u2190-\u219B\u219D-\u21A7\u21A9-\u21AE\u21B0-\u21B3\u21B5-\u21B7\u21BA-\u21DB\u21DD\u21E4\u21E5\u21F5\u21FD-\u2205\u2207-\u2209\u220B\u220C\u220F-\u2214\u2216-\u2218\u221A\u221D-\u2238\u223A-\u2257\u2259\u225A\u225C\u225F-\u2262\u2264-\u228B\u228D-\u229B\u229D-\u22A5\u22A7-\u22B0\u22B2-\u22BB\u22BD-\u22DB\u22DE-\u22E3\u22E6-\u22F7\u22F9-\u22FE\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231C-\u231F\u2322\u2323\u232D\u232E\u2336\u233D\u233F\u237C\u23B0\u23B1\u23B4-\u23B6\u23DC-\u23DF\u23E2\u23E7\u2423\u24C8\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2550-\u256C\u2580\u2584\u2588\u2591-\u2593\u25A1\u25AA\u25AB\u25AD\u25AE\u25B1\u25B3-\u25B5\u25B8\u25B9\u25BD-\u25BF\u25C2\u25C3\u25CA\u25CB\u25EC\u25EF\u25F8-\u25FC\u2605\u2606\u260E\u2640\u2642\u2660\u2663\u2665\u2666\u266A\u266D-\u266F\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u27C8\u27C9\u27E6-\u27ED\u27F5-\u27FA\u27FC\u27FF\u2902-\u2905\u290C-\u2913\u2916\u2919-\u2920\u2923-\u292A\u2933\u2935-\u2939\u293C\u293D\u2945\u2948-\u294B\u294E-\u2976\u2978\u2979\u297B-\u297F\u2985\u2986\u298B-\u2996\u299A\u299C\u299D\u29A4-\u29B7\u29B9\u29BB\u29BC\u29BE-\u29C5\u29C9\u29CD-\u29D0\u29DC-\u29DE\u29E3-\u29E5\u29EB\u29F4\u29F6\u2A00-\u2A02\u2A04\u2A06\u2A0C\u2A0D\u2A10-\u2A17\u2A22-\u2A27\u2A29\u2A2A\u2A2D-\u2A31\u2A33-\u2A3C\u2A3F\u2A40\u2A42-\u2A4D\u2A50\u2A53-\u2A58\u2A5A-\u2A5D\u2A5F\u2A66\u2A6A\u2A6D-\u2A75\u2A77-\u2A9A\u2A9D-\u2AA2\u2AA4-\u2AB0\u2AB3-\u2AC8\u2ACB\u2ACC\u2ACF-\u2ADB\u2AE4\u2AE6-\u2AE9\u2AEB-\u2AF3\u2AFD\uFB00-\uFB04]|\uD835[\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDD6B]/g,p={"­":"shy","‌":"zwnj","‍":"zwj","‎":"lrm","⁣":"ic","⁢":"it","⁡":"af","‏":"rlm","​":"ZeroWidthSpace","⁠":"NoBreak","̑":"DownBreve","⃛":"tdot","⃜":"DotDot","\t":"Tab","\n":"NewLine"," ":"puncsp"," ":"MediumSpace"," ":"thinsp"," ":"hairsp"," ":"emsp13"," ":"ensp"," ":"emsp14"," ":"emsp"," ":"numsp"," ":"nbsp","  ":"ThickSpace","‾":"oline",_:"lowbar","‐":"dash","–":"ndash","—":"mdash","―":"horbar",",":"comma",";":"semi","⁏":"bsemi",":":"colon","⩴":"Colone","!":"excl","¡":"iexcl","?":"quest","¿":"iquest",".":"period","‥":"nldr","…":"mldr","·":"middot","'":"apos","‘":"lsquo","’":"rsquo","‚":"sbquo","‹":"lsaquo","›":"rsaquo",'"':"quot","“":"ldquo","”":"rdquo","„":"bdquo","«":"laquo","»":"raquo","(":"lpar",")":"rpar","[":"lsqb","]":"rsqb","{":"lcub","}":"rcub","⌈":"lceil","⌉":"rceil","⌊":"lfloor","⌋":"rfloor","⦅":"lopar","⦆":"ropar","⦋":"lbrke","⦌":"rbrke","⦍":"lbrkslu","⦎":"rbrksld","⦏":"lbrksld","⦐":"rbrkslu","⦑":"langd","⦒":"rangd","⦓":"lparlt","⦔":"rpargt","⦕":"gtlPar","⦖":"ltrPar","⟦":"lobrk","⟧":"robrk","⟨":"lang","⟩":"rang","⟪":"Lang","⟫":"Rang","⟬":"loang","⟭":"roang","❲":"lbbrk","❳":"rbbrk","‖":"Vert","§":"sect","¶":"para","@":"commat","*":"ast","/":"sol",undefined:null,"&":"amp","#":"num","%":"percnt","‰":"permil","‱":"pertenk","†":"dagger","‡":"Dagger","•":"bull","⁃":"hybull","′":"prime","″":"Prime","‴":"tprime","⁗":"qprime","‵":"bprime","⁁":"caret","`":"grave","´":"acute","˜":"tilde","^":"Hat","¯":"macr","˘":"breve","˙":"dot","¨":"die","˚":"ring","˝":"dblac","¸":"cedil","˛":"ogon","ˆ":"circ","ˇ":"caron","°":"deg","©":"copy","®":"reg","℗":"copysr","℘":"wp","℞":"rx","℧":"mho","℩":"iiota","←":"larr","↚":"nlarr","→":"rarr","↛":"nrarr","↑":"uarr","↓":"darr","↔":"harr","↮":"nharr","↕":"varr","↖":"nwarr","↗":"nearr","↘":"searr","↙":"swarr","↝":"rarrw","↝̸":"nrarrw","↞":"Larr","↟":"Uarr","↠":"Rarr","↡":"Darr","↢":"larrtl","↣":"rarrtl","↤":"mapstoleft","↥":"mapstoup","↦":"map","↧":"mapstodown","↩":"larrhk","↪":"rarrhk","↫":"larrlp","↬":"rarrlp","↭":"harrw","↰":"lsh","↱":"rsh","↲":"ldsh","↳":"rdsh","↵":"crarr","↶":"cularr","↷":"curarr","↺":"olarr","↻":"orarr","↼":"lharu","↽":"lhard","↾":"uharr","↿":"uharl","⇀":"rharu","⇁":"rhard","⇂":"dharr","⇃":"dharl","⇄":"rlarr","⇅":"udarr","⇆":"lrarr","⇇":"llarr","⇈":"uuarr","⇉":"rrarr","⇊":"ddarr","⇋":"lrhar","⇌":"rlhar","⇐":"lArr","⇍":"nlArr","⇑":"uArr","⇒":"rArr","⇏":"nrArr","⇓":"dArr","⇔":"iff","⇎":"nhArr","⇕":"vArr","⇖":"nwArr","⇗":"neArr","⇘":"seArr","⇙":"swArr","⇚":"lAarr","⇛":"rAarr","⇝":"zigrarr","⇤":"larrb","⇥":"rarrb","⇵":"duarr","⇽":"loarr","⇾":"roarr","⇿":"hoarr","∀":"forall","∁":"comp","∂":"part","∂̸":"npart","∃":"exist","∄":"nexist","∅":"empty","∇":"Del","∈":"in","∉":"notin","∋":"ni","∌":"notni","϶":"bepsi","∏":"prod","∐":"coprod","∑":"sum","+":"plus","±":"pm","÷":"div","×":"times","<":"lt","≮":"nlt","<⃒":"nvlt","=":"equals","≠":"ne","=⃥":"bne","⩵":"Equal",">":"gt","≯":"ngt",">⃒":"nvgt","¬":"not","|":"vert","¦":"brvbar","−":"minus","∓":"mp","∔":"plusdo","⁄":"frasl","∖":"setmn","∗":"lowast","∘":"compfn","√":"Sqrt","∝":"prop","∞":"infin","∟":"angrt","∠":"ang","∠⃒":"nang","∡":"angmsd","∢":"angsph","∣":"mid","∤":"nmid","∥":"par","∦":"npar","∧":"and","∨":"or","∩":"cap","∩︀":"caps","∪":"cup","∪︀":"cups","∫":"int","∬":"Int","∭":"tint","⨌":"qint","∮":"oint","∯":"Conint","∰":"Cconint","∱":"cwint","∲":"cwconint","∳":"awconint","∴":"there4","∵":"becaus","∶":"ratio","∷":"Colon","∸":"minusd","∺":"mDDot","∻":"homtht","∼":"sim","≁":"nsim","∼⃒":"nvsim","∽":"bsim","∽̱":"race","∾":"ac","∾̳":"acE","∿":"acd","≀":"wr","≂":"esim","≂̸":"nesim","≃":"sime","≄":"nsime","≅":"cong","≇":"ncong","≆":"simne","≈":"ap","≉":"nap","≊":"ape","≋":"apid","≋̸":"napid","≌":"bcong","≍":"CupCap","≭":"NotCupCap","≍⃒":"nvap","≎":"bump","≎̸":"nbump","≏":"bumpe","≏̸":"nbumpe","≐":"doteq","≐̸":"nedot","≑":"eDot","≒":"efDot","≓":"erDot","≔":"colone","≕":"ecolon","≖":"ecir","≗":"cire","≙":"wedgeq","≚":"veeeq","≜":"trie","≟":"equest","≡":"equiv","≢":"nequiv","≡⃥":"bnequiv","≤":"le","≰":"nle","≤⃒":"nvle","≥":"ge","≱":"nge","≥⃒":"nvge","≦":"lE","≦̸":"nlE","≧":"gE","≧̸":"ngE","≨︀":"lvnE","≨":"lnE","≩":"gnE","≩︀":"gvnE","≪":"ll","≪̸":"nLtv","≪⃒":"nLt","≫":"gg","≫̸":"nGtv","≫⃒":"nGt","≬":"twixt","≲":"lsim","≴":"nlsim","≳":"gsim","≵":"ngsim","≶":"lg","≸":"ntlg","≷":"gl","≹":"ntgl","≺":"pr","⊀":"npr","≻":"sc","⊁":"nsc","≼":"prcue","⋠":"nprcue","≽":"sccue","⋡":"nsccue","≾":"prsim","≿":"scsim","≿̸":"NotSucceedsTilde","⊂":"sub","⊄":"nsub","⊂⃒":"vnsub","⊃":"sup","⊅":"nsup","⊃⃒":"vnsup","⊆":"sube","⊈":"nsube","⊇":"supe","⊉":"nsupe","⊊︀":"vsubne","⊊":"subne","⊋︀":"vsupne","⊋":"supne","⊍":"cupdot","⊎":"uplus","⊏":"sqsub","⊏̸":"NotSquareSubset","⊐":"sqsup","⊐̸":"NotSquareSuperset","⊑":"sqsube","⋢":"nsqsube","⊒":"sqsupe","⋣":"nsqsupe","⊓":"sqcap","⊓︀":"sqcaps","⊔":"sqcup","⊔︀":"sqcups","⊕":"oplus","⊖":"ominus","⊗":"otimes","⊘":"osol","⊙":"odot","⊚":"ocir","⊛":"oast","⊝":"odash","⊞":"plusb","⊟":"minusb","⊠":"timesb","⊡":"sdotb","⊢":"vdash","⊬":"nvdash","⊣":"dashv","⊤":"top","⊥":"bot","⊧":"models","⊨":"vDash","⊭":"nvDash","⊩":"Vdash","⊮":"nVdash","⊪":"Vvdash","⊫":"VDash","⊯":"nVDash","⊰":"prurel","⊲":"vltri","⋪":"nltri","⊳":"vrtri","⋫":"nrtri","⊴":"ltrie","⋬":"nltrie","⊴⃒":"nvltrie","⊵":"rtrie","⋭":"nrtrie","⊵⃒":"nvrtrie","⊶":"origof","⊷":"imof","⊸":"mumap","⊹":"hercon","⊺":"intcal","⊻":"veebar","⊽":"barvee","⊾":"angrtvb","⊿":"lrtri","⋀":"Wedge","⋁":"Vee","⋂":"xcap","⋃":"xcup","⋄":"diam","⋅":"sdot","⋆":"Star","⋇":"divonx","⋈":"bowtie","⋉":"ltimes","⋊":"rtimes","⋋":"lthree","⋌":"rthree","⋍":"bsime","⋎":"cuvee","⋏":"cuwed","⋐":"Sub","⋑":"Sup","⋒":"Cap","⋓":"Cup","⋔":"fork","⋕":"epar","⋖":"ltdot","⋗":"gtdot","⋘":"Ll","⋘̸":"nLl","⋙":"Gg","⋙̸":"nGg","⋚︀":"lesg","⋚":"leg","⋛":"gel","⋛︀":"gesl","⋞":"cuepr","⋟":"cuesc","⋦":"lnsim","⋧":"gnsim","⋨":"prnsim","⋩":"scnsim","⋮":"vellip","⋯":"ctdot","⋰":"utdot","⋱":"dtdot","⋲":"disin","⋳":"isinsv","⋴":"isins","⋵":"isindot","⋵̸":"notindot","⋶":"notinvc","⋷":"notinvb","⋹":"isinE","⋹̸":"notinE","⋺":"nisd","⋻":"xnis","⋼":"nis","⋽":"notnivc","⋾":"notnivb","⌅":"barwed","⌆":"Barwed","⌌":"drcrop","⌍":"dlcrop","⌎":"urcrop","⌏":"ulcrop","⌐":"bnot","⌒":"profline","⌓":"profsurf","⌕":"telrec","⌖":"target","⌜":"ulcorn","⌝":"urcorn","⌞":"dlcorn","⌟":"drcorn","⌢":"frown","⌣":"smile","⌭":"cylcty","⌮":"profalar","⌶":"topbot","⌽":"ovbar","⌿":"solbar","⍼":"angzarr","⎰":"lmoust","⎱":"rmoust","⎴":"tbrk","⎵":"bbrk","⎶":"bbrktbrk","⏜":"OverParenthesis","⏝":"UnderParenthesis","⏞":"OverBrace","⏟":"UnderBrace","⏢":"trpezium","⏧":"elinters","␣":"blank","─":"boxh","│":"boxv","┌":"boxdr","┐":"boxdl","└":"boxur","┘":"boxul","├":"boxvr","┤":"boxvl","┬":"boxhd","┴":"boxhu","┼":"boxvh","═":"boxH","║":"boxV","╒":"boxdR","╓":"boxDr","╔":"boxDR","╕":"boxdL","╖":"boxDl","╗":"boxDL","╘":"boxuR","╙":"boxUr","╚":"boxUR","╛":"boxuL","╜":"boxUl","╝":"boxUL","╞":"boxvR","╟":"boxVr","╠":"boxVR","╡":"boxvL","╢":"boxVl","╣":"boxVL","╤":"boxHd","╥":"boxhD","╦":"boxHD","╧":"boxHu","╨":"boxhU","╩":"boxHU","╪":"boxvH","╫":"boxVh","╬":"boxVH","▀":"uhblk","▄":"lhblk","█":"block","░":"blk14","▒":"blk12","▓":"blk34","□":"squ","▪":"squf","▫":"EmptyVerySmallSquare","▭":"rect","▮":"marker","▱":"fltns","△":"xutri","▴":"utrif","▵":"utri","▸":"rtrif","▹":"rtri","▽":"xdtri","▾":"dtrif","▿":"dtri","◂":"ltrif","◃":"ltri","◊":"loz","○":"cir","◬":"tridot","◯":"xcirc","◸":"ultri","◹":"urtri","◺":"lltri","◻":"EmptySmallSquare","◼":"FilledSmallSquare","★":"starf","☆":"star","☎":"phone","♀":"female","♂":"male","♠":"spades","♣":"clubs","♥":"hearts","♦":"diams","♪":"sung","✓":"check","✗":"cross","✠":"malt","✶":"sext","❘":"VerticalSeparator","⟈":"bsolhsub","⟉":"suphsol","⟵":"xlarr","⟶":"xrarr","⟷":"xharr","⟸":"xlArr","⟹":"xrArr","⟺":"xhArr","⟼":"xmap","⟿":"dzigrarr","⤂":"nvlArr","⤃":"nvrArr","⤄":"nvHarr","⤅":"Map","⤌":"lbarr","⤍":"rbarr","⤎":"lBarr","⤏":"rBarr","⤐":"RBarr","⤑":"DDotrahd","⤒":"UpArrowBar","⤓":"DownArrowBar","⤖":"Rarrtl","⤙":"latail","⤚":"ratail","⤛":"lAtail","⤜":"rAtail","⤝":"larrfs","⤞":"rarrfs","⤟":"larrbfs","⤠":"rarrbfs","⤣":"nwarhk","⤤":"nearhk","⤥":"searhk","⤦":"swarhk","⤧":"nwnear","⤨":"toea","⤩":"tosa","⤪":"swnwar","⤳":"rarrc","⤳̸":"nrarrc","⤵":"cudarrr","⤶":"ldca","⤷":"rdca","⤸":"cudarrl","⤹":"larrpl","⤼":"curarrm","⤽":"cularrp","⥅":"rarrpl","⥈":"harrcir","⥉":"Uarrocir","⥊":"lurdshar","⥋":"ldrushar","⥎":"LeftRightVector","⥏":"RightUpDownVector","⥐":"DownLeftRightVector","⥑":"LeftUpDownVector","⥒":"LeftVectorBar","⥓":"RightVectorBar","⥔":"RightUpVectorBar","⥕":"RightDownVectorBar","⥖":"DownLeftVectorBar","⥗":"DownRightVectorBar","⥘":"LeftUpVectorBar","⥙":"LeftDownVectorBar","⥚":"LeftTeeVector","⥛":"RightTeeVector","⥜":"RightUpTeeVector","⥝":"RightDownTeeVector","⥞":"DownLeftTeeVector","⥟":"DownRightTeeVector","⥠":"LeftUpTeeVector","⥡":"LeftDownTeeVector","⥢":"lHar","⥣":"uHar","⥤":"rHar","⥥":"dHar","⥦":"luruhar","⥧":"ldrdhar","⥨":"ruluhar","⥩":"rdldhar","⥪":"lharul","⥫":"llhard","⥬":"rharul","⥭":"lrhard","⥮":"udhar","⥯":"duhar","⥰":"RoundImplies","⥱":"erarr","⥲":"simrarr","⥳":"larrsim","⥴":"rarrsim","⥵":"rarrap","⥶":"ltlarr","⥸":"gtrarr","⥹":"subrarr","⥻":"suplarr","⥼":"lfisht","⥽":"rfisht","⥾":"ufisht","⥿":"dfisht","⦚":"vzigzag","⦜":"vangrt","⦝":"angrtvbd","⦤":"ange","⦥":"range","⦦":"dwangle","⦧":"uwangle","⦨":"angmsdaa","⦩":"angmsdab","⦪":"angmsdac","⦫":"angmsdad","⦬":"angmsdae","⦭":"angmsdaf","⦮":"angmsdag","⦯":"angmsdah","⦰":"bemptyv","⦱":"demptyv","⦲":"cemptyv","⦳":"raemptyv","⦴":"laemptyv","⦵":"ohbar","⦶":"omid","⦷":"opar","⦹":"operp","⦻":"olcross","⦼":"odsold","⦾":"olcir","⦿":"ofcir","⧀":"olt","⧁":"ogt","⧂":"cirscir","⧃":"cirE","⧄":"solb","⧅":"bsolb","⧉":"boxbox","⧍":"trisb","⧎":"rtriltri","⧏":"LeftTriangleBar","⧏̸":"NotLeftTriangleBar","⧐":"RightTriangleBar","⧐̸":"NotRightTriangleBar","⧜":"iinfin","⧝":"infintie","⧞":"nvinfin","⧣":"eparsl","⧤":"smeparsl","⧥":"eqvparsl","⧫":"lozf","⧴":"RuleDelayed","⧶":"dsol","⨀":"xodot","⨁":"xoplus","⨂":"xotime","⨄":"xuplus","⨆":"xsqcup","⨍":"fpartint","⨐":"cirfnint","⨑":"awint","⨒":"rppolint","⨓":"scpolint","⨔":"npolint","⨕":"pointint","⨖":"quatint","⨗":"intlarhk","⨢":"pluscir","⨣":"plusacir","⨤":"simplus","⨥":"plusdu","⨦":"plussim","⨧":"plustwo","⨩":"mcomma","⨪":"minusdu","⨭":"loplus","⨮":"roplus","⨯":"Cross","⨰":"timesd","⨱":"timesbar","⨳":"smashp","⨴":"lotimes","⨵":"rotimes","⨶":"otimesas","⨷":"Otimes","⨸":"odiv","⨹":"triplus","⨺":"triminus","⨻":"tritime","⨼":"iprod","⨿":"amalg","⩀":"capdot","⩂":"ncup","⩃":"ncap","⩄":"capand","⩅":"cupor","⩆":"cupcap","⩇":"capcup","⩈":"cupbrcap","⩉":"capbrcup","⩊":"cupcup","⩋":"capcap","⩌":"ccups","⩍":"ccaps","⩐":"ccupssm","⩓":"And","⩔":"Or","⩕":"andand","⩖":"oror","⩗":"orslope","⩘":"andslope","⩚":"andv","⩛":"orv","⩜":"andd","⩝":"ord","⩟":"wedbar","⩦":"sdote","⩪":"simdot","⩭":"congdot","⩭̸":"ncongdot","⩮":"easter","⩯":"apacir","⩰":"apE","⩰̸":"napE","⩱":"eplus","⩲":"pluse","⩳":"Esim","⩷":"eDDot","⩸":"equivDD","⩹":"ltcir","⩺":"gtcir","⩻":"ltquest","⩼":"gtquest","⩽":"les","⩽̸":"nles","⩾":"ges","⩾̸":"nges","⩿":"lesdot","⪀":"gesdot","⪁":"lesdoto","⪂":"gesdoto","⪃":"lesdotor","⪄":"gesdotol","⪅":"lap","⪆":"gap","⪇":"lne","⪈":"gne","⪉":"lnap","⪊":"gnap","⪋":"lEg","⪌":"gEl","⪍":"lsime","⪎":"gsime","⪏":"lsimg","⪐":"gsiml","⪑":"lgE","⪒":"glE","⪓":"lesges","⪔":"gesles","⪕":"els","⪖":"egs","⪗":"elsdot","⪘":"egsdot","⪙":"el","⪚":"eg","⪝":"siml","⪞":"simg","⪟":"simlE","⪠":"simgE","⪡":"LessLess","⪡̸":"NotNestedLessLess","⪢":"GreaterGreater","⪢̸":"NotNestedGreaterGreater","⪤":"glj","⪥":"gla","⪦":"ltcc","⪧":"gtcc","⪨":"lescc","⪩":"gescc","⪪":"smt","⪫":"lat","⪬":"smte","⪬︀":"smtes","⪭":"late","⪭︀":"lates","⪮":"bumpE","⪯":"pre","⪯̸":"npre","⪰":"sce","⪰̸":"nsce","⪳":"prE","⪴":"scE","⪵":"prnE","⪶":"scnE","⪷":"prap","⪸":"scap","⪹":"prnap","⪺":"scnap","⪻":"Pr","⪼":"Sc","⪽":"subdot","⪾":"supdot","⪿":"subplus","⫀":"supplus","⫁":"submult","⫂":"supmult","⫃":"subedot","⫄":"supedot","⫅":"subE","⫅̸":"nsubE","⫆":"supE","⫆̸":"nsupE","⫇":"subsim","⫈":"supsim","⫋︀":"vsubnE","⫋":"subnE","⫌︀":"vsupnE","⫌":"supnE","⫏":"csub","⫐":"csup","⫑":"csube","⫒":"csupe","⫓":"subsup","⫔":"supsub","⫕":"subsub","⫖":"supsup","⫗":"suphsub","⫘":"supdsub","⫙":"forkv","⫚":"topfork","⫛":"mlcp","⫤":"Dashv","⫦":"Vdashl","⫧":"Barv","⫨":"vBar","⫩":"vBarv","⫫":"Vbar","⫬":"Not","⫭":"bNot","⫮":"rnmid","⫯":"cirmid","⫰":"midcir","⫱":"topcir","⫲":"nhpar","⫳":"parsim","⫽":"parsl","⫽⃥":"nparsl","♭":"flat","♮":"natur","♯":"sharp","¤":"curren","¢":"cent",$:"dollar","£":"pound","¥":"yen","€":"euro","¹":"sup1","½":"half","⅓":"frac13","¼":"frac14","⅕":"frac15","⅙":"frac16","⅛":"frac18","²":"sup2","⅔":"frac23","⅖":"frac25","³":"sup3","¾":"frac34","⅗":"frac35","⅜":"frac38","⅘":"frac45","⅚":"frac56","⅝":"frac58","⅞":"frac78","𝒶":"ascr","𝕒":"aopf","𝔞":"afr","𝔸":"Aopf","𝔄":"Afr","𝒜":"Ascr","ª":"ordf","á":"aacute","Á":"Aacute","à":"agrave","À":"Agrave","ă":"abreve","Ă":"Abreve","â":"acirc","Â":"Acirc","å":"aring","Å":"angst","ä":"auml","Ä":"Auml","ã":"atilde","Ã":"Atilde","ą":"aogon","Ą":"Aogon","ā":"amacr","Ā":"Amacr","æ":"aelig","Æ":"AElig","𝒷":"bscr","𝕓":"bopf","𝔟":"bfr","𝔹":"Bopf","ℬ":"Bscr","𝔅":"Bfr","𝔠":"cfr","𝒸":"cscr","𝕔":"copf","ℭ":"Cfr","𝒞":"Cscr","ℂ":"Copf","ć":"cacute","Ć":"Cacute","ĉ":"ccirc","Ĉ":"Ccirc","č":"ccaron","Č":"Ccaron","ċ":"cdot","Ċ":"Cdot","ç":"ccedil","Ç":"Ccedil","℅":"incare","𝔡":"dfr","ⅆ":"dd","𝕕":"dopf","𝒹":"dscr","𝒟":"Dscr","𝔇":"Dfr","ⅅ":"DD","𝔻":"Dopf","ď":"dcaron","Ď":"Dcaron","đ":"dstrok","Đ":"Dstrok","ð":"eth","Ð":"ETH","ⅇ":"ee","ℯ":"escr","𝔢":"efr","𝕖":"eopf","ℰ":"Escr","𝔈":"Efr","𝔼":"Eopf","é":"eacute","É":"Eacute","è":"egrave","È":"Egrave","ê":"ecirc","Ê":"Ecirc","ě":"ecaron","Ě":"Ecaron","ë":"euml","Ë":"Euml","ė":"edot","Ė":"Edot","ę":"eogon","Ę":"Eogon","ē":"emacr","Ē":"Emacr","𝔣":"ffr","𝕗":"fopf","𝒻":"fscr","𝔉":"Ffr","𝔽":"Fopf","ℱ":"Fscr","ﬀ":"fflig","ﬃ":"ffilig","ﬄ":"ffllig","ﬁ":"filig",fj:"fjlig","ﬂ":"fllig","ƒ":"fnof","ℊ":"gscr","𝕘":"gopf","𝔤":"gfr","𝒢":"Gscr","𝔾":"Gopf","𝔊":"Gfr","ǵ":"gacute","ğ":"gbreve","Ğ":"Gbreve","ĝ":"gcirc","Ĝ":"Gcirc","ġ":"gdot","Ġ":"Gdot","Ģ":"Gcedil","𝔥":"hfr","ℎ":"planckh","𝒽":"hscr","𝕙":"hopf","ℋ":"Hscr","ℌ":"Hfr","ℍ":"Hopf","ĥ":"hcirc","Ĥ":"Hcirc","ℏ":"hbar","ħ":"hstrok","Ħ":"Hstrok","𝕚":"iopf","𝔦":"ifr","𝒾":"iscr","ⅈ":"ii","𝕀":"Iopf","ℐ":"Iscr","ℑ":"Im","í":"iacute","Í":"Iacute","ì":"igrave","Ì":"Igrave","î":"icirc","Î":"Icirc","ï":"iuml","Ï":"Iuml","ĩ":"itilde","Ĩ":"Itilde","İ":"Idot","į":"iogon","Į":"Iogon","ī":"imacr","Ī":"Imacr","ĳ":"ijlig","Ĳ":"IJlig","ı":"imath","𝒿":"jscr","𝕛":"jopf","𝔧":"jfr","𝒥":"Jscr","𝔍":"Jfr","𝕁":"Jopf","ĵ":"jcirc","Ĵ":"Jcirc","ȷ":"jmath","𝕜":"kopf","𝓀":"kscr","𝔨":"kfr","𝒦":"Kscr","𝕂":"Kopf","𝔎":"Kfr","ķ":"kcedil","Ķ":"Kcedil","𝔩":"lfr","𝓁":"lscr","ℓ":"ell","𝕝":"lopf","ℒ":"Lscr","𝔏":"Lfr","𝕃":"Lopf","ĺ":"lacute","Ĺ":"Lacute","ľ":"lcaron","Ľ":"Lcaron","ļ":"lcedil","Ļ":"Lcedil","ł":"lstrok","Ł":"Lstrok","ŀ":"lmidot","Ŀ":"Lmidot","𝔪":"mfr","𝕞":"mopf","𝓂":"mscr","𝔐":"Mfr","𝕄":"Mopf","ℳ":"Mscr","𝔫":"nfr","𝕟":"nopf","𝓃":"nscr","ℕ":"Nopf","𝒩":"Nscr","𝔑":"Nfr","ń":"nacute","Ń":"Nacute","ň":"ncaron","Ň":"Ncaron","ñ":"ntilde","Ñ":"Ntilde","ņ":"ncedil","Ņ":"Ncedil","№":"numero","ŋ":"eng","Ŋ":"ENG","𝕠":"oopf","𝔬":"ofr","ℴ":"oscr","𝒪":"Oscr","𝔒":"Ofr","𝕆":"Oopf","º":"ordm","ó":"oacute","Ó":"Oacute","ò":"ograve","Ò":"Ograve","ô":"ocirc","Ô":"Ocirc","ö":"ouml","Ö":"Ouml","ő":"odblac","Ő":"Odblac","õ":"otilde","Õ":"Otilde","ø":"oslash","Ø":"Oslash","ō":"omacr","Ō":"Omacr","œ":"oelig","Œ":"OElig","𝔭":"pfr","𝓅":"pscr","𝕡":"popf","ℙ":"Popf","𝔓":"Pfr","𝒫":"Pscr","𝕢":"qopf","𝔮":"qfr","𝓆":"qscr","𝒬":"Qscr","𝔔":"Qfr","ℚ":"Qopf","ĸ":"kgreen","𝔯":"rfr","𝕣":"ropf","𝓇":"rscr","ℛ":"Rscr","ℜ":"Re","ℝ":"Ropf","ŕ":"racute","Ŕ":"Racute","ř":"rcaron","Ř":"Rcaron","ŗ":"rcedil","Ŗ":"Rcedil","𝕤":"sopf","𝓈":"sscr","𝔰":"sfr","𝕊":"Sopf","𝔖":"Sfr","𝒮":"Sscr","Ⓢ":"oS","ś":"sacute","Ś":"Sacute","ŝ":"scirc","Ŝ":"Scirc","š":"scaron","Š":"Scaron","ş":"scedil","Ş":"Scedil","ß":"szlig","𝔱":"tfr","𝓉":"tscr","𝕥":"topf","𝒯":"Tscr","𝔗":"Tfr","𝕋":"Topf","ť":"tcaron","Ť":"Tcaron","ţ":"tcedil","Ţ":"Tcedil","™":"trade","ŧ":"tstrok","Ŧ":"Tstrok","𝓊":"uscr","𝕦":"uopf","𝔲":"ufr","𝕌":"Uopf","𝔘":"Ufr","𝒰":"Uscr","ú":"uacute","Ú":"Uacute","ù":"ugrave","Ù":"Ugrave","ŭ":"ubreve","Ŭ":"Ubreve","û":"ucirc","Û":"Ucirc","ů":"uring","Ů":"Uring","ü":"uuml","Ü":"Uuml","ű":"udblac","Ű":"Udblac","ũ":"utilde","Ũ":"Utilde","ų":"uogon","Ų":"Uogon","ū":"umacr","Ū":"Umacr","𝔳":"vfr","𝕧":"vopf","𝓋":"vscr","𝔙":"Vfr","𝕍":"Vopf","𝒱":"Vscr","𝕨":"wopf","𝓌":"wscr","𝔴":"wfr","𝒲":"Wscr","𝕎":"Wopf","𝔚":"Wfr","ŵ":"wcirc","Ŵ":"Wcirc","𝔵":"xfr","𝓍":"xscr","𝕩":"xopf","𝕏":"Xopf","𝔛":"Xfr","𝒳":"Xscr","𝔶":"yfr","𝓎":"yscr","𝕪":"yopf","𝒴":"Yscr","𝔜":"Yfr","𝕐":"Yopf","ý":"yacute","Ý":"Yacute","ŷ":"ycirc","Ŷ":"Ycirc","ÿ":"yuml","Ÿ":"Yuml","𝓏":"zscr","𝔷":"zfr","𝕫":"zopf","ℨ":"Zfr","ℤ":"Zopf","𝒵":"Zscr","ź":"zacute","Ź":"Zacute","ž":"zcaron","Ž":"Zcaron","ż":"zdot","Ż":"Zdot","Ƶ":"imped","þ":"thorn","Þ":"THORN","ŉ":"napos","α":"alpha","Α":"Alpha","β":"beta","Β":"Beta","γ":"gamma","Γ":"Gamma","δ":"delta","Δ":"Delta","ε":"epsi","ϵ":"epsiv","Ε":"Epsilon","ϝ":"gammad","Ϝ":"Gammad","ζ":"zeta","Ζ":"Zeta","η":"eta","Η":"Eta","θ":"theta","ϑ":"thetav","Θ":"Theta","ι":"iota","Ι":"Iota","κ":"kappa","ϰ":"kappav","Κ":"Kappa","λ":"lambda","Λ":"Lambda","μ":"mu","µ":"micro","Μ":"Mu","ν":"nu","Ν":"Nu","ξ":"xi","Ξ":"Xi","ο":"omicron","Ο":"Omicron","π":"pi","ϖ":"piv","Π":"Pi","ρ":"rho","ϱ":"rhov","Ρ":"Rho","σ":"sigma","Σ":"Sigma","ς":"sigmaf","τ":"tau","Τ":"Tau","υ":"upsi","Υ":"Upsilon","ϒ":"Upsi","φ":"phi","ϕ":"phiv","Φ":"Phi","χ":"chi","Χ":"Chi","ψ":"psi","Ψ":"Psi","ω":"omega","Ω":"ohm","а":"acy","А":"Acy","б":"bcy","Б":"Bcy","в":"vcy","В":"Vcy","г":"gcy","Г":"Gcy","ѓ":"gjcy","Ѓ":"GJcy","д":"dcy","Д":"Dcy","ђ":"djcy","Ђ":"DJcy","е":"iecy","Е":"IEcy","ё":"iocy","Ё":"IOcy","є":"jukcy","Є":"Jukcy","ж":"zhcy","Ж":"ZHcy","з":"zcy","З":"Zcy","ѕ":"dscy","Ѕ":"DScy","и":"icy","И":"Icy","і":"iukcy","І":"Iukcy","ї":"yicy","Ї":"YIcy","й":"jcy","Й":"Jcy","ј":"jsercy","Ј":"Jsercy","к":"kcy","К":"Kcy","ќ":"kjcy","Ќ":"KJcy","л":"lcy","Л":"Lcy","љ":"ljcy","Љ":"LJcy","м":"mcy","М":"Mcy","н":"ncy","Н":"Ncy","њ":"njcy","Њ":"NJcy","о":"ocy","О":"Ocy","п":"pcy","П":"Pcy","р":"rcy","Р":"Rcy","с":"scy","С":"Scy","т":"tcy","Т":"Tcy","ћ":"tshcy","Ћ":"TSHcy","у":"ucy","У":"Ucy","ў":"ubrcy","Ў":"Ubrcy","ф":"fcy","Ф":"Fcy","х":"khcy","Х":"KHcy","ц":"tscy","Ц":"TScy","ч":"chcy","Ч":"CHcy","џ":"dzcy","Џ":"DZcy","ш":"shcy","Ш":"SHcy","щ":"shchcy","Щ":"SHCHcy","ъ":"hardcy","Ъ":"HARDcy","ы":"ycy","Ы":"Ycy","ь":"softcy","Ь":"SOFTcy","э":"ecy","Э":"Ecy","ю":"yucy","Ю":"YUcy","я":"yacy","Я":"YAcy","ℵ":"aleph","ℶ":"beth","ℷ":"gimel","ℸ":"daleth"},d=/["&'<>`]/g,o={'"':"&quot;","&":"&amp;","'":"&#x27;","<":"&lt;",">":"&gt;","`":"&#x60;"},s=/&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/,g=/[\0-\x08\x0B\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,u=/&(CounterClockwiseContourIntegral|DoubleLongLeftRightArrow|ClockwiseContourIntegral|NotNestedGreaterGreater|NotSquareSupersetEqual|DiacriticalDoubleAcute|NotRightTriangleEqual|NotSucceedsSlantEqual|NotPrecedesSlantEqual|CloseCurlyDoubleQuote|NegativeVeryThinSpace|DoubleContourIntegral|FilledVerySmallSquare|CapitalDifferentialD|OpenCurlyDoubleQuote|EmptyVerySmallSquare|NestedGreaterGreater|DoubleLongRightArrow|NotLeftTriangleEqual|NotGreaterSlantEqual|ReverseUpEquilibrium|DoubleLeftRightArrow|NotSquareSubsetEqual|NotDoubleVerticalBar|RightArrowLeftArrow|NotGreaterFullEqual|NotRightTriangleBar|SquareSupersetEqual|DownLeftRightVector|DoubleLongLeftArrow|leftrightsquigarrow|LeftArrowRightArrow|NegativeMediumSpace|blacktriangleright|RightDownVectorBar|PrecedesSlantEqual|RightDoubleBracket|SucceedsSlantEqual|NotLeftTriangleBar|RightTriangleEqual|SquareIntersection|RightDownTeeVector|ReverseEquilibrium|NegativeThickSpace|longleftrightarrow|Longleftrightarrow|LongLeftRightArrow|DownRightTeeVector|DownRightVectorBar|GreaterSlantEqual|SquareSubsetEqual|LeftDownVectorBar|LeftDoubleBracket|VerticalSeparator|rightleftharpoons|NotGreaterGreater|NotSquareSuperset|blacktriangleleft|blacktriangledown|NegativeThinSpace|LeftDownTeeVector|NotLessSlantEqual|leftrightharpoons|DoubleUpDownArrow|DoubleVerticalBar|LeftTriangleEqual|FilledSmallSquare|twoheadrightarrow|NotNestedLessLess|DownLeftTeeVector|DownLeftVectorBar|RightAngleBracket|NotTildeFullEqual|NotReverseElement|RightUpDownVector|DiacriticalTilde|NotSucceedsTilde|circlearrowright|NotPrecedesEqual|rightharpoondown|DoubleRightArrow|NotSucceedsEqual|NonBreakingSpace|NotRightTriangle|LessEqualGreater|RightUpTeeVector|LeftAngleBracket|GreaterFullEqual|DownArrowUpArrow|RightUpVectorBar|twoheadleftarrow|GreaterEqualLess|downharpoonright|RightTriangleBar|ntrianglerighteq|NotSupersetEqual|LeftUpDownVector|DiacriticalAcute|rightrightarrows|vartriangleright|UpArrowDownArrow|DiacriticalGrave|UnderParenthesis|EmptySmallSquare|LeftUpVectorBar|leftrightarrows|DownRightVector|downharpoonleft|trianglerighteq|ShortRightArrow|OverParenthesis|DoubleLeftArrow|DoubleDownArrow|NotSquareSubset|bigtriangledown|ntrianglelefteq|UpperRightArrow|curvearrowright|vartriangleleft|NotLeftTriangle|nleftrightarrow|LowerRightArrow|NotHumpDownHump|NotGreaterTilde|rightthreetimes|LeftUpTeeVector|NotGreaterEqual|straightepsilon|LeftTriangleBar|rightsquigarrow|ContourIntegral|rightleftarrows|CloseCurlyQuote|RightDownVector|LeftRightVector|nLeftrightarrow|leftharpoondown|circlearrowleft|SquareSuperset|OpenCurlyQuote|hookrightarrow|HorizontalLine|DiacriticalDot|NotLessGreater|ntriangleright|DoubleRightTee|InvisibleComma|InvisibleTimes|LowerLeftArrow|DownLeftVector|NotSubsetEqual|curvearrowleft|trianglelefteq|NotVerticalBar|TildeFullEqual|downdownarrows|NotGreaterLess|RightTeeVector|ZeroWidthSpace|looparrowright|LongRightArrow|doublebarwedge|ShortLeftArrow|ShortDownArrow|RightVectorBar|GreaterGreater|ReverseElement|rightharpoonup|LessSlantEqual|leftthreetimes|upharpoonright|rightarrowtail|LeftDownVector|Longrightarrow|NestedLessLess|UpperLeftArrow|nshortparallel|leftleftarrows|leftrightarrow|Leftrightarrow|LeftRightArrow|longrightarrow|upharpoonleft|RightArrowBar|ApplyFunction|LeftTeeVector|leftarrowtail|NotEqualTilde|varsubsetneqq|varsupsetneqq|RightTeeArrow|SucceedsEqual|SucceedsTilde|LeftVectorBar|SupersetEqual|hookleftarrow|DifferentialD|VerticalTilde|VeryThinSpace|blacktriangle|bigtriangleup|LessFullEqual|divideontimes|leftharpoonup|UpEquilibrium|ntriangleleft|RightTriangle|measuredangle|shortparallel|longleftarrow|Longleftarrow|LongLeftArrow|DoubleLeftTee|Poincareplane|PrecedesEqual|triangleright|DoubleUpArrow|RightUpVector|fallingdotseq|looparrowleft|PrecedesTilde|NotTildeEqual|NotTildeTilde|smallsetminus|Proportional|triangleleft|triangledown|UnderBracket|NotHumpEqual|exponentiale|ExponentialE|NotLessTilde|HilbertSpace|RightCeiling|blacklozenge|varsupsetneq|HumpDownHump|GreaterEqual|VerticalLine|LeftTeeArrow|NotLessEqual|DownTeeArrow|LeftTriangle|varsubsetneq|Intersection|NotCongruent|DownArrowBar|LeftUpVector|LeftArrowBar|risingdotseq|GreaterTilde|RoundImplies|SquareSubset|ShortUpArrow|NotSuperset|quaternions|precnapprox|backepsilon|preccurlyeq|OverBracket|blacksquare|MediumSpace|VerticalBar|circledcirc|circleddash|CircleMinus|CircleTimes|LessGreater|curlyeqprec|curlyeqsucc|diamondsuit|UpDownArrow|Updownarrow|RuleDelayed|Rrightarrow|updownarrow|RightVector|nRightarrow|nrightarrow|eqslantless|LeftCeiling|Equilibrium|SmallCircle|expectation|NotSucceeds|thickapprox|GreaterLess|SquareUnion|NotPrecedes|NotLessLess|straightphi|succnapprox|succcurlyeq|SubsetEqual|sqsupseteq|Proportion|Laplacetrf|ImaginaryI|supsetneqq|NotGreater|gtreqqless|NotElement|ThickSpace|TildeEqual|TildeTilde|Fouriertrf|rmoustache|EqualTilde|eqslantgtr|UnderBrace|LeftVector|UpArrowBar|nLeftarrow|nsubseteqq|subsetneqq|nsupseteqq|nleftarrow|succapprox|lessapprox|UpTeeArrow|upuparrows|curlywedge|lesseqqgtr|varepsilon|varnothing|RightFloor|complement|CirclePlus|sqsubseteq|Lleftarrow|circledast|RightArrow|Rightarrow|rightarrow|lmoustache|Bernoullis|precapprox|mapstoleft|mapstodown|longmapsto|dotsquare|downarrow|DoubleDot|nsubseteq|supsetneq|leftarrow|nsupseteq|subsetneq|ThinSpace|ngeqslant|subseteqq|HumpEqual|NotSubset|triangleq|NotCupCap|lesseqgtr|heartsuit|TripleDot|Leftarrow|Coproduct|Congruent|varpropto|complexes|gvertneqq|LeftArrow|LessTilde|supseteqq|MinusPlus|CircleDot|nleqslant|NotExists|gtreqless|nparallel|UnionPlus|LeftFloor|checkmark|CenterDot|centerdot|Mellintrf|gtrapprox|bigotimes|OverBrace|spadesuit|therefore|pitchfork|rationals|PlusMinus|Backslash|Therefore|DownBreve|backsimeq|backprime|DownArrow|nshortmid|Downarrow|lvertneqq|eqvparsl|imagline|imagpart|infintie|integers|Integral|intercal|LessLess|Uarrocir|intlarhk|sqsupset|angmsdaf|sqsubset|llcorner|vartheta|cupbrcap|lnapprox|Superset|SuchThat|succnsim|succneqq|angmsdag|biguplus|curlyvee|trpezium|Succeeds|NotTilde|bigwedge|angmsdah|angrtvbd|triminus|cwconint|fpartint|lrcorner|smeparsl|subseteq|urcorner|lurdshar|laemptyv|DDotrahd|approxeq|ldrushar|awconint|mapstoup|backcong|shortmid|triangle|geqslant|gesdotol|timesbar|circledR|circledS|setminus|multimap|naturals|scpolint|ncongdot|RightTee|boxminus|gnapprox|boxtimes|andslope|thicksim|angmsdaa|varsigma|cirfnint|rtriltri|angmsdab|rppolint|angmsdac|barwedge|drbkarow|clubsuit|thetasym|bsolhsub|capbrcup|dzigrarr|doteqdot|DotEqual|dotminus|UnderBar|NotEqual|realpart|otimesas|ulcorner|hksearow|hkswarow|parallel|PartialD|elinters|emptyset|plusacir|bbrktbrk|angmsdad|pointint|bigoplus|angmsdae|Precedes|bigsqcup|varkappa|notindot|supseteq|precneqq|precnsim|profalar|profline|profsurf|leqslant|lesdotor|raemptyv|subplus|notnivb|notnivc|subrarr|zigrarr|vzigzag|submult|subedot|Element|between|cirscir|larrbfs|larrsim|lotimes|lbrksld|lbrkslu|lozenge|ldrdhar|dbkarow|bigcirc|epsilon|simrarr|simplus|ltquest|Epsilon|luruhar|gtquest|maltese|npolint|eqcolon|npreceq|bigodot|ddagger|gtrless|bnequiv|harrcir|ddotseq|equivDD|backsim|demptyv|nsqsube|nsqsupe|Upsilon|nsubset|upsilon|minusdu|nsucceq|swarrow|nsupset|coloneq|searrow|boxplus|napprox|natural|asympeq|alefsym|congdot|nearrow|bigstar|diamond|supplus|tritime|LeftTee|nvinfin|triplus|NewLine|nvltrie|nvrtrie|nwarrow|nexists|Diamond|ruluhar|Implies|supmult|angzarr|suplarr|suphsub|questeq|because|digamma|Because|olcross|bemptyv|omicron|Omicron|rotimes|NoBreak|intprod|angrtvb|orderof|uwangle|suphsol|lesdoto|orslope|DownTee|realine|cudarrl|rdldhar|OverBar|supedot|lessdot|supdsub|topfork|succsim|rbrkslu|rbrksld|pertenk|cudarrr|isindot|planckh|lessgtr|pluscir|gesdoto|plussim|plustwo|lesssim|cularrp|rarrsim|Cayleys|notinva|notinvb|notinvc|UpArrow|Uparrow|uparrow|NotLess|dwangle|precsim|Product|curarrm|Cconint|dotplus|rarrbfs|ccupssm|Cedilla|cemptyv|notniva|quatint|frac35|frac38|frac45|frac56|frac58|frac78|tridot|xoplus|gacute|gammad|Gammad|lfisht|lfloor|bigcup|sqsupe|gbreve|Gbreve|lharul|sqsube|sqcups|Gcedil|apacir|llhard|lmidot|Lmidot|lmoust|andand|sqcaps|approx|Abreve|spades|circeq|tprime|divide|topcir|Assign|topbot|gesdot|divonx|xuplus|timesd|gesles|atilde|solbar|SOFTcy|loplus|timesb|lowast|lowbar|dlcorn|dlcrop|softcy|dollar|lparlt|thksim|lrhard|Atilde|lsaquo|smashp|bigvee|thinsp|wreath|bkarow|lsquor|lstrok|Lstrok|lthree|ltimes|ltlarr|DotDot|simdot|ltrPar|weierp|xsqcup|angmsd|sigmav|sigmaf|zeetrf|Zcaron|zcaron|mapsto|vsupne|thetav|cirmid|marker|mcomma|Zacute|vsubnE|there4|gtlPar|vsubne|bottom|gtrarr|SHCHcy|shchcy|midast|midcir|middot|minusb|minusd|gtrdot|bowtie|sfrown|mnplus|models|colone|seswar|Colone|mstpos|searhk|gtrsim|nacute|Nacute|boxbox|telrec|hairsp|Tcedil|nbumpe|scnsim|ncaron|Ncaron|ncedil|Ncedil|hamilt|Scedil|nearhk|hardcy|HARDcy|tcedil|Tcaron|commat|nequiv|nesear|tcaron|target|hearts|nexist|varrho|scedil|Scaron|scaron|hellip|Sacute|sacute|hercon|swnwar|compfn|rtimes|rthree|rsquor|rsaquo|zacute|wedgeq|homtht|barvee|barwed|Barwed|rpargt|horbar|conint|swarhk|roplus|nltrie|hslash|hstrok|Hstrok|rmoust|Conint|bprime|hybull|hyphen|iacute|Iacute|supsup|supsub|supsim|varphi|coprod|brvbar|agrave|Supset|supset|igrave|Igrave|notinE|Agrave|iiiint|iinfin|copysr|wedbar|Verbar|vangrt|becaus|incare|verbar|inodot|bullet|drcorn|intcal|drcrop|cularr|vellip|Utilde|bumpeq|cupcap|dstrok|Dstrok|CupCap|cupcup|cupdot|eacute|Eacute|supdot|iquest|easter|ecaron|Ecaron|ecolon|isinsv|utilde|itilde|Itilde|curarr|succeq|Bumpeq|cacute|ulcrop|nparsl|Cacute|nprcue|egrave|Egrave|nrarrc|nrarrw|subsup|subsub|nrtrie|jsercy|nsccue|Jsercy|kappav|kcedil|Kcedil|subsim|ulcorn|nsimeq|egsdot|veebar|kgreen|capand|elsdot|Subset|subset|curren|aacute|lacute|Lacute|emptyv|ntilde|Ntilde|lagran|lambda|Lambda|capcap|Ugrave|langle|subdot|emsp13|numero|emsp14|nvdash|nvDash|nVdash|nVDash|ugrave|ufisht|nvHarr|larrfs|nvlArr|larrhk|larrlp|larrpl|nvrArr|Udblac|nwarhk|larrtl|nwnear|oacute|Oacute|latail|lAtail|sstarf|lbrace|odblac|Odblac|lbrack|udblac|odsold|eparsl|lcaron|Lcaron|ograve|Ograve|lcedil|Lcedil|Aacute|ssmile|ssetmn|squarf|ldquor|capcup|ominus|cylcty|rharul|eqcirc|dagger|rfloor|rfisht|Dagger|daleth|equals|origof|capdot|equest|dcaron|Dcaron|rdquor|oslash|Oslash|otilde|Otilde|otimes|Otimes|urcrop|Ubreve|ubreve|Yacute|Uacute|uacute|Rcedil|rcedil|urcorn|parsim|Rcaron|Vdashl|rcaron|Tstrok|percnt|period|permil|Exists|yacute|rbrack|rbrace|phmmat|ccaron|Ccaron|planck|ccedil|plankv|tstrok|female|plusdo|plusdu|ffilig|plusmn|ffllig|Ccedil|rAtail|dfisht|bernou|ratail|Rarrtl|rarrtl|angsph|rarrpl|rarrlp|rarrhk|xwedge|xotime|forall|ForAll|Vvdash|vsupnE|preceq|bigcap|frac12|frac13|frac14|primes|rarrfs|prnsim|frac15|Square|frac16|square|lesdot|frac18|frac23|propto|prurel|rarrap|rangle|puncsp|frac25|Racute|qprime|racute|lesges|frac34|abreve|AElig|eqsim|utdot|setmn|urtri|Equal|Uring|seArr|uring|searr|dashv|Dashv|mumap|nabla|iogon|Iogon|sdote|sdotb|scsim|napid|napos|equiv|natur|Acirc|dblac|erarr|nbump|iprod|erDot|ucirc|awint|esdot|angrt|ncong|isinE|scnap|Scirc|scirc|ndash|isins|Ubrcy|nearr|neArr|isinv|nedot|ubrcy|acute|Ycirc|iukcy|Iukcy|xutri|nesim|caret|jcirc|Jcirc|caron|twixt|ddarr|sccue|exist|jmath|sbquo|ngeqq|angst|ccaps|lceil|ngsim|UpTee|delta|Delta|rtrif|nharr|nhArr|nhpar|rtrie|jukcy|Jukcy|kappa|rsquo|Kappa|nlarr|nlArr|TSHcy|rrarr|aogon|Aogon|fflig|xrarr|tshcy|ccirc|nleqq|filig|upsih|nless|dharl|nlsim|fjlig|ropar|nltri|dharr|robrk|roarr|fllig|fltns|roang|rnmid|subnE|subne|lAarr|trisb|Ccirc|acirc|ccups|blank|VDash|forkv|Vdash|langd|cedil|blk12|blk14|laquo|strns|diams|notin|vDash|larrb|blk34|block|disin|uplus|vdash|vBarv|aelig|starf|Wedge|check|xrArr|lates|lbarr|lBarr|notni|lbbrk|bcong|frasl|lbrke|frown|vrtri|vprop|vnsup|gamma|Gamma|wedge|xodot|bdquo|srarr|doteq|ldquo|boxdl|boxdL|gcirc|Gcirc|boxDl|boxDL|boxdr|boxdR|boxDr|TRADE|trade|rlhar|boxDR|vnsub|npart|vltri|rlarr|boxhd|boxhD|nprec|gescc|nrarr|nrArr|boxHd|boxHD|boxhu|boxhU|nrtri|boxHu|clubs|boxHU|times|colon|Colon|gimel|xlArr|Tilde|nsime|tilde|nsmid|nspar|THORN|thorn|xlarr|nsube|nsubE|thkap|xhArr|comma|nsucc|boxul|boxuL|nsupe|nsupE|gneqq|gnsim|boxUl|boxUL|grave|boxur|boxuR|boxUr|boxUR|lescc|angle|bepsi|boxvh|varpi|boxvH|numsp|Theta|gsime|gsiml|theta|boxVh|boxVH|boxvl|gtcir|gtdot|boxvL|boxVl|boxVL|crarr|cross|Cross|nvsim|boxvr|nwarr|nwArr|sqsup|dtdot|Uogon|lhard|lharu|dtrif|ocirc|Ocirc|lhblk|duarr|odash|sqsub|Hacek|sqcup|llarr|duhar|oelig|OElig|ofcir|boxvR|uogon|lltri|boxVr|csube|uuarr|ohbar|csupe|ctdot|olarr|olcir|harrw|oline|sqcap|omacr|Omacr|omega|Omega|boxVR|aleph|lneqq|lnsim|loang|loarr|rharu|lobrk|hcirc|operp|oplus|rhard|Hcirc|orarr|Union|order|ecirc|Ecirc|cuepr|szlig|cuesc|breve|reals|eDDot|Breve|hoarr|lopar|utrif|rdquo|Umacr|umacr|efDot|swArr|ultri|alpha|rceil|ovbar|swarr|Wcirc|wcirc|smtes|smile|bsemi|lrarr|aring|parsl|lrhar|bsime|uhblk|lrtri|cupor|Aring|uharr|uharl|slarr|rbrke|bsolb|lsime|rbbrk|RBarr|lsimg|phone|rBarr|rbarr|icirc|lsquo|Icirc|emacr|Emacr|ratio|simne|plusb|simlE|simgE|simeq|pluse|ltcir|ltdot|empty|xharr|xdtri|iexcl|Alpha|ltrie|rarrw|pound|ltrif|xcirc|bumpe|prcue|bumpE|asymp|amacr|cuvee|Sigma|sigma|iiint|udhar|iiota|ijlig|IJlig|supnE|imacr|Imacr|prime|Prime|image|prnap|eogon|Eogon|rarrc|mdash|mDDot|cuwed|imath|supne|imped|Amacr|udarr|prsim|micro|rarrb|cwint|raquo|infin|eplus|range|rangd|Ucirc|radic|minus|amalg|veeeq|rAarr|epsiv|ycirc|quest|sharp|quot|zwnj|Qscr|race|qscr|Qopf|qopf|qint|rang|Rang|Zscr|zscr|Zopf|zopf|rarr|rArr|Rarr|Pscr|pscr|prop|prod|prnE|prec|ZHcy|zhcy|prap|Zeta|zeta|Popf|popf|Zdot|plus|zdot|Yuml|yuml|phiv|YUcy|yucy|Yscr|yscr|perp|Yopf|yopf|part|para|YIcy|Ouml|rcub|yicy|YAcy|rdca|ouml|osol|Oscr|rdsh|yacy|real|oscr|xvee|andd|rect|andv|Xscr|oror|ordm|ordf|xscr|ange|aopf|Aopf|rHar|Xopf|opar|Oopf|xopf|xnis|rhov|oopf|omid|xmap|oint|apid|apos|ogon|ascr|Ascr|odot|odiv|xcup|xcap|ocir|oast|nvlt|nvle|nvgt|nvge|nvap|Wscr|wscr|auml|ntlg|ntgl|nsup|nsub|nsim|Nscr|nscr|nsce|Wopf|ring|npre|wopf|npar|Auml|Barv|bbrk|Nopf|nopf|nmid|nLtv|beta|ropf|Ropf|Beta|beth|nles|rpar|nleq|bnot|bNot|nldr|NJcy|rscr|Rscr|Vscr|vscr|rsqb|njcy|bopf|nisd|Bopf|rtri|Vopf|nGtv|ngtr|vopf|boxh|boxH|boxv|nges|ngeq|boxV|bscr|scap|Bscr|bsim|Vert|vert|bsol|bull|bump|caps|cdot|ncup|scnE|ncap|nbsp|napE|Cdot|cent|sdot|Vbar|nang|vBar|chcy|Mscr|mscr|sect|semi|CHcy|Mopf|mopf|sext|circ|cire|mldr|mlcp|cirE|comp|shcy|SHcy|vArr|varr|cong|copf|Copf|copy|COPY|malt|male|macr|lvnE|cscr|ltri|sime|ltcc|simg|Cscr|siml|csub|Uuml|lsqb|lsim|uuml|csup|Lscr|lscr|utri|smid|lpar|cups|smte|lozf|darr|Lopf|Uscr|solb|lopf|sopf|Sopf|lneq|uscr|spar|dArr|lnap|Darr|dash|Sqrt|LJcy|ljcy|lHar|dHar|Upsi|upsi|diam|lesg|djcy|DJcy|leqq|dopf|Dopf|dscr|Dscr|dscy|ldsh|ldca|squf|DScy|sscr|Sscr|dsol|lcub|late|star|Star|Uopf|Larr|lArr|larr|uopf|dtri|dzcy|sube|subE|Lang|lang|Kscr|kscr|Kopf|kopf|KJcy|kjcy|KHcy|khcy|DZcy|ecir|edot|eDot|Jscr|jscr|succ|Jopf|jopf|Edot|uHar|emsp|ensp|Iuml|iuml|eopf|isin|Iscr|iscr|Eopf|epar|sung|epsi|escr|sup1|sup2|sup3|Iota|iota|supe|supE|Iopf|iopf|IOcy|iocy|Escr|esim|Esim|imof|Uarr|QUOT|uArr|uarr|euml|IEcy|iecy|Idot|Euml|euro|excl|Hscr|hscr|Hopf|hopf|TScy|tscy|Tscr|hbar|tscr|flat|tbrk|fnof|hArr|harr|half|fopf|Fopf|tdot|gvnE|fork|trie|gtcc|fscr|Fscr|gdot|gsim|Gscr|gscr|Gopf|gopf|gneq|Gdot|tosa|gnap|Topf|topf|geqq|toea|GJcy|gjcy|tint|gesl|mid|Sfr|ggg|top|ges|gla|glE|glj|geq|gne|gEl|gel|gnE|Gcy|gcy|gap|Tfr|tfr|Tcy|tcy|Hat|Tau|Ffr|tau|Tab|hfr|Hfr|ffr|Fcy|fcy|icy|Icy|iff|ETH|eth|ifr|Ifr|Eta|eta|int|Int|Sup|sup|ucy|Ucy|Sum|sum|jcy|ENG|ufr|Ufr|eng|Jcy|jfr|els|ell|egs|Efr|efr|Jfr|uml|kcy|Kcy|Ecy|ecy|kfr|Kfr|lap|Sub|sub|lat|lcy|Lcy|leg|Dot|dot|lEg|leq|les|squ|div|die|lfr|Lfr|lgE|Dfr|dfr|Del|deg|Dcy|dcy|lne|lnE|sol|loz|smt|Cup|lrm|cup|lsh|Lsh|sim|shy|map|Map|mcy|Mcy|mfr|Mfr|mho|gfr|Gfr|sfr|cir|Chi|chi|nap|Cfr|vcy|Vcy|cfr|Scy|scy|ncy|Ncy|vee|Vee|Cap|cap|nfr|scE|sce|Nfr|nge|ngE|nGg|vfr|Vfr|ngt|bot|nGt|nis|niv|Rsh|rsh|nle|nlE|bne|Bfr|bfr|nLl|nlt|nLt|Bcy|bcy|not|Not|rlm|wfr|Wfr|npr|nsc|num|ocy|ast|Ocy|ofr|xfr|Xfr|Ofr|ogt|ohm|apE|olt|Rho|ape|rho|Rfr|rfr|ord|REG|ang|reg|orv|And|and|AMP|Rcy|amp|Afr|ycy|Ycy|yen|yfr|Yfr|rcy|par|pcy|Pcy|pfr|Pfr|phi|Phi|afr|Acy|acy|zcy|Zcy|piv|acE|acd|zfr|Zfr|pre|prE|psi|Psi|qfr|Qfr|zwj|Or|ge|Gg|gt|gg|el|oS|lt|Lt|LT|Re|lg|gl|eg|ne|Im|it|le|DD|wp|wr|nu|Nu|dd|lE|Sc|sc|pi|Pi|ee|af|ll|Ll|rx|gE|xi|pm|Xi|ic|pr|Pr|in|ni|mp|mu|ac|Mu|or|ap|Gt|GT|ii);|&(Aacute|Agrave|Atilde|Ccedil|Eacute|Egrave|Iacute|Igrave|Ntilde|Oacute|Ograve|Oslash|Otilde|Uacute|Ugrave|Yacute|aacute|agrave|atilde|brvbar|ccedil|curren|divide|eacute|egrave|frac12|frac14|frac34|iacute|igrave|iquest|middot|ntilde|oacute|ograve|oslash|otilde|plusmn|uacute|ugrave|yacute|AElig|Acirc|Aring|Ecirc|Icirc|Ocirc|THORN|Ucirc|acirc|acute|aelig|aring|cedil|ecirc|icirc|iexcl|laquo|micro|ocirc|pound|raquo|szlig|thorn|times|ucirc|Auml|COPY|Euml|Iuml|Ouml|QUOT|Uuml|auml|cent|copy|euml|iuml|macr|nbsp|ordf|ordm|ouml|para|quot|sect|sup1|sup2|sup3|uuml|yuml|AMP|ETH|REG|amp|deg|eth|not|reg|shy|uml|yen|GT|LT|gt|lt)(?!;)([=a-zA-Z0-9]?)|&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+)/g,h={aacute:"á",Aacute:"Á",abreve:"ă",Abreve:"Ă",ac:"∾",acd:"∿",acE:"∾̳",acirc:"â",Acirc:"Â",acute:"´",acy:"а",Acy:"А",aelig:"æ",AElig:"Æ",af:"⁡",afr:"𝔞",Afr:"𝔄",agrave:"à",Agrave:"À",alefsym:"ℵ",aleph:"ℵ",alpha:"α",Alpha:"Α",amacr:"ā",Amacr:"Ā",amalg:"⨿",amp:"&",AMP:"&",and:"∧",And:"⩓",andand:"⩕",andd:"⩜",andslope:"⩘",andv:"⩚",ang:"∠",ange:"⦤",angle:"∠",angmsd:"∡",angmsdaa:"⦨",angmsdab:"⦩",angmsdac:"⦪",angmsdad:"⦫",angmsdae:"⦬",angmsdaf:"⦭",angmsdag:"⦮",angmsdah:"⦯",angrt:"∟",angrtvb:"⊾",angrtvbd:"⦝",angsph:"∢",angst:"Å",angzarr:"⍼",aogon:"ą",Aogon:"Ą",aopf:"𝕒",Aopf:"𝔸",ap:"≈",apacir:"⩯",ape:"≊",apE:"⩰",apid:"≋",apos:"'",ApplyFunction:"⁡",approx:"≈",approxeq:"≊",aring:"å",Aring:"Å",ascr:"𝒶",Ascr:"𝒜",Assign:"≔",ast:"*",asymp:"≈",asympeq:"≍",atilde:"ã",Atilde:"Ã",auml:"ä",Auml:"Ä",awconint:"∳",awint:"⨑",backcong:"≌",backepsilon:"϶",backprime:"‵",backsim:"∽",backsimeq:"⋍",Backslash:"∖",Barv:"⫧",barvee:"⊽",barwed:"⌅",Barwed:"⌆",barwedge:"⌅",bbrk:"⎵",bbrktbrk:"⎶",bcong:"≌",bcy:"б",Bcy:"Б",bdquo:"„",becaus:"∵",because:"∵",Because:"∵",bemptyv:"⦰",bepsi:"϶",bernou:"ℬ",Bernoullis:"ℬ",beta:"β",Beta:"Β",beth:"ℶ",between:"≬",bfr:"𝔟",Bfr:"𝔅",bigcap:"⋂",bigcirc:"◯",bigcup:"⋃",bigodot:"⨀",bigoplus:"⨁",bigotimes:"⨂",bigsqcup:"⨆",bigstar:"★",bigtriangledown:"▽",bigtriangleup:"△",biguplus:"⨄",bigvee:"⋁",bigwedge:"⋀",bkarow:"⤍",blacklozenge:"⧫",blacksquare:"▪",blacktriangle:"▴",blacktriangledown:"▾",blacktriangleleft:"◂",blacktriangleright:"▸",blank:"␣",blk12:"▒",blk14:"░",blk34:"▓",block:"█",bne:"=⃥",bnequiv:"≡⃥",bnot:"⌐",bNot:"⫭",bopf:"𝕓",Bopf:"𝔹",bot:"⊥",bottom:"⊥",bowtie:"⋈",boxbox:"⧉",boxdl:"┐",boxdL:"╕",boxDl:"╖",boxDL:"╗",boxdr:"┌",boxdR:"╒",boxDr:"╓",boxDR:"╔",boxh:"─",boxH:"═",boxhd:"┬",boxhD:"╥",boxHd:"╤",boxHD:"╦",boxhu:"┴",boxhU:"╨",boxHu:"╧",boxHU:"╩",boxminus:"⊟",boxplus:"⊞",boxtimes:"⊠",boxul:"┘",boxuL:"╛",boxUl:"╜",boxUL:"╝",boxur:"└",boxuR:"╘",boxUr:"╙",boxUR:"╚",boxv:"│",boxV:"║",boxvh:"┼",boxvH:"╪",boxVh:"╫",boxVH:"╬",boxvl:"┤",boxvL:"╡",boxVl:"╢",boxVL:"╣",boxvr:"├",boxvR:"╞",boxVr:"╟",boxVR:"╠",bprime:"‵",breve:"˘",Breve:"˘",brvbar:"¦",bscr:"𝒷",Bscr:"ℬ",bsemi:"⁏",bsim:"∽",bsime:"⋍",bsol:"\\",bsolb:"⧅",bsolhsub:"⟈",bull:"•",bullet:"•",bump:"≎",bumpe:"≏",bumpE:"⪮",bumpeq:"≏",Bumpeq:"≎",cacute:"ć",Cacute:"Ć",cap:"∩",Cap:"⋒",capand:"⩄",capbrcup:"⩉",capcap:"⩋",capcup:"⩇",capdot:"⩀",CapitalDifferentialD:"ⅅ",caps:"∩︀",caret:"⁁",caron:"ˇ",Cayleys:"ℭ",ccaps:"⩍",ccaron:"č",Ccaron:"Č",ccedil:"ç",Ccedil:"Ç",ccirc:"ĉ",Ccirc:"Ĉ",Cconint:"∰",ccups:"⩌",ccupssm:"⩐",cdot:"ċ",Cdot:"Ċ",cedil:"¸",Cedilla:"¸",cemptyv:"⦲",cent:"¢",centerdot:"·",CenterDot:"·",cfr:"𝔠",Cfr:"ℭ",chcy:"ч",CHcy:"Ч",check:"✓",checkmark:"✓",chi:"χ",Chi:"Χ",cir:"○",circ:"ˆ",circeq:"≗",circlearrowleft:"↺",circlearrowright:"↻",circledast:"⊛",circledcirc:"⊚",circleddash:"⊝",CircleDot:"⊙",circledR:"®",circledS:"Ⓢ",CircleMinus:"⊖",CirclePlus:"⊕",CircleTimes:"⊗",cire:"≗",cirE:"⧃",cirfnint:"⨐",cirmid:"⫯",cirscir:"⧂",ClockwiseContourIntegral:"∲",CloseCurlyDoubleQuote:"”",CloseCurlyQuote:"’",clubs:"♣",clubsuit:"♣",colon:":",Colon:"∷",colone:"≔",Colone:"⩴",coloneq:"≔",comma:",",commat:"@",comp:"∁",compfn:"∘",complement:"∁",complexes:"ℂ",cong:"≅",congdot:"⩭",Congruent:"≡",conint:"∮",Conint:"∯",ContourIntegral:"∮",copf:"𝕔",Copf:"ℂ",coprod:"∐",Coproduct:"∐",copy:"©",COPY:"©",copysr:"℗",CounterClockwiseContourIntegral:"∳",crarr:"↵",cross:"✗",Cross:"⨯",cscr:"𝒸",Cscr:"𝒞",csub:"⫏",csube:"⫑",csup:"⫐",csupe:"⫒",ctdot:"⋯",cudarrl:"⤸",cudarrr:"⤵",cuepr:"⋞",cuesc:"⋟",cularr:"↶",cularrp:"⤽",cup:"∪",Cup:"⋓",cupbrcap:"⩈",cupcap:"⩆",CupCap:"≍",cupcup:"⩊",cupdot:"⊍",cupor:"⩅",cups:"∪︀",curarr:"↷",curarrm:"⤼",curlyeqprec:"⋞",curlyeqsucc:"⋟",curlyvee:"⋎",curlywedge:"⋏",curren:"¤",curvearrowleft:"↶",curvearrowright:"↷",cuvee:"⋎",cuwed:"⋏",cwconint:"∲",cwint:"∱",cylcty:"⌭",dagger:"†",Dagger:"‡",daleth:"ℸ",darr:"↓",dArr:"⇓",Darr:"↡",dash:"‐",dashv:"⊣",Dashv:"⫤",dbkarow:"⤏",dblac:"˝",dcaron:"ď",Dcaron:"Ď",dcy:"д",Dcy:"Д",dd:"ⅆ",DD:"ⅅ",ddagger:"‡",ddarr:"⇊",DDotrahd:"⤑",ddotseq:"⩷",deg:"°",Del:"∇",delta:"δ",Delta:"Δ",demptyv:"⦱",dfisht:"⥿",dfr:"𝔡",Dfr:"𝔇",dHar:"⥥",dharl:"⇃",dharr:"⇂",DiacriticalAcute:"´",DiacriticalDot:"˙",DiacriticalDoubleAcute:"˝",DiacriticalGrave:"`",DiacriticalTilde:"˜",diam:"⋄",diamond:"⋄",Diamond:"⋄",diamondsuit:"♦",diams:"♦",die:"¨",DifferentialD:"ⅆ",digamma:"ϝ",disin:"⋲",div:"÷",divide:"÷",divideontimes:"⋇",divonx:"⋇",djcy:"ђ",DJcy:"Ђ",dlcorn:"⌞",dlcrop:"⌍",dollar:"$",dopf:"𝕕",Dopf:"𝔻",dot:"˙",Dot:"¨",DotDot:"⃜",doteq:"≐",doteqdot:"≑",DotEqual:"≐",dotminus:"∸",dotplus:"∔",dotsquare:"⊡",doublebarwedge:"⌆",DoubleContourIntegral:"∯",DoubleDot:"¨",DoubleDownArrow:"⇓",DoubleLeftArrow:"⇐",DoubleLeftRightArrow:"⇔",DoubleLeftTee:"⫤",DoubleLongLeftArrow:"⟸",DoubleLongLeftRightArrow:"⟺",DoubleLongRightArrow:"⟹",DoubleRightArrow:"⇒",DoubleRightTee:"⊨",DoubleUpArrow:"⇑",DoubleUpDownArrow:"⇕",DoubleVerticalBar:"∥",downarrow:"↓",Downarrow:"⇓",DownArrow:"↓",DownArrowBar:"⤓",DownArrowUpArrow:"⇵",DownBreve:"̑",downdownarrows:"⇊",downharpoonleft:"⇃",downharpoonright:"⇂",DownLeftRightVector:"⥐",DownLeftTeeVector:"⥞",DownLeftVector:"↽",DownLeftVectorBar:"⥖",DownRightTeeVector:"⥟",DownRightVector:"⇁",DownRightVectorBar:"⥗",DownTee:"⊤",DownTeeArrow:"↧",drbkarow:"⤐",drcorn:"⌟",drcrop:"⌌",dscr:"𝒹",Dscr:"𝒟",dscy:"ѕ",DScy:"Ѕ",dsol:"⧶",dstrok:"đ",Dstrok:"Đ",dtdot:"⋱",dtri:"▿",dtrif:"▾",duarr:"⇵",duhar:"⥯",dwangle:"⦦",dzcy:"џ",DZcy:"Џ",dzigrarr:"⟿",eacute:"é",Eacute:"É",easter:"⩮",ecaron:"ě",Ecaron:"Ě",ecir:"≖",ecirc:"ê",Ecirc:"Ê",ecolon:"≕",ecy:"э",Ecy:"Э",eDDot:"⩷",edot:"ė",eDot:"≑",Edot:"Ė",ee:"ⅇ",efDot:"≒",efr:"𝔢",Efr:"𝔈",eg:"⪚",egrave:"è",Egrave:"È",egs:"⪖",egsdot:"⪘",el:"⪙",Element:"∈",elinters:"⏧",ell:"ℓ",els:"⪕",elsdot:"⪗",emacr:"ē",Emacr:"Ē",empty:"∅",emptyset:"∅",EmptySmallSquare:"◻",emptyv:"∅",EmptyVerySmallSquare:"▫",emsp:" ",emsp13:" ",emsp14:" ",eng:"ŋ",ENG:"Ŋ",ensp:" ",eogon:"ę",Eogon:"Ę",eopf:"𝕖",Eopf:"𝔼",epar:"⋕",eparsl:"⧣",eplus:"⩱",epsi:"ε",epsilon:"ε",Epsilon:"Ε",epsiv:"ϵ",eqcirc:"≖",eqcolon:"≕",eqsim:"≂",eqslantgtr:"⪖",eqslantless:"⪕",Equal:"⩵",equals:"=",EqualTilde:"≂",equest:"≟",Equilibrium:"⇌",equiv:"≡",equivDD:"⩸",eqvparsl:"⧥",erarr:"⥱",erDot:"≓",escr:"ℯ",Escr:"ℰ",esdot:"≐",esim:"≂",Esim:"⩳",eta:"η",Eta:"Η",eth:"ð",ETH:"Ð",euml:"ë",Euml:"Ë",euro:"€",excl:"!",exist:"∃",Exists:"∃",expectation:"ℰ",exponentiale:"ⅇ",ExponentialE:"ⅇ",fallingdotseq:"≒",fcy:"ф",Fcy:"Ф",female:"♀",ffilig:"ﬃ",fflig:"ﬀ",ffllig:"ﬄ",ffr:"𝔣",Ffr:"𝔉",filig:"ﬁ",FilledSmallSquare:"◼",FilledVerySmallSquare:"▪",fjlig:"fj",flat:"♭",fllig:"ﬂ",fltns:"▱",fnof:"ƒ",fopf:"𝕗",Fopf:"𝔽",forall:"∀",ForAll:"∀",fork:"⋔",forkv:"⫙",Fouriertrf:"ℱ",fpartint:"⨍",frac12:"½",frac13:"⅓",frac14:"¼",frac15:"⅕",frac16:"⅙",frac18:"⅛",frac23:"⅔",frac25:"⅖",frac34:"¾",frac35:"⅗",frac38:"⅜",frac45:"⅘",frac56:"⅚",frac58:"⅝",frac78:"⅞",frasl:"⁄",frown:"⌢",fscr:"𝒻",Fscr:"ℱ",gacute:"ǵ",gamma:"γ",Gamma:"Γ",gammad:"ϝ",Gammad:"Ϝ",gap:"⪆",gbreve:"ğ",Gbreve:"Ğ",Gcedil:"Ģ",gcirc:"ĝ",Gcirc:"Ĝ",gcy:"г",Gcy:"Г",gdot:"ġ",Gdot:"Ġ",ge:"≥",gE:"≧",gel:"⋛",gEl:"⪌",geq:"≥",geqq:"≧",geqslant:"⩾",ges:"⩾",gescc:"⪩",gesdot:"⪀",gesdoto:"⪂",gesdotol:"⪄",gesl:"⋛︀",gesles:"⪔",gfr:"𝔤",Gfr:"𝔊",gg:"≫",Gg:"⋙",ggg:"⋙",gimel:"ℷ",gjcy:"ѓ",GJcy:"Ѓ",gl:"≷",gla:"⪥",glE:"⪒",glj:"⪤",gnap:"⪊",gnapprox:"⪊",gne:"⪈",gnE:"≩",gneq:"⪈",gneqq:"≩",gnsim:"⋧",gopf:"𝕘",Gopf:"𝔾",grave:"`",GreaterEqual:"≥",GreaterEqualLess:"⋛",GreaterFullEqual:"≧",GreaterGreater:"⪢",GreaterLess:"≷",GreaterSlantEqual:"⩾",GreaterTilde:"≳",gscr:"ℊ",Gscr:"𝒢",gsim:"≳",gsime:"⪎",gsiml:"⪐",gt:">",Gt:"≫",GT:">",gtcc:"⪧",gtcir:"⩺",gtdot:"⋗",gtlPar:"⦕",gtquest:"⩼",gtrapprox:"⪆",gtrarr:"⥸",gtrdot:"⋗",gtreqless:"⋛",gtreqqless:"⪌",gtrless:"≷",gtrsim:"≳",gvertneqq:"≩︀",gvnE:"≩︀",Hacek:"ˇ",hairsp:" ",half:"½",hamilt:"ℋ",hardcy:"ъ",HARDcy:"Ъ",harr:"↔",hArr:"⇔",harrcir:"⥈",harrw:"↭",Hat:"^",hbar:"ℏ",hcirc:"ĥ",Hcirc:"Ĥ",hearts:"♥",heartsuit:"♥",hellip:"…",hercon:"⊹",hfr:"𝔥",Hfr:"ℌ",HilbertSpace:"ℋ",hksearow:"⤥",hkswarow:"⤦",hoarr:"⇿",homtht:"∻",hookleftarrow:"↩",hookrightarrow:"↪",hopf:"𝕙",Hopf:"ℍ",horbar:"―",HorizontalLine:"─",hscr:"𝒽",Hscr:"ℋ",hslash:"ℏ",hstrok:"ħ",Hstrok:"Ħ",HumpDownHump:"≎",HumpEqual:"≏",hybull:"⁃",hyphen:"‐",iacute:"í",Iacute:"Í",ic:"⁣",icirc:"î",Icirc:"Î",icy:"и",Icy:"И",Idot:"İ",iecy:"е",IEcy:"Е",iexcl:"¡",iff:"⇔",ifr:"𝔦",Ifr:"ℑ",igrave:"ì",Igrave:"Ì",ii:"ⅈ",iiiint:"⨌",iiint:"∭",iinfin:"⧜",iiota:"℩",ijlig:"ĳ",IJlig:"Ĳ",Im:"ℑ",imacr:"ī",Imacr:"Ī",image:"ℑ",ImaginaryI:"ⅈ",imagline:"ℐ",imagpart:"ℑ",imath:"ı",imof:"⊷",imped:"Ƶ",Implies:"⇒",in:"∈",incare:"℅",infin:"∞",infintie:"⧝",inodot:"ı",int:"∫",Int:"∬",intcal:"⊺",integers:"ℤ",Integral:"∫",intercal:"⊺",Intersection:"⋂",intlarhk:"⨗",intprod:"⨼",InvisibleComma:"⁣",InvisibleTimes:"⁢",iocy:"ё",IOcy:"Ё",iogon:"į",Iogon:"Į",iopf:"𝕚",Iopf:"𝕀",iota:"ι",Iota:"Ι",iprod:"⨼",iquest:"¿",iscr:"𝒾",Iscr:"ℐ",isin:"∈",isindot:"⋵",isinE:"⋹",isins:"⋴",isinsv:"⋳",isinv:"∈",it:"⁢",itilde:"ĩ",Itilde:"Ĩ",iukcy:"і",Iukcy:"І",iuml:"ï",Iuml:"Ï",jcirc:"ĵ",Jcirc:"Ĵ",jcy:"й",Jcy:"Й",jfr:"𝔧",Jfr:"𝔍",jmath:"ȷ",jopf:"𝕛",Jopf:"𝕁",jscr:"𝒿",Jscr:"𝒥",jsercy:"ј",Jsercy:"Ј",jukcy:"є",Jukcy:"Є",kappa:"κ",Kappa:"Κ",kappav:"ϰ",kcedil:"ķ",Kcedil:"Ķ",kcy:"к",Kcy:"К",kfr:"𝔨",Kfr:"𝔎",kgreen:"ĸ",khcy:"х",KHcy:"Х",kjcy:"ќ",KJcy:"Ќ",kopf:"𝕜",Kopf:"𝕂",kscr:"𝓀",Kscr:"𝒦",lAarr:"⇚",lacute:"ĺ",Lacute:"Ĺ",laemptyv:"⦴",lagran:"ℒ",lambda:"λ",Lambda:"Λ",lang:"⟨",Lang:"⟪",langd:"⦑",langle:"⟨",lap:"⪅",Laplacetrf:"ℒ",laquo:"«",larr:"←",lArr:"⇐",Larr:"↞",larrb:"⇤",larrbfs:"⤟",larrfs:"⤝",larrhk:"↩",larrlp:"↫",larrpl:"⤹",larrsim:"⥳",larrtl:"↢",lat:"⪫",latail:"⤙",lAtail:"⤛",late:"⪭",lates:"⪭︀",lbarr:"⤌",lBarr:"⤎",lbbrk:"❲",lbrace:"{",lbrack:"[",lbrke:"⦋",lbrksld:"⦏",lbrkslu:"⦍",lcaron:"ľ",Lcaron:"Ľ",lcedil:"ļ",Lcedil:"Ļ",lceil:"⌈",lcub:"{",lcy:"л",Lcy:"Л",ldca:"⤶",ldquo:"“",ldquor:"„",ldrdhar:"⥧",ldrushar:"⥋",ldsh:"↲",le:"≤",lE:"≦",LeftAngleBracket:"⟨",leftarrow:"←",Leftarrow:"⇐",LeftArrow:"←",LeftArrowBar:"⇤",LeftArrowRightArrow:"⇆",leftarrowtail:"↢",LeftCeiling:"⌈",LeftDoubleBracket:"⟦",LeftDownTeeVector:"⥡",LeftDownVector:"⇃",LeftDownVectorBar:"⥙",LeftFloor:"⌊",leftharpoondown:"↽",leftharpoonup:"↼",leftleftarrows:"⇇",leftrightarrow:"↔",Leftrightarrow:"⇔",LeftRightArrow:"↔",leftrightarrows:"⇆",leftrightharpoons:"⇋",leftrightsquigarrow:"↭",LeftRightVector:"⥎",LeftTee:"⊣",LeftTeeArrow:"↤",LeftTeeVector:"⥚",leftthreetimes:"⋋",LeftTriangle:"⊲",LeftTriangleBar:"⧏",LeftTriangleEqual:"⊴",LeftUpDownVector:"⥑",LeftUpTeeVector:"⥠",LeftUpVector:"↿",LeftUpVectorBar:"⥘",LeftVector:"↼",LeftVectorBar:"⥒",leg:"⋚",lEg:"⪋",leq:"≤",leqq:"≦",leqslant:"⩽",les:"⩽",lescc:"⪨",lesdot:"⩿",lesdoto:"⪁",lesdotor:"⪃",lesg:"⋚︀",lesges:"⪓",lessapprox:"⪅",lessdot:"⋖",lesseqgtr:"⋚",lesseqqgtr:"⪋",LessEqualGreater:"⋚",LessFullEqual:"≦",LessGreater:"≶",lessgtr:"≶",LessLess:"⪡",lesssim:"≲",LessSlantEqual:"⩽",LessTilde:"≲",lfisht:"⥼",lfloor:"⌊",lfr:"𝔩",Lfr:"𝔏",lg:"≶",lgE:"⪑",lHar:"⥢",lhard:"↽",lharu:"↼",lharul:"⥪",lhblk:"▄",ljcy:"љ",LJcy:"Љ",ll:"≪",Ll:"⋘",llarr:"⇇",llcorner:"⌞",Lleftarrow:"⇚",llhard:"⥫",lltri:"◺",lmidot:"ŀ",Lmidot:"Ŀ",lmoust:"⎰",lmoustache:"⎰",lnap:"⪉",lnapprox:"⪉",lne:"⪇",lnE:"≨",lneq:"⪇",lneqq:"≨",lnsim:"⋦",loang:"⟬",loarr:"⇽",lobrk:"⟦",longleftarrow:"⟵",Longleftarrow:"⟸",LongLeftArrow:"⟵",longleftrightarrow:"⟷",Longleftrightarrow:"⟺",LongLeftRightArrow:"⟷",longmapsto:"⟼",longrightarrow:"⟶",Longrightarrow:"⟹",LongRightArrow:"⟶",looparrowleft:"↫",looparrowright:"↬",lopar:"⦅",lopf:"𝕝",Lopf:"𝕃",loplus:"⨭",lotimes:"⨴",lowast:"∗",lowbar:"_",LowerLeftArrow:"↙",LowerRightArrow:"↘",loz:"◊",lozenge:"◊",lozf:"⧫",lpar:"(",lparlt:"⦓",lrarr:"⇆",lrcorner:"⌟",lrhar:"⇋",lrhard:"⥭",lrm:"‎",lrtri:"⊿",lsaquo:"‹",lscr:"𝓁",Lscr:"ℒ",lsh:"↰",Lsh:"↰",lsim:"≲",lsime:"⪍",lsimg:"⪏",lsqb:"[",lsquo:"‘",lsquor:"‚",lstrok:"ł",Lstrok:"Ł",lt:"<",Lt:"≪",LT:"<",ltcc:"⪦",ltcir:"⩹",ltdot:"⋖",lthree:"⋋",ltimes:"⋉",ltlarr:"⥶",ltquest:"⩻",ltri:"◃",ltrie:"⊴",ltrif:"◂",ltrPar:"⦖",lurdshar:"⥊",luruhar:"⥦",lvertneqq:"≨︀",lvnE:"≨︀",macr:"¯",male:"♂",malt:"✠",maltese:"✠",map:"↦",Map:"⤅",mapsto:"↦",mapstodown:"↧",mapstoleft:"↤",mapstoup:"↥",marker:"▮",mcomma:"⨩",mcy:"м",Mcy:"М",mdash:"—",mDDot:"∺",measuredangle:"∡",MediumSpace:" ",Mellintrf:"ℳ",mfr:"𝔪",Mfr:"𝔐",mho:"℧",micro:"µ",mid:"∣",midast:"*",midcir:"⫰",middot:"·",minus:"−",minusb:"⊟",minusd:"∸",minusdu:"⨪",MinusPlus:"∓",mlcp:"⫛",mldr:"…",mnplus:"∓",models:"⊧",mopf:"𝕞",Mopf:"𝕄",mp:"∓",mscr:"𝓂",Mscr:"ℳ",mstpos:"∾",mu:"μ",Mu:"Μ",multimap:"⊸",mumap:"⊸",nabla:"∇",nacute:"ń",Nacute:"Ń",nang:"∠⃒",nap:"≉",napE:"⩰̸",napid:"≋̸",napos:"ŉ",napprox:"≉",natur:"♮",natural:"♮",naturals:"ℕ",nbsp:" ",nbump:"≎̸",nbumpe:"≏̸",ncap:"⩃",ncaron:"ň",Ncaron:"Ň",ncedil:"ņ",Ncedil:"Ņ",ncong:"≇",ncongdot:"⩭̸",ncup:"⩂",ncy:"н",Ncy:"Н",ndash:"–",ne:"≠",nearhk:"⤤",nearr:"↗",neArr:"⇗",nearrow:"↗",nedot:"≐̸",NegativeMediumSpace:"​",NegativeThickSpace:"​",NegativeThinSpace:"​",NegativeVeryThinSpace:"​",nequiv:"≢",nesear:"⤨",nesim:"≂̸",NestedGreaterGreater:"≫",NestedLessLess:"≪",NewLine:"\n",nexist:"∄",nexists:"∄",nfr:"𝔫",Nfr:"𝔑",nge:"≱",ngE:"≧̸",ngeq:"≱",ngeqq:"≧̸",ngeqslant:"⩾̸",nges:"⩾̸",nGg:"⋙̸",ngsim:"≵",ngt:"≯",nGt:"≫⃒",ngtr:"≯",nGtv:"≫̸",nharr:"↮",nhArr:"⇎",nhpar:"⫲",ni:"∋",nis:"⋼",nisd:"⋺",niv:"∋",njcy:"њ",NJcy:"Њ",nlarr:"↚",nlArr:"⇍",nldr:"‥",nle:"≰",nlE:"≦̸",nleftarrow:"↚",nLeftarrow:"⇍",nleftrightarrow:"↮",nLeftrightarrow:"⇎",nleq:"≰",nleqq:"≦̸",nleqslant:"⩽̸",nles:"⩽̸",nless:"≮",nLl:"⋘̸",nlsim:"≴",nlt:"≮",nLt:"≪⃒",nltri:"⋪",nltrie:"⋬",nLtv:"≪̸",nmid:"∤",NoBreak:"⁠",NonBreakingSpace:" ",nopf:"𝕟",Nopf:"ℕ",not:"¬",Not:"⫬",NotCongruent:"≢",NotCupCap:"≭",NotDoubleVerticalBar:"∦",NotElement:"∉",NotEqual:"≠",NotEqualTilde:"≂̸",NotExists:"∄",NotGreater:"≯",NotGreaterEqual:"≱",NotGreaterFullEqual:"≧̸",NotGreaterGreater:"≫̸",NotGreaterLess:"≹",NotGreaterSlantEqual:"⩾̸",NotGreaterTilde:"≵",NotHumpDownHump:"≎̸",NotHumpEqual:"≏̸",notin:"∉",notindot:"⋵̸",notinE:"⋹̸",notinva:"∉",notinvb:"⋷",notinvc:"⋶",NotLeftTriangle:"⋪",NotLeftTriangleBar:"⧏̸",NotLeftTriangleEqual:"⋬",NotLess:"≮",NotLessEqual:"≰",NotLessGreater:"≸",NotLessLess:"≪̸",NotLessSlantEqual:"⩽̸",NotLessTilde:"≴",NotNestedGreaterGreater:"⪢̸",NotNestedLessLess:"⪡̸",notni:"∌",notniva:"∌",notnivb:"⋾",notnivc:"⋽",NotPrecedes:"⊀",NotPrecedesEqual:"⪯̸",NotPrecedesSlantEqual:"⋠",NotReverseElement:"∌",NotRightTriangle:"⋫",NotRightTriangleBar:"⧐̸",NotRightTriangleEqual:"⋭",NotSquareSubset:"⊏̸",NotSquareSubsetEqual:"⋢",NotSquareSuperset:"⊐̸",NotSquareSupersetEqual:"⋣",NotSubset:"⊂⃒",NotSubsetEqual:"⊈",NotSucceeds:"⊁",NotSucceedsEqual:"⪰̸",NotSucceedsSlantEqual:"⋡",NotSucceedsTilde:"≿̸",NotSuperset:"⊃⃒",NotSupersetEqual:"⊉",NotTilde:"≁",NotTildeEqual:"≄",NotTildeFullEqual:"≇",NotTildeTilde:"≉",NotVerticalBar:"∤",npar:"∦",nparallel:"∦",nparsl:"⫽⃥",npart:"∂̸",npolint:"⨔",npr:"⊀",nprcue:"⋠",npre:"⪯̸",nprec:"⊀",npreceq:"⪯̸",nrarr:"↛",nrArr:"⇏",nrarrc:"⤳̸",nrarrw:"↝̸",nrightarrow:"↛",nRightarrow:"⇏",nrtri:"⋫",nrtrie:"⋭",nsc:"⊁",nsccue:"⋡",nsce:"⪰̸",nscr:"𝓃",Nscr:"𝒩",nshortmid:"∤",nshortparallel:"∦",nsim:"≁",nsime:"≄",nsimeq:"≄",nsmid:"∤",nspar:"∦",nsqsube:"⋢",nsqsupe:"⋣",nsub:"⊄",nsube:"⊈",nsubE:"⫅̸",nsubset:"⊂⃒",nsubseteq:"⊈",nsubseteqq:"⫅̸",nsucc:"⊁",nsucceq:"⪰̸",nsup:"⊅",nsupe:"⊉",nsupE:"⫆̸",nsupset:"⊃⃒",nsupseteq:"⊉",nsupseteqq:"⫆̸",ntgl:"≹",ntilde:"ñ",Ntilde:"Ñ",ntlg:"≸",ntriangleleft:"⋪",ntrianglelefteq:"⋬",ntriangleright:"⋫",ntrianglerighteq:"⋭",nu:"ν",Nu:"Ν",num:"#",numero:"№",numsp:" ",nvap:"≍⃒",nvdash:"⊬",nvDash:"⊭",nVdash:"⊮",nVDash:"⊯",nvge:"≥⃒",nvgt:">⃒",nvHarr:"⤄",nvinfin:"⧞",nvlArr:"⤂",nvle:"≤⃒",nvlt:"<⃒",nvltrie:"⊴⃒",nvrArr:"⤃",nvrtrie:"⊵⃒",nvsim:"∼⃒",nwarhk:"⤣",nwarr:"↖",nwArr:"⇖",nwarrow:"↖",nwnear:"⤧",oacute:"ó",Oacute:"Ó",oast:"⊛",ocir:"⊚",ocirc:"ô",Ocirc:"Ô",ocy:"о",Ocy:"О",odash:"⊝",odblac:"ő",Odblac:"Ő",odiv:"⨸",odot:"⊙",odsold:"⦼",oelig:"œ",OElig:"Œ",ofcir:"⦿",ofr:"𝔬",Ofr:"𝔒",ogon:"˛",ograve:"ò",Ograve:"Ò",ogt:"⧁",ohbar:"⦵",ohm:"Ω",oint:"∮",olarr:"↺",olcir:"⦾",olcross:"⦻",oline:"‾",olt:"⧀",omacr:"ō",Omacr:"Ō",omega:"ω",Omega:"Ω",omicron:"ο",Omicron:"Ο",omid:"⦶",ominus:"⊖",oopf:"𝕠",Oopf:"𝕆",opar:"⦷",OpenCurlyDoubleQuote:"“",OpenCurlyQuote:"‘",operp:"⦹",oplus:"⊕",or:"∨",Or:"⩔",orarr:"↻",ord:"⩝",order:"ℴ",orderof:"ℴ",ordf:"ª",ordm:"º",origof:"⊶",oror:"⩖",orslope:"⩗",orv:"⩛",oS:"Ⓢ",oscr:"ℴ",Oscr:"𝒪",oslash:"ø",Oslash:"Ø",osol:"⊘",otilde:"õ",Otilde:"Õ",otimes:"⊗",Otimes:"⨷",otimesas:"⨶",ouml:"ö",Ouml:"Ö",ovbar:"⌽",OverBar:"‾",OverBrace:"⏞",OverBracket:"⎴",OverParenthesis:"⏜",par:"∥",para:"¶",parallel:"∥",parsim:"⫳",parsl:"⫽",part:"∂",PartialD:"∂",pcy:"п",Pcy:"П",percnt:"%",period:".",permil:"‰",perp:"⊥",pertenk:"‱",pfr:"𝔭",Pfr:"𝔓",phi:"φ",Phi:"Φ",phiv:"ϕ",phmmat:"ℳ",phone:"☎",pi:"π",Pi:"Π",pitchfork:"⋔",piv:"ϖ",planck:"ℏ",planckh:"ℎ",plankv:"ℏ",plus:"+",plusacir:"⨣",plusb:"⊞",pluscir:"⨢",plusdo:"∔",plusdu:"⨥",pluse:"⩲",PlusMinus:"±",plusmn:"±",plussim:"⨦",plustwo:"⨧",pm:"±",Poincareplane:"ℌ",pointint:"⨕",popf:"𝕡",Popf:"ℙ",pound:"£",pr:"≺",Pr:"⪻",prap:"⪷",prcue:"≼",pre:"⪯",prE:"⪳",prec:"≺",precapprox:"⪷",preccurlyeq:"≼",Precedes:"≺",PrecedesEqual:"⪯",PrecedesSlantEqual:"≼",PrecedesTilde:"≾",preceq:"⪯",precnapprox:"⪹",precneqq:"⪵",precnsim:"⋨",precsim:"≾",prime:"′",Prime:"″",primes:"ℙ",prnap:"⪹",prnE:"⪵",prnsim:"⋨",prod:"∏",Product:"∏",profalar:"⌮",profline:"⌒",profsurf:"⌓",prop:"∝",Proportion:"∷",Proportional:"∝",propto:"∝",prsim:"≾",prurel:"⊰",pscr:"𝓅",Pscr:"𝒫",psi:"ψ",Psi:"Ψ",puncsp:" ",qfr:"𝔮",Qfr:"𝔔",qint:"⨌",qopf:"𝕢",Qopf:"ℚ",qprime:"⁗",qscr:"𝓆",Qscr:"𝒬",quaternions:"ℍ",quatint:"⨖",quest:"?",questeq:"≟",quot:'"',QUOT:'"',rAarr:"⇛",race:"∽̱",racute:"ŕ",Racute:"Ŕ",radic:"√",raemptyv:"⦳",rang:"⟩",Rang:"⟫",rangd:"⦒",range:"⦥",rangle:"⟩",raquo:"»",rarr:"→",rArr:"⇒",Rarr:"↠",rarrap:"⥵",rarrb:"⇥",rarrbfs:"⤠",rarrc:"⤳",rarrfs:"⤞",rarrhk:"↪",rarrlp:"↬",rarrpl:"⥅",rarrsim:"⥴",rarrtl:"↣",Rarrtl:"⤖",rarrw:"↝",ratail:"⤚",rAtail:"⤜",ratio:"∶",rationals:"ℚ",rbarr:"⤍",rBarr:"⤏",RBarr:"⤐",rbbrk:"❳",rbrace:"}",rbrack:"]",rbrke:"⦌",rbrksld:"⦎",rbrkslu:"⦐",rcaron:"ř",Rcaron:"Ř",rcedil:"ŗ",Rcedil:"Ŗ",rceil:"⌉",rcub:"}",rcy:"р",Rcy:"Р",rdca:"⤷",rdldhar:"⥩",rdquo:"”",rdquor:"”",rdsh:"↳",Re:"ℜ",real:"ℜ",realine:"ℛ",realpart:"ℜ",reals:"ℝ",rect:"▭",reg:"®",REG:"®",ReverseElement:"∋",ReverseEquilibrium:"⇋",ReverseUpEquilibrium:"⥯",rfisht:"⥽",rfloor:"⌋",rfr:"𝔯",Rfr:"ℜ",rHar:"⥤",rhard:"⇁",rharu:"⇀",rharul:"⥬",rho:"ρ",Rho:"Ρ",rhov:"ϱ",RightAngleBracket:"⟩",rightarrow:"→",Rightarrow:"⇒",RightArrow:"→",RightArrowBar:"⇥",RightArrowLeftArrow:"⇄",rightarrowtail:"↣",RightCeiling:"⌉",RightDoubleBracket:"⟧",RightDownTeeVector:"⥝",RightDownVector:"⇂",RightDownVectorBar:"⥕",RightFloor:"⌋",rightharpoondown:"⇁",rightharpoonup:"⇀",rightleftarrows:"⇄",rightleftharpoons:"⇌",rightrightarrows:"⇉",rightsquigarrow:"↝",RightTee:"⊢",RightTeeArrow:"↦",RightTeeVector:"⥛",rightthreetimes:"⋌",RightTriangle:"⊳",RightTriangleBar:"⧐",RightTriangleEqual:"⊵",RightUpDownVector:"⥏",RightUpTeeVector:"⥜",RightUpVector:"↾",RightUpVectorBar:"⥔",RightVector:"⇀",RightVectorBar:"⥓",ring:"˚",risingdotseq:"≓",rlarr:"⇄",rlhar:"⇌",rlm:"‏",rmoust:"⎱",rmoustache:"⎱",rnmid:"⫮",roang:"⟭",roarr:"⇾",robrk:"⟧",ropar:"⦆",ropf:"𝕣",Ropf:"ℝ",roplus:"⨮",rotimes:"⨵",RoundImplies:"⥰",rpar:")",rpargt:"⦔",rppolint:"⨒",rrarr:"⇉",Rrightarrow:"⇛",rsaquo:"›",rscr:"𝓇",Rscr:"ℛ",rsh:"↱",Rsh:"↱",rsqb:"]",rsquo:"’",rsquor:"’",rthree:"⋌",rtimes:"⋊",rtri:"▹",rtrie:"⊵",rtrif:"▸",rtriltri:"⧎",RuleDelayed:"⧴",ruluhar:"⥨",rx:"℞",sacute:"ś",Sacute:"Ś",sbquo:"‚",sc:"≻",Sc:"⪼",scap:"⪸",scaron:"š",Scaron:"Š",sccue:"≽",sce:"⪰",scE:"⪴",scedil:"ş",Scedil:"Ş",scirc:"ŝ",Scirc:"Ŝ",scnap:"⪺",scnE:"⪶",scnsim:"⋩",scpolint:"⨓",scsim:"≿",scy:"с",Scy:"С",sdot:"⋅",sdotb:"⊡",sdote:"⩦",searhk:"⤥",searr:"↘",seArr:"⇘",searrow:"↘",sect:"§",semi:";",seswar:"⤩",setminus:"∖",setmn:"∖",sext:"✶",sfr:"𝔰",Sfr:"𝔖",sfrown:"⌢",sharp:"♯",shchcy:"щ",SHCHcy:"Щ",shcy:"ш",SHcy:"Ш",ShortDownArrow:"↓",ShortLeftArrow:"←",shortmid:"∣",shortparallel:"∥",ShortRightArrow:"→",ShortUpArrow:"↑",shy:"­",sigma:"σ",Sigma:"Σ",sigmaf:"ς",sigmav:"ς",sim:"∼",simdot:"⩪",sime:"≃",simeq:"≃",simg:"⪞",simgE:"⪠",siml:"⪝",simlE:"⪟",simne:"≆",simplus:"⨤",simrarr:"⥲",slarr:"←",SmallCircle:"∘",smallsetminus:"∖",smashp:"⨳",smeparsl:"⧤",smid:"∣",smile:"⌣",smt:"⪪",smte:"⪬",smtes:"⪬︀",softcy:"ь",SOFTcy:"Ь",sol:"/",solb:"⧄",solbar:"⌿",sopf:"𝕤",Sopf:"𝕊",spades:"♠",spadesuit:"♠",spar:"∥",sqcap:"⊓",sqcaps:"⊓︀",sqcup:"⊔",sqcups:"⊔︀",Sqrt:"√",sqsub:"⊏",sqsube:"⊑",sqsubset:"⊏",sqsubseteq:"⊑",sqsup:"⊐",sqsupe:"⊒",sqsupset:"⊐",sqsupseteq:"⊒",squ:"□",square:"□",Square:"□",SquareIntersection:"⊓",SquareSubset:"⊏",SquareSubsetEqual:"⊑",SquareSuperset:"⊐",SquareSupersetEqual:"⊒",SquareUnion:"⊔",squarf:"▪",squf:"▪",srarr:"→",sscr:"𝓈",Sscr:"𝒮",ssetmn:"∖",ssmile:"⌣",sstarf:"⋆",star:"☆",Star:"⋆",starf:"★",straightepsilon:"ϵ",straightphi:"ϕ",strns:"¯",sub:"⊂",Sub:"⋐",subdot:"⪽",sube:"⊆",subE:"⫅",subedot:"⫃",submult:"⫁",subne:"⊊",subnE:"⫋",subplus:"⪿",subrarr:"⥹",subset:"⊂",Subset:"⋐",subseteq:"⊆",subseteqq:"⫅",SubsetEqual:"⊆",subsetneq:"⊊",subsetneqq:"⫋",subsim:"⫇",subsub:"⫕",subsup:"⫓",succ:"≻",succapprox:"⪸",succcurlyeq:"≽",Succeeds:"≻",SucceedsEqual:"⪰",SucceedsSlantEqual:"≽",SucceedsTilde:"≿",succeq:"⪰",succnapprox:"⪺",succneqq:"⪶",succnsim:"⋩",succsim:"≿",SuchThat:"∋",sum:"∑",Sum:"∑",sung:"♪",sup:"⊃",Sup:"⋑",sup1:"¹",sup2:"²",sup3:"³",supdot:"⪾",supdsub:"⫘",supe:"⊇",supE:"⫆",supedot:"⫄",Superset:"⊃",SupersetEqual:"⊇",suphsol:"⟉",suphsub:"⫗",suplarr:"⥻",supmult:"⫂",supne:"⊋",supnE:"⫌",supplus:"⫀",supset:"⊃",Supset:"⋑",supseteq:"⊇",supseteqq:"⫆",supsetneq:"⊋",supsetneqq:"⫌",supsim:"⫈",supsub:"⫔",supsup:"⫖",swarhk:"⤦",swarr:"↙",swArr:"⇙",swarrow:"↙",swnwar:"⤪",szlig:"ß",Tab:"\t",target:"⌖",tau:"τ",Tau:"Τ",tbrk:"⎴",tcaron:"ť",Tcaron:"Ť",tcedil:"ţ",Tcedil:"Ţ",tcy:"т",Tcy:"Т",tdot:"⃛",telrec:"⌕",tfr:"𝔱",Tfr:"𝔗",there4:"∴",therefore:"∴",Therefore:"∴",theta:"θ",Theta:"Θ",thetasym:"ϑ",thetav:"ϑ",thickapprox:"≈",thicksim:"∼",ThickSpace:"  ",thinsp:" ",ThinSpace:" ",thkap:"≈",thksim:"∼",thorn:"þ",THORN:"Þ",tilde:"˜",Tilde:"∼",TildeEqual:"≃",TildeFullEqual:"≅",TildeTilde:"≈",times:"×",timesb:"⊠",timesbar:"⨱",timesd:"⨰",tint:"∭",toea:"⤨",top:"⊤",topbot:"⌶",topcir:"⫱",topf:"𝕥",Topf:"𝕋",topfork:"⫚",tosa:"⤩",tprime:"‴",trade:"™",TRADE:"™",triangle:"▵",triangledown:"▿",triangleleft:"◃",trianglelefteq:"⊴",triangleq:"≜",triangleright:"▹",trianglerighteq:"⊵",tridot:"◬",trie:"≜",triminus:"⨺",TripleDot:"⃛",triplus:"⨹",trisb:"⧍",tritime:"⨻",trpezium:"⏢",tscr:"𝓉",Tscr:"𝒯",tscy:"ц",TScy:"Ц",tshcy:"ћ",TSHcy:"Ћ",tstrok:"ŧ",Tstrok:"Ŧ",twixt:"≬",twoheadleftarrow:"↞",twoheadrightarrow:"↠",uacute:"ú",Uacute:"Ú",uarr:"↑",uArr:"⇑",Uarr:"↟",Uarrocir:"⥉",ubrcy:"ў",Ubrcy:"Ў",ubreve:"ŭ",Ubreve:"Ŭ",ucirc:"û",Ucirc:"Û",ucy:"у",Ucy:"У",udarr:"⇅",udblac:"ű",Udblac:"Ű",udhar:"⥮",ufisht:"⥾",ufr:"𝔲",Ufr:"𝔘",ugrave:"ù",Ugrave:"Ù",uHar:"⥣",uharl:"↿",uharr:"↾",uhblk:"▀",ulcorn:"⌜",ulcorner:"⌜",ulcrop:"⌏",ultri:"◸",umacr:"ū",Umacr:"Ū",uml:"¨",UnderBar:"_",UnderBrace:"⏟",UnderBracket:"⎵",UnderParenthesis:"⏝",Union:"⋃",UnionPlus:"⊎",uogon:"ų",Uogon:"Ų",uopf:"𝕦",Uopf:"𝕌",uparrow:"↑",Uparrow:"⇑",UpArrow:"↑",UpArrowBar:"⤒",UpArrowDownArrow:"⇅",updownarrow:"↕",Updownarrow:"⇕",UpDownArrow:"↕",UpEquilibrium:"⥮",upharpoonleft:"↿",upharpoonright:"↾",uplus:"⊎",UpperLeftArrow:"↖",UpperRightArrow:"↗",upsi:"υ",Upsi:"ϒ",upsih:"ϒ",upsilon:"υ",Upsilon:"Υ",UpTee:"⊥",UpTeeArrow:"↥",upuparrows:"⇈",urcorn:"⌝",urcorner:"⌝",urcrop:"⌎",uring:"ů",Uring:"Ů",urtri:"◹",uscr:"𝓊",Uscr:"𝒰",utdot:"⋰",utilde:"ũ",Utilde:"Ũ",utri:"▵",utrif:"▴",uuarr:"⇈",uuml:"ü",Uuml:"Ü",uwangle:"⦧",vangrt:"⦜",varepsilon:"ϵ",varkappa:"ϰ",varnothing:"∅",varphi:"ϕ",varpi:"ϖ",varpropto:"∝",varr:"↕",vArr:"⇕",varrho:"ϱ",varsigma:"ς",varsubsetneq:"⊊︀",varsubsetneqq:"⫋︀",varsupsetneq:"⊋︀",varsupsetneqq:"⫌︀",vartheta:"ϑ",vartriangleleft:"⊲",vartriangleright:"⊳",vBar:"⫨",Vbar:"⫫",vBarv:"⫩",vcy:"в",Vcy:"В",vdash:"⊢",vDash:"⊨",Vdash:"⊩",VDash:"⊫",Vdashl:"⫦",vee:"∨",Vee:"⋁",veebar:"⊻",veeeq:"≚",vellip:"⋮",verbar:"|",Verbar:"‖",vert:"|",Vert:"‖",VerticalBar:"∣",VerticalLine:"|",VerticalSeparator:"❘",VerticalTilde:"≀",VeryThinSpace:" ",vfr:"𝔳",Vfr:"𝔙",vltri:"⊲",vnsub:"⊂⃒",vnsup:"⊃⃒",vopf:"𝕧",Vopf:"𝕍",vprop:"∝",vrtri:"⊳",vscr:"𝓋",Vscr:"𝒱",vsubne:"⊊︀",vsubnE:"⫋︀",vsupne:"⊋︀",vsupnE:"⫌︀",Vvdash:"⊪",vzigzag:"⦚",wcirc:"ŵ",Wcirc:"Ŵ",wedbar:"⩟",wedge:"∧",Wedge:"⋀",wedgeq:"≙",weierp:"℘",wfr:"𝔴",Wfr:"𝔚",wopf:"𝕨",Wopf:"𝕎",wp:"℘",wr:"≀",wreath:"≀",wscr:"𝓌",Wscr:"𝒲",xcap:"⋂",xcirc:"◯",xcup:"⋃",xdtri:"▽",xfr:"𝔵",Xfr:"𝔛",xharr:"⟷",xhArr:"⟺",xi:"ξ",Xi:"Ξ",xlarr:"⟵",xlArr:"⟸",xmap:"⟼",xnis:"⋻",xodot:"⨀",xopf:"𝕩",Xopf:"𝕏",xoplus:"⨁",xotime:"⨂",xrarr:"⟶",xrArr:"⟹",xscr:"𝓍",Xscr:"𝒳",xsqcup:"⨆",xuplus:"⨄",xutri:"△",xvee:"⋁",xwedge:"⋀",yacute:"ý",Yacute:"Ý",yacy:"я",YAcy:"Я",ycirc:"ŷ",Ycirc:"Ŷ",ycy:"ы",Ycy:"Ы",yen:"¥",yfr:"𝔶",Yfr:"𝔜",yicy:"ї",YIcy:"Ї",yopf:"𝕪",Yopf:"𝕐",yscr:"𝓎",Yscr:"𝒴",yucy:"ю",YUcy:"Ю",yuml:"ÿ",Yuml:"Ÿ",zacute:"ź",Zacute:"Ź",zcaron:"ž",Zcaron:"Ž",zcy:"з",Zcy:"З",zdot:"ż",Zdot:"Ż",zeetrf:"ℨ",ZeroWidthSpace:"​",zeta:"ζ",Zeta:"Ζ",zfr:"𝔷",Zfr:"ℨ",zhcy:"ж",ZHcy:"Ж",zigrarr:"⇝",zopf:"𝕫",Zopf:"ℤ",zscr:"𝓏",Zscr:"𝒵",zwj:"‍",zwnj:"‌"},q={aacute:"á",Aacute:"Á",acirc:"â",Acirc:"Â",acute:"´",aelig:"æ",AElig:"Æ",agrave:"à",Agrave:"À",amp:"&",AMP:"&",aring:"å",Aring:"Å",atilde:"ã",Atilde:"Ã",auml:"ä",Auml:"Ä",brvbar:"¦",ccedil:"ç",Ccedil:"Ç",cedil:"¸",cent:"¢",copy:"©",COPY:"©",curren:"¤",deg:"°",divide:"÷",eacute:"é",Eacute:"É",ecirc:"ê",Ecirc:"Ê",egrave:"è",Egrave:"È",eth:"ð",ETH:"Ð",euml:"ë",Euml:"Ë",frac12:"½",frac14:"¼",frac34:"¾",gt:">",GT:">",iacute:"í",Iacute:"Í",icirc:"î",Icirc:"Î",iexcl:"¡",igrave:"ì",Igrave:"Ì",iquest:"¿",iuml:"ï",Iuml:"Ï",laquo:"«",lt:"<",LT:"<",macr:"¯",micro:"µ",middot:"·",nbsp:" ",not:"¬",ntilde:"ñ",Ntilde:"Ñ",oacute:"ó",Oacute:"Ó",ocirc:"ô",Ocirc:"Ô",ograve:"ò",Ograve:"Ò",ordf:"ª",ordm:"º",oslash:"ø",Oslash:"Ø",otilde:"õ",Otilde:"Õ",ouml:"ö",Ouml:"Ö",para:"¶",plusmn:"±",pound:"£",quot:'"',QUOT:'"',raquo:"»",reg:"®",REG:"®",sect:"§",shy:"­",sup1:"¹",sup2:"²",sup3:"³",szlig:"ß",thorn:"þ",THORN:"Þ",times:"×",uacute:"ú",Uacute:"Ú",ucirc:"û",Ucirc:"Û",ugrave:"ù",Ugrave:"Ù",uml:"¨",uuml:"ü",Uuml:"Ü",yacute:"ý",Yacute:"Ý",yen:"¥",yuml:"ÿ"},m={0:"�",128:"€",130:"‚",131:"ƒ",132:"„",133:"…",134:"†",135:"‡",136:"ˆ",137:"‰",138:"Š",139:"‹",140:"Œ",142:"Ž",145:"‘",146:"’",147:"“",148:"”",149:"•",150:"–",151:"—",152:"˜",153:"™",154:"š",155:"›",156:"œ",158:"ž",159:"Ÿ"},f=[1,2,3,4,5,6,7,8,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,64976,64977,64978,64979,64980,64981,64982,64983,64984,64985,64986,64987,64988,64989,64990,64991,64992,64993,64994,64995,64996,64997,64998,64999,65e3,65001,65002,65003,65004,65005,65006,65007,65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111],b=String.fromCharCode,v={}.hasOwnProperty,w=function(r,e){return v.call(r,e)},D=function(r,e){if(!r)return e;var a,t={};for(a in e)t[a]=w(r,a)?r[a]:e[a];return t},y=function(r,e){var a="";return 55296<=r&&r<=57343||1114111<r?(e&&x("character reference outside the permissible Unicode range"),"�"):w(m,r)?(e&&x("disallowed character reference"),m[r]):(e&&function(r,e){for(var a=-1,t=r.length;++a<t;)if(r[a]==e)return!0;return!1}(f,r)&&x("disallowed character reference"),65535<r&&(a+=b((r-=65536)>>>10&1023|55296),r=56320|1023&r),a+=b(r))},A=function(r){return"&#x"+r.toString(16).toUpperCase()+";"},E=function(r){return"&#"+r+";"},x=function(r){throw Error("Parse error: "+r)},k=function(r,e){(e=D(e,k.options)).strict&&g.test(r)&&x("forbidden code point");var a=e.encodeEverything,t=e.useNamedReferences,o=e.allowUnsafeSymbols,s=e.decimal?E:A,u=function(r){return s(r.charCodeAt(0))};return a?(r=r.replace(l,function(r){return t&&w(p,r)?"&"+p[r]+";":u(r)}),t&&(r=r.replace(/&gt;\u20D2/g,"&nvgt;").replace(/&lt;\u20D2/g,"&nvlt;").replace(/&#x66;&#x6A;/g,"&fjlig;")),t&&(r=r.replace(n,function(r){return"&"+p[r]+";"}))):t?(o||(r=r.replace(d,function(r){return"&"+p[r]+";"})),r=(r=r.replace(/&gt;\u20D2/g,"&nvgt;").replace(/&lt;\u20D2/g,"&nvlt;")).replace(n,function(r){return"&"+p[r]+";"})):o||(r=r.replace(d,u)),r.replace(c,function(r){var e=r.charCodeAt(0),a=r.charCodeAt(1);return s(1024*(e-55296)+a-56320+65536)}).replace(i,u)};k.options={allowUnsafeSymbols:!1,encodeEverything:!1,strict:!1,useNamedReferences:!1,decimal:!1};var L=function(r,f){var b=(f=D(f,L.options)).strict;return b&&s.test(r)&&x("malformed character reference"),r.replace(u,function(r,e,a,t,o,s,u,c,l){var i,n,p,d,g,m;return e?h[g=e]:a?(g=a,(m=t)&&f.isAttributeValue?(b&&"="==m&&x("`&` did not start a character reference"),r):(b&&x("named character reference was not terminated by a semicolon"),q[g]+(m||""))):o?(p=o,n=s,b&&!n&&x("character reference was not terminated by a semicolon"),i=parseInt(p,10),y(i,b)):u?(d=u,n=c,b&&!n&&x("character reference was not terminated by a semicolon"),i=parseInt(d,16),y(i,b)):(b&&x("named character reference was not terminated by a semicolon"),r)})};L.options={isAttributeValue:!1,strict:!1};var S={version:"1.2.0",encode:k,decode:L,escape:function(r){return r.replace(d,function(r){return o[r]})},unescape:L};if("function"==typeof define&&"object"==typeof define.amd&&define.amd)define(function(){return S});else if(e&&!e.nodeType)if(a)a.exports=S;else for(var C in S)w(S,C)&&(e[C]=S[C]);else r.he=S}(this);

(function (markdownit, DOMPurify, he) {
    'use strict';

    console.log('🚀 QQ Mind Map Converter starting...');

    // 简化的模块系统
    const modules = {};
    
    function define(name, factory) { 
        try {
            modules[name] = factory();
            console.log('✅ Module loaded:', name);
        } catch (error) {
            console.error('❌ Error loading module:', name, error);
        }
    }
    
    function require(name) { 
        const module = modules[name];
        if (!module) {
            console.error('❌ Module not found:', name);
        }
        return module;
    }

    define('IndentManager', function() {
        /**
 * 标准化缩进管理器
 * 统一处理 Markdown 和 QQ 思维导图之间的缩进转换
 */
class IndentManager {
    constructor() {
        // 标准缩进配置
        this.config = {
            tabSize: 2,           // 修复：改为2个空格，更符合Markdown习惯
            useTabs: false,       // 修复：改为false，使用空格而不是tab
            maxIndentLevel: 10    // 最大缩进级别
        };
    }

    /**
     * 标准化缩进字符串
     * @param {string} text - 原始文本
     * @returns {string} 标准化后的文本
     */
    normalizeIndent(text) {
        const lines = text.split('\n');
        const normalizedLines = lines.map(line => {
            const indentMatch = line.match(/^(\s*)/);
            if (!indentMatch) return line;

            const indentText = indentMatch[1];
            const indentLevel = this.calculateIndentLevel(indentText);
            const normalizedIndent = this.createIndentString(indentLevel);
            
            return normalizedIndent + line.substring(indentMatch[1].length);
        });
        
        return normalizedLines.join('\n');
    }

    /**
     * 计算缩进级别
     * @param {string} indentText - 缩进字符串
     * @returns {number} 缩进级别 (0, 1, 2, ...)
     */
    calculateIndentLevel(indentText) {
        if (!indentText) return 0;
        
        // 统一转换为空格计算
        const spaceCount = indentText.replace(/\t/g, ' '.repeat(this.config.tabSize)).length;
        return Math.floor(spaceCount / this.config.tabSize);
    }

    /**
     * 创建缩进字符串
     * @param {number} level - 缩进级别
     * @returns {string} 缩进字符串
     */
    createIndentString(level) {
        if (level <= 0) return '';
        
        if (this.config.useTabs) {
            return '\t'.repeat(level);
        } else {
            return ' '.repeat(level * this.config.tabSize);
        }
    }

    /**
     * 从 Markdown 行解析缩进信息
     * @param {string} line - Markdown 行
     * @returns {Object} 缩进信息
     */
    parseMarkdownIndent(line) {
        const trimmedLine = line.trim();
        const indentMatch = line.match(/^(\s*)/);
        const indentText = indentMatch ? indentMatch[1] : '';
        
        // 改进列表判断：更精确地识别真正的列表项
        const isHeader = /^(#{1,6})\s+/.test(trimmedLine);
        
        // 判断是否为真正的列表项：
        // 1. 不是标题
        // 2. 以列表标记开头（- * + 或 数字.）
        // 3. 列表标记后必须有空格
        // 4. 排除包含特殊字符的标题行（如 "3. 探索 (Explore) ──"）
        // 5. 排除包含粗体语法的行
        const isList = this.isValidListLine(line, trimmedLine, isHeader);
        
        return {
            originalIndent: indentText,
            level: this.calculateIndentLevel(indentText),
            content: trimmedLine,
            isList: isList,
            isHeader: isHeader
        };
    }

    /**
     * 验证是否为有效的列表行
     * @param {string} line - 原始行
     * @param {string} trimmedLine - 去除首尾空格的行
     * @param {boolean} isHeader - 是否为标题
     * @returns {boolean} 是否为有效列表
     */
    isValidListLine(line, trimmedLine, isHeader) {
        // 如果是标题，不是列表
        if (isHeader) {
            return false;
        }

        // 基本列表匹配模式
        const basicListMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
        if (!basicListMatch) {
            return false;
        }

        const [, indent, marker, content] = basicListMatch;
        const trimmedContent = content.trim();

        // 排除整行都是粗体语法的情况（这些可能是误判的粗体文本）
        if (trimmedContent.match(/^[*_]+.*[*_]+$/)) {
            return false;
        }

        // 排除包含奇数个*字符且不以*开头的行
        if (trimmedContent.includes('*') && !trimmedContent.startsWith('*')) {
            const asteriskCount = (trimmedContent.match(/\*/g) || []).length;
            if (asteriskCount % 2 === 1) {
                // 奇数个*字符，可能是粗体语法的一部分
                return false;
            }
        }

        // 排除包含特殊分隔符的行
        if (trimmedContent.includes('──') || trimmedContent.includes('—') || trimmedContent.includes('–')) {
            return false;
        }

        // 验证列表标记后必须有空格
        const markerEndIndex = line.indexOf(marker) + marker.length;
        const afterMarker = line.substring(markerEndIndex);
        if (!afterMarker.startsWith(' ')) {
            return false;
        }

        return true;
    }

    /**
     * 从 QQ 节点获取缩进级别
     * @param {Object} node - QQ 节点
     * @param {number} baseLevel - 基础缩进级别
     * @returns {number} 缩进级别
     */
    getQQNodeIndentLevel(node, baseLevel = 0) {
        // QQ 节点的缩进级别由其层级决定
        return baseLevel;
    }

    /**
     * 验证缩进一致性
     * @param {string} originalText - 原始文本
     * @param {string} convertedText - 转换后文本
     * @returns {Object} 验证结果
     */
    validateIndentConsistency(originalText, convertedText) {
        const originalLines = originalText.split('\n');
        const convertedLines = convertedText.split('\n');
        
        const issues = [];
        
        for (let i = 0; i < Math.min(originalLines.length, convertedLines.length); i++) {
            const originalIndent = this.parseMarkdownIndent(originalLines[i]);
            const convertedIndent = this.parseMarkdownIndent(convertedLines[i]);
            
            if (originalIndent.level !== convertedIndent.level) {
                issues.push({
                    line: i + 1,
                    original: originalIndent.level,
                    converted: convertedIndent.level,
                    content: originalIndent.content.substring(0, 50)
                });
            }
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }

    /**
     * 修复缩进不一致
     * @param {string} text - 需要修复的文本
     * @param {Array} corrections - 修正信息数组
     * @returns {string} 修复后的文本
     */
    fixIndentInconsistencies(text, corrections) {
        const lines = text.split('\n');
        
        corrections.forEach(correction => {
            const lineIndex = correction.line - 1;
            if (lineIndex >= 0 && lineIndex < lines.length) {
                const line = lines[lineIndex];
                const indentInfo = this.parseMarkdownIndent(line);
                const correctIndent = this.createIndentString(correction.correctLevel);
                lines[lineIndex] = correctIndent + indentInfo.content;
            }
        });
        
        return lines.join('\n');
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndentManager;
} else if (typeof window !== 'undefined') {
    window.IndentManager = IndentManager;
} 
        return IndentManager;
    });

    define('LinePreserver', function() {
        /**
 * 行格式保持器
 * 专门处理 Markdown 转换过程中的空行和格式保持
 */
class LinePreserver {
    constructor(indentManager = null) {
        this.config = {
            preserveEmptyLines: true,    // 是否保持空行
            normalizeSpacing: true,      // 是否标准化间距
            maxConsecutiveEmptyLines: 2  // 最大连续空行数
        };
        
        // 注入 IndentManager 依赖
        this.indentManager = indentManager;
        
        // 如果没有提供 IndentManager，尝试从全局获取
        if (!this.indentManager && typeof window !== 'undefined') {
            this.indentManager = window.IndentManager ? new window.IndentManager() : null;
        }
    }

    /**
     * 分析 Markdown 文档的行结构
     * @param {string} markdown - Markdown 文本
     * @returns {Array} 行结构数组
     */
    analyzeLineStructure(markdown) {
        const lines = markdown.split('\n');
        const structure = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            structure.push({
                index: i,
                original: line,
                trimmed: trimmedLine,
                isEmpty: trimmedLine === '',
                isHeader: /^(#{1,6})\s+/.test(trimmedLine),
                isList: /^\s*([-*+]|\d+\.)\s+/.test(trimmedLine),
                isSeparator: trimmedLine === '---',
                indentLevel: this.calculateIndentLevel(line),
                shouldPreserve: this.shouldPreserveLine(line, i, lines)
            });
        }
        
        return structure;
    }

    /**
     * 计算缩进级别 - 使用 IndentManager 的方法
     * @param {string} line - 行内容
     * @returns {number} 缩进级别
     */
    calculateIndentLevel(line) {
        const match = line.match(/^(\s*)/);
        if (!match) return 0;
        
        // 优先使用注入的 IndentManager
        if (this.indentManager && typeof this.indentManager.calculateIndentLevel === 'function') {
            return this.indentManager.calculateIndentLevel(match[1]);
        }
        
        // 降级到简单计算
        const indentText = match[1];
        return (indentText.match(/\t/g) || []).length;
    }

    /**
     * 判断是否应该保持该行
     * @param {string} line - 行内容
     * @param {number} index - 行索引
     * @param {Array} allLines - 所有行
     * @returns {boolean} 是否应该保持
     */
    shouldPreserveLine(line, index, allLines) {
        const trimmedLine = line.trim();
        
        // 空行处理
        if (trimmedLine === '') {
            // 检查前后行来决定是否保持空行
            const prevLine = index > 0 ? allLines[index - 1].trim() : '';
            const nextLine = index < allLines.length - 1 ? allLines[index + 1].trim() : '';
            
            // 标题后的空行应该保持
            if (prevLine.match(/^(#{1,6})\s+/)) {
                return true;
            }
            
            // 列表项之间的空行应该保持（但不要太多）
            if (prevLine.match(/^\s*[-*+]\s/) && nextLine.match(/^\s*[-*+]\s/)) {
                return true;
            }
            
            // 段落之间的空行应该保持
            if (prevLine !== '' && nextLine !== '' && 
                !prevLine.match(/^(#{1,6})\s+/) && 
                !nextLine.match(/^(#{1,6})\s+/)) {
                return true;
            }
            
            return false;
        }
        
        return true;
    }

    /**
     * 清理和标准化空行
     * @param {Array} structure - 行结构数组
     * @returns {Array} 清理后的行结构
     */
    normalizeEmptyLines(structure) {
        const result = [];
        let consecutiveEmptyCount = 0;
        
        for (const lineInfo of structure) {
            if (lineInfo.isEmpty) {
                consecutiveEmptyCount++;
                if (consecutiveEmptyCount <= this.config.maxConsecutiveEmptyLines) {
                    result.push(lineInfo);
                }
            } else {
                consecutiveEmptyCount = 0;
                result.push(lineInfo);
            }
        }
        
        return result;
    }

    /**
     * 从行结构重建 Markdown
     * @param {Array} structure - 行结构数组
     * @returns {string} 重建的 Markdown
     */
    rebuildMarkdown(structure) {
        return structure
            .filter(lineInfo => lineInfo.shouldPreserve)
            .map(lineInfo => lineInfo.original)
            .join('\n');
    }

    /**
     * 保持原始格式的转换
     * @param {string} originalMarkdown - 原始 Markdown
     * @param {string} convertedContent - 转换后的内容
     * @returns {string} 格式保持后的内容
     */
    preserveFormat(originalMarkdown, convertedContent) {
        // 分析原始文档结构
        const originalStructure = this.analyzeLineStructure(originalMarkdown);
        const convertedLines = convertedContent.split('\n');
        
        // 创建新的结构，保持原始的空行模式
        const newStructure = [];
        let convertedIndex = 0;
        
        for (const originalLine of originalStructure) {
            if (originalLine.isEmpty && originalLine.shouldPreserve) {
                // 保持原始空行
                newStructure.push({ original: '', shouldPreserve: true });
            } else if (!originalLine.isEmpty) {
                // 使用转换后的内容
                if (convertedIndex < convertedLines.length) {
                    newStructure.push({ 
                        original: convertedLines[convertedIndex], 
                        shouldPreserve: true 
                    });
                    convertedIndex++;
                }
            }
        }
        
        // 添加剩余的转换内容
        while (convertedIndex < convertedLines.length) {
            newStructure.push({ 
                original: convertedLines[convertedIndex], 
                shouldPreserve: true 
            });
            convertedIndex++;
        }
        
        return this.rebuildMarkdown(newStructure);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinePreserver;
} else if (typeof window !== 'undefined') {
    window.LinePreserver = LinePreserver;
} 
        return LinePreserver;
    });

    define('QQMindMapParser', function() {
        /**
 * QQ思维导图解析器
 * 负责解析QQ思维导图的HTML结构和数据格式
 */
class QQMindMapParser {
    constructor() {
        this.PRESENTATION_NODE_TITLE = 'Presentation';
    }

    /**
     * 从HTML中提取思维导图数据
     * @param {string} html - 包含思维导图数据的HTML
     * @returns {Array} 思维导图节点数组
     */
    extractMindMapData(html) {
        try {
            const mindMapElement = new DOMParser()
                .parseFromString(html, 'text/html')
                .querySelector('[data-mind-map]');
            
            if (!mindMapElement) {
                throw new Error('No data-mind-map attribute found in HTML');
            }
            
            return JSON.parse(mindMapElement.getAttribute('data-mind-map'));
        } catch (error) {
            throw new Error(`Failed to extract mind map data: ${error.message}`);
        }
    }

    /**
     * 解析节点结构
     * @param {Object} node - 思维导图节点
     * @returns {Object} 解析后的节点数据
     */
    parseNode(node) {
        const data = node.data || node;
        return {
            title: this.parseTitle(data.title),
            images: data.images || [],
            labels: data.labels || [],
            notes: data.notes,
            children: this.parseChildren(data.children),
            isHeader: this.isHeaderNode(data),
            isPresentation: data.title === this.PRESENTATION_NODE_TITLE,
            isDivider: data.title === '---'
        };
    }

    /**
     * 解析标题内容
     * @param {Object|string} title - 标题对象或字符串
     * @returns {Object} 解析后的标题数据
     */
    parseTitle(title) {
        if (typeof title === 'string') {
            return { type: 'text', content: title, styles: {} };
        }
        
        if (!title?.children) {
            return { type: 'text', content: '', styles: {} };
        }

        return {
            type: 'rich-text',
            content: this.extractTextContent(title),
            styles: this.extractTextStyles(title)
        };
    }

    /**
     * 提取文本内容
     * @param {Object} titleObject - 标题对象
     * @returns {string} 提取的文本内容
     */
    extractTextContent(titleObject) {
        return titleObject.children
            .flatMap(p => p.children?.map(t => t.text || '') || [])
            .join('');
    }

    /**
     * 提取文本样式
     * @param {Object} titleObject - 标题对象
     * @returns {Object} 样式对象
     */
    extractTextStyles(titleObject) {
        const styles = {};
        titleObject.children.forEach(p => {
            p.children?.forEach(textNode => {
                if (textNode.backgroundColor === '#FFF3A1') styles.highlight = true;
                if (textNode.strike) styles.strikethrough = true;
                if (textNode.fontStyle === 'italic') styles.italic = true;
                if (textNode.fontWeight === 700) styles.bold = true;
                if (textNode.underline) styles.underline = true;
            });
        });
        return styles;
    }

    /**
     * 解析子节点
     * @param {Object} children - 子节点对象
     * @returns {Array} 子节点数组
     */
    parseChildren(children) {
        if (!children?.attached) return [];
        return children.attached.map(child => this.parseNode(child));
    }

    /**
     * 判断是否为标题节点
     * @param {Object} data - 节点数据
     * @returns {boolean} 是否为标题节点
     */
    isHeaderNode(data) {
        return data.labels?.some(label => label.text === 'header');
    }

    /**
     * 生成纯文本表示
     * @param {Array} nodes - 节点数组
     * @param {number} depth - 当前深度
     * @returns {string} 纯文本内容
     */
    generatePlainText(nodes, depth = 0) {
        return nodes.map(node => {
            const parsedNode = this.parseNode(node);
            let text = '';

            if (parsedNode.isPresentation && parsedNode.notes?.content) {
                text = this.convertNoteHtmlToPlainText(parsedNode.notes.content) + '\n';
            } else if (!parsedNode.isDivider) {
                const titleText = typeof parsedNode.title === 'string' 
                    ? parsedNode.title 
                    : parsedNode.title.content;
                
                if (titleText.trim()) {
                    text = '\t'.repeat(depth) + titleText.trim() + '\n';
                }
            }

            if (parsedNode.children.length > 0) {
                text += this.generatePlainText(parsedNode.children, depth + 1);
            }

            return text;
        }).join('');
    }

    /**
     * 转换注释HTML为纯文本
     * @param {string} html - HTML内容
     * @returns {string} 纯文本内容
     */
    convertNoteHtmlToPlainText(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
        return doc.body.textContent || '';
    }
}

// 导出模块
if (typeof window !== 'undefined') {
    window.QQMindMapParser = QQMindMapParser;
} 
        return QQMindMapParser;
    });

    define('RichTextFormatter', function() {
        /**
 * 富文本格式处理器
 * 负责处理富文本格式的转换和样式应用
 */
class RichTextFormatter {
    constructor(qqParser = null) {
        this.styleMappings = {
            // QQ到Markdown的样式映射
            qqToMd: {
                backgroundColor: {
                    '#FFF3A1': '=={content}=='
                },
                strike: '~~{content}~~',
                italic: '*{content}*', // 修复：使用 italic 而不是 fontStyle
                fontWeight: {
                    'bold': '**{content}**',
                    700: '**{content}**'
                },
                underline: '<u>{content}</u>' // 修复：使用HTML标签而不是[[]]
            },
            // Markdown到QQ的样式映射
            mdToQq: {
                highlight: { backgroundColor: '#FFF3A1' },
                strikethrough: { strike: true },
                italic: { italic: true }, // 修复：使用 italic 而不是 fontStyle
                bold: { fontWeight: 700 }, // 修复：使用数值700
                wikilink: { underline: true, color: '#0052D9' },
                link: { underline: true, color: '#0052D9' },
                code: { fontFamily: 'monospace', backgroundColor: '#F0F0F0' }
            }
        };
        
        // 注入 QQMindMapParser 依赖
        this.qqParser = qqParser;
        
        // 如果没有提供 qqParser，尝试从全局获取
        if (!this.qqParser && typeof window !== 'undefined') {
            this.qqParser = window.QQMindMapParser ? new window.QQMindMapParser() : null;
        }
    }

    /**
     * 将QQ富文本对象转换为Markdown
     * @param {Object|string} titleObject - QQ标题对象或字符串
     * @returns {string} Markdown文本
     */
    convertQQToMarkdown(titleObject) {
        if (typeof titleObject === 'string') {
            return titleObject;
        }
        
        if (!titleObject?.children) {
            return '';
        }

        let result = titleObject.children.flatMap(p => 
            p.children?.map(textNode => this.applyQQStyles(textNode)) || []
        ).join('');
        
        // 后处理：修复多余的粗体标记
        result = this.fixDuplicateBoldMarkers(result);
        
        return result;
    }

    /**
     * 修复多余的粗体标记
     * 解决粗体文本中包含内联代码时产生多余星号的问题
     * @param {string} text - 原始文本
     * @returns {string} 修复后的文本
     */
    fixDuplicateBoldMarkers(text) {
        // 匹配连续的粗体节点，插入空格，确保Obsidian正常渲染
        // 例如：**数据格式：****`距离,归一化值`** -> **数据格式：** **`距离,归一化值`**
        return text.replace(/\*\*([^*]+)\*\*(?=\*\*)/g, '**$1** ');
    }

    /**
     * 应用QQ样式到文本
     * @param {Object} textNode - QQ文本节点
     * @returns {string} 带样式的文本
     */
    applyQQStyles(textNode) {
        let content = textNode.text || '';
        
        // 修复：使用正确的属性名称和标准Markdown格式
        if (textNode.backgroundColor === '#FFF3A1') {
            content = `==${content}==`; // 高亮格式
        }
        
        if (textNode.strike) {
            content = `~~${content}~~`; // 删除线
        }
        
        if (textNode.italic) { // 修复：使用 italic 而不是 fontStyle === 'italic'
            content = `*${content}*`; // 斜体
        }
        
        if (textNode.fontWeight === 'bold' || textNode.fontWeight === 700) { // 修复：支持字符串和数值
            content = `**${content}**`; // 粗体
        }
        
        if (textNode.underline) {
            content = `<u>${content}</u>`; // 修复：使用HTML标签而不是[[]]
        }
        
        // 添加对更多格式的支持
        if (textNode.fontFamily === 'monospace') {
            content = `\`${content}\``; // 内联代码
        }
        
        if (textNode.color && textNode.color !== '#000000') {
            // 对于有颜色的文本，使用HTML标签保持颜色信息
            content = `<span style="color: ${textNode.color}">${content}</span>`;
        }
        
        if (textNode.backgroundColor && textNode.backgroundColor !== '#FFF3A1') {
            // 对于有背景色的文本，使用HTML标签保持背景色信息
            content = `<span style="background-color: ${textNode.backgroundColor}">${content}</span>`;
        }
        
        return content;
    }

    /**
     * 从Markdown tokens构建QQ富文本节点
     * @param {Array} tokens - Markdown tokens
     * @returns {Array} QQ文本节点数组
     */
    buildQQNodesFromTokens(tokens) {
        const resultNodes = [];
        const styleStack = [];
        let currentStyle = {};

        // 递归处理嵌套的tokens
        const processTokens = (tokenList) => {
            for (const token of tokenList) {
                let content = token.content;
                
                // 处理样式开始标记
                switch (token.type) {
                    // 开启标签 - 修正：推入完整的当前样式状态
                    case 'strong_open': 
                        styleStack.push({...currentStyle});
                        currentStyle = {...currentStyle, fontWeight: 700};
                        continue;
                        
                    case 'em_open': 
                        styleStack.push({...currentStyle});
                        currentStyle = {...currentStyle, italic: true}; // 修复：使用 italic 而不是 fontStyle
                        continue;
                        
                    case 's_open': 
                        styleStack.push({...currentStyle});
                        currentStyle = {...currentStyle, strike: true};
                        continue;
                        
                    case 'highlight_open': 
                        styleStack.push({...currentStyle});
                        currentStyle = {...currentStyle, backgroundColor: '#FFF3A1'};
                        continue;
                        
                    case 'wikilink_open': 
                    case 'link_open': 
                        styleStack.push({...currentStyle});
                        currentStyle = {...currentStyle, underline: true, color: '#0052D9'};
                        continue;

                    // 关闭标签 - 修正：恢复到上一个样式状态
                    case 'strong_close':
                    case 'em_close':
                    case 's_close':
                    case 'highlight_close':
                    case 'wikilink_close':
                    case 'link_close': 
                        if (styleStack.length > 0) {
                            currentStyle = styleStack.pop();
                        } else {
                            currentStyle = {};
                        }
                        continue;

                    // 自包含的样式token
                    case 'strong':
                        // 处理粗体内容
                        if (token.children && token.children.length > 0) {
                            // 递归处理子tokens
                            const childStyle = {...currentStyle, fontWeight: 700};
                            const childNodes = this.buildQQNodesFromTokens(token.children);
                            childNodes.forEach(node => {
                                resultNodes.push({
                                    ...node,
                                    ...childStyle
                                });
                            });
                        } else {
                            resultNodes.push({
                                type: 'text',
                                text: content,
                                ...currentStyle,
                                fontWeight: 700
                            });
                        }
                        continue;

                    case 'em':
                        // 处理斜体内容
                        if (token.children && token.children.length > 0) {
                            const childStyle = {...currentStyle, italic: true};
                            const childNodes = this.buildQQNodesFromTokens(token.children);
                            childNodes.forEach(node => {
                                resultNodes.push({
                                    ...node,
                                    ...childStyle
                                });
                            });
                        } else {
                            resultNodes.push({
                                type: 'text',
                                text: content,
                                ...currentStyle,
                                italic: true
                            });
                        }
                        continue;

                    // 内联代码（自包含token）- 修复：保留backtick标记
                    case 'code_inline':
                        resultNodes.push({
                            type: 'text',
                            text: `\`${content}\``, // 保留backtick标记
                            ...currentStyle
                        });
                        continue;

                    // HTML标签处理 - 修正：改进HTML标签解析
                    case 'html_inline':
                        if (content.includes('<u>')) {
                            styleStack.push({...currentStyle});
                            currentStyle = {...currentStyle, underline: true};
                            continue;
                        } else if (content.includes('</u>')) {
                            if (styleStack.length > 0) {
                                currentStyle = styleStack.pop();
                            }
                            continue;
                        }
                        // 其他HTML内容作为文本处理
                        break;

                    // 文本内容
                    case 'text': 
                        if (content && content.trim()) {
                            resultNodes.push({
                                type: 'text',
                                text: content,
                                ...currentStyle
                            });
                        }
                        continue;
                        
                    // 链接（自包含）
                    case 'link':
                        const linkStyle = { underline: true, color: '#0052D9' };
                        resultNodes.push({
                            type: 'text',
                            text: content,
                            ...currentStyle,
                            ...linkStyle
                        });
                        continue;
                        
                    // 图片处理
                    case 'image':
                        content = content || 'image';
                        resultNodes.push({
                            type: 'text',
                            text: content,
                            ...currentStyle
                        });
                        continue;

                    // 其他类型的token，尝试处理子tokens
                    default:
                        if (token.children && token.children.length > 0) {
                            // 递归处理子tokens
                            const childNodes = this.buildQQNodesFromTokens(token.children);
                            childNodes.forEach(node => {
                                resultNodes.push({
                                    ...node,
                                    ...currentStyle
                                });
                            });
                        } else if (content && content.trim()) {
                            // 如果没有子tokens但有内容，作为普通文本处理
                            resultNodes.push({
                                type: 'text',
                                text: content,
                                ...currentStyle
                            });
                        }
                        continue;
                }
            }
        };

        processTokens(tokens);
        return resultNodes;
    }

    /**
     * 合并样式栈
     * @param {Array} styleStack - 样式栈
     * @returns {Object} 合并后的样式对象
     */
    mergeStyles(styleStack) {
        return styleStack.reduce((acc, style) => ({ ...acc, ...style }), {});
    }

    /**
     * 创建QQ富文本节点结构
     * @param {Array} textNodes - 文本节点数组
     * @returns {Object} QQ富文本节点
     */
    createQQRichTextNode(textNodes) {
        if (textNodes.length === 0) {
            textNodes.push({ type: 'text', text: '' });
        }

        return {
            children: [{ 
                type: 'paragraph', 
                children: textNodes 
            }],
            type: 'document',
        };
    }

    /**
     * 提取QQ文本内容 - 使用 QQMindMapParser 的方法
     * @param {Object} titleObject - QQ标题对象
     * @returns {string} 提取的文本内容
     */
    extractQQTextContent(titleObject) {
        // 优先使用注入的 QQMindMapParser
        if (this.qqParser && typeof this.qqParser.extractTextContent === 'function') {
            return this.qqParser.extractTextContent(titleObject);
        }
        
        // 降级到原始实现
        if (typeof titleObject === 'string') {
            return titleObject;
        }
        
        if (!titleObject?.children) {
            return '';
        }

        return titleObject.children
            .flatMap(p => p.children?.map(t => t.text || '') || [])
            .join('');
    }

    /**
     * 提取QQ文本样式 - 使用 QQMindMapParser 的方法
     * @param {Object} titleObject - QQ标题对象
     * @returns {Object} 样式对象
     */
    extractQQTextStyles(titleObject) {
        // 优先使用注入的 QQMindMapParser
        if (this.qqParser && typeof this.qqParser.extractTextStyles === 'function') {
            return this.qqParser.extractTextStyles(titleObject);
        }
        
        // 降级到原始实现
        const styles = {};
        
        if (!titleObject?.children) {
            return styles;
        }

        titleObject.children.forEach(p => {
            p.children?.forEach(textNode => {
                if (textNode.backgroundColor === '#FFF3A1') {
                    styles.highlight = true;
                }
                if (textNode.strike) {
                    styles.strikethrough = true;
                }
                if (textNode.italic) { // 修复：使用 italic 而不是 fontStyle
                    styles.italic = true;
                }
                if (textNode.fontWeight === 700) { // 修复：使用数值700
                    styles.bold = true;
                }
            });
        });
        
        return styles;
    }

    /**
     * 验证富文本格式
     * @param {Object} textNode - 文本节点
     * @returns {boolean} 是否有效
     */
    validateRichTextNode(textNode) {
        if (!textNode || typeof textNode !== 'object') {
            return false;
        }

        // 检查必需的属性
        if (typeof textNode.text !== 'string') {
            return false;
        }

        // 检查样式属性的有效性
        const validStyles = ['backgroundColor', 'strike', 'italic', 'fontWeight', 'underline', 'color', 'fontFamily'];
        const nodeKeys = Object.keys(textNode);
        
        for (const key of nodeKeys) {
            if (key !== 'text' && key !== 'type' && !validStyles.includes(key)) {
                return false;
            }
        }

        return true;
    }

    /**
     * 格式化Markdown文本为QQ富文本节点
     * @param {string} markdown - Markdown文本
     * @param {object} markdownIt - markdown-it实例
     * @returns {Object} QQ富文本节点
     */
    format(markdown, markdownIt) {
        const trimmedMarkdown = markdown.trim();
        if (trimmedMarkdown === '') {
            return {
                children: [{ type: 'paragraph', children: [{type: 'text', text: ''}] }],
                type: 'document',
            };
        }

        if (!markdownIt) {
            // 如果没有提供markdownIt，返回简单的文本节点
            return {
                children: [{ type: 'paragraph', children: [{type: 'text', text: trimmedMarkdown}] }],
                type: 'document',
            };
        }

        const tokens = markdownIt.parseInline(trimmedMarkdown, {});
        const qqTextNodes = this.buildQQNodesFromTokens(tokens);

        if (qqTextNodes.length === 0) {
            qqTextNodes.push({ type: 'text', text: trimmedMarkdown });
        }

        return this.createQQRichTextNode(qqTextNodes);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RichTextFormatter;
} else if (typeof window !== 'undefined') {
    window.RichTextFormatter = RichTextFormatter;
} 
        return RichTextFormatter;
    });

    define('CodeBlockHandler', function() {
        /**
 * 代码块处理器
 * 负责处理代码块的双向转换功能
 */

class CodeBlockHandler {
    /**
     * @param {object} richTextFormatter - 富文本格式化器
     * @param {object} he - he库实例
     */
    constructor(richTextFormatter, he) {
        if (!he || typeof he.encode !== 'function') {
            throw new Error("CodeBlockHandler requires the 'he' library, but it was not provided or is invalid.");
        }
        this.richTextFormatter = richTextFormatter;
        this.he = he;
        
        // 代码块标签定义
        this.CODE_BLOCK_LABEL = {
            id: 'qq-mind-map-code-block-label',
            text: 'code-block',
            backgroundColor: 'rgb(172, 226, 197)',
            color: '#000000'
        };
    }

    /**
     * 生成唯一节点ID
     * @returns {string} 唯一ID
     */
    generateNodeId() {
        return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 创建代码块节点 (从 md2qq.js 提取)
     * @param {Array} codeLines - 代码行数组
     * @param {string} language - 编程语言
     * @param {object} markdownIt - markdown-it实例
     * @returns {Object} 代码块节点
     */
    createCodeBlockNode(codeLines, language, markdownIt) {
        // 生成QQ思维导图期望的HTML格式
        const title = language ? `\`\`\`${language}` : '```';
        
        // 将代码行转换为QQ思维导图期望的HTML格式
        const htmlContent = this.convertCodeLinesToQQHtml(codeLines, language);
        
        return {
            id: this.generateNodeId(),
            title: this.richTextFormatter.format(title, markdownIt),
            labels: [this.CODE_BLOCK_LABEL],
            notes: { content: htmlContent },
            collapse: false,
            children: { attached: [] }
        };
    }

    /**
     * 将代码行转换为QQ思维导图期望的HTML格式 (从 md2qq.js 提取)
     * @param {Array} codeLines - 代码行数组
     * @param {string} language - 编程语言
     * @returns {string} QQ思维导图格式的HTML
     */
    convertCodeLinesToQQHtml(codeLines, language = '') {
        const paragraphs = [];
        let currentParagraphLines = [];

        const flushParagraph = () => {
            if (currentParagraphLines.length > 0) {
                const paragraphContent = currentParagraphLines.map(line => this.processCodeLine(line)).join('');
                paragraphs.push(`<p>${paragraphContent}</p>`);
                currentParagraphLines = [];
            }
        };

        // 处理代码行，正确处理空行
        for (let i = 0; i < codeLines.length; i++) {
            const line = codeLines[i];
            
            if (line.trim() === '') {
                // 空行：结束当前段落，添加空段落
                flushParagraph();
                paragraphs.push('<p><br></p>');
            } else {
                // 非空行：添加到当前段落
                currentParagraphLines.push(line);
            }
        }
        
        // 处理最后一个段落
        flushParagraph();

        // 添加语言标识到第一个段落
        if (paragraphs.length > 0) {
            const languagePrefix = language ? `\`\`\`${language}<br>` : '```<br>';
            paragraphs[0] = paragraphs[0].replace('<p>', `<p>${languagePrefix}`);
        } else {
            // 如果没有内容，创建默认段落
            const languagePrefix = language ? `\`\`\`${language}<br>` : '```<br>';
            paragraphs.push(`<p>${languagePrefix}</p>`);
        }
        
        // 添加结束标记
        paragraphs.push('<p>```</p>');

        return paragraphs.join('\n');
    }

    /**
     * 处理单行代码，包括缩进和特殊字符 (从 md2qq.js 提取)
     * @param {string} line - 原始代码行
     * @returns {string} 处理后的HTML
     */
    processCodeLine(line) {
        // 修复：先处理缩进，将制表符转换为空格
        let processedLine = line.replace(/\t/g, '    '); // 将制表符转换为4个空格
        
        // 使用he库进行HTML实体编码
        const escapedLine = this.he.encode(processedLine, {
            'useNamedReferences': false,
            'allowUnsafeSymbols': false,
            'decimal': false // 使用十六进制格式
        });

        // 将HTML实体转换为Unicode转义格式以匹配QQ思维导图期望
        let result = escapedLine.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
            return `\\u{${hex.toUpperCase()}}`;
        });

        // 处理特殊字符
        result = result.replace(/&lt;/g, '\\u{3C}');
        result = result.replace(/&gt;/g, '\\u{3E}');
        result = result.replace(/&amp;/g, '\\u{26}');
        result = result.replace(/&quot;/g, '\\u{22}');
        result = result.replace(/&#39;/g, '\\u{27}');

        // 修复：将双反斜杠转换为单反斜杠以匹配QQ思维导图期望
        result = result.replace(/\\\\u\{/g, '\\u{');
        
        // 修复：将Unicode转义转换为实际字符以匹配QQ思维导图期望
        result = result.replace(/\\u\{([0-9A-F]+)\}/g, (match, hex) => {
            return String.fromCodePoint(parseInt(hex, 16));
        });

        // 处理缩进：将前导空格转换为&nbsp;，使用双重转义
        result = result.replace(/^ +/g, (spaces) => '&amp;nbsp;'.repeat(spaces.length));

        // 处理换行符
        result = result.replace(/\n/g, '\\n');
        result = result.replace(/\r/g, '\\r');
        // 注意：制表符已经在前面转换为空格，这里不需要再处理

        // 添加换行标签
        return result + '<br>';
    }

    /**
     * 转换代码块节点 (从 qq2md.js 提取)
     * @param {Object} node - 代码块节点
     * @param {Object} richTextFormatter - 富文本格式化器
     * @returns {string} Markdown文本
     */
    convertCodeBlock(node, richTextFormatter) {
        const data = node.data || node;
        let markdown = '';

        // 获取代码块标题（语言标识）
        let titleText = '';
        if (richTextFormatter && typeof richTextFormatter.convertRichTextToMarkdown === 'function') {
            titleText = richTextFormatter.convertRichTextToMarkdown(data.title).trim();
        } else {
            // 降级处理：直接获取标题文本
            if (typeof data.title === 'string') {
                titleText = data.title;
            } else if (data.title && typeof data.title === 'object') {
                // 尝试从富文本对象中提取文本
                titleText = this.extractTextFromRichText(data.title);
            } else {
                titleText = '';
            }
        }
        
        // 处理语言标识 - 避免重复的代码块标记
        let language = '';
        if (titleText.startsWith('```')) {
            // 如果标题已经是代码块格式，提取语言
            language = titleText.replace(/^```/, '').trim();
        } else {
            // 否则使用标题作为语言
            language = titleText;
        }
        
        // 获取代码内容
        let codeContent = '';
        if (data.notes?.content) {
            codeContent = this.extractCodeFromNotes(data.notes.content);
        }

        // 确保代码内容不包含代码块标记
        codeContent = this.cleanCodeBlockMarkers(codeContent);

        // 修复：确保代码内容有正确的换行符
        if (codeContent && !codeContent.endsWith('\n')) {
            codeContent += '\n';
        }

        // 修复：确保代码内容开头没有多余的换行符
        codeContent = codeContent.replace(/^\n+/, '');

        // 生成Markdown代码块 - 避免嵌套
        if (language && language !== '```' && language !== '') {
            markdown += `\n\`\`\`${language}\n${codeContent}\`\`\`\n\n`;
        } else {
            markdown += `\n\`\`\`\n${codeContent}\`\`\`\n\n`;
        }

        return markdown;
    }

    /**
     * 从注释中提取代码内容 (从 qq2md.js 提取)
     * @param {string} htmlContent - HTML内容
     * @returns {string} 代码内容
     */
    extractCodeFromNotes(htmlContent) {
        // 修复：使用更简单直接的方法解析HTML内容
        
        // 1. 直接解析HTML内容，提取所有文本
        let codeContent = this.simpleHtmlToText(htmlContent);
        
        // 2. 清理代码块标记，但保留注释
        codeContent = this.cleanCodeBlockMarkers(codeContent);
        
        // 3. 修复：处理换行符，将<br>标签转换为换行符
        codeContent = codeContent.replace(/<br\s*\/?>/gi, '\n');
        
        // 4. 修复：处理制表符，将\t转换为空格
        codeContent = codeContent.replace(/\\t/g, '    '); // 将制表符转换为4个空格
        
        // 5. 修复：确保换行符正确保留
        // 将连续的换行符标准化为单个换行符
        codeContent = codeContent.replace(/\n{2,}/g, '\n');
        
        // 6. 如果内容为空，尝试其他方法
        if (!codeContent.trim()) {
            // 回退到原有的pre/code标签解析
            const preCodeMatch = htmlContent.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/);
            if (preCodeMatch) {
                codeContent = this.decodeHtmlEntities(preCodeMatch[1]);
                codeContent = this.cleanCodeBlockMarkers(codeContent);
                codeContent = codeContent.replace(/<br\s*\/?>/gi, '\n');
                codeContent = codeContent.replace(/\\t/g, '    ');
                codeContent = codeContent.replace(/\n{2,}/g, '\n');
                return codeContent;
            }
            
            // 尝试从code标签中提取
            const codeMatch = htmlContent.match(/<code>([\s\S]*?)<\/code>/);
            if (codeMatch) {
                codeContent = this.decodeHtmlEntities(codeMatch[1]);
                codeContent = this.cleanCodeBlockMarkers(codeContent);
                codeContent = codeContent.replace(/<br\s*\/?>/gi, '\n');
                codeContent = codeContent.replace(/\\t/g, '    ');
                codeContent = codeContent.replace(/\n{2,}/g, '\n');
                return codeContent;
            }
            
            // 尝试从pre标签中提取
            const preMatch = htmlContent.match(/<pre>([\s\S]*?)<\/pre>/);
            if (preMatch) {
                codeContent = this.decodeHtmlEntities(preMatch[1]);
                codeContent = this.cleanCodeBlockMarkers(codeContent);
                codeContent = codeContent.replace(/<br\s*\/?>/gi, '\n');
                codeContent = codeContent.replace(/\\t/g, '    ');
                codeContent = codeContent.replace(/\n{2,}/g, '\n');
                return codeContent;
            }
        }
        
        return codeContent;
    }

    /**
     * 清理代码内容中的代码块标记 (从 qq2md.js 提取)
     * @param {string} codeContent - 代码内容
     * @returns {string} 清理后的代码内容
     */
    cleanCodeBlockMarkers(codeContent) {
        // 修复：更精确地清理代码块标记
        // 移除开头的代码块标记（包括语言标识）
        codeContent = codeContent.replace(/^```\w*\n?/, '');
        // 移除结尾的代码块标记
        codeContent = codeContent.replace(/\n?```$/, '');
        // 移除中间的代码块标记
        codeContent = codeContent.replace(/\n```\w*\n/g, '\n');
        codeContent = codeContent.replace(/\n```\n/g, '\n');
        
        // 清理多余的换行符
        codeContent = codeContent.replace(/\n{3,}/g, '\n\n');
        
        return codeContent.trim();
    }

    /**
     * 解码HTML实体 (从 qq2md.js 提取)
     * @param {string} text - 包含HTML实体的文本
     * @returns {string} 解码后的文本
     */
    decodeHtmlEntities(text) {
        // 使用he库解码HTML实体
        return this.he.decode(text);
    }

    /**
     * 简单的HTML到文本转换 (从 qq2md.js 提取)
     * @param {string} html - HTML内容
     * @returns {string} 纯文本内容
     */
    simpleHtmlToText(html) {
        // 修复：统一使用字符串处理，避免DOM解析丢失换行符
        let text = html;
        
        // 移除HTML标签，但保留换行符
        text = text.replace(/<br\s*\/?>/gi, '\n');
        text = text.replace(/<\/?p[^>]*>/gi, '\n');
        text = text.replace(/<\/?div[^>]*>/gi, '\n');
        text = text.replace(/<\/?span[^>]*>/gi, '');
        text = text.replace(/<\/?code[^>]*>/gi, '');
        text = text.replace(/<\/?pre[^>]*>/gi, '');
        
        // 解码HTML实体
        text = this.decodeHtmlEntities(text);
        
        // 清理多余的换行符，但保持基本结构
        text = text.replace(/\n{3,}/g, '\n\n');
        
        return text;
    }

    /**
     * 从富文本对象中提取文本内容
     * @param {Object} richText - 富文本对象
     * @returns {string} 提取的文本
     */
    extractTextFromRichText(richText) {
        if (!richText) return '';
        
        if (typeof richText === 'string') {
            return richText;
        }
        
        if (richText.children && Array.isArray(richText.children)) {
            return richText.children.map(child => {
                if (typeof child === 'string') {
                    return child;
                } else if (child && typeof child === 'object') {
                    return child.text || this.extractTextFromRichText(child);
                }
                return '';
            }).join('');
        }
        
        return richText.text || '';
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeBlockHandler;
} else if (typeof window !== 'undefined') {
    window.CodeBlockHandler = CodeBlockHandler;
} 
        return CodeBlockHandler;
    });

    define('NodeManager', function() {
        /**
 * 节点管理器
 * 负责处理节点的创建、查找、附加等操作
 */

class NodeManager {
    /**
     * 生成唯一节点ID
     * @returns {string} 唯一ID
     */
    generateNodeId() {
        return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 创建节点 (从 md2qq.js 提取)
     * @param {Object} lineInfo - 行信息
     * @param {Object} richTextFormatter - 富文本格式化器
     * @param {Object} markdownIt - markdown-it实例
     * @param {Object} labels - 标签定义
     * @returns {Object} 节点数据
     */
    createNode(lineInfo, richTextFormatter, markdownIt, labels) {
        const nodeId = this.generateNodeId();
        
        if (lineInfo.type === 'header') {
            return {
                id: nodeId,
                title: richTextFormatter.format(lineInfo.content, markdownIt),
                labels: [labels.HEADER_LABEL],
                collapse: false,
                children: { attached: [] }
            };
        } else if (lineInfo.type === 'divider') {
            return {
                id: nodeId,
                title: '---',
                labels: [labels.DIVIDER_LABEL],
                collapse: false,
                children: { attached: [] }
            };
        } else if (lineInfo.type === 'image') {
            const altText = lineInfo.alt || 'image';
            const imageUrl = lineInfo.url;
            
            return { 
                id: nodeId,
                title: '', 
                images: [{ 
                    id: this.generateNodeId(), 
                    w: 80,
                    h: 80,
                    ow: 80,
                    oh: 80,
                    url: imageUrl
                }], 
                notes: { 
                    content: `<p>Image Alt: ${altText}</p>` 
                },
                collapse: false,
                children: { attached: [] } 
            };
        } else {
            // 修复：正确处理列表项内容
            let content = lineInfo.content;
            
            // 如果是列表项，保留列表标记以便QQtoMD转换时准确识别
            if (lineInfo.type === 'list' && lineInfo.listMarker) {
                // 在内容前添加列表标记
                content = `${lineInfo.listMarker} ${content}`;
            }
            
            return { 
                id: nodeId,
                title: richTextFormatter.format(content, markdownIt), 
                collapse: false,
                children: { attached: [] },
                originalIndent: lineInfo.indent
            };
        }
    }

    /**
     * 查找父节点 (从 md2qq.js 提取)
     * @param {Array} stack - 节点栈
     * @param {Object} lineInfo - 行信息
     * @returns {Object} 父节点信息
     */
    findParentNode(stack, lineInfo) {
        let parentIndex = -1;
        let parentNode = null;
        
        // 从栈顶开始查找合适的父节点
        for (let i = stack.length - 1; i >= 0; i--) {
            const stackItem = stack[i];
            
            // 如果当前是标题
            if (lineInfo.headerLevel > 0) {
                // 标题的父节点应该是层级更小的标题
                if (stackItem.headerLevel > 0 && lineInfo.headerLevel > stackItem.headerLevel) {
                    parentIndex = i;
                    parentNode = stackItem.node;
                    break;
                }
            } else {
                // 非标题内容的父节点判断
                // 1. 如果当前行缩进级别大于栈中节点的缩进级别，则可以作为子节点
                if (lineInfo.indent > stackItem.indentLevel) {
                    parentIndex = i;
                    parentNode = stackItem.node;
                    break;
                }
                // 2. 如果当前行缩进级别等于栈中节点的缩进级别，且栈中节点是标题，则可以作为标题的内容
                if (lineInfo.indent === stackItem.indentLevel && stackItem.headerLevel > 0) {
                    parentIndex = i;
                    parentNode = stackItem.node;
                    break;
                }
                // 3. 如果当前行缩进级别等于栈中节点的缩进级别，且都是列表项，则可以作为同级节点
                if (lineInfo.indent === stackItem.indentLevel && lineInfo.type === 'list' && stackItem.type === 'list') {
                    // 同级列表项，弹出当前父节点，寻找更上层的父节点
                    continue;
                }
                // 4. 如果当前行缩进级别等于栈中节点的缩进级别，且都是普通文本，则可以作为同级节点
                if (lineInfo.indent === stackItem.indentLevel && lineInfo.type === 'text' && stackItem.type === 'text') {
                    // 同级文本，弹出当前父节点，寻找更上层的父节点
                    continue;
                }
            }
        }
        
        return { parentIndex, parentNode };
    }

    /**
     * 附加节点 (从 md2qq.js 提取)
     * @param {Object} newNode - 新节点
     * @param {Object} parentNode - 父节点
     * @param {Array} forest - 根节点数组
     */
    attachNode(newNode, parentNode, forest) {
        if (parentNode) {
            if (!parentNode.children) parentNode.children = { attached: [] };
            if (!parentNode.children.attached) parentNode.children.attached = [];
            parentNode.children.attached.push(newNode);
        } else {
            forest.push({ type: 5, data: newNode });
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NodeManager;
} else if (typeof window !== 'undefined') {
    window.NodeManager = NodeManager;
} 
        return NodeManager;
    });

    define('HtmlUtils', function() {
        /**
 * HTML工具类
 * 负责处理HTML解码、文本转换等操作
 */

class HtmlUtils {
    /**
     * 解码HTML实体 (从 qq2md.js 提取)
     * @param {string} text - 包含HTML实体的文本
     * @returns {string} 解码后的文本
     */
    decodeHtmlEntities(text) {
        // 修复：改进HTML实体解码
        try {
            // 首先处理QQ思维导图特有的实体
            let decodedText = text
                .replace(/&nbsp;/g, ' ')  // 空格
                .replace(/&lt;/g, '<')    // 小于号
                .replace(/&gt;/g, '>')    // 大于号
                .replace(/&amp;/g, '&')   // 和号
                .replace(/&quot;/g, '"')  // 双引号
                .replace(/&#39;/g, "'");  // 单引号
            
            // 处理十进制HTML实体（包括中文字符）
            decodedText = decodedText.replace(/&#(\d+);/g, (match, dec) => {
                return String.fromCharCode(parseInt(dec, 10));
            });
            
            // 处理十六进制HTML实体
            decodedText = decodedText.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
                return String.fromCharCode(parseInt(hex, 16));
            });
            
            return decodedText;
        } catch (error) {
            // 回退到手动解码常见实体
            return text
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&nbsp;/g, ' ');
        }
    }

    /**
     * 简化的HTML到文本转换 (从 qq2md.js 提取)
     * @param {string} html - HTML内容
     * @returns {string} 纯文本内容
     */
    simpleHtmlToText(html) {
        if (!html) return '';
        
        let text = html;
        
        // 移除HTML标签，但保留内容
        text = text.replace(/<br\s*\/?>/gi, '\n');
        text = text.replace(/<\/?p[^>]*>/gi, '\n');
        text = text.replace(/<\/?div[^>]*>/gi, '\n');
        text = text.replace(/<\/?span[^>]*>/gi, '');
        text = text.replace(/<\/?code[^>]*>/gi, '');
        text = text.replace(/<\/?pre[^>]*>/gi, '');
        
        // 解码HTML实体
        text = this.decodeHtmlEntities(text);
        
        // 修复：更精确地处理空格和换行符，但保留原始格式
        // 将多个连续的换行符合并为两个换行符
        text = text.replace(/\n{3,}/g, '\n\n');
        
        // 修复：处理制表符，将\t转换为空格
        text = text.replace(/\\t/g, '    '); // 将制表符转换为4个空格
        
        return text;
    }

    /**
     * 转换注释HTML为纯文本 (从 qq2md.js 提取)
     * @param {string} html - HTML内容
     * @param {Object} qqParser - QQ解析器实例
     * @returns {string} 纯文本内容
     */
    convertNoteHtmlToPlainText(html, qqParser) {
        // 优先使用注入的 QQMindMapParser
        if (qqParser && typeof qqParser.convertNoteHtmlToPlainText === 'function') {
            return qqParser.convertNoteHtmlToPlainText(html);
        }
        
        // 降级到原始实现
        try {
            // 在Node.js环境中使用jsdom
            if (typeof window === 'undefined' || !window.DOMParser) {
                // 使用简化的HTML解析
                return this.simpleHtmlToText(html);
            }
            
            const doc = new DOMParser().parseFromString(html, 'text/html');
            doc.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
            let text = doc.body.textContent || '';
            
            // 修复：处理制表符，将\t转换为空格
            text = text.replace(/\\t/g, '    '); // 将制表符转换为4个空格
            
            return text;
        } catch (error) {
            console.log('DOMParser failed, using fallback:', error.message);
            let text = this.simpleHtmlToText(html);
            // 修复：处理制表符，将\t转换为空格
            text = text.replace(/\\t/g, '    '); // 将制表符转换为4个空格
            return text;
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HtmlUtils;
} else if (typeof window !== 'undefined') {
    window.HtmlUtils = HtmlUtils;
} 
        return HtmlUtils;
    });

    define('QQToMarkdownConverter', function() {
        /**
 * QQ思维导图转Markdown转换器
 * 负责将QQ思维导图数据转换为Markdown格式
 */

// 导入依赖 - 修复浏览器环境下的模块加载问题
let RichTextFormatter;
let IndentManager;
let LinePreserver;
let CodeBlockHandler;
let HtmlUtils;

// 在浏览器环境中，直接使用全局对象，不尝试require
if (typeof window !== 'undefined') {
    // 浏览器环境：使用全局对象
    RichTextFormatter = window.RichTextFormatter;
    IndentManager = window.IndentManager;
    LinePreserver = window.LinePreserver;
    CodeBlockHandler = window.CodeBlockHandler;
    HtmlUtils = window.HtmlUtils;
} else if (typeof require !== 'undefined') {
    // Node.js 环境：使用require
    try {
        RichTextFormatter = require('../formatters/richText.js');
        IndentManager = require('../utils/indentManager.js');
        LinePreserver = require('../utils/linePreserver.js');
        CodeBlockHandler = require('./shared/codeBlockHandler.js');
        HtmlUtils = require('./shared/htmlUtils.js');
    } catch (e) {
        console.warn('Node.js环境下模块加载失败:', e.message);
    }
}

class QQToMarkdownConverter {
    constructor(qqParser = null, DOMPurify = null) {
        this.PRESENTATION_NODE_TITLE = 'Presentation';
        // 延迟初始化依赖，避免模块未完全加载时出错
        this._initialized = false;
        
        // 注入依赖
        this.qqParser = qqParser;
        this.DOMPurify = DOMPurify;
        
        // 如果没有提供 qqParser，尝试从全局获取
        if (!this.qqParser && typeof window !== 'undefined') {
            this.qqParser = window.QQMindMapParser ? new window.QQMindMapParser() : null;
        }
        
        this._initDependencies();
    }

    /**
     * 初始化依赖
     */
    _initDependencies() {
        try {
            // 尝试从全局对象获取依赖
            if (typeof window !== 'undefined') {
                this.indentManager = new (window.IndentManager || IndentManager)();
                this.linePreserver = new (window.LinePreserver || LinePreserver)();
                this.richTextFormatter = new (window.RichTextFormatter || RichTextFormatter)();
                
                // 创建共享模块实例
                this.codeBlockHandler = new (window.CodeBlockHandler || CodeBlockHandler)(
                    this.richTextFormatter, 
                    window.he
                );
                this.htmlUtils = new (window.HtmlUtils || HtmlUtils)();
                
                this._initialized = true;
            } else {
                // Node.js 环境
                this.indentManager = new IndentManager();
                this.linePreserver = new LinePreserver();
                this.richTextFormatter = new RichTextFormatter();
                
                // 创建共享模块实例
                this.codeBlockHandler = new CodeBlockHandler(this.richTextFormatter, require('he'));
                this.htmlUtils = new HtmlUtils();
                
                this._initialized = true;
            }
        } catch (error) {
            console.warn('⚠️ 依赖初始化失败，将在首次使用时重试:', error.message);
            this._initialized = false;
        }
    }

    /**
     * 确保依赖已初始化
     */
    _ensureInitialized() {
        if (!this._initialized) {
            this._initDependencies();
            if (!this._initialized) {
                throw new Error('无法初始化QQToMarkdownConverter依赖');
            }
        }
    }

    /**
     * 转换思维导图节点为Markdown
     * @param {Array} nodes - 思维导图节点数组
     * @param {number} startHeaderLevel - 起始标题层级 (1-6)
     * @returns {string} Markdown文本
     */
    convert(nodes, originalMarkdown = null, startHeaderLevel = 1) {
        this._ensureInitialized(); // 确保依赖已初始化
        let markdown = '';
        
        for (const node of nodes) {
            const data = node.data || node;
            const isHeader = data.labels?.some(l => l.text === 'header');
            const isCodeBlock = data.labels?.some(l => l.text === 'code-block');
            const isDivider = data.labels?.some(l => l.text === 'divider') || data.title === '---';
            
            if (isHeader) {
                markdown += this.convertNodeAsHeader(node, startHeaderLevel - 1);
            } else if (isCodeBlock) {
                markdown += this.convertCodeBlock(node);
            } else if (isDivider) {
                markdown += this.convertDivider(node);
            } else {
                markdown += this.convertNode(node, 0, true);
            }
        }
        
        // 如果有原始Markdown，使用LinePreserver保持格式
        if (originalMarkdown) {
            return this.linePreserver.preserveFormat(originalMarkdown, markdown);
        }
        
        return markdown.replace(/\n{3,}/g, '\n\n').trim();
    }

    /**
     * 转换标题节点
     * @param {Object} node - 节点对象
     * @param {number} baseDepth - 基础深度
     * @returns {string} Markdown文本
     */
    convertNodeAsHeader(node, baseDepth) {
        this._ensureInitialized(); // 确保依赖已初始化
        const data = node.data || node;
        let markdown = '';

        // 处理演示文稿节点
        if (data.title === this.PRESENTATION_NODE_TITLE && data.notes?.content) {
            return `\n\n<!--\n${this.convertNoteHtmlToPlainText(data.notes.content)}\n-->\n\n`;
        }

        // 处理图片
        if (data.images) {
            markdown += data.images.map(img => {
                // 从notes中提取alt信息
                let altText = 'image';
                if (data.notes?.content) {
                    // 尝试多种格式匹配alt信息
                    const altPatterns = [
                        /<p>Image Alt:\s*(.*?)<\/p>/i,
                        /<p>Alt:\s*(.*?)<\/p>/i,
                        /<p>图片描述:\s*(.*?)<\/p>/i,
                        /<p>描述:\s*(.*?)<\/p>/i,
                        /alt:\s*(.*?)(?:\n|$)/i,
                        /图片描述:\s*(.*?)(?:\n|$)/i
                    ];
                    
                    for (const pattern of altPatterns) {
                        const match = data.notes.content.match(pattern);
                        if (match && match[1].trim()) {
                            altText = match[1].trim();
                            break;
                        }
                    }
                    
                    // 如果没有找到alt信息，尝试使用notes的纯文本内容作为alt
                    if (altText === 'image' && data.notes.content.trim()) {
                        const plainText = this.convertNoteHtmlToPlainText(data.notes.content).trim();
                        if (plainText && plainText !== 'image') {
                            altText = plainText;
                        }
                    }
                }
                
                // 生成Markdown图片格式
                return `![${altText}](${img.url})\n`;
            }).join('');
        }

        // 处理标题文本
        let titleText = this.convertRichTextToMarkdown(data.title).trim();
        if (titleText) {
            const headerLevel = Math.min(baseDepth + 1, 6); // 限制最大为H6
            markdown += `${'#'.repeat(headerLevel)} ${titleText}\n`;
        }

        // 处理子节点
        if (data.children?.attached) {
            for (const child of data.children.attached) {
                const childData = child.data || child;
                const isChildHeader = childData.labels?.some(l => l.text === 'header');
                const isChildCodeBlock = childData.labels?.some(l => l.text === 'code-block');
                const isChildDivider = childData.labels?.some(l => l.text === 'divider') || childData.title === '---';
                
                if (isChildHeader) {
                    markdown += this.convertNodeAsHeader(child, baseDepth + 1);
                } else if (isChildCodeBlock) {
                    markdown += this.convertCodeBlock(child);
                } else if (isChildDivider) {
                    markdown += this.convertDivider(child);
                } else {
                    markdown += this.convertNode(child, 0, false);
                }
            }
        }

        return markdown;
    }

    /**
     * 转换普通节点
     * @param {Object} node - 节点对象
     * @param {number} indent - 缩进级别
     * @param {boolean} isListItem - 是否为列表项
     * @returns {string} Markdown文本
     */
    convertNode(node, indent, isListItem) {
        this._ensureInitialized(); // 确保依赖已初始化
        const data = node.data || node;
        let markdown = '';

        // 处理演示文稿节点
        if (data.title === this.PRESENTATION_NODE_TITLE && data.notes?.content) {
            return `\n\n<!--\n${this.convertNoteHtmlToPlainText(data.notes.content)}\n-->\n\n`;
        }

        let titleText = this.convertRichTextToMarkdown(data.title).trim();
        // 使用标准化的缩进管理器
        const indentStr = this.indentManager.createIndentString(indent);

        // 处理图片
        if (data.images) {
            markdown += data.images.map(img => {
                // 从notes中提取alt信息
                let altText = 'image';
                if (data.notes?.content) {
                    // 尝试多种格式匹配alt信息
                    const altPatterns = [
                        /<p>Image Alt:\s*(.*?)<\/p>/i,
                        /<p>Alt:\s*(.*?)<\/p>/i,
                        /<p>图片描述:\s*(.*?)<\/p>/i,
                        /<p>描述:\s*(.*?)<\/p>/i,
                        /alt:\s*(.*?)(?:\n|$)/i,
                        /图片描述:\s*(.*?)(?:\n|$)/i
                    ];
                    
                    for (const pattern of altPatterns) {
                        const match = data.notes.content.match(pattern);
                        if (match && match[1].trim()) {
                            altText = match[1].trim();
                            break;
                        }
                    }
                    
                    // 如果没有找到alt信息，尝试使用notes的纯文本内容作为alt
                    if (altText === 'image' && data.notes.content.trim()) {
                        const plainText = this.convertNoteHtmlToPlainText(data.notes.content).trim();
                        if (plainText && plainText !== 'image') {
                            altText = plainText;
                        }
                    }
                }
                
                // 生成Markdown图片格式
                return `${indentStr}![${altText}](${img.url})\n`;
            }).join('');
        }

        // 处理文本内容
        if (titleText) {
            let prefix = '';
            let finalIndent = '';
            
            if (isListItem) {
                // 检查是否已经包含列表标记
                const listMatch = titleText.match(/^([-*+]|\d+\.)\s+(.+)$/);
                if (listMatch) {
                    // 已经包含列表标记，直接使用
                    prefix = `${listMatch[1]} `;
                    titleText = listMatch[2]; // 移除列表标记，只保留内容
                } else {
                    // 没有列表标记，添加默认的 '- '
                    prefix = '- ';
                }
                
                // 使用原始缩进信息来决定是否添加缩进
                const originalIndent = data.originalIndent || 0;
                if (originalIndent > 0) {
                    finalIndent = this.indentManager.createIndentString(originalIndent);
                }
            } else {
                finalIndent = indentStr;
            }
            markdown += `${finalIndent}${prefix}${titleText}\n`;
        }

        // 处理子节点
        if (data.children?.attached) {
            for (const child of data.children.attached) {
                const isChildHeader = (child.data || child).labels?.some(l => l.text === 'header');
                const isChildCodeBlock = (child.data || child).labels?.some(l => l.text === 'code-block');
                const isChildDivider = (child.data || child).labels?.some(l => l.text === 'divider') || (child.data || child).title === '---';
                
                if (isChildHeader) {
                    markdown += this.convertNodeAsHeader(child, 0);
                } else if (isChildCodeBlock) {
                    markdown += this.convertCodeBlock(child);
                } else if (isChildDivider) {
                    markdown += this.convertDivider(child);
                } else {
                    markdown += this.convertNode(child, indent + 1, true);
                }
            }
        }

        return markdown;
    }

    /**
     * 转换代码块节点 - 使用 CodeBlockHandler
     * @param {Object} node - 代码块节点
     * @returns {string} Markdown文本
     */
    convertCodeBlock(node) {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.codeBlockHandler.convertCodeBlock(node, this.richTextFormatter);
    }

    /**
     * 转换分割线节点
     * @param {Object} node - 分割线节点
     * @returns {string} Markdown文本
     */
    convertDivider(node) {
        this._ensureInitialized(); // 确保依赖已初始化
        return '\n\n---\n\n';
    }

    /**
     * 转换富文本为Markdown
     * @param {Object|string} titleObject - 标题对象或字符串
     * @returns {string} Markdown文本
     */
    convertRichTextToMarkdown(titleObject) {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.richTextFormatter.convertQQToMarkdown(titleObject);
    }

    /**
     * 转换注释HTML为纯文本 - 使用 HtmlUtils
     * @param {string} html - HTML内容
     * @returns {string} 纯文本内容
     */
    convertNoteHtmlToPlainText(html) {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.htmlUtils.convertNoteHtmlToPlainText(html, this.qqParser);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QQToMarkdownConverter;
} else if (typeof window !== 'undefined') {
    window.QQToMarkdownConverter = QQToMarkdownConverter;
} 
        return QQToMarkdownConverter;
    });

    define('MarkdownToQQConverter', function() {
        /**
 * Markdown转QQ转换器
 * 负责将Markdown格式转换为QQ思维导图数据
 */

// 导入依赖 - 修复浏览器环境下的模块加载问题
let RichTextFormatter;
let IndentManager;
let CodeBlockHandler;
let NodeManager;

// 在浏览器环境中，直接使用全局对象，不尝试require
if (typeof window !== 'undefined') {
    // 浏览器环境：使用全局对象
    RichTextFormatter = window.RichTextFormatter;
    IndentManager = window.IndentManager;
    CodeBlockHandler = window.CodeBlockHandler;
    NodeManager = window.NodeManager;
} else if (typeof require !== 'undefined') {
    // Node.js 环境：使用require
    try {
        RichTextFormatter = require('../formatters/richText.js');
        IndentManager = require('../utils/indentManager.js');
        CodeBlockHandler = require('./shared/codeBlockHandler.js');
        NodeManager = require('./shared/nodeManager.js');
    } catch (e) {
        console.warn('Node.js环境下模块加载失败:', e.message);
    }
}

class MarkdownToQQConverter {
    /**
     * @param {object} markdownIt - markdown-it 实例
     * @param {object} he - he 库实例
     */
    constructor(markdownIt, he) {
        if (!he || typeof he.encode !== 'function') {
            throw new Error("MarkdownToQQConverter requires the 'he' library, but it was not provided or is invalid.");
        }
        this.md = markdownIt;
        this.he = he;
        this.PRESENTATION_NODE_TITLE = 'Presentation';
        this.HEADER_LABEL = { 
            id: 'qq-mind-map-header-label', 
            text: 'header', 
            backgroundColor: '#ADCBFF', 
            color: '#000000e1' 
        };
        this.CODE_BLOCK_LABEL = {
            id: 'qq-mind-map-code-block-label',
            text: 'code-block',
            backgroundColor: 'rgb(172, 226, 197)',
            color: '#000000'
        };
        this.DIVIDER_LABEL = {
            id: 'qq-mind-map-divider-label',
            text: 'divider',
            backgroundColor: '#E0E0E0',
            color: '#666666'
        };
        
        // 延迟初始化依赖，避免模块未完全加载时出错
        this._initialized = false;
        this._initDependencies();
    }

    /**
     * 初始化依赖
     */
    _initDependencies() {
        try {
            // 尝试从全局对象获取依赖
            if (typeof window !== 'undefined' && typeof global === 'undefined') {
                // 真正的浏览器环境
                // 检查依赖是否可用
                if (typeof window.RichTextFormatter === 'undefined' || typeof window.IndentManager === 'undefined') {
                    console.warn('⚠️ 浏览器环境中依赖模块未加载，等待重试...');
                    this._initialized = false;
                    return;
                }
                
                this.richTextFormatter = new window.RichTextFormatter();
                this.indentManager = new window.IndentManager();
                
                // 初始化代码块处理器
                if (typeof window.CodeBlockHandler !== 'undefined') {
                    this.codeBlockHandler = new window.CodeBlockHandler(this.richTextFormatter, this.he);
                } else {
                    throw new Error('CodeBlockHandler 未加载，无法初始化 MarkdownToQQConverter');
                }
                
                // 初始化节点管理器
                if (typeof window.NodeManager !== 'undefined') {
                    this.nodeManager = new window.NodeManager();
                } else {
                    throw new Error('NodeManager 未加载，无法初始化 MarkdownToQQConverter');
                }
                
                this._initialized = true;
                console.log('✅ 浏览器环境依赖初始化成功');
            } else {
                // Node.js 环境 - 直接 require 模块
                const RichTextFormatter = require('../formatters/richText.js');
                const IndentManager = require('../utils/indentManager.js');
                this.richTextFormatter = new RichTextFormatter();
                this.indentManager = new IndentManager();
                
                // 初始化代码块处理器
                try {
                    const CodeBlockHandler = require('./shared/codeBlockHandler.js');
                    this.codeBlockHandler = new CodeBlockHandler(this.richTextFormatter, this.he);
                } catch (e) {
                    throw new Error(`CodeBlockHandler 加载失败: ${e.message}`);
                }
                
                // 初始化节点管理器
                try {
                    const NodeManager = require('./shared/nodeManager.js');
                    this.nodeManager = new NodeManager();
                } catch (e) {
                    throw new Error(`NodeManager 加载失败: ${e.message}`);
                }
                
                this._initialized = true;
                console.log('✅ Node.js 环境依赖初始化成功');
            }
        } catch (error) {
            console.warn('⚠️ 依赖初始化失败，将在首次使用时重试:', error.message);
            this._initialized = false;
        }
    }

    /**
     * 确保依赖已初始化
     */
    _ensureInitialized() {
        if (!this._initialized) {
            this._initDependencies();
            if (!this._initialized) {
                // 在浏览器环境中，如果依赖未加载，等待一段时间后重试
                if (typeof window !== 'undefined' && typeof global === 'undefined') {
                    console.log('🔄 等待依赖模块加载，将在 100ms 后重试...');
                    setTimeout(() => {
                        this._initDependencies();
                        if (!this._initialized) {
                            console.log('🔄 再次等待依赖模块加载，将在 200ms 后重试...');
                            setTimeout(() => {
                                this._initDependencies();
                                if (!this._initialized) {
                                    throw new Error('无法初始化MarkdownToQQConverter依赖，请检查模块是否正确加载');
                                }
                            }, 200);
                        }
                    }, 100);
                } else {
                    throw new Error('无法初始化MarkdownToQQConverter依赖');
                }
            }
        }
    }

    /**
     * 转换Markdown为思维导图数据
     * @param {string} markdown - Markdown文本
     * @returns {Array} 思维导图节点数组
     */
    convert(markdown) {
        this._ensureInitialized(); // 确保依赖已初始化
        const lines = markdown.replace(/\r/g, '').split('\n');
        const forest = [];
        const stack = []; // { node, indentLevel, isText, headerLevel }
        let inCommentBlock = false;
        let commentContent = [];
        let inCodeBlock = false;
        let codeBlockContent = [];
        let codeBlockLanguage = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // 处理代码块
            if (inCodeBlock) {
                if (line.trim() === '```') {
                    // 代码块结束
                    inCodeBlock = false;
                    
                    // 修复：代码块应该添加到最近的标题节点，而不是栈顶节点
                    let parentNode = null;
                    
                    // 从栈顶开始查找最近的标题节点
                    for (let i = stack.length - 1; i >= 0; i--) {
                        const stackItem = stack[i];
                        if (stackItem.headerLevel > 0) {
                            parentNode = stackItem.node;
                            break;
                        }
                    }
                    
                    // 如果没有找到标题节点，使用栈顶节点
                    if (!parentNode && stack.length > 0) {
                        parentNode = stack[stack.length - 1].node;
                    }
                    
                    if (parentNode) {
                        const codeNode = this.createCodeBlockNode(codeBlockContent, codeBlockLanguage);
                        parentNode.children.attached.push(codeNode);
                    } else {
                        // 如果没有父节点，作为顶级节点
                        forest.push({ type: 5, data: this.createCodeBlockNode(codeBlockContent, codeBlockLanguage) });
                    }
                    
                    codeBlockContent = [];
                    codeBlockLanguage = '';
                    continue;
                } else {
                    // 继续收集代码块内容
                    codeBlockContent.push(line);
                    continue;
                }
            }
            
            // 检查代码块开始
            const codeBlockMatch = line.match(/^```(\w+)?$/);
            if (codeBlockMatch) {
                inCodeBlock = true;
                codeBlockLanguage = codeBlockMatch[1] || '';
                continue;
            }
            
            // 处理注释块
            if (line.trim() === '<!--') {
                inCommentBlock = true;
                commentContent = [];
                continue;
            }
            
            if (inCommentBlock) {
                if (line.trim() === '-->') {
                    inCommentBlock = false;
                    // 创建演示文稿节点
                    const presentationNode = {
                        type: 5,
                        data: {
                            id: this.generateNodeId(),
                            title: this.PRESENTATION_NODE_TITLE,
                            notes: { content: commentContent.join('\n') },
                            collapse: false,
                            children: { attached: [] }
                        }
                    };
                    forest.push(presentationNode);
                    continue;
                } else {
                    commentContent.push(line);
                    continue;
                }
            }
            
            // 跳过空行
            if (line.trim() === '') {
                continue;
            }
            
            // 解析当前行
            const lineInfo = this.parseLine(line);
            
            // 查找父节点
            const parentInfo = this.findParentNode(stack, lineInfo);
            
            // 创建新节点
            const newNode = this.createNode(lineInfo);
            
            // 附加节点
            this.attachNode(newNode, parentInfo.parentNode, forest);
            
            // 更新栈 - 修复层级关系处理
            if (parentInfo.parentIndex >= 0) {
                // 移除父节点之后的所有节点，保持正确的层级结构
                stack.splice(parentInfo.parentIndex + 1);
            } else {
                // 如果没有找到父节点，清空栈（当前节点将成为顶级节点）
                stack.length = 0;
            }
            
            // 将新节点推入栈
            stack.push({ 
                node: newNode, 
                indentLevel: lineInfo.indent, 
                isText: lineInfo.isText, 
                headerLevel: lineInfo.headerLevel,
                type: lineInfo.type // 添加类型信息以便后续判断
            });
        }
        
        return forest;
    }

    /**
     * 解析单行Markdown
     * @param {string} line - 原始行
     * @returns {Object} 行信息
     */
    parseLine(line) {
        this._ensureInitialized(); // 确保依赖已初始化
        const trimmedLine = line.trim();
        
        // 计算缩进级别
        const indentMatch = line.match(/^(\s*)/);
        const indent = this.indentManager.calculateIndentLevel(indentMatch ? indentMatch[1] : '');
        
        // 检查是否为标题
        const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
            return {
                type: 'header',
                level: headerMatch[1].length,
                content: headerMatch[2],
                indent: indent,
                headerLevel: headerMatch[1].length,
                isText: false
            };
        }
        
        // 检查是否为分割线
        if (trimmedLine.match(/^[-*_]{3,}$/)) {
            return {
                type: 'divider',
                content: '---',
                indent: indent,
                headerLevel: 0,
                isText: false
            };
        }
        
        // 检查是否为图片
        const imageMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imageMatch) {
            return {
                type: 'image',
                alt: imageMatch[1],
                url: imageMatch[2],
                indent: indent,
                headerLevel: 0,
                isText: false
            };
        }
        
        // 修复：更精确的列表项识别
        // 1. 确保列表标记后必须有空格
        // 2. 排除包含粗体语法的情况
        // 3. 排除包含其他Markdown语法的行
        const listMatch = this.isValidListItem(line);
        if (listMatch) {
            // 修复：正确计算列表项的缩进级别
            // 列表项的缩进应该包括列表标记前的空格
            const listIndentText = listMatch.indent;
            const listIndent = this.indentManager.calculateIndentLevel(listIndentText);
            
            return {
                type: 'list',
                content: listMatch.content, // 这里已经是去除列表标记的内容
                indent: listIndent,
                headerLevel: 0,
                isText: true,
                // 新增：保留列表标记信息，用于QQtoMD转换时的准确识别
                listMarker: listMatch.marker,
                originalContent: line.trim() // 保留原始内容，包含列表标记
            };
        }
        
        // 普通文本
        return {
            type: 'text',
            content: trimmedLine,
            indent: indent,
            headerLevel: 0,
            isText: true
        };
    }

    /**
     * 验证是否为有效的列表项
     * @param {string} line - 原始行
     * @returns {Object|null} 列表信息或null
     */
    isValidListItem(line) {
        // 基本列表匹配模式
        const basicListMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
        if (!basicListMatch) {
            return null;
        }

        const [, indent, marker, content] = basicListMatch;
        const trimmedContent = content.trim();

        // 排除整行都是粗体语法的情况（这些可能是误判的粗体文本）
        if (trimmedContent.match(/^[*_]+.*[*_]+$/)) {
            return null;
        }

        // 排除包含奇数个*字符且不以*开头的行
        if (trimmedContent.includes('*') && !trimmedContent.startsWith('*')) {
            const asteriskCount = (trimmedContent.match(/\*/g) || []).length;
            if (asteriskCount % 2 === 1) {
                // 奇数个*字符，可能是粗体语法的一部分
                return null;
            }
        }

        // 排除包含特殊分隔符的行
        if (trimmedContent.includes('──') || trimmedContent.includes('—') || trimmedContent.includes('–')) {
            return null;
        }

        // 验证列表标记后必须有空格
        const markerEndIndex = line.indexOf(marker) + marker.length;
        const afterMarker = line.substring(markerEndIndex);
        if (!afterMarker.startsWith(' ')) {
            return null;
        }

        return {
            indent: indent,
            marker: marker,
            content: trimmedContent
        };
    }

    /**
     * 查找父节点
     * @param {Array} stack - 节点栈
     * @param {Object} lineInfo - 行信息
     * @returns {Object} 父节点信息
     */
    findParentNode(stack, lineInfo) {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.nodeManager.findParentNode(stack, lineInfo);
    }

    /**
     * 创建节点
     * @param {Object} lineInfo - 行信息
     * @returns {Object} 节点数据
     */
    createNode(lineInfo) {
        this._ensureInitialized(); // 确保依赖已初始化
        const labels = {
            HEADER_LABEL: this.HEADER_LABEL,
            DIVIDER_LABEL: this.DIVIDER_LABEL
        };
        return this.nodeManager.createNode(lineInfo, this.richTextFormatter, this.md, labels);
    }

    /**
     * 生成唯一节点ID
     * @returns {string} 唯一ID
     */
    generateNodeId() {
        return this.nodeManager.generateNodeId();
    }

    /**
     * 创建代码块节点
     * @param {Array} codeLines - 代码行数组
     * @param {string} language - 编程语言
     * @returns {Object} 代码块节点
     */
    createCodeBlockNode(codeLines, language) {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.codeBlockHandler.createCodeBlockNode(codeLines, language, this.md);
    }

    /**
     * 将代码行转换为QQ思维导图期望的HTML格式
     * @param {Array} codeLines - 代码行数组
     * @param {string} language - 编程语言
     * @returns {string} QQ思维导图格式的HTML
     */
    convertCodeLinesToQQHtml(codeLines, language = '') {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.codeBlockHandler.convertCodeLinesToQQHtml(codeLines, language);
    }

    /**
     * 创建段落
     * @param {Array} lines - 代码行数组
     * @returns {string} 段落HTML
     */
    createParagraph(lines) {
        this._ensureInitialized(); // 确保依赖已初始化
        const processedLines = lines.map(line => this.processCodeLine(line));
        return `<p>${processedLines.join('')}</p>`;
    }

    /**
     * 处理单行代码，包括缩进和特殊字符
     * @param {string} line - 原始代码行
     * @returns {string} 处理后的HTML
     */
    processCodeLine(line) {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.codeBlockHandler.processCodeLine(line);
    }

    /**
     * 附加节点
     * @param {Object} newNode - 新节点
     * @param {Object} parentNode - 父节点
     * @param {Array} forest - 根节点数组
     */
    attachNode(newNode, parentNode, forest) {
        this.nodeManager.attachNode(newNode, parentNode, forest);
    }

    /**
     * 创建富文本节点
     * @param {string} markdown - Markdown文本
     * @returns {Object} 富文本节点
     */
    createRichTextNode(markdown) {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.richTextFormatter.format(markdown, this.md);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownToQQConverter;
} else if (typeof window !== 'undefined') {
    window.MarkdownToQQConverter = MarkdownToQQConverter;
}
        return MarkdownToQQConverter;
    });

    define('NotificationSystem', function() {
        /**
 * 通知系统
 * 负责显示用户反馈和状态提示
 */
class NotificationSystem {
    constructor() {
        this.notificationId = 'converter-notification';
        this.defaultDuration = 3000;
        this.colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
    }

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 ('success', 'error', 'warning', 'info')
     * @param {number} duration - 显示时长（毫秒）
     */
    show(message, type = 'success', duration = this.defaultDuration) {
        // 移除现有通知
        this.removeExisting();

        // 创建通知元素
        const notification = this.createNotification(message, type);
        
        // 添加到页面
        document.body.appendChild(notification);

        // 动画显示
        this.animateIn(notification);

        // 自动隐藏
        setTimeout(() => {
            this.animateOut(notification);
        }, duration);
    }

    /**
     * 显示成功通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    success(message, duration = this.defaultDuration) {
        this.show(message, 'success', duration);
    }

    /**
     * 显示错误通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    error(message, duration = this.defaultDuration) {
        this.show(message, 'error', duration);
    }

    /**
     * 显示警告通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    warning(message, duration = this.defaultDuration) {
        this.show(message, 'warning', duration);
    }

    /**
     * 显示信息通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    info(message, duration = this.defaultDuration) {
        this.show(message, 'info', duration);
    }

    /**
     * 创建通知元素
     * @param {string} message - 消息内容
     * @param {string} type - 通知类型
     * @returns {Element} 通知元素
     */
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.id = this.notificationId;
        notification.textContent = message;
        notification.className = `notification notification-${type}`;
        
        return notification;
    }

    /**
     * 添加通知样式
     */
    addStyles() {
        const styles = `
            #converter-notification {
                position: fixed;
                top: -50px;
                left: 50%;
                transform: translateX(-50%);
                background-color: ${this.colors.success};
                color: white;
                padding: 12px 20px;
                border-radius: 5px;
                z-index: 10000;
                font-size: 14px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                transition: top 0.5s ease, opacity 0.5s ease;
                opacity: 0;
                max-width: 400px;
                word-wrap: break-word;
                text-align: center;
            }
            #converter-notification.notification-error {
                background-color: ${this.colors.error};
            }
            #converter-notification.notification-warning {
                background-color: ${this.colors.warning};
            }
            #converter-notification.notification-info {
                background-color: ${this.colors.info};
            }
            #converter-notification.notification-success {
                background-color: ${this.colors.success};
            }
        `;

        if (typeof GM_addStyle !== 'undefined') {
            GM_addStyle(styles);
        } else {
            const styleElement = document.createElement('style');
            styleElement.textContent = styles;
            document.head.appendChild(styleElement);
        }
    }

    /**
     * 动画显示通知
     * @param {Element} notification - 通知元素
     */
    animateIn(notification) {
        setTimeout(() => {
            notification.style.top = '20px';
            notification.style.opacity = '1';
        }, 100);
    }

    /**
     * 动画隐藏通知
     * @param {Element} notification - 通知元素
     */
    animateOut(notification) {
        notification.style.top = '-50px';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 500);
    }

    /**
     * 移除现有通知
     */
    removeExisting() {
        const existing = document.getElementById(this.notificationId);
        if (existing) {
            existing.remove();
        }
    }

    /**
     * 显示进度通知
     * @param {string} message - 消息内容
     * @returns {Function} 完成回调函数
     */
    showProgress(message) {
        this.show(message, 'info', 0); // 不自动隐藏
        return (finalMessage, type = 'success') => {
            this.show(finalMessage, type);
        };
    }

    /**
     * 显示确认对话框
     * @param {string} message - 消息内容
     * @param {Function} onConfirm - 确认回调
     * @param {Function} onCancel - 取消回调
     */
    confirm(message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        dialog.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 16px;">${message}</div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="confirm-yes" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">确认</button>
                <button id="confirm-no" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">取消</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const handleConfirm = () => {
            overlay.remove();
            if (onConfirm) onConfirm();
        };

        const handleCancel = () => {
            overlay.remove();
            if (onCancel) onCancel();
        };

        dialog.querySelector('#confirm-yes').addEventListener('click', handleConfirm);
        dialog.querySelector('#confirm-no').addEventListener('click', handleCancel);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) handleCancel();
        });
    }
}

// 导出模块
if (typeof window !== 'undefined') {
    window.NotificationSystem = NotificationSystem;
} 
        return NotificationSystem;
    });

    define('InterfaceManager', function() {
        /**
 * 用户界面管理器
 * 负责创建和管理转换工具的UI组件
 */
class InterfaceManager {
    constructor(converter) {
        this.converter = converter;
        this.container = null;
        this.config = {
            autoDetect: true
        };
        this.init();
    }

    /**
     * 初始化界面
     */
    init() {
        this.waitForUIAndInject();
    }

    /**
     * 等待UI加载并注入组件
     */
    waitForUIAndInject() {
        let attempts = 0;
        const maxAttempts = 10;
        
        const interval = setInterval(() => {
            attempts++;
            
            // 尝试多个可能的选择器
            const selectors = [
                '#editor-root > div > div > div.Footer_footer__DdscW',
                '.Footer_footer__DdscW',
                'footer',
                'body'
            ];
            
            let targetElement = null;
            for (const selector of selectors) {
                targetElement = document.querySelector(selector);
                if (targetElement) break;
            }
            
            if (targetElement) {
                clearInterval(interval);
                this.createUI(targetElement);
                this.addEventListeners();
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                this.createUI(document.body);
                this.addEventListeners();
            }
        }, 1000);
    }

    /**
     * 创建UI组件
     * @param {Element} parentElement - 父元素
     */
    createUI(parentElement) {
        this.container = document.createElement('div');
        this.container.id = 'converter-container';
        this.container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            gap: 10px;
            background: rgba(255, 255, 255, 0.95);
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid #e0e0e0;
        `;

        // 创建按钮
        const qqToMdBtn = document.createElement('button');
        qqToMdBtn.textContent = 'QQ to MD';
        qqToMdBtn.style.cssText = `
            background: #4CAF50;
                color: white;
            border: none;
            padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        `;
        qqToMdBtn.onclick = () => this.handleQQToMDConversion();

        const mdToQqBtn = document.createElement('button');
        mdToQqBtn.textContent = 'MD to QQ';
        mdToQqBtn.style.cssText = `
            background: #2196F3;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
                cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        `;
        mdToQqBtn.onclick = () => this.converter.convertMDToQQ();

        // 添加按钮到容器
        this.container.appendChild(qqToMdBtn);
        this.container.appendChild(mdToQqBtn);

        // 添加到页面
        parentElement.appendChild(this.container);
    }

    /**
     * 添加事件监听器
     */
    addEventListeners() {
        // 可以在这里添加更多事件监听器
    }

    /**
     * 处理QQ到MD转换，包含header level选择
     */
    async handleQQToMDConversion() {
        // 获取QQ思维导图数据
        const qqData = await this.converter.getQQMindMapData();
        if (!qqData || qqData.length === 0) {
            this.showNotification('未检测到QQ思维导图数据', 'error');
            return;
        }

        // 检查是否包含header节点
        const hasHeaders = this.checkForHeaderNodes(qqData);
        
        if (hasHeaders) {
            this.showHeaderLevelDialog(qqData);
        } else {
            // 没有header节点，直接转换
            this.converter.convertQQToMD();
        }
    }

    /**
     * 检查是否包含header节点
     * @param {Array} nodes - 节点数组
     * @returns {boolean} 是否包含header节点
     */
    checkForHeaderNodes(nodes) {
        for (const node of nodes) {
            const data = node.data || node;
            if (data.labels && data.labels.some(l => l.text === 'header')) {
                return true;
            }
            if (data.children && data.children.attached) {
                if (this.checkForHeaderNodes(data.children.attached)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 显示header level选择对话框
     * @param {Array} qqData - QQ思维导图数据
     */
    showHeaderLevelDialog(qqData) {
        // 创建模态对话框
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 90%;
        `;

        dialog.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #333;">选择起始标题层级</h3>
            <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
                检测到思维导图中包含标题节点。请选择起始的标题层级，这将影响转换后的Markdown结构。
            </p>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; color: #333;">
                    <input type="radio" name="headerLevel" value="1" checked> 
                    H1 (# 一级标题)
                </label>
                <label style="display: block; margin-bottom: 8px; color: #333;">
                    <input type="radio" name="headerLevel" value="2"> 
                    H2 (## 二级标题)
                </label>
                <label style="display: block; margin-bottom: 8px; color: #333;">
                    <input type="radio" name="headerLevel" value="3"> 
                    H3 (### 三级标题)
                </label>
                <label style="display: block; margin-bottom: 8px; color: #333;">
                    <input type="radio" name="headerLevel" value="4"> 
                    H4 (#### 四级标题)
                </label>
                <label style="display: block; margin-bottom: 8px; color: #333;">
                    <input type="radio" name="headerLevel" value="5"> 
                    H5 (##### 五级标题)
                </label>
                <label style="display: block; margin-bottom: 8px; color: #333;">
                    <input type="radio" name="headerLevel" value="6"> 
                    H6 (###### 六级标题)
                </label>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancelBtn" style="
                    padding: 8px 16px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                ">取消</button>
                <button id="confirmBtn" style="
                    padding: 8px 16px;
                    border: none;
                    background: #007bff;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                ">确认转换</button>
            </div>
        `;

        modal.appendChild(dialog);
        document.body.appendChild(modal);

        // 添加事件监听器
        const confirmBtn = dialog.querySelector('#confirmBtn');
        const cancelBtn = dialog.querySelector('#cancelBtn');

        confirmBtn.addEventListener('click', () => {
            const selectedLevel = parseInt(dialog.querySelector('input[name="headerLevel"]:checked').value);
            document.body.removeChild(modal);
            this.converter.convertQQToMDWithHeaderLevel(selectedLevel);
        });

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    /**
     * 显示通知
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 ('success', 'error', 'info')
     */
    showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 4px;
                color: white;
                font-size: 14px;
                z-index: 10001;
                ${type === 'error' ? 'background: #dc3545;' : 
                  type === 'success' ? 'background: #28a745;' : 
                  'background: #17a2b8;'}
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 3000);
        }

    /**
     * 设置加载状态
     * @param {boolean} isLoading - 是否正在加载
     */
    setLoadingState(isLoading) {
        // 可以在这里添加加载状态的UI更新
    }

    /**
     * 销毁UI组件
     */
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InterfaceManager;
} else if (typeof window !== 'undefined') {
    window.InterfaceManager = InterfaceManager;
} 
        return InterfaceManager;
    });

    // 等待所有模块加载完成后创建全局变量
    setTimeout(() => {
        if (modules.IndentManager) window.IndentManager = modules.IndentManager;
        if (modules.LinePreserver) window.LinePreserver = modules.LinePreserver;
        if (modules.QQMindMapParser) window.QQMindMapParser = modules.QQMindMapParser;
        if (modules.RichTextFormatter) window.RichTextFormatter = modules.RichTextFormatter;
        if (modules.CodeBlockHandler) window.CodeBlockHandler = modules.CodeBlockHandler;
        if (modules.NodeManager) window.NodeManager = modules.NodeManager;
        if (modules.HtmlUtils) window.HtmlUtils = modules.HtmlUtils;
        if (modules.QQToMarkdownConverter) window.QQToMarkdownConverter = modules.QQToMarkdownConverter;
        if (modules.MarkdownToQQConverter) window.MarkdownToQQConverter = modules.MarkdownToQQConverter;
        if (modules.NotificationSystem) window.NotificationSystem = modules.NotificationSystem;
        if (modules.InterfaceManager) window.InterfaceManager = modules.InterfaceManager;
        console.log('✅ 全局变量已创建');
    }, 100);



    // 主转换器类
    class MainConverter {
        constructor() {
            this.setupMarkdownIt();
            this.initializeComponents();
        }

        setupMarkdownIt() {
            if (typeof markdownit === 'undefined') {
                console.error('❌ markdown-it not available');
                return;
            }
            
            this.md = markdownit({
                html: true,
                linkify: true,
                breaks: false,  // 控制换行行为
                typographer: false  // 禁用排版转换
            })
            // 启用删除线支持
            .enable(['strikethrough'])
            // 确保强调和粗体格式正确解析
            .enable(['emphasis'])
            // 如果需要额外插件支持，可以添加
            // .use(markdownItUnderline)  // 下划线支持（需要额外插件）
            // .use(markdownItMark);      // 高亮支持（需要额外插件）
        }
        

        initializeComponents() {
            try {
                // 获取模块
                const NotificationSystem = modules.NotificationSystem;
                const QQMindMapParser = modules.QQMindMapParser;
                const QQToMarkdownConverter = modules.QQToMarkdownConverter;
                const MarkdownToQQConverter = modules.MarkdownToQQConverter;
                const InterfaceManager = modules.InterfaceManager;
                const IndentManager = modules.IndentManager;
                const LinePreserver = modules.LinePreserver;
                const RichTextFormatter = modules.RichTextFormatter;
                const CodeBlockHandler = modules.CodeBlockHandler;
                const NodeManager = modules.NodeManager;
                const HtmlUtils = modules.HtmlUtils;

                this.notifications = new NotificationSystem();
                this.notifications.addStyles();
                
                // 创建依赖实例
                this.qqParser = new QQMindMapParser();
                this.indentManager = new IndentManager();
                this.linePreserver = new LinePreserver(this.indentManager);
                this.richTextFormatter = new RichTextFormatter(this.qqParser);
                
                // 创建共享模块实例
                this.codeBlockHandler = new CodeBlockHandler(this.richTextFormatter, he);
                this.nodeManager = new NodeManager();
                this.htmlUtils = new HtmlUtils();
                
                // 创建转换器，传递共享模块依赖
                this.qqToMdConverter = new QQToMarkdownConverter(this.qqParser, DOMPurify);
                this.mdToQqConverter = new MarkdownToQQConverter(this.md, he);
                this.interfaceManager = new InterfaceManager(this);
            } catch (error) {
                console.error('❌ Error initializing components:', error);
            }
        }

        async convertQQToMD() {
            try {
                this.interfaceManager.setLoadingState(true);
                this.notifications.show('QQ to MD conversion started', 'info');

                const clipboardItems = await navigator.clipboard.read();
                for (const item of clipboardItems) {
                    if (item.types.includes('text/html')) {
                        const blob = await item.getType('text/html');
                        const html = await blob.text();
                        const mindMapData = this.qqParser.extractMindMapData(html);
                        const markdown = this.qqToMdConverter.convert(mindMapData);
                        GM_setClipboard(markdown);
                        this.notifications.success('QQ to MD conversion completed!');
                        return;
                    }
                }
                this.notifications.error('No QQ mind map data found in clipboard');
            } catch (err) {
                console.error('❌ QQ to MD conversion failed:', err);
                this.notifications.error('Conversion failed: ' + err.message);
            } finally {
                this.interfaceManager.setLoadingState(false);
            }
        }

        async getQQMindMapData() {
            try {
                const clipboardItems = await navigator.clipboard.read();
                for (const item of clipboardItems) {
                    if (item.types.includes('text/html')) {
                        const blob = await item.getType('text/html');
                        const html = await blob.text();
                        return this.qqParser.extractMindMapData(html);
                    }
                }
                return null;
            } catch (err) {
                console.error('❌ Failed to get QQ mind map data:', err);
                return null;
            }
        }

        async convertQQToMDWithHeaderLevel(startHeaderLevel = 1) {
            try {
                this.interfaceManager.setLoadingState(true);
                this.notifications.show(`QQ to MD conversion started (H${startHeaderLevel})`, 'info');

                const mindMapData = await this.getQQMindMapData();
                if (!mindMapData) {
                    this.notifications.error('No QQ mind map data found in clipboard');
                    return;
                }

                const markdown = this.qqToMdConverter.convert(mindMapData, null, startHeaderLevel);
                GM_setClipboard(markdown);
                this.notifications.success(`QQ to MD conversion completed! (Starting from H${startHeaderLevel})`);
            } catch (err) {
                console.error('❌ QQ to MD conversion with header level failed:', err);
                this.notifications.error('Conversion failed: ' + err.message);
            } finally {
                this.interfaceManager.setLoadingState(false);
            }
        }

        async convertMDToQQ() {
            try {
                this.interfaceManager.setLoadingState(true);
                this.notifications.show('MD to QQ conversion started', 'info');

                const markdown = await navigator.clipboard.readText();
                if (!markdown) {
                    this.notifications.error('Clipboard is empty or contains no text');
                    return;
                }

                const mindMapData = this.mdToQqConverter.convert(markdown);
                if (typeof DOMPurify === 'undefined') {
                    console.error('❌ DOMPurify not available');
                    this.notifications.error('DOMPurify library not loaded');
                    return;
                }
                
                // 确保数据结构符合QQ思维导图的richtext格式
                const sanitizedData = this.sanitizeMindMapData(mindMapData);
                const html = DOMPurify.sanitize('<div data-mind-map=\'' + JSON.stringify(sanitizedData) + '\'></div>');
                const plainText = this.qqParser.generatePlainText(sanitizedData);
                
                const htmlBlob = new Blob([html], { type: 'text/html' });
                const textBlob = new Blob([plainText], { type: 'text/plain' });
                
                await navigator.clipboard.write([
                    new ClipboardItem({ 
                        'text/html': htmlBlob, 
                        'text/plain': textBlob 
                    })
                ]);
                
                this.notifications.success('MD to QQ conversion completed!');
            } catch (err) {
                console.error('❌ MD to QQ conversion failed:', err);
                this.notifications.error('Conversion failed: ' + err.message);
            } finally {
                this.interfaceManager.setLoadingState(false);
            }
        }

        /**
         * 清理和验证思维导图数据，确保符合QQ思维导图的richtext格式
         * @param {Array} mindMapData - 原始思维导图数据
         * @returns {Array} 清理后的数据
         */
        sanitizeMindMapData(mindMapData) {
            const sanitizedData = [];
            
            for (const node of mindMapData) {
                if (node.type === 5 && node.data) {
                    // 确保每个节点都有必要的字段
                    const sanitizedNode = {
                        type: 5,
                        data: {
                            id: node.data.id || this.generateNodeId(),
                            title: node.data.title || '',
                            collapse: node.data.collapse !== undefined ? node.data.collapse : false,
                            children: {
                                attached: node.data.children?.attached || []
                            }
                        }
                    };
                    
                    // 添加可选的字段
                    if (node.data.labels) {
                        sanitizedNode.data.labels = node.data.labels;
                    }
                    if (node.data.notes) {
                        sanitizedNode.data.notes = node.data.notes;
                    }
                    if (node.data.images) {
                        sanitizedNode.data.images = node.data.images;
                    }
                    
                    sanitizedData.push(sanitizedNode);
                }
            }
            
            return sanitizedData;
        }

        /**
         * 生成唯一节点ID
         * @returns {string} 唯一ID
         */
        generateNodeId() {
            return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
    }

    // 主函数
    async function main() {
        try {
            // 检查核心依赖库是否加载成功
            if (typeof markdownit === 'undefined' || typeof DOMPurify === 'undefined' || typeof he === 'undefined') {
                const missing = [
                    (typeof markdownit === 'undefined' ? 'markdown-it' : null),
                    (typeof DOMPurify === 'undefined' ? 'DOMPurify' : null),
                    (typeof he === 'undefined' ? 'he' : null)
                ].filter(Boolean).join(', ');
                
                const errorMsg = `QQmindmap2Obsidian Error: A critical library (${missing}) failed to load. Please check your internet connection, browser console, and script manager's log for errors.`;
                console.error(errorMsg);
                alert(errorMsg);
                return;
            }
            
            // 等待页面加载
            if (document.readyState !== 'complete') {
                await new Promise((resolve) => {
                    window.addEventListener('load', resolve);
                });
            }
            
            // 等待页面初始化
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const converter = new MainConverter();

            // 创建全局对象
            window.QQMindMap2Obsidian = {
                converter,
                QQMindMapParser: modules.QQMindMapParser,
                QQToMarkdownConverter: modules.QQToMarkdownConverter,
                MarkdownToQQConverter: modules.MarkdownToQQConverter,
                NotificationSystem: modules.NotificationSystem,
                InterfaceManager: modules.InterfaceManager,
                CodeBlockHandler: modules.CodeBlockHandler,
                NodeManager: modules.NodeManager,
                HtmlUtils: modules.HtmlUtils,
                status: 'ready'
            };
            
        } catch (error) {
            console.error('❌ Error in main function:', error);
        }
    }

    // 启动主函数
    main();

})(window.markdownit, window.DOMPurify, window.he); 