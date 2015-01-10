var goal = '123456789abcdefg',
    initial = '5ea1d32f7g9cb648',
    digitsNum = initial.length,
    rubyDigitSize = Math.sqrt(digitsNum),
    rubyDigitSizeOneLess = rubyDigitSize - 1,
    rubydigitShiftsPerDirection = rubyDigitSize,
    usedStamps = {initial: true},
    priorityStates = [
        {
            stamp: initial,
            shiftsNum: 0,
            shifts: []
        }
    ];
var started = new Date().getTime();

function RubyDigit(stamp) {
    this.array = [];
    var splitted = stamp.split('');
    for (var i = 0; i < digitsNum; i+=rubyDigitSize) {
        this.array.push( splitted.slice(i, i+rubyDigitSize) )
    }
}

RubyDigit.prototype.up = function(column) {
    var first = this.array[0][column];
    for (var i = 0; i < rubyDigitSizeOneLess; i++) {
       this.array[i][column] = this.array[i + 1][column];
    }
    this.array[rubyDigitSizeOneLess][column] = first;
};

RubyDigit.prototype.down = function(column) {
    var last = this.array[rubyDigitSizeOneLess][column];
    for (var i = rubyDigitSizeOneLess; i > 0; i--) {
        this.array[i][column] = this.array[i - 1][column];
    }
    this.array[0][column] = last;
};

RubyDigit.prototype.right = function(row) {
    var last = this.array[row][rubyDigitSizeOneLess];
    for (var i = rubyDigitSizeOneLess; i > 0; i--) {
        this.array[row][i] = this.array[row][i - 1];
    }
    this.array[row][0] = last;
};

RubyDigit.prototype.left = function(row) {
    var first = this.array[row][0];
    for (var i = 0; i < rubyDigitSizeOneLess; i++) {
        this.array[row][i] =  this.array[row][i + 1];
    }
    this.array[row][rubyDigitSizeOneLess] = first;
};

RubyDigit.prototype.getStamp = function() {
    var stamp = '';
    this.array.forEach(function(element, index) {
        stamp+=element.join('');
    });
    return stamp
};

var assembleToGoal = function() {
    var prevousState = 0,
        steps = 0;
    while (priorityStates.length > 0) {
        var state = priorityStates.shift();
        makeShifts( state );
        steps++;
        if (prevousState != state.shiftsNum) {
            console.log('Shifts: ' + state.shiftsNum + ', steps: ' + steps + ', timeElapsed: ' + (new Date().getTime() - started));
            prevousState = state.shiftsNum;
        }
    }
};

var makeShifts = function( state ) {
     for ( var i = 0; i < rubydigitShiftsPerDirection; i++ ) {
         shift(state, i, 'l');
         shift(state, i, 'r');
         shift(state, i, 'u');
         shift(state, i, 'd');
     }
};

var getSolution = function(state) {
    return (state.prevState ? getSolution(state.prevState) : '') + ' ' + state.shiftCode;
};

var shift = function(state, index, shiftCode) {
    var rubyDigit = new RubyDigit(state.stamp);
    switch (shiftCode) {
        case 'l': rubyDigit.left(index); break;
        case 'r': rubyDigit.right(index); break;
        case 'u': rubyDigit.up(index); break;
        case 'd': rubyDigit.down(index); break;
    }
    var newStamp = rubyDigit.getStamp();
    if ( !usedStamps[newStamp] && newStamp != goal ) {
        usedStamps[newStamp] = true;
        priorityStates.push({
            stamp: newStamp,
            shiftsNum: state.shiftsNum+1,
            shiftCode: shiftCode+index,
            prevState: state
        });
    } else if ( newStamp == goal ) {
        console.log('Assembled in ' + (state.shiftsNum + 1));
        console.log('Solution: ' + getSolution(state) + ' ' + index + shiftCode);
        process.exit();
        priorityStates = []
    }
};

assembleToGoal();








