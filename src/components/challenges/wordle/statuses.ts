export type CharStatus = 'absent' | 'present' | 'correct';
export const getGuessStatuses = (
    solution: string,
    guess: string
  ): CharStatus[] => {
    const splitSolution = solution.split("")
    const splitGuess = guess.split("")
  
    const solutionCharsTaken = splitSolution.map(() => false)
  
    const statuses: CharStatus[] = Array.from(Array(guess.length))
  
    // handle all correct cases first
    splitGuess.forEach((letter, i) => {
      if (letter === splitSolution[i]) {
        statuses[i] = 'correct'
        solutionCharsTaken[i] = true
        return
      }
    })
  
    splitGuess.forEach((letter, i) => {
      if (statuses[i]) return
  
      if (!splitSolution.includes(letter)) {
        // handles the absent case
        statuses[i] = 'absent'
        return
      }
  
      // now we are left with "present"s
      const indexOfPresentChar = splitSolution.findIndex(
        (x, index) => x === letter && !solutionCharsTaken[index]
      )
  
      if (indexOfPresentChar > -1) {
        statuses[i] = 'present'
        solutionCharsTaken[indexOfPresentChar] = true
        return
      } else {
        statuses[i] = 'absent'
        return
      }
    })
  
    return statuses
  }