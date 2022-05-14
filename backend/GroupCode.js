const groupCodeArr = [];

export function generateGroupCode(digits) {
    while (true) {
        let uuid = generateUUID(digits);
        for (let i = 0; i < groupCodeArr.length; i++) {
            if (uuid.localeCompare(groupCodeArr[i] == 0)) {
                continue;
            }
        }
        groupCodeArr.push(uuid);
        return uuid;
    }
    return; 
}

const generateUUID = (digits) => {
  let str = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXZ";
  let uuid = [];
  for (let i = 0; i < digits; i++) {
    uuid.push(str[Math.floor(Math.random() * str.length)]);
  }
  return uuid.join("");
}