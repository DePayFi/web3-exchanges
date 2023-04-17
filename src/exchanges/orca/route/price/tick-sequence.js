import { TICK_ARRAY_SIZE, MAX_TICK_INDEX, MIN_TICK_INDEX } from "./ticks"
import { PublicKey } from '@depay/solana-web3.js'

class TickArrayIndex {
  
  static fromTickIndex(index, tickSpacing) {
    const arrayIndex = Math.floor(Math.floor(index / tickSpacing) / TICK_ARRAY_SIZE)
    let offsetIndex = Math.floor((index % (tickSpacing * TICK_ARRAY_SIZE)) / tickSpacing)
    if (offsetIndex < 0) {
      offsetIndex = TICK_ARRAY_SIZE + offsetIndex
    }
    return new TickArrayIndex(arrayIndex, offsetIndex, tickSpacing)
  }

  constructor(arrayIndex, offsetIndex, tickSpacing) {
    if (offsetIndex >= TICK_ARRAY_SIZE) {
      throw new Error("Invalid offsetIndex - value has to be smaller than TICK_ARRAY_SIZE")
    }
    if (offsetIndex < 0) {
      throw new Error("Invalid offsetIndex - value is smaller than 0")
    }

    if (tickSpacing < 0) {
      throw new Error("Invalid tickSpacing - value is less than 0")
    }

    this.arrayIndex = arrayIndex
    this.offsetIndex = offsetIndex
    this.tickSpacing = tickSpacing
  }

  toTickIndex() {
    return (
      this.arrayIndex * TICK_ARRAY_SIZE * this.tickSpacing + this.offsetIndex * this.tickSpacing
    );
  }

  toNextInitializableTickIndex() {
    return TickArrayIndex.fromTickIndex(this.toTickIndex() + this.tickSpacing, this.tickSpacing)
  }

  toPrevInitializableTickIndex() {
    return TickArrayIndex.fromTickIndex(this.toTickIndex() - this.tickSpacing, this.tickSpacing)
  }
}

export class TickArraySequence {

  constructor(tickArrays, tickSpacing, aToB) {
    if (!tickArrays[0] || !tickArrays[0].data) {
      throw new Error("TickArray index 0 must be initialized");
    }

    // If an uninitialized TickArray appears, truncate all TickArrays after it (inclusive).
    this.sequence = [];
    for (const tickArray of tickArrays) {
      if (!tickArray || !tickArray.data) {
        break;
      }
      this.sequence.push({
        address: tickArray.address,
        data: tickArray.data,
      });
    }

    this.tickArrays = tickArrays
    this.tickSpacing = tickSpacing
    this.aToB = aToB

    this.touchedArrays = [...Array(this.sequence.length).fill(false)];
    this.startArrayIndex = TickArrayIndex.fromTickIndex(
      this.sequence[0].data.startTickIndex,
      this.tickSpacing
    ).arrayIndex;
  }

  isValidTickArray0(tickCurrentIndex) {
    const shift = this.aToB ? 0 : this.tickSpacing;
    const tickArray = this.sequence[0].data;
    return this.checkIfIndexIsInTickArrayRange(tickArray.startTickIndex, tickCurrentIndex + shift);
  }

  getNumOfTouchedArrays() {
    return this.touchedArrays.filter((val) => !!val).length;
  }

  getTouchedArrays(minArraySize) {
    let result = this.touchedArrays.reduce((prev, curr, index) => {
      if (curr) {
        prev.push(this.sequence[index].address);
      }
      return prev;
    }, []);

    // Edge case: nothing was ever touched.
    if (result.length === 0) {
      return [];
    }

    // The quote object should contain the specified amount of tick arrays to be plugged
    // directly into the swap instruction.
    // If the result does not fit minArraySize, pad the rest with the last touched array
    const sizeDiff = minArraySize - result.length;
    if (sizeDiff > 0) {
      result = result.concat(Array(sizeDiff).fill(result[result.length - 1]));
    }

    return result;
  }

  getTick(index) {
    const targetTaIndex = TickArrayIndex.fromTickIndex(index, this.tickSpacing);

    if (!this.isArrayIndexInBounds(targetTaIndex, this.aToB)) {
      throw new Error("Provided tick index is out of bounds for this sequence.");
    }

    const localArrayIndex = this.getLocalArrayIndex(targetTaIndex.arrayIndex, this.aToB);
    const tickArray = this.sequence[localArrayIndex].data;

    this.touchedArrays[localArrayIndex] = true;

    if (!tickArray) {
      throw new Error(
        `TickArray at index ${localArrayIndex} is not initialized.`
      );
    }

    if (!this.checkIfIndexIsInTickArrayRange(tickArray.startTickIndex, index)) {
      throw new Error(
        `TickArray at index ${localArrayIndex} is unexpected for this sequence.`
      );
    }

    return tickArray.ticks[targetTaIndex.offsetIndex];
  }
  /**
   * if a->b, currIndex is included in the search
   * if b->a, currIndex is always ignored
   * @param currIndex
   * @returns
   */
  findNextInitializedTickIndex(currIndex) {
    const searchIndex = this.aToB ? currIndex : currIndex + this.tickSpacing;
    let currTaIndex = TickArrayIndex.fromTickIndex(searchIndex, this.tickSpacing);

    // Throw error if the search attempted to search for an index out of bounds
    if (!this.isArrayIndexInBounds(currTaIndex, this.aToB)) {
      throw new Error(
        `Swap input value traversed too many arrays. Out of bounds at attempt to traverse tick index - ${currTaIndex.toTickIndex()}.`
      );
    }

    while (this.isArrayIndexInBounds(currTaIndex, this.aToB)) {
      const currTickData = this.getTick(currTaIndex.toTickIndex());
      if (currTickData.initialized) {
        return { nextIndex: currTaIndex.toTickIndex(), nextTickData: currTickData };
      }
      currTaIndex = this.aToB
        ? currTaIndex.toPrevInitializableTickIndex()
        : currTaIndex.toNextInitializableTickIndex();
    }

    const lastIndexInArray = Math.max(
      Math.min(
        this.aToB ? currTaIndex.toTickIndex() + this.tickSpacing : currTaIndex.toTickIndex() - 1,
        MAX_TICK_INDEX
      ),
      MIN_TICK_INDEX
    );

    return { nextIndex: lastIndexInArray, nextTickData: null };
  }

  getLocalArrayIndex(arrayIndex, aToB) {
    return aToB ? this.startArrayIndex - arrayIndex : arrayIndex - this.startArrayIndex;
  }

  /**
   * Check whether the array index potentially exists in this sequence.
   * Note: assumes the sequence of tick-arrays are sequential
   * @param index
   */
  isArrayIndexInBounds(index, aToB) {
    // a+0...a+n-1 array index is ok
    const localArrayIndex = this.getLocalArrayIndex(index.arrayIndex, aToB);
    const seqLength = this.sequence.length;
    return localArrayIndex >= 0 && localArrayIndex < seqLength;
  }

  checkIfIndexIsInTickArrayRange(startTick, tickIndex) {
    const upperBound = startTick + this.tickSpacing * TICK_ARRAY_SIZE;
    return tickIndex >= startTick && tickIndex < upperBound;
  }
}
