import { Roles, User } from '../entities/User';
import * as J from 'joi';
import { Response } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { AuthRequest } from '../interfaces/token.interface';
import { makeStooqAPIRequest } from '../utils/stock';
import { StooqAsset } from '../interfaces/stock.interface';
import { StockDaily } from '../entities/StockDaily';
import HttpError from '../exceptions/HttpException';

export default class StockService {
    
    /**
     * Consult the daily history of a stock and save it as
     * a requested stock linked to the authenticated user
     * @param req http request
     * @param res http server response
     */
    consultDailyStockHistory = async (req: AuthRequest, res: Response): Promise<void> => {
        const consultDailyStockValidation = J.object({
            q: J.string().required(),
        });
        return authMiddleware(req, res, {
            queryValidation: consultDailyStockValidation,
            roles: [Roles.ADMIN, Roles.USER],
            validateToken: true,
            handler: async (req: AuthRequest, res: Response, manager: EntityManager) => {
                const { q } = req.query;
                const symbol = q as string;
                const { email } = req.decodedToken;

                // Get Stooq API information
                const { symbols } = await makeStooqAPIRequest(symbol);
                const stockDailyHistory = symbols[0] as StooqAsset;
                if (!stockDailyHistory.name)
                    throw new HttpError(404, `Symbol ${symbol} not found on Stooq stocks database`);

                // Get user
                const user = await manager.findOne(User, { where: { email } });

                // Save consulted stock in database
                const stockDaily = new StockDaily();
                Object.assign(stockDaily, stockDailyHistory);
                stockDaily.user = user;
                await manager.save(stockDaily);

                // Send response
                res.status(200).send(symbols);
            },
        });
    };

     /**
     * Get all the requested stocks for a user using 
     * two query params for pagination
     * @param req http request
     * @param res http server response
     */
    getUserStockSearchHistory = async (req: AuthRequest, res: Response): Promise<void> => {
        const getUserHistoryValidation = J.object({
            skip: J.number().min(0).required(),
            take: J.number().min(1).required(),
        });
        return authMiddleware(req, res, {
            queryValidation: getUserHistoryValidation,
            roles: [Roles.ADMIN, Roles.USER],
            validateToken: true,
            handler: async (req: AuthRequest, res: Response, manager: EntityManager) => {
                const { skip, take } = req.query;
                const { _id } = req.decodedToken;

                // Get history of consulted stocks
                const consultedStocks = await manager
                    .createQueryBuilder(StockDaily, 'sd')
                    .where('sd.user_id = :userId', { userId: _id })
                    .orderBy('sd.created_at')
                    .skip(Number.parseInt(skip as string))
                    .take(Number.parseInt(take as string))
                    .getMany();

                // send responses
                res.status(200).send(
                    consultedStocks.map((s) => {
                        return {
                            date: s.date,
                            name: s.name,
                            symbol: s.symbol,
                            open: s.open,
                            high: s.high,
                            low: s.low,
                            close: s.close,
                        };
                    }),
                );
            },
        });
    };

    /**
     * Get the top 5 most requested stocks by all users
     * @param req http request
     * @param res http server response
     */
    getAllUsersStockStats = async (req: AuthRequest, res: Response): Promise<void> => {
        return authMiddleware(req, res, {
            roles: [Roles.ADMIN],
            validateToken: true,
            handler: async (req: AuthRequest, res: Response, manager: EntityManager) => {
                // Get top 5 most requested stocks
                const top5MostRequested: { stock: string; times_requested: string }[] = await manager
                    .createQueryBuilder(StockDaily, 'sd')
                    .select(['sd.symbol stock, count(sd.id) times_requested'])
                    .groupBy('stock')
                    .orderBy('times_requested', 'DESC')
                    .take(5)
                    .getRawMany();

                // send responses
                res.status(200).send(
                    top5MostRequested.map((s) => {
                        return {
                            stock: s.stock,
                            times_requested: Number.parseInt(s.times_requested),
                        };
                    }),
                );
            },
        });
    };
}
