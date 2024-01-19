import { useRouter } from "next/router";
import { INVALID_GROUP_CODE } from "../controllers/groupMembershipAndExistence/groupCodeController";

export const useGroupCode = () : string => {
    const router = useRouter();
    const groupCode = router.query.groupCode ? router.query.groupCode.toString() : INVALID_GROUP_CODE;
    return groupCode;
}