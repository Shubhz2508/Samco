const calculateTrigger = (TGPrice: number, type: string) => {
    let diff: number;
    if (TGPrice > 0 && TGPrice < 200) {
        diff = 0.1;
    }
    if (TGPrice > 200 && TGPrice < 500) {
        diff = 0.2;
    }
    if (TGPrice > 500 && TGPrice < 1000) {
        diff = 0.3;
    }
    if (TGPrice > 1000 && TGPrice < 2000) {
        diff = 0.4;
    }
    if (TGPrice > 2000 && TGPrice < 3000) {
        diff = 0.5;
    }
    if (TGPrice > 3000 && TGPrice < 5000) {
        diff = 1;
    } else {
        diff = 2;
    }
    if (type === "BUY") {
        return TGPrice - diff;
    } else {
        return TGPrice + diff;
    }
};

export default calculateTrigger;