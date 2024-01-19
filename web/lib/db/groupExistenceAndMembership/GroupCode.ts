
import { checkIfGroupExistsByGroupCode } from "./joinGroup";
const GROUP_CODE_LENGTH = 8;
export async function generateGroupCode(digits : number) : Promise<string> {
	let groupCode = generateUUID(digits);

	while (await checkIfGroupExistsByGroupCode(groupCode)){
		groupCode = generateUUID(GROUP_CODE_LENGTH);
	}
	return groupCode;
}

const generateUUID = (digits : number) : string => {
	let str = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXZ";
	let uuid = [];
	for (let i = 0; i < digits; i++) {
		uuid.push(str[Math.floor(Math.random() * str.length)]);
	}
	return uuid.join("");
};
