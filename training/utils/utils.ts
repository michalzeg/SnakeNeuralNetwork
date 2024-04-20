
export const random = (max: number) => Math.floor(Math.random() * max);

export const compareArrays = (array1: number[][], array2: number[][]): boolean => {
  for (let i = 0; i < array1.length; i++) {
    if (!arraysAreEqual(array1[i], array2[i])) {
      return false;
    }
  }
  return true;
};

const arraysAreEqual = (arr1: number[], arr2: number[]): boolean => {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
};

export const copyArray = (source: number[][], target: number[][]): void =>{
  for (let i = 0; i < source.length; i++) {
    for (let j = 0; j < source[0].length; j++) {
      target[i][j] = source[i][j];
    }
  }
}

export const initalizeBoardArray = (size: number): number[][] =>{
  const result: number[][] = [];
  for (let i = 0; i < size; i++) {
    result[i] = [];
    for (let j = 0; j < size; j++) {
      result[i][j] = -1;
    }
  }
  return result;
}

export const wait = (value: number): Promise<void> => {
  if (value === 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, value);
  });
};
