import { assert, expect } from 'chai';
import { computeEquityCurve } from '../../lib/compute-equity-curve';
import { DataFrame, IDataFrame } from 'data-forge';
import * as moment from 'moment';
import { ITrade } from '../..';

describe("compute equity curve", () => {

    function makeDate(dateStr: string, fmt?: string): Date {
        return moment(dateStr, fmt || "YYYY/MM/DD").toDate();
    }

    it("no trades results in equity curve with only starting capital", () => {
        const startingCapital = 1000;
        const equityCurve = computeEquityCurve(startingCapital, new DataFrame<number, ITrade>());
        expect(equityCurve.count()).to.eql(1);
        expect(equityCurve.first()).to.eql(startingCapital);
    });

    it("can compute equity curve for single trade with profit", () => {

        const growth = 2;
        const singleTrade: ITrade = {
            entryTime: makeDate("2018/10/25"),
            entryPrice: 10,
            exitTime: makeDate("2018/10/30"),
            exitPrice: 20,
            profit: 10,
            profitPct: 100,
            growth: growth,
            risk: undefined,
            rmultiple: undefined,
            holdingPeriod: 5,
            exitReason: "Sell",
        };

        const startingCapital = 100;
        const equityCurve = computeEquityCurve(startingCapital, new DataFrame<number, ITrade>([ singleTrade ]));
        expect(equityCurve.count()).to.eql(2);
        expect(equityCurve.skip(1).first()).to.eql(startingCapital * growth);
    });

    it("can compute equity curve for single trade with loss", () => {

        const growth = 0.5;
        const singleTrade: ITrade = {
            entryTime: makeDate("2018/10/25"),
            entryPrice: 10,
            exitTime: makeDate("2018/10/29"),
            exitPrice: 5,
            profit: -5,
            profitPct: -50,
            growth: growth,
            risk: undefined,
            rmultiple: undefined,
            holdingPeriod: 4,
            exitReason: "Sell",
        };

        const startingCapital = 100;
        const equityCurve = computeEquityCurve(startingCapital, new DataFrame<number, ITrade>([ singleTrade ]));
        expect(equityCurve.count()).to.eql(2);
        expect(equityCurve.skip(1).first()).to.eql(startingCapital * growth);
    });
    
    it("can compute equity curve for multiple trades with profit", () => {

        const growth1 = 2;
        const growth2 = 3;
        const trades: ITrade[] = [
            {
                entryTime: makeDate("2018/10/25"),
                entryPrice: 10,
                exitTime: makeDate("2018/10/30"),
                exitPrice: 20,
                profit: 10,
                profitPct: 100,
                growth: growth1,
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
                growth: growth2,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 10,
                exitReason: "Sell",
            },
        ];

        const startingCapital = 10;
        const equityCurve = computeEquityCurve(startingCapital, new DataFrame<number, ITrade>(trades));
        expect(equityCurve.count()).to.eql(3);
        expect(equityCurve.skip(1).first()).to.eql(startingCapital * growth1);
        expect(equityCurve.skip(2).first()).to.eql(startingCapital * growth1 * growth2);
    });

    it("can compute equity curve for multiple trades with loss", () => {

        const growth1 = 0.5;
        const growth2 = 0.8;
        const trades: ITrade[] = [
            {
                entryTime: makeDate("2018/10/25"),
                entryPrice: 20,
                exitTime: makeDate("2018/10/30"),
                exitPrice: 10,
                profit: -10,
                profitPct: -50,
                growth: growth1,
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
                growth: growth2,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 10,
                exitReason: "Sell",
            },
        ];

        const startingCapital = 20;
        const equityCurve = computeEquityCurve(startingCapital, new DataFrame<number, ITrade>(trades));
        expect(equityCurve.count()).to.eql(3);
        expect(equityCurve.skip(1).first()).to.eql(startingCapital * growth1);
        expect(equityCurve.skip(2).first()).to.eql(startingCapital * growth1 * growth2);
    });

    it("can compute equity curve for multiple trades with profit and loss", () => {

        const growth1 = 2;
        const growth2 = 0.5;
        const trades: ITrade[] = [
            {
                entryTime: makeDate("2018/10/25"),
                entryPrice: 10,
                exitTime: makeDate("2018/10/30"),
                exitPrice: 20,
                profit: 10,
                profitPct: 100,
                growth: growth1,
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
                growth: growth2,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 10,
                exitReason: "Sell",
            },
        ];

        const startingCapital = 20;
        const equityCurve = computeEquityCurve(startingCapital, new DataFrame<number, ITrade>(trades));
        expect(equityCurve.count()).to.eql(3);
        expect(equityCurve.skip(1).first()).to.eql(startingCapital * growth1);
        expect(equityCurve.skip(2).first()).to.eql(startingCapital * growth1 * growth2);
    });

    it("can compute equity curve for multiple trades with loss and profit", () => {

        const growth1 = 0.5;
        const growth2 = 2;
        const trades: ITrade[] = [
            {
                entryTime: makeDate("2018/10/25"),
                entryPrice: 20,
                exitTime: makeDate("2018/10/30"),
                exitPrice: 10,
                profit: -10,
                profitPct: -50,
                growth: growth1,
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
                growth: growth2,
                risk: undefined,
                rmultiple: undefined,
                holdingPeriod: 10,
                exitReason: "Sell",
            },
        ];

        const startingCapital = 20;
        const equityCurve = computeEquityCurve(startingCapital, new DataFrame<number, ITrade>(trades));
        expect(equityCurve.count()).to.eql(3);
        expect(equityCurve.skip(1).first()).to.eql(startingCapital * growth1);
        expect(equityCurve.skip(2).first()).to.eql(startingCapital * growth1 * growth2);
    });
});