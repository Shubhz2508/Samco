export const getStatus = (status: string) => {
    if (status === "validation pending") {
        return "PENDING";
    }
    if (status === "open pending") {
        return "PENDING";
    }
    if (status === "open") {
        return "PENDING";
    }
    if (status === "rejected") {
        return "REJECTED";
    }
    if (status === "completed") {
        return "EXECUTED";
    }
    if (status === "trigger pending") {
        return "PENDING";
    }
    if (status === "modification validation pending") {
        return "PENDING";
    }
    if (status === "modify pending") {
        return "PENDING";
    }
    if (status === "modified open") {
        return "EXECUTED";
    }
    if (status === "modified open") {
        return "EXECUTED";
    }
    if (status === "not modified open") {
        return "REJECTED";
    }
    if (status === "modify validation pending") {
        return "PENDING";
    }
    if (status === "modified trigger pending") {
        return "EXECUTED";
    }
    if (status === "not modified trigger pending") {
        return "REJECTED";
    }
    if (status === "cancel pending") {
        return "PENDING";
    }
    if (status === "cancelled") {
        return "CANCELLED";
    }
    if (status === "not cancelled open") {
        return "REJECTED";
    }
    if (status === "not cancelled trigger pending") {
        return "REJECTED";
    } else {
        return "NT";
    }
};
