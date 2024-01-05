//check types of incoming request

export const checkType = (...args: any[]) => {
    args.map((arg) => {
        const arg3 = arg[3] ? arg[3] : undefined;
        if (typeof arg[0] !== arg[2] && typeof arg[0] !== arg[3]) {
            throw { field: arg[1], validation: `Required type is ${arg[2]}` };
        }
    });
};