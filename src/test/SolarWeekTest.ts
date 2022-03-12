import {SolarUtil, SolarWeek} from '../lib';

const assert = require('assert');

describe('SolarWeek', () => {
    it('testFromMonday', () => {
        const start = 1;
        const week = SolarWeek.fromYmd(2019, 5, 1, start);
        assert.strictEqual(week.toString(), '2019.5.1');
        assert.strictEqual(week.toFullString(), '2019年5月第1周');
        assert.strictEqual(SolarUtil.getWeeksOfMonth(week.getYear(), week.getMonth(), start), 5);
        assert.strictEqual(week.getFirstDay().toString(), '2019-04-29');
        assert.strictEqual(week.getFirstDayInMonth().toString(), '2019-05-01');
    });

    it('testFromSunday', () => {
        const start = 0;
        const week = SolarWeek.fromYmd(2019, 5, 1, start);
        assert.strictEqual(week.toString(), '2019.5.1');
        assert.strictEqual(week.toFullString(), '2019年5月第1周');
        assert.strictEqual(SolarUtil.getWeeksOfMonth(week.getYear(), week.getMonth(), start), 5);
        assert.strictEqual(week.getFirstDay().toString(), '2019-04-28');
        assert.strictEqual(week.getFirstDayInMonth().toString(), '2019-05-01');
    });

    it('test1', () => {
        const start = 0;
        const week = SolarWeek.fromYmd(2022, 5, 1, start);
        assert.strictEqual(week.getIndex(), 1);
    });

    it('test2', () => {
        const start = 2;
        const week = SolarWeek.fromYmd(2021, 5, 4, start);
        assert.strictEqual(week.getIndex(), 2);
    });

    it('test3', () => {
        const start = 0;
        const week = SolarWeek.fromYmd(2022, 3, 6, start);
        assert.strictEqual(week.getIndexInYear(), 11);
    });
});
