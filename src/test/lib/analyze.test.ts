import { assert, expect } from 'chai';
import { analyze } from '../../lib/analyze';
import { DataFrame, IDataFrame } from 'data-forge';
import * as moment from 'moment';
import { ITrade } from '../..';

describe("analyze", () => {

    function makeDate(dateStr: string, fmt?: string): Date {
        return moment(dateStr, fmt || "YYYY/MM/DD").toDate();
    }

    it("analysis records starting capital", () => {
        const analysis1 = analyze(1000, new DataFrame<number, ITrade>());
        expect(analysis1.startingCapital).to.eql(1000);

        const analysis2 = analyze(1200, new DataFrame<number, ITrade>());
        expect(analysis2.startingCapital).to.eql(1200);
    });

    it("analysis of zero trades has zero profit", () => {
        const analysis = analyze(1000, new DataFrame<number, ITrade>());
        expect(analysis.profit).to.eql(0);
        expect(analysis.profitPct).to.eql(0);
        expect(analysis.growth).to.eql(1);
    });

    it("analysis of zero trades has no drawdown", () => {
        const analysis = analyze(1000, new DataFrame<number, ITrade>());
        expect(analysis.maxDrawdown).to.eql(0);
        expect(analysis.maxDrawdownPct).to.eql(0);
    });

    it("analysis of zero trades has zero bar count", () => {
        const analysis = analyze(1000, new DataFrame<number, ITrade>());
        expect(analysis.barCount).to.eql(0);
    });

    it("analysis of zero trades has undefined risk", () => {
        const analysis = analyze(1000, new DataFrame<number, ITrade>());
        expect(analysis.maxRisk).to.eql(undefined);
        expect(analysis.maxRiskPct).to.eql(undefined);
    });

    it("analysis of zero trades records final capital to be the same as starting capital", () => {
        const analysis = analyze(2000, new DataFrame<number, ITrade>());
        expect(analysis.finalCapital).to.eql(2000);
    });

    it("can analyze single trade with profit", () => {

        const singleTrade: ITrade = {
            entryTime: makeDate("2018/10/25"),
            entryPrice: 10,
            exitTime: makeDate("2018/10/30"),
            exitPrice: 20,
            profit: 10,
            profitPct: 100,
            growth: 2,
            risk: undefined,
            rmultiple: undefined,
            holdingPeriod: 5,
            exitReason: "Sell",
        };

        const analysis = analyze(10, new DataFrame<number, ITrade>([ singleTrade ] ));
        expect(analysis.startingCapital).to.eql(10);
        expect(analysis.finalCapital).to.eql(20);
        expect(analysis.profit).to.eql(10);
        expect(analysis.profitPct).to.eql(100);
        expect(analysis.growth).to.eql(2);
        expect(analysis.barCount).to.eql(5);
        expect(analysis.maxRisk).to.eql(undefined);
        expect(analysis.maxRiskPct).to.eql(undefined);
    });

    it("can analyze single trade with loss", () => {

        const singleTrade: ITrade = {
            entryTime: makeDate("2018/10/25"),
            entryPrice: 10,
            exitTime: makeDate("2018/10/29"),
            exitPrice: 5,
            profit: -5,
            profitPct: -50,
            growth: 0.5,
            risk: undefined,
            rmultiple: undefined,
            holdingPeriod: 4,
            exitReason: "Sell",
        };

        const analysis = analyze(10, new DataFrame<number, ITrade>([ singleTrade ] ));
        expect(analysis.startingCapital).to.eql(10);
        expect(analysis.finalCapital).to.eql(5);
        expect(analysis.profit).to.eql(-5);
        expect(analysis.profitPct).to.eql(-50);
        expect(analysis.growth).to.eql(0.5);
        expect(analysis.barCount).to.eql(4);
        expect(analysis.maxRisk).to.eql(undefined);
        expect(analysis.maxRiskPct).to.eql(undefined);
    });
    
    it("can analyze multiple trades with profit", () => {

        const trades: ITrade[] = [
            {
                entryTime: makeDate("2018/10/25"),
                entryPrice: 10,
                exitTime: makeDate("2018/10/30"),
                exitPrice: 20,
                profit: 10,
                profitPct: 100,
                growth: 2,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 5,
                exitReason: "Sell",
            },
            {
                entryTime: makeDate("2018/11/1"),
                entryPrice: 20,
                exitTime: makeDate("2018/11/10"),
                exitPrice: 60,
                profit: 40,
                profitPct: 150,
                growth: 3,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 10,
                exitReason: "Sell",
            },
        ];

        const analysis = analyze(10, new DataFrame<number, ITrade>(trades));
        expect(analysis.startingCapital).to.eql(10);
        expect(analysis.finalCapital).to.eql(60);
        expect(analysis.profit).to.eql(50);
        expect(analysis.profitPct).to.eql(500);
        expect(analysis.growth).to.eql(6);
        expect(analysis.barCount).to.eql(15);
        expect(analysis.maxRisk).to.eql(undefined);
        expect(analysis.maxRiskPct).to.eql(undefined);
    });

    it("can analyze multiple trades with loss", () => {

        const trades: ITrade[] = [
            {
                entryTime: makeDate("2018/10/25"),
                entryPrice: 20,
                exitTime: makeDate("2018/10/30"),
                exitPrice: 10,
                profit: -10,
                profitPct: -50,
                growth: 0.5,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 5,
                exitReason: "Sell",
            },
            {
                entryTime: makeDate("2018/11/1"),
                entryPrice: 10,
                exitTime: makeDate("2018/11/10"),
                exitPrice: 8,
                profit: -2,
                profitPct: -20,
                growth: 0.8,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 10,
                exitReason: "Sell",
            },
        ];

        const analysis = analyze(20, new DataFrame<number, ITrade>(trades));
        expect(analysis.startingCapital).to.eql(20);
        expect(analysis.finalCapital).to.eql(8);
        expect(analysis.profit).to.eql(-12);
        expect(analysis.profitPct).to.eql(-60);
        expect(analysis.growth).to.eql(0.4);
        expect(analysis.barCount).to.eql(15);
        expect(analysis.maxRisk).to.eql(undefined);
        expect(analysis.maxRiskPct).to.eql(undefined);
    });

    it("can analyze multiple trades with profit and loss", () => {

        const trades: ITrade[] = [
            {
                entryTime: makeDate("2018/10/25"),
                entryPrice: 10,
                exitTime: makeDate("2018/10/30"),
                exitPrice: 20,
                profit: 10,
                profitPct: 100,
                growth: 2,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 5,
                exitReason: "Sell",
            },
            {
                entryTime: makeDate("2018/11/1"),
                entryPrice: 20,
                exitTime: makeDate("2018/11/10"),
                exitPrice: 10,
                profit: -10,
                profitPct: -50,
                growth: 0.5,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 10,
                exitReason: "Sell",
            },
        ];

        const analysis = analyze(10, new DataFrame<number, ITrade>(trades));
        expect(analysis.startingCapital).to.eql(10);
        expect(analysis.finalCapital).to.eql(10);
        expect(analysis.profit).to.eql(0);
        expect(analysis.profitPct).to.eql(0);
        expect(analysis.growth).to.eql(1);
        expect(analysis.barCount).to.eql(15);
        expect(analysis.maxRisk).to.eql(undefined);
        expect(analysis.maxRiskPct).to.eql(undefined);
    });

    it("can analyze multiple trades with loss and profit", () => {

        const trades: ITrade[] = [
            {
                entryTime: makeDate("2018/10/25"),
                entryPrice: 20,
                exitTime: makeDate("2018/10/30"),
                exitPrice: 10,
                profit: -10,
                profitPct: -50,
                growth: 0.5,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 5,
                exitReason: "Sell",
            },
            {
                entryTime: makeDate("2018/11/1"),
                entryPrice: 10,
                exitTime: makeDate("2018/11/10"),
                exitPrice: 20,
                profit: 10,
                profitPct: 100,
                growth: 2,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 10,
                exitReason: "Sell",
            },
        ];

        const analysis = analyze(20, new DataFrame<number, ITrade>(trades));
        expect(analysis.startingCapital).to.eql(20);
        expect(analysis.finalCapital).to.eql(20);
        expect(analysis.profit).to.eql(0);
        expect(analysis.profitPct).to.eql(0);
        expect(analysis.growth).to.eql(1);
        expect(analysis.barCount).to.eql(15);
        expect(analysis.maxRisk).to.eql(undefined);
        expect(analysis.maxRiskPct).to.eql(undefined);
    });


    it("single trade with profit has no drawdown", () => {

        const singleTrade: ITrade = {
            entryTime: makeDate("2018/10/25"),
            entryPrice: 10,
            exitTime: makeDate("2018/10/30"),
            exitPrice: 20,
            profit: 10,
            profitPct: 100,
            growth: 2,
            risk: undefined,
            rmultiple: undefined,
            holdingPeriod: 5,
            exitReason: "Sell",
        };

        const analysis = analyze(10, new DataFrame<number, ITrade>([ singleTrade ] ));
        expect(analysis.maxDrawdown).to.eql(0);
        expect(analysis.maxDrawdownPct).to.eql(0);
    });

    it("single trade with loss sets the drawdown to the loss", () => {

        const singleTrade: ITrade = {
            entryTime: makeDate("2018/10/25"),
            entryPrice: 10,
            exitTime: makeDate("2018/10/29"),
            exitPrice: 5,
            profit: -5,
            profitPct: -50,
            growth: 0.5,
            risk: undefined,
            rmultiple: undefined,
            holdingPeriod: 4,
            exitReason: "Sell",
        };

        const analysis = analyze(10, new DataFrame<number, ITrade>([ singleTrade ] ));
        expect(analysis.maxDrawdown).to.eql(-5);
        expect(analysis.maxDrawdownPct).to.eql(-50);
    });
    
    it("drawdown from first loss is not override by subsequent profit", () => {

        const trades: ITrade[] = [
            {
                entryTime: makeDate("2018/10/25"),
                entryPrice: 20,
                exitTime: makeDate("2018/10/30"),
                exitPrice: 10,
                profit: -10,
                profitPct: -50,
                growth: 0.5,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 5,
                exitReason: "Sell",
            },
            {
                entryTime: makeDate("2018/11/1"),
                entryPrice: 10,
                exitTime: makeDate("2018/11/10"),
                exitPrice: 20,
                profit: 10,
                profitPct: 100,
                growth: 2,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 10,
                exitReason: "Sell",
            },
        ];

        const analysis = analyze(20, new DataFrame<number, ITrade>(trades));
        expect(analysis.maxDrawdown).to.eql(-10);
        expect(analysis.maxDrawdownPct).to.eql(-50);
    });

    it("drawdown resets on peak", () => {

        const trades: ITrade[] = [
            {
                entryTime: makeDate("2018/10/25"),
                entryPrice: 20,
                exitTime: makeDate("2018/10/30"),
                exitPrice: 10,
                profit: -10,
                profitPct: -50,
                growth: 0.5,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 5,
                exitReason: "Sell",
            },
            {
                entryTime: makeDate("2018/11/1"),
                entryPrice: 10,
                exitTime: makeDate("2018/11/10"),
                exitPrice: 30,
                profit: 20,
                profitPct: 200,
                growth: 3,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 10,
                exitReason: "Sell",
            },
            {
                entryTime: makeDate("2018/12/1"),
                entryPrice: 30,
                exitTime: makeDate("2018/12/5"),
                exitPrice: 15,
                profit: -15,
                profitPct: -50,
                growth: 0.5,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 5,
                exitReason: "Sell",
            },
        ];

        const analysis = analyze(20, new DataFrame<number, ITrade>(trades));
        expect(analysis.maxDrawdown).to.eql(-15);
        expect(analysis.maxDrawdownPct).to.eql(-50);
    });

    //todo: risk
    //todo: percent profitable, profit factor
    //todo: total trades
});
