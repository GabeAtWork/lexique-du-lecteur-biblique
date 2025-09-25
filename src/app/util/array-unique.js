export const arrayUniqueByKey = (arr, key) => [
  ...new Map(arr.map((item) => [item[key], item])).values(),
];
