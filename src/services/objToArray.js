
const convertObjToArray = (obj) => {
  let arr= []
    for(let i in obj)
      arr.push([i, obj[i]]);
  return arr;
};

const processApiObj = (obj) => {
  let arr = convertObjToArray(obj.data)
  arr = arr.map(elmt => elmt[1]);
  return arr;
};

export default { processApiObj };