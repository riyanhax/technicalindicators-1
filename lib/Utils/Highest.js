import { Indicator, IndicatorInput } from "../indicator/indicator";
import FixedSizedLinkedList from "./FixedSizeLinkedList";
export class HighestInput extends IndicatorInput {
}
export class Highest extends Indicator {
    constructor(input) {
        super(input);
        const values = input.values;
        const period = input.period;
        this.result = [];
        const periodList = new FixedSizedLinkedList(period, true, false, false);
        this.generator = (function* () {
            let tick;
            let high;
            tick = yield;
            while (true) {
                periodList.push(tick);
                if (periodList.totalPushed >= period) {
                    high = periodList.periodHigh;
                }
                tick = yield high;
            }
        })();
        this.generator.next();
        values.forEach((value, index) => {
            const result = this.generator.next(value);
            if (result.value !== undefined) {
                this.result.push(result.value);
            }
        });
    }
    nextValue(price) {
        const result = this.generator.next(price);
        if (result.value !== undefined) {
            return result.value;
        }
    }
}
Highest.calculate = highest;
export function highest(input) {
    Indicator.reverseInputs(input);
    const result = new Highest(input).result;
    if (input.reversedInput) {
        result.reverse();
    }
    Indicator.reverseInputs(input);
    return result;
}
