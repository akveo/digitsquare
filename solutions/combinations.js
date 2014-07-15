var goal = '968153742',
    initial = '123456789',
    digitsNum = initial.length,
    rubyDigitSize = Math.sqrt(digitsNum),
    usedStamps = ['123456789'],
    priorityStates = [
        {
            stamp: initial,
            shiftsNum: 0,
            shifts: []
        }
    ];


function RubyDigit(stamp) {
    this.array = [];
    for (var i = 0; i < digitsNum; i+=rubyDigitSize) {
        this.array.push( stamp.slice(i, i+rubyDigitSize).split('') )
    }
}

RubyDigit.prototype.up = function(column) {
    var columnCopy = this.getColumnCopy(column);
    for (var i = 0; i < rubyDigitSize; i++) {
       this.array[i][column] = this.getUpOrLeftShiftedElement(i, columnCopy);
    }
};

RubyDigit.prototype.down = function(column) {
    var columnCopy = this.getColumnCopy(column);
    for (var i = 0; i < rubyDigitSize; i++) {
        this.array[i][column] = this.getDownOrRightShiftedElement(i, columnCopy);
    }
};

RubyDigit.prototype.getColumnCopy = function(column) {
    var columnCopy = [];
    for (var i = 0; i < rubyDigitSize; i++) {
        columnCopy.push(this.array[i][column]);
    }
    return columnCopy
}

RubyDigit.prototype.right = function(row) {
    var rowCopy = this.getRowCopy(row);
    for ( var i = 0; i < rubyDigitSize; i++) {
        this.array[row][i] = this.getDownOrRightShiftedElement(i, rowCopy);
    }
};

RubyDigit.prototype.left = function(row) {
    var rowCopy = this.getRowCopy(row);
    for (var i = 0; i < rubyDigitSize; i++) {
        this.array[row][i] =  this.getUpOrLeftShiftedElement(i, rowCopy);
    }
};

RubyDigit.prototype.getRowCopy = function(row) {
    var rowCopy = [];
    for (var i = 0; i < rubyDigitSize; i++) {
        rowCopy.push(this.array[row][i]);
    }
    return rowCopy;
}

RubyDigit.prototype.getStamp = function() {
    var stamp = '';
    this.array.forEach(function(element, index) {
        stamp+=element.join('');
    });
    return stamp
};

RubyDigit.prototype.getUpOrLeftShiftedElement = function(index, rowCopy) {
    return index + 1 < rubyDigitSize ? rowCopy[index+1] : rowCopy[0];
}

RubyDigit.prototype.getDownOrRightShiftedElement = function(index, rowCopy) {
    return index - 1 >= 0 ? rowCopy[index-1] : rowCopy[rubyDigitSize-1];
}

var assembleToGoal = function() {
    var prevousState = 0,
        steps = 0;
    while (priorityStates.length > 0) {
        var state = priorityStates.shift();
        makeShifts( state );
        steps++;
        if (prevousState != state.shiftsNum) {
            console.log('Shifts: ' + state.shiftsNum + ', steps: ' + steps);
            prevousState = state.shiftsNum;
        }
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








