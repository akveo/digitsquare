var goal = '123457689',
    initial = '123456789',
    usedStamps = ['123456789'],
    priorityStates = [
        {
            stamp: initial,
            shiftsNum: 0,
            shifts: []
        }
    ]


function RubyDigit(stamp) {
    this.array = [ stamp.slice(0,3).split(''), stamp.slice(3,6).split(''), stamp.slice(6).split('') ];
}

RubyDigit.prototype.up = function(column) {
    var columnCopy = [ this.array[0][column], this.array[1][column], this.array[2][column] ];
    this.array[0][column] = columnCopy[1];
    this.array[1][column] = columnCopy[2];
    this.array[2][column] = columnCopy[0];
};

RubyDigit.prototype.down = function(column) {
    var columnCopy = [ this.array[0][column], this.array[1][column], this.array[2][column] ];
    this.array[0][column] = columnCopy[2];
    this.array[1][column] = columnCopy[0];
    this.array[2][column] = columnCopy[1];
};

RubyDigit.prototype.right = function(row) {
    var rowCopy = [ this.array[row][0], this.array[row][1], this.array[row][2] ];
    this.array[row][0] = rowCopy[2];
    this.array[row][1] = rowCopy[0];
    this.array[row][2] = rowCopy[1];
};

RubyDigit.prototype.left = function(row) {
    var rowCopy = [ this.array[row][0], this.array[row][1], this.array[row][2] ];
    this.array[row][0] = rowCopy[1];
    this.array[row][1] = rowCopy[2];
    this.array[row][2] = rowCopy[0];
};

RubyDigit.prototype.getStamp = function() {
    var stamp = '';
    this.array.forEach(function(element, index) {
        stamp+=element.join('');
    });
    return stamp
};

var assembleToGoal = function() {
    while (priorityStates.length > 0) {
        var state = priorityStates.shift();
        makeShifts( state );
        console.log(state.shiftsNum)
    }
};

var makeShifts = function( state ) {
     for ( var i = 0; i < 3; i++ ) {
         shift(state, i, 'l');
         shift(state, i, 'r');
         shift(state, i, 'u');
         shift(state, i, 'd');
     }
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
    if ( usedStamps.indexOf(newStamp) ==-1 && newStamp != goal ) {
        usedStamps.push(newStamp);
        priorityStates.push({
            stamp: newStamp,
            shiftsNum: state.shiftsNum+1,
//            shifts: state.shifts.push(index + shiftCode)  //will it be the copy of an array?
        });
    } else if ( newStamp == goal ) {
        console.log('Assembled!')
        priorityStates = []
    }
};

assembleToGoal();








