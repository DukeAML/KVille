
import { checkIfGroupExistsByGroupCode } from "./joinGroup.js";
const GROUP_CODE_LENGTH = 8;
export const INVALID_GROUP_CODE = "";
export async function generateGroupCode(digits) {
	let groupCode = generateUUID(digits);

	while (await checkIfGroupExistsByGroupCode(groupCode)){
		groupCode = generateGroupCode(GROUP_CODE_LENGTH);
	}
	return groupCode;
}

const generateUUID = (digits) => {
	let str = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXZ";
	let uuid = [];
	for (let i = 0; i < digits; i++) {
		uuid.push(str[Math.floor(Math.random() * str.length)]);
	}
	return uuid.join("");
};
