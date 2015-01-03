/**
 * @author v.lugovsky 
 */
import scala.collection.mutable
import scala.util.Random

object RubyState {
  def apply(stamp: String) = {
    val size: Int = math.sqrt(stamp.length).toInt

    def splitN[A](list: List[A], n: Int): List[List[A]] =
      if(n == 1) list :: Nil else list.take(size) :: splitN(list.drop(size), n - 1)

    new RubyState(splitN(stamp.toCharArray.toList, size))
  }
}

case class RubyState(state: List[List[Char]]) extends mutable.Traversable[(Char, Int, Int)] {
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

  override def foreach[U](f: ((Char, Int, Int)) => U): Unit = {
    state.zipWithIndex.foreach { case (row, rowIndex) =>
      row.zipWithIndex.foreach { case (cell, cellIndex) =>
        f((cell, rowIndex, cellIndex))
      }
    }
  }
}

object Main {

  val initial = RubyState("--1--1111")
  val goal = RubyState("1-1-1-1-1")
  val rubyDigitSize = initial.length
  val rubyDigitSizeOneLess = rubyDigitSize - 1
  val rubydigitShiftsPerDirection = rubyDigitSize
  val usedStamps = mutable.Set(initial)
  val started = System.currentTimeMillis()


  case class ShiftState(stamp: RubyState, shiftsNum: Int, shiftItem: Int, shiftCode: Char, prevState: ShiftState)

  val priorityStates = mutable.Queue(ShiftState(initial, 0, -1, 0, null))

  def assembleToGoal() {
//  recursiveFindSolution(initial, countDistanceToGoal(initial), -1, 'q') // 1
    directedFindSolution()
//    dijkstraAssemble()
  }

  def dijkstraAssemble(): Unit = {
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

  def countDistanceToGoal(state: RubyState): Int = {
    def getMinDistanceForCell(cell: Char, row: Int, col: Int): Int = {
      goal.foldLeft(rubyDigitSize * 2) { (acc, targetCell) =>
        if (targetCell._1 == cell) {
          val minDistance = Math.min(Math.abs(row - targetCell._2), rubyDigitSize - Math.abs(row - targetCell._2)) +
            Math.min(Math.abs(col - targetCell._3), rubyDigitSize - Math.abs(col - targetCell._3))
          if (minDistance > acc) {
            acc
          } else {
            minDistance
          }
        } else {
          acc
        }
      }
    }

    state.foldLeft(0) { (acc: Int, cell) =>
      acc + getMinDistanceForCell(cell._1, cell._2, cell._3)
    }
  }

  def recursiveFindSolution(state: RubyState, currentDistance: Int, shiftedIndex: Int, shiftedDirection: Char): Boolean = {
    if (currentDistance == 0) {
      print(" " + shiftedIndex + shiftedDirection)
      return true
    }

    def checkDistanceAndShift(newState: RubyState, index: Int, code: Char): Boolean = {
      val distance = countDistanceToGoal(newState)
      if (distance < currentDistance && !usedStamps.contains(newState)) {
        usedStamps.add(newState)
        recursiveFindSolution(newState, distance, index, code)
      } else {
        false
      }
    }

    val found1 = (0 to rubydigitShiftsPerDirection).foldLeft(false) { (res: Boolean, index: Int) =>
      var found = res
      if (shiftedDirection != 'r' && !found) found = checkDistanceAndShift(state.left(index), index, 'l')
      if (shiftedDirection != 'l' && !found) found = checkDistanceAndShift(state.right(index), index, 'r')
      if (shiftedDirection != 'd' && !found) found = checkDistanceAndShift(state.up(index), index, 'u')
      if (shiftedDirection != 'd' && !found) found = checkDistanceAndShift(state.down(index), index, 'd')
      found
    }

    if (found1 && shiftedIndex != -1) {
      print(" " + shiftedIndex + shiftedDirection)
    }
    found1
  }

  def makeShifts(state: ShiftState) {
    var i = 0
    while (i < rubydigitShiftsPerDirection) {
      if (state.shiftCode != 'r') shift(state, i, state.stamp.left(i), 'l')
      if (state.shiftCode != 'l') shift(state, i, state.stamp.right(i), 'r')
      if (state.shiftCode != 'd') shift(state, i, state.stamp.up(i), 'u')
      if (state.shiftCode != 'u') shift(state, i, state.stamp.down(i), 'd')
      i += 1
    }
  }

  def shift(state: ShiftState, index: Int, newStamp: RubyState, shiftCode: Char) {
    if (!usedStamps.contains(newStamp)) {
      if (newStamp != goal) {
        usedStamps.add(newStamp)
        priorityStates.enqueue(ShiftState(newStamp, state.shiftsNum + 1, index, shiftCode, state))
      } else {
        println("Assembled in " + (state.shiftsNum + 1))
        println("Solution: " + getSolution(state) + " " + index + shiftCode)
        println("Distance: " + countDistanceToGoal(initial) + " State: " + initial.map(_._1).mkString(""))
        sys.exit()
      }
    }
  }

  def getSolution(state: ShiftState): String = {
    if (state.prevState != null) {
      getSolution(state.prevState) + " " + state.shiftItem + state.shiftCode
    } else {
      ""
    }
  }

  def getSolutionReverted(state: ShiftState): String = {
    if (state.prevState != null) {
      "" + state.shiftItem + invertShiftCode(state.shiftCode) + " "  + getSolutionReverted(state.prevState)
    } else {
      ""
    }
  }

  val initialUsedStamps = mutable.Set(initial)
  val goalUsedStamps = mutable.Set(goal)
  val initialPriorityStates = mutable.Queue(ShiftState(initial, 0, -1, 0, null))
  val goalPriorityStates = mutable.Queue(ShiftState(goal, 0, -1, 0, null))

  def directedFindSolution(): Unit = {
    var isInitial = true
    var prevousState = 0
    var steps = 0

    var activePS = initialPriorityStates
    var activeUS = initialUsedStamps
    var otherPS = goalPriorityStates
    var otherUS = goalUsedStamps
    while (activePS.length > 0) {
      val state = activePS.dequeue()

      makeShifts1( state )(activePS, activeUS, otherPS, otherUS)
      steps += 1
      if (activePS.length == 0 || activePS.front.shiftsNum != prevousState) {
        if (isInitial) {
          activePS = goalPriorityStates
          activeUS = goalUsedStamps
          otherPS = initialPriorityStates
          otherUS = initialUsedStamps
          isInitial = false
        } else {
          activePS = initialPriorityStates
          activeUS = initialUsedStamps
          otherPS = goalPriorityStates
          otherUS = goalUsedStamps
          isInitial = true
          prevousState = activePS.front.shiftsNum
          println("New State: " + prevousState + " Steps: " + steps)
        }
      }
    }

  }

  def makeShifts1(state: ShiftState)(implicit activePS: mutable.Queue[ShiftState], activeUS: mutable.Set[RubyState], otherPS: mutable.Queue[ShiftState], otherUS: mutable.Set[RubyState]) {
    var i = 0
    while (i < rubydigitShiftsPerDirection) {
      if (state.shiftCode != 'r') shift2(state, i, state.stamp.left(i), 'l')(activePS, activeUS, otherPS, otherUS)
      if (state.shiftCode != 'l') shift2(state, i, state.stamp.right(i), 'r')(activePS, activeUS, otherPS, otherUS)
      if (state.shiftCode != 'd') shift2(state, i, state.stamp.up(i), 'u')(activePS, activeUS, otherPS, otherUS)
      if (state.shiftCode != 'u') shift2(state, i, state.stamp.down(i), 'd')(activePS, activeUS, otherPS, otherUS)
      i += 1
    }
  }

  def invertShiftCode(shiftCode: Char): Char = shiftCode match {
    case 'u' => 'd'
    case 'd' => 'u'
    case 'l' => 'r'
    case 'r' => 'l'
  }

  def shift2(state: ShiftState, index: Int, newStamp: RubyState, shiftCode: Char) (implicit activePS: mutable.Queue[ShiftState], activeUS: mutable.Set[RubyState], otherPS: mutable.Queue[ShiftState], otherUS: mutable.Set[RubyState]) {
    if (otherUS.contains(newStamp)) {
      // Found solution
      val matching = otherPS.find(_.stamp == newStamp).get
      val solution: String = if (activePS == initialPriorityStates) {
        getSolution(state) + " " + index + shiftCode + " "  + getSolutionReverted(matching)
      } else {
        getSolution(matching) + " " + index + invertShiftCode(shiftCode) + " "  + getSolutionReverted(state)
      }
      println("Assembled in " + (state.shiftsNum + matching.shiftsNum + 1))
      println("Solution: " + solution)
      sys.exit()
    } else {
       if (!activeUS.contains(newStamp)) {
         activeUS.add(newStamp)
         activePS.enqueue(ShiftState(newStamp, state.shiftsNum + 1, index, shiftCode, state))
       }
    }
  }

  def main (args: Array[String]) {
    assembleToGoal()
  }

}
