/**
 * @author v.lugovsky 
 */
import scala.collection.mutable



object RubyState {
  def apply(stamp: String) = {
    val size: Int = math.sqrt(stamp.length).toInt

    def splitN[A](list: List[A], n: Int): List[List[A]] =
      if(n == 1) list :: Nil else list.take(size) :: splitN(list.drop(size), n - 1)

    new RubyState(splitN(stamp.toCharArray.toList, size))
  }
}

case class RubyState(state: List[List[Char]]) {
  def up(col: Int) = {
    var rowIndex = 0
    RubyState(state.map { rowElement =>
      var columnIndex = 0
      val resRow = rowElement.map  { columnElement =>
        val resColumnEl = if (columnIndex != col) {
          columnElement
        } else if (rowIndex < rowElement.length - 1) {
          state(rowIndex + 1)(columnIndex)
        } else {
          state(0)(columnIndex)
        }
        columnIndex += 1
        resColumnEl
      }
      rowIndex += 1
      resRow
    })
  }

  def down(col: Int) = {
    var rowIndex = 0
    RubyState(state.map { rowElement =>
      var columnIndex = 0
      val resRow = rowElement.map  { columnElement =>
        val res = if (columnIndex != col) {
          columnElement
        } else if (rowIndex > 0) {
          state(rowIndex - 1)(columnIndex)
        } else {
          state(state.length - 1)(columnIndex)
        }
        columnIndex += 1
        res
      }
      rowIndex += 1
      resRow
    })
  }

  def right(row: Int) = {
    var rowIndex = 0
    RubyState(state.map { rowValue =>
      val resRow = if (rowIndex != row) {
        rowValue
      } else {
        rowValue.last :: rowValue.init
      }
      rowIndex += 1
      resRow
    })
  }

  def left(row: Int) = {
    var rowIndex = 0
    RubyState(state.map { rowValue =>
      val resRow = if (rowIndex != row) {
        rowValue
      } else {
        rowValue.tail :+ rowValue.head
      }
      rowIndex += 1
      resRow
    })
  }

  lazy val length = state.length
}

val goal = RubyState("123456789abcdefg")
val initial= RubyState("5ea1d32f7g9cb648")
val rubyDigitSize = initial.length
val rubyDigitSizeOneLess = rubyDigitSize - 1
val rubydigitShiftsPerDirection = rubyDigitSize
val usedStamps = mutable.Set(initial)
val started = System.currentTimeMillis()


case class ShiftState(stamp: RubyState, shiftsNum: Int, shiftCode: String, prevState: ShiftState)

val priorityStates = mutable.Queue(ShiftState(initial, 0, null, null))

def assembleToGoal() {
  var prevousState = 0
  var steps = 0
  while (priorityStates.length > 0) {
    val state = priorityStates.dequeue()
    makeShifts( state )
    steps += 1
    if (prevousState != state.shiftsNum) {
      println("Shifts: " + state.shiftsNum + ", steps:" + steps + ", timeElapsed: " + (System.currentTimeMillis() - started))
      prevousState = state.shiftsNum
    }
  }
}

def makeShifts(state: ShiftState) {
  var i = 0
  while (i < rubydigitShiftsPerDirection) {
    shift(state, i, 'l')
    shift(state, i, 'r')
    shift(state, i, 'u')
    shift(state, i, 'd')
    i += 1
  }
}

def shift(state: ShiftState, index: Int, shiftCode: Char) {
  val newStamp = shiftCode match {
    case 'l' => state.stamp.left(index)
    case 'r' => state.stamp.right(index)
    case 'u' => state.stamp.up(index)
    case 'd' => state.stamp.down(index)
  }
  if ( !usedStamps.contains(newStamp) && newStamp != goal ) {
    if (newStamp != goal) {
      usedStamps.add(newStamp)
      priorityStates.enqueue(ShiftState(newStamp, state.shiftsNum + 1, "" + shiftCode + index, state))
    } else {
      println("Assembled in " + (state.shiftsNum + 1))
      println("Solution: " + getSolution(state) + " " + index + shiftCode)
      sys.exit()
    }
  }
}

def getSolution(state: ShiftState): String = {
  if (state.prevState != null) {
    getSolution(state.prevState) + " " + state.shiftCode
  } else {
    ""
  }
}

assembleToGoal()
