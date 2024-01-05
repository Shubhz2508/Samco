import { Request, Response, NextFunction } from "express";

const allowCORS = function (req: Request, res: Response, next: NextFunction) {
    var origin = req.get("origin");
    console.log(origin);
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
};

export default allowCORS;
