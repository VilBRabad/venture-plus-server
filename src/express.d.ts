import { IInvestor } from "./models/investor.model";

declare global {
    namespace Express {
        interface Request {
            user?: IInvestor;
        }
    }
}
