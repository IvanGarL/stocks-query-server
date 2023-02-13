import { Router } from 'express';
import StockService from '../services/stock.service';
import Route from '../interfaces/routes.interface';

// In MVC this could be a Controller
/**
 * Controller for the Stocks Service
 */
export class StocksRoute implements Route {
    public path = '/stock';
    public router = Router();
    public stockService = new StockService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.stockService.consultDailyStockHistory);
        this.router.get(`${this.path}/history`, this.stockService.getUserStockSearchHistory);
        this.router.get(`${this.path}/stats`, this.stockService.getAllUsersStockStats);
    }
}
