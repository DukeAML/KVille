import { useRouter } from "next/router";
import { INVALID_GROUP_CODE } from "../../../common/src/db/groupExistenceAndMembership/GroupCode";

export const useGroupCode = () : string => {
    const router = useRouter();
    const groupCode = router.query.groupCode ? router.query.groupCode.toString() : INVALID_GROUP_CODE;
    return groupCode;
}