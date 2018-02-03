//const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
var stringNotes = {1:'E', 2:'A', 3:'D', 4:'G', 5:'B', 6:'E'};

var topLeft = {x:50, y:30};

var numFrets = 22;
var fretColor = '#bbb';
var fretDist = 50;
var fretWidth = 2.5;

var stringColor = '#bbb';
var stringDist = 25;
var stringWidth = 1.5;

var markerColor = '#ccc';

var noteRadius = 8;
var noteOffset = noteRadius * 1.3;

/*
var frets = {};
for (var string = 1; string <= 6; string++) {
	for (var fret = 0; fret <= 22; fret++) {
		frets[fret][string] = {
			x: topLeft.x,
			y: topLeft.y
		};
	}
}
console.log(frets);
*/


window.onload = function() {
	var canvas = document.getElementById('myCanvas');
	paper.setup(canvas);

	drawFretboard();
	drawButtons();

	//clickDegree(degreeButtons[0].grp);
	//clickDegree(degreeButtons[4].grp);
	//clickDegree(degreeButtons[7].grp);

	clickKey(keyButtons[0]);

	ModeButton.allModes[0].click(); // ionian

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
	if(ModeButton.enabledMode) ModeButton.enabledMode.disable();
};
DegreeButton.prototype.enable = function() {
	this.grp.opacity = 1;
	DegreeButton.enabledDegrees.push(this);
	this.enabled = true;
	redrawNotes();
};
DegreeButton.prototype.disable = function() {
	this.grp.opacity = 0.1;
	DegreeButton.enabledDegrees.splice(DegreeButton.enabledDegrees.indexOf(this), 1);
	this.enabled = false;
	redrawNotes();
};





var degreeButtons = [
	{label:'R', color:'#f00', relx:0},
	{label:'b2', color:'#f60', relx:0.5},
	{label:'2', color:'#f80', relx:1},
	{label:'b3', color:'#fc0', relx:1.5},
	{label:'3', color:'#ee0', relx:2},
	{label:'4', color:'#0d0', relx:3},
	{label:'#4', color:'#0ed', relx:3.5},//.change label based on lyd (#4) vs loc (b5)
	{label:'5', color:'#00f', relx:4},
	{label:'b6', color:'#64f', relx:4.5},//.change label based on aug (#5) vs all else (b6)
	{label:'6', color:'#80f', relx:5},
	{label:'b7', color:'#c0f', relx:5.5},
	{label:'7', color:'#f0f', relx:6}
];
var btnTopLeft = {
	x: topLeft.x + fretDist/2,
	y: topLeft.y + 5*stringDist + 3*buttonRadius
};
function drawButtons() {
	drawDegrees();
	drawKeys();
	drawModes();
}

// based on this chart: http://danbecker.info/guitars/TriadArpeggios.png
function drawDegrees() {
	for (var i = 0, len = degreeButtons.length; i < len; i++) {
		var button = degreeButtons[i];

		var x = btnTopLeft.x + 2.5*button.relx*buttonRadius;
		var y = btnTopLeft.y;
		if(button.label.length !== 1) {//.hack
			y += 1.8 * buttonRadius;
		}

		var degBtn = new DegreeButton(x, y, button.label, button.color, i);
	}
}

var keyWheelRadius = 80;
var keyButtons = [];
function drawKeys() {
	var midX = btnTopLeft.x + 2.5*3*buttonRadius;
	var midY = btnTopLeft.y + 2.5*2*buttonRadius + keyWheelRadius;

	keyButtons = [];

	for (i in KEYS) {
		var key = KEYS[i];

		var theta = i * 2 * Math.PI / 12 - (Math.PI / 2);
		var x = midX + keyWheelRadius * Math.cos(theta);
		var y = midY + keyWheelRadius * Math.sin(theta);

		var circle = new paper.Path.Circle(new paper.Point(x, y), buttonRadius);
		circle.fillColor = 'white';
		circle.strokeColor = '#333';
		circle.strokeWidth = 2;

		var text = new paper.PointText(new paper.Point(x, y + 5));//.hack
		text.fillColor = '#333';
		text.content = key;
		text.justification = 'center';
		text.fontSize = 15;
		text.fontWeight = 'bold';

		var grp = new paper.Group([circle, text]);
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

		keyButtons.forEach(function(keyGrp){
			keyGrp.children[0].fillColor = 'white';
			keyGrp.children[1].fillColor = '#333';
		});

		grp.children[0].fillColor = '#333';
		grp.children[1].fillColor = 'white';

		redrawNotes();
	}
}


var modeWidth = 110;
var ModeButton = function(x, y, name, intervals) {
	this.name = name;
	this.intervals = intervals;

	var rect = new paper.Path.RoundRectangle(
		new paper.Rectangle(new paper.Point(x, y), new paper.Point(x+modeWidth, y+2*buttonRadius)),
		new paper.Size(buttonRadius, buttonRadius)
	);
	rect.strokeColor = '#333';
	rect.strokeWidth = 2;

	var text = new paper.PointText(new paper.Point(x+modeWidth/2, y + 20));//.hack
	text.content = this.name;
	text.justification = 'center';
	text.fontSize = 15;
	text.fontWeight = 'bold';

	var grp = new paper.Group([rect, text]);
	var thisMode = this;
	grp.onClick = function(event) {
		thisMode.click();
	};

	this.grp = grp;

	this.disable();

	ModeButton.allModes.push(this);
};
ModeButton.allModes = [];
ModeButton.enabledMode = null;
ModeButton.prototype.click = function() {
	if(ModeButton.enabledMode !== this) this.enable();
};
ModeButton.prototype.enable = function() {
	if(ModeButton.enabledMode) ModeButton.enabledMode.disable();
	this.grp.children[0].fillColor = '#333';
	this.grp.children[1].fillColor = 'white';
	ModeButton.enabledMode = this;

	// disable degree buttons
	DegreeButton.allDegrees.forEach(function(deg){
		deg.disable();
	});

	// enable the appropriate degrees
	this.intervals.forEach(function(i){
		DegreeButton.allDegrees[i].enable();
	});
};
ModeButton.prototype.disable = function() {
	this.grp.children[0].fillColor = 'white';
	this.grp.children[1].fillColor = '#333';
	if(ModeButton.enabledMode === this) ModeButton.enabledMode = null;
};

function drawModes() {
	var x = btnTopLeft.x;
	var y = btnTopLeft.y;

	// Diatonics
	x += 2.5*8*buttonRadius;
	var text = new paper.PointText(new paper.Point(x + modeWidth/2, y));
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
		var btn = new ModeButton(x, y, diatonics[i].name, diatonics[i].intervals);
		y += 2.5*buttonRadius;
	}

	// Pentatonics
	x += modeWidth + 2.5*buttonRadius;
	y = btnTopLeft.y;
	var text = new paper.PointText(new paper.Point(x + modeWidth/2, y));
	text.content = 'Pentatonic';
	text.justification = 'center';
	text.fontSize = 20;
	text.fontWeight = 'bold';
	y += buttonRadius;
	var btn = new ModeButton(x, y, 'Major', [0,2,4,7,9]);
	y += 2.5*buttonRadius;
	var btn = new ModeButton(x, y, 'Minor', [0,3,5,7,10]);

	// Triads
	x += modeWidth + 2.5*buttonRadius;
	y = btnTopLeft.y;
	var text = new paper.PointText(new paper.Point(x + modeWidth/2, y));
	text.content = 'Triad';
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
		var btn = new ModeButton(x, y, triads[i].name, triads[i].intervals);
		y += 2.5*buttonRadius;
	}

	// Chromatic
	x += modeWidth + 2.5*buttonRadius;
	y = btnTopLeft.y;
	y += buttonRadius;
	var btn = new ModeButton(x, y, 'Chromatic', [0,1,2,3,4,5,6,7,8,9,10,11]);
}


var drawnNotes = [];
function redrawNotes() {
	drawnNotes.forEach(function(note){ note.remove(); });
	drawnNotes = [];

	var rootIdx = KEYS.indexOf(selectedKey);
	//console.log(rootIdx, selectedKey);
	if(rootIdx !== -1) {
		// remove existing notes
		for (note in drawnNotes){
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
