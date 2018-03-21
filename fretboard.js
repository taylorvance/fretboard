//const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
var stringNotes = {1:'E', 2:'A', 3:'D', 4:'G', 5:'B', 6:'E'};
/*                     1      m2       2      m3       3       4       T       5      m6       6      m7       7 */
var degreeColors = ['#f00', '#07b', '#   ', '#990', '#ee0', '#0d0', '#099', '#00f', '#   ', '#   ', '#   ', '#f0c'];
var degreeColors = ['#f00', '#f60', '#f80', '#fc0', '#ee0', '#0d0', '#0ed', '#00f', '#64f', '#80f', '#c0f', '#f0f'];

var topLeft = {x:50, y:30};

var numFrets = 22;
var fretColor = '#bbb';
var fretDist = 50;
var fretWidth = 2.5;

var stringColor = '#bbb';
var stringDist = 25;
var stringWidth = 1.5;

var markerColor = '#ddd';

var noteRadius = 8;
var noteOffset = noteRadius * 1.3;


window.onload = function() {
	var canvas = document.getElementById('myCanvas');
	paper.setup(canvas);

	drawFretboard();
	drawButtons();

	clickKey(keyButtons[0]); // C
	ScaleButton.allScales[0].click(); // ionian

	paper.view.draw();
};


function drawFretboard() {
	// draw markers
	var coords = [[2.5, 2.5], [4.5, 2.5], [6.5, 2.5], [8.5, 2.5], [11.5, 1.5], [11.5, 3.5], [14.5, 2.5], [16.5, 2.5], [18.5, 2.5], [20.5, 2.5], [22.5, 2.5]];
	for (i in coords) {
		if(numFrets < coords[i][0]) break;
		var circle = new paper.Path.Circle(new paper.Point(topLeft.x + (coords[i][0] * fretDist), topLeft.y + (coords[i][1] * stringDist)), 6);
		circle.fillColor = markerColor;
	}

	// draw frets
	for (var i = 0; i <= numFrets; i++) {
		var path = new paper.Path();
		path.strokeColor = fretColor;

		var start = new paper.Point(topLeft.x + (i * fretDist), topLeft.y);
		path.moveTo(start);
		path.lineTo(start.add([0, (stringDist * 5)]));
		path.strokeWidth = fretWidth;
	}

	// draw strings
	for (var i = 0; i < 6; i++) {
		var path = new paper.Path();
		path.strokeColor = stringColor;

		var start = new paper.Point(topLeft.x, topLeft.y + (i * stringDist));
		path.moveTo(start);
		path.lineTo(start.add([(fretDist * numFrets), 0]));
		path.strokeWidth = stringWidth;
	}
}


var buttonRadius = 15;



var DegreeButton = function(x, y, label, color, i) {
	this.label = label;
	this.color = color;

	var circle = new paper.Path.Circle(new paper.Point(x, y), buttonRadius);
	circle.fillColor = this.color;

	var text = new paper.PointText(new paper.Point(x, y + 5));//.hack
	text.fillColor = 'white';
	text.fontSize = 15;
	text.fontWeight = 'bold';
	text.justification = 'center';
	text.content = this.label;

	var grp = new paper.Group([circle, text]);
	var thisDegree = this;
	grp.onClick = function(event) {
		thisDegree.click();
	};

	this.myIndex = i;//.terrible hack

	this.grp = grp;

	this.disable();

	DegreeButton.allDegrees.push(this);
};
DegreeButton.enabledDegrees = [];
DegreeButton.allDegrees = [];
DegreeButton.prototype.click = function() {
	if(this.enabled) this.disable();
	else this.enable();
	if(ScaleButton.enabledScale) ScaleButton.enabledScale.disable();
};
DegreeButton.prototype.enable = function() {
	this.grp.opacity = 1;
	DegreeButton.enabledDegrees.push(this);
	this.enabled = true;
	redrawNotes();
	enableKeyButton((KEYS.indexOf(selectedKey) + this.myIndex) % KEYS.length);
	redrawKeyLines();
};
DegreeButton.prototype.disable = function() {
	this.grp.opacity = 0.1;
	DegreeButton.enabledDegrees.splice(DegreeButton.enabledDegrees.indexOf(this), 1);
	this.enabled = false;
	redrawNotes();
	disableKeyButton((KEYS.indexOf(selectedKey) + this.myIndex) % KEYS.length);
	redrawKeyLines();
};





var degreeButtons = [
	{label:'R', relx:0},
	{label:'b2', relx:0.5},
	{label:'2', relx:1},
	{label:'b3', relx:1.5},
	{label:'3', relx:2},
	{label:'4', relx:3},
	{label:'#4', relx:3.5},//.change label based on lyd (#4) vs loc (b5)
	{label:'5', relx:4},
	{label:'b6', relx:4.5},//.change label based on aug (#5) vs all else (b6)
	{label:'6', relx:5},
	{label:'b7', relx:5.5},
	{label:'7', relx:6}
];
var belowFretboard = {
	x: topLeft.x + fretDist/2,
	y: topLeft.y + 5*stringDist + 3*buttonRadius
};
function drawButtons() {
	drawDegrees();
	drawKeys();
	drawScales();
	drawPlayButtons();
}

// based on this chart: http://danbecker.info/guitars/TriadArpeggios.png
function drawDegrees() {
	for (var i = 0, len = degreeButtons.length; i < len; i++) {
		var button = degreeButtons[i];

		var x = belowFretboard.x + 2.5*button.relx*buttonRadius;
		var y = belowFretboard.y;
		if(button.label.length === 1) {//.hack
			y += 1.8 * buttonRadius;
		}

		var degBtn = new DegreeButton(x, y, button.label, degreeColors[i], i);
	}
}

var keyWheelRadius = 80;
var keyButtons = [];
function drawKeys() {
	var midX = belowFretboard.x + 2.5*3*buttonRadius;
	var midY = belowFretboard.y + 2.5*2*buttonRadius + keyWheelRadius;

	for (i in KEYS) {
		var key = KEYS[i];

		var theta = i * 2 * Math.PI / 12 - (Math.PI / 2);
		var x = midX + keyWheelRadius * Math.cos(theta);
		var y = midY + keyWheelRadius * Math.sin(theta);

		var line = new paper.Path();
		line.strokeColor = stringColor;
		var start = new paper.Point(midX, midY);
		line.moveTo(start);
		line.lineTo([
			midX + (keyWheelRadius-buttonRadius) * Math.cos(theta),
			midY + (keyWheelRadius-buttonRadius) * Math.sin(theta)
		]);
		line.strokeColor = '#333';
		line.strokeWidth = 2;

		var circle = new paper.Path.Circle(new paper.Point(x, y), buttonRadius);
		circle.fillColor = 'white';
		circle.strokeColor = '#333';
		//circle.strokeWidth = 2;

		var text = new paper.PointText(new paper.Point(x, y + 5));//.hack
		//text.fillColor = '#333';
		text.fillColor = 'white';
		text.content = key;
		text.justification = 'center';
		text.fontSize = 15;
		text.fontWeight = 'bold';

		var grp = new paper.Group([circle, text, line]);
		grp.onClick = function(event) {
			clickKey(this);
		};

		keyButtons.push(grp);
	}
}

var selectedKey = '';
function clickKey(grp) {
	if(selectedKey != grp.children[1].content) {
		selectedKey = grp.children[1].content;

		var rootIdx = KEYS.indexOf(selectedKey);
		var degs = getEnabledDegrees();

		for (var i = 0, len = KEYS.length; i < len; i++) {
			var keyIdx = (rootIdx + i) % len;
			var keyGrp = keyButtons[keyIdx];
			//keyGrp.children[0].fillColor = 'white';
			//keyGrp.children[1].fillColor = '#333';
			keyGrp.children[0].fillColor = DegreeButton.allDegrees[i].color;
			keyGrp.children[0].strokeWidth = 0;
			if(degs.indexOf(i) === -1) {
				disableKeyButton(keyIdx);
			} else {
				enableKeyButton(keyIdx);
			}
		}

		//grp.children[0].fillColor = '#333';
		//grp.children[1].fillColor = 'white';
		grp.children[0].strokeWidth = 3;

		redrawNotes();
	}
}
function enableKeyButton(idx) {
	if(keyButtons[idx]) {
		var grp = keyButtons[idx];
		grp.children[0].opacity = 1;
	}
	redrawKeyLines();
}
function disableKeyButton(idx) {
	if(keyButtons[idx]) {
		var grp = keyButtons[idx];
		grp.children[0].opacity = 0.1;
	}
	redrawKeyLines();
}


var scaleWidth = 110;
var ScaleButton = function(x, y, name, intervals) {
	this.name = name;
	this.intervals = intervals;

	var rect = new paper.Path.RoundRectangle(
		new paper.Rectangle(new paper.Point(x, y), new paper.Point(x+scaleWidth, y+2*buttonRadius)),
		new paper.Size(buttonRadius, buttonRadius)
	);
	rect.strokeColor = '#333';
	rect.strokeWidth = 2;

	var text = new paper.PointText(new paper.Point(x+scaleWidth/2, y + 20));//.hack
	text.content = this.name;
	text.justification = 'center';
	text.fontSize = 15;
	text.fontWeight = 'bold';

	var grp = new paper.Group([rect, text]);
	var thisScale = this;
	grp.onClick = function(event) {
		thisScale.click();
	};

	this.grp = grp;

	this.disable();

	ScaleButton.allScales.push(this);
};
ScaleButton.allScales = [];
ScaleButton.enabledScale = null;
ScaleButton.prototype.click = function() {
	if(ScaleButton.enabledScale !== this) this.enable();
};
ScaleButton.prototype.enable = function() {
	if(ScaleButton.enabledScale) ScaleButton.enabledScale.disable();
	this.grp.children[0].fillColor = '#333';
	this.grp.children[1].fillColor = 'white';
	ScaleButton.enabledScale = this;

	// disable degree buttons
	DegreeButton.allDegrees.forEach(function(deg){
		deg.disable();
	});

	// enable the appropriate degrees
	this.intervals.forEach(function(i){
		DegreeButton.allDegrees[i].enable();
	});
};
ScaleButton.prototype.disable = function() {
	this.grp.children[0].fillColor = 'white';
	this.grp.children[1].fillColor = '#333';
	if(ScaleButton.enabledScale === this) ScaleButton.enabledScale = null;
};

function drawScales() {
	var x = belowFretboard.x;
	var y = belowFretboard.y;

	// Diatonics
	x += 2*9*buttonRadius;
	var text = new paper.PointText(new paper.Point(x + scaleWidth/2, y));
	text.content = 'Diatonic';
	text.justification = 'center';
	text.fontSize = 20;
	text.fontWeight = 'bold';
	y += buttonRadius;
	var diatonics = [
		{name:'Ionian', intervals:[0,2,4,5,7,9,11]},
		{name:'Dorian', intervals:[0,2,3,5,7,9,10]},
		{name:'Phrygian', intervals:[0,1,3,5,7,8,10]},
		{name:'Lydian', intervals:[0,2,4,6,7,9,11]},
		{name:'Mixolydian', intervals:[0,2,4,5,7,9,10]},
		{name:'Aeolian', intervals:[0,2,3,5,7,8,10]},
		{name:'Locrian', intervals:[0,1,3,5,6,8,10]}
	];
	for (var i = 0, len = diatonics.length; i < len; i++) {
		var btn = new ScaleButton(x, y, diatonics[i].name, diatonics[i].intervals);
		y += 2.5*buttonRadius;
	}

	// Pentatonics
	x += scaleWidth + 2*buttonRadius;
	y = belowFretboard.y;
	var text = new paper.PointText(new paper.Point(x + scaleWidth/2, y));
	text.content = 'Pentatonic';
	text.justification = 'center';
	text.fontSize = 20;
	text.fontWeight = 'bold';
	y += buttonRadius;
	var btn = new ScaleButton(x, y, 'Major', [0,2,4,7,9]);
	y += 2.5*buttonRadius;
	var btn = new ScaleButton(x, y, 'Minor', [0,3,5,7,10]);

	// Triads
	x += scaleWidth + 2*buttonRadius;
	y = belowFretboard.y;
	var text = new paper.PointText(new paper.Point(x + scaleWidth/2, y));
	text.content = 'Triads';
	text.justification = 'center';
	text.fontSize = 20;
	text.fontWeight = 'bold';
	y += buttonRadius;
	var triads = [
		{name:'Major', intervals:[0,4,7]},
		{name:'Minor', intervals:[0,3,7]},
		{name:'Augmented', intervals:[0,4,8]},
		{name:'Diminished', intervals:[0,3,6]},
		{name:'Suspended 2', intervals:[0,2,7]},
		{name:'Suspended 4', intervals:[0,5,7]},
	];
	for (var i = 0, len = triads.length; i < len; i++) {
		var btn = new ScaleButton(x, y, triads[i].name, triads[i].intervals);
		y += 2.5*buttonRadius;
	}

	// Intervals
	x += scaleWidth + 2*buttonRadius;
	y = belowFretboard.y;
	var text = new paper.PointText(new paper.Point(x + scaleWidth/2, y));
	text.content = 'Intervals';
	text.justification = 'center';
	text.fontSize = 20;
	text.fontWeight = 'bold';
	y += buttonRadius;
	var intervals = [
		/*
		{name:'(p)erfect', intervals:[0,5,7]},
		{name:'(m)ajor', intervals:[0,4,8]},
		{name:'mi(n)or', intervals:[0,3,9]},
		{name:'(s)econd', intervals:[0,2,10]},
		{name:'(d)iminished', intervals:[0,1,11]},
		{name:'(t)ritone', intervals:[0,6]},
		*/
		{name:'P4 / P5', intervals:[0,5,7]},
		{name:'M3 / m6', intervals:[0,4,8]},
		{name:'m3 / M6', intervals:[0,3,9]},
		{name:'M2 / m7', intervals:[0,2,10]},
		{name:'m2 / M7', intervals:[0,1,11]},
		{name:'Tritone', intervals:[0,6]},
	];
	for (var i = 0, len = intervals.length; i < len; i++) {
		var btn = new ScaleButton(x, y, intervals[i].name, intervals[i].intervals);
		y += 2.5*buttonRadius;
	}

	/*
	// Chord Ornaments
	x += scaleWidth + 2*buttonRadius;
	y = belowFretboard.y;
	var text = new paper.PointText(new paper.Point(x + scaleWidth/2, y));
	text.content = 'Ornaments';
	text.justification = 'center';
	text.fontSize = 20;
	text.fontWeight = 'bold';
	y += buttonRadius;
	var chords = [
		{name:'6', intervals:[0,4,7,9]},
		{name:'7', intervals:[0,4,7,10]},
		{name:'maj7', intervals:[0,4,7,11]},
		{name:'add9', intervals:[0,2,4,7]},
		{name:'add11', intervals:[0,4,5,7]},
	];
	for (var i = 0, len = chords.length; i < len; i++) {
		var btn = new ScaleButton(x, y, chords[i].name, chords[i].intervals);
		y += 2.5*buttonRadius;
	}
	*/

	// Other
	x += scaleWidth + 2*buttonRadius;
	y = belowFretboard.y;
	var text = new paper.PointText(new paper.Point(x + scaleWidth/2, y));
	text.content = 'Other';
	text.justification = 'center';
	text.fontSize = 20;
	text.fontWeight = 'bold';
	y += buttonRadius;
	var chords = [
		{name:'Chromatic', intervals:[0,1,2,3,4,5,6,7,8,9,10,11]},
		{name:'Blues', intervals:[0,3,5,6,7,10]},
		{name:'Mixolydian b6', intervals:[0,2,4,5,7,8,10]},
		{name:'Phrygian Dom', intervals:[0,1,4,5,7,8,10]},
	];
	for (var i = 0, len = chords.length; i < len; i++) {
		var btn = new ScaleButton(x, y, chords[i].name, chords[i].intervals);
		y += 2.5*buttonRadius;
	}
}

function drawPlayButtons() {
	var x = belowFretboard.x;
	var y = belowFretboard.y + 7*buttonRadius + 2*keyWheelRadius;

	var playBtnWidth = scaleWidth - buttonRadius;

	var rect = new paper.Path.RoundRectangle(
		new paper.Rectangle(new paper.Point(x, y), new paper.Point(x+playBtnWidth, y+2*buttonRadius)),
		new paper.Size(buttonRadius, buttonRadius)
	);
	rect.strokeColor = '#333';
	rect.strokeWidth = 2;

	var text = new paper.PointText(new paper.Point(x+playBtnWidth/2, y + 20));
	text.content = 'Play Scale';
	text.justification = 'center';
	text.fontSize = 15;
	text.fontWeight = 'bold';

	var grp = new paper.Group([rect, text]);
	grp.onClick = function(event) { playScale(); };


	return;//.del
	x += playBtnWidth + 2*buttonRadius;

	var rect = new paper.Path.RoundRectangle(
		new paper.Rectangle(new paper.Point(x, y), new paper.Point(x+playBtnWidth, y+2*buttonRadius)),
		new paper.Size(buttonRadius, buttonRadius)
	);
	rect.strokeColor = '#333';
	rect.strokeWidth = 2;

	var text = new paper.PointText(new paper.Point(x+playBtnWidth/2, y + 20));
	text.content = 'Play Triads';
	text.justification = 'center';
	text.fontSize = 15;
	text.fontWeight = 'bold';

	var grp = new paper.Group([rect, text]);
	grp.onClick = function(event) { playTriads(); };
}

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playNote(frequency, duration) {
	var oscillator = audioCtx.createOscillator();
	//oscillator.type = 'square';
	oscillator.frequency.value = frequency; // value in hertz
	oscillator.connect(audioCtx.destination);
	oscillator.start();
	setTimeout(function(){ oscillator.stop(); }, duration);
}

function getEnabledDegrees() {
	var degs = [];
	DegreeButton.enabledDegrees.forEach(function(deg){
		if(degs.indexOf(deg.myIndex) === -1) parseInt(degs.push(deg.myIndex));
	});
	return degs.sort();
}
function playScale() {
	var rootIdx = KEYS.indexOf(selectedKey);
	if(rootIdx === -1) {
		alert("Select a key to play the scale.");
		return;
	}

	var frequencies = [];
	var containsRoot = false;
	getEnabledDegrees().forEach(function(deg){
		frequencies.push(calcHz(rootIdx + deg - fixedNoteIdx));
		if(deg === 0) containsRoot = true;
	});
	frequencies.sort();

	if(!containsRoot) {
		alert("Root must be enabled to play the scale.");
		return;
	}

	var duration = 300;
	var delay = 0;

	// play root twice as long
	var doubleDuration = 2 * duration;
	playNote(frequencies[0], doubleDuration);
	delay += doubleDuration;

	// set timeouts for each note (asc)
	frequencies.slice(1).forEach(function(hz){
		setTimeout(function(){
			playNote(hz, duration);
		}, delay);
		delay += duration;
	});

	// play the octave twice as long
	setTimeout(function(){
		playNote(calcHz(rootIdx + 12 - fixedNoteIdx), doubleDuration);
	}, delay);
	delay += doubleDuration;

	// set timeouts for each note (desc)
	frequencies.slice(1).reverse().forEach(function(hz){
		setTimeout(function(){
			playNote(hz, duration);
		}, delay);
		delay += duration;
	});

	// play the root again twice as long
	setTimeout(function(){
		playNote(frequencies[0], doubleDuration);
	}, delay);
}

function playTriads() {
	var rootIdx = KEYS.indexOf(selectedKey);
	if(rootIdx === -1) {
		alert("Select a key to play the triads.");
		return;
	}

	var frequencies = [];
	var containsRoot = false;
	getEnabledDegrees().forEach(function(deg){
		frequencies.push(calcHz(rootIdx + deg - fixedNoteIdx));
		if(deg === 0) containsRoot = true;
	});
	frequencies.sort();

	if(!containsRoot) {
		alert("Root must be enabled to play triads.");
		return;
	}

	var duration = 300;
	var delay = 0;

	// play the I chord twice as long
	var doubleDuration = 2 * duration;
	playNote(frequencies[0 % frequencies.length], doubleDuration);
	playNote(frequencies[2 % frequencies.length], doubleDuration);
	playNote(frequencies[4 % frequencies.length], doubleDuration);
	delay += doubleDuration;

	// set timeouts for each chord
	for (var i = 1, len = frequencies.length; i < len; i++) {
		setTimeout(function(i){
			playNote(frequencies[(i+0) % frequencies.length], duration);
			playNote(frequencies[(i+2) % frequencies.length], duration);
			playNote(frequencies[(i+4) % frequencies.length], duration);
		}, delay, i);
		delay += duration;
	}

	// play the I again twice as long
	setTimeout(function(){
		playNote(frequencies[0 % frequencies.length], doubleDuration);
		playNote(frequencies[2 % frequencies.length], doubleDuration);
		playNote(frequencies[4 % frequencies.length], doubleDuration);
	}, delay);
}

var fixedNoteIdx = KEYS.indexOf('A');
var fixedNoteFreq = 440; // A4
function calcHz(halfSteps) {
	return fixedNoteFreq * Math.pow(Math.pow(2, 1/12), halfSteps);
}


var drawnNotes = [];
function redrawNotes() {
	drawnNotes.forEach(function(note){ note.remove(); });
	drawnNotes = [];

	var rootIdx = KEYS.indexOf(selectedKey);
	//console.log(rootIdx, selectedKey);
	if(rootIdx !== -1) {
		// remove existing notes
		for (note in drawnNotes) {
			drawnNotes.splice(drawnNotes.indexOf(note), 1);
			note.remove();
		}

		// figure out which notes to use
		var notesToDraw = [];
		var noteLabels = {};
		var noteColors = {};
		DegreeButton.enabledDegrees.forEach(function(deg){
			var noteName = KEYS[(rootIdx + deg.myIndex) % 12];
			notesToDraw.push(noteName);
			noteLabels[noteName] = deg.label;
			noteColors[noteName] = deg.color;
		});
		//console.log(notesToDraw);

		// draw all notes
		for (stringNum in stringNotes) {
			var startingIndex = KEYS.indexOf(stringNotes[stringNum]);
			if (startingIndex !== -1) {
				for (var fret = 0; fret <= numFrets; fret++) {
					var label = KEYS[(fret + startingIndex) % 12];
					if(notesToDraw.indexOf(label) !== -1) {
						//var note = drawNote({fret:fret, string:stringNum, label:noteLabels[label], color:noteColors[label]});
						var note = drawNote({fret:fret, string:stringNum, label:label, color:noteColors[label]});
						//note.onClick = function(event){ this.remove(); };
						drawnNotes.push(note);
					}
				}
			}
		}
	}
}

function redrawKeyLines() {
	// hide all lines
	keyButtons.forEach(function(grp){
		grp.children[2].opacity = 0;
	});

	// show lines for enabled degrees
	var rootIdx = KEYS.indexOf(selectedKey);
	getEnabledDegrees().forEach(function(deg){
		keyButtons[(rootIdx + deg) % KEYS.length].children[2].opacity = 1;
	});
}


function drawNote(opts) {
	var x = topLeft.x + (opts.fret * fretDist) - noteOffset;
	var y = topLeft.y + ((6 - opts.string) * stringDist);

	var circle = new paper.Path.Circle(new paper.Point(x, y), noteRadius);
	circle.fillColor = opts.color || '#333';

	if(opts.label) {
		var text = new paper.PointText(new paper.Point(x, y + 3));//.hack
		text.fillColor = 'white';
		text.content = opts.label;
		text.justification = 'center';
		text.fontSize = 9;
		text.fontWeight = 'bold';
	}

	return new paper.Group([circle, text]);
}
