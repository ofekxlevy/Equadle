import { describe, expect, it } from 'vitest';

import {
    makeAddExp,
    makeDivExp,
    makeMulExp,
    makeNumExp,
    makeSquareExp,
    makeSubExp,
} from './expressionAst';

import { evaluateExpression } from './expressionEvaluator';

describe('evaluateExpression', () => {
    describe('numbers', () => {
        it('evaluates a number expression', () => {
            const expression = makeNumExp(12);

            expect(evaluateExpression(expression)).toEqual({
                isValid: true,
                value: 12,
            });
        });
    });

    describe('square expressions', () => {
        it('evaluates the square of a number', () => {
            const expression = makeSquareExp(
                makeNumExp(5)
            );

            expect(evaluateExpression(expression)).toEqual({
                isValid: true,
                value: 25,
            });
        });

        it('evaluates the square of a compound expression', () => {
            const expression = makeSquareExp(
                makeAddExp(
                    makeNumExp(3),
                    makeNumExp(5)
                )
            );

            expect(evaluateExpression(expression)).toEqual({
                isValid: true,
                value: 64,
            });
        });
    });

    describe('binary expressions', () => {
        it('evaluates addition', () => {
            const expression = makeAddExp(
                makeNumExp(3),
                makeNumExp(5)
            );

            expect(evaluateExpression(expression)).toEqual({
                isValid: true,
                value: 8,
            });
        });

        it('evaluates subtraction', () => {
            const expression = makeSubExp(
                makeNumExp(10),
                makeNumExp(3)
            );

            expect(evaluateExpression(expression)).toEqual({
                isValid: true,
                value: 7,
            });
        });

        it('evaluates multiplication', () => {
            const expression = makeMulExp(
                makeNumExp(6),
                makeNumExp(4)
            );

            expect(evaluateExpression(expression)).toEqual({
                isValid: true,
                value: 24,
            });
        });

        it('evaluates division', () => {
            const expression = makeDivExp(
                makeNumExp(24),
                makeNumExp(3)
            );

            expect(evaluateExpression(expression)).toEqual({
                isValid: true,
                value: 8,
            });
        });

        it('allows non-integer division results', () => {
            const expression = makeDivExp(
                makeNumExp(5),
                makeNumExp(2)
            );

            expect(evaluateExpression(expression)).toEqual({
                isValid: true,
                value: 2.5,
            });
        });
    });

    describe('compound expressions', () => {
        it('recursively evaluates both sides of a binary expression', () => {
            const expression = makeAddExp(
                makeMulExp(
                    makeNumExp(5),
                    makeNumExp(2)
                ),
                makeSubExp(
                    makeNumExp(3),
                    makeNumExp(1)
                )
            );

            expect(evaluateExpression(expression)).toEqual({
                isValid: true,
                value: 12,
            });
        });

        it('evaluates a deeply nested expression', () => {
            const expression = makeMulExp(
                makeAddExp(
                    makeNumExp(2),
                    makeNumExp(3)
                ),
                makeSquareExp(
                    makeSubExp(
                        makeNumExp(6),
                        makeNumExp(4)
                    )
                )
            );

            expect(evaluateExpression(expression)).toEqual({
                isValid: true,
                value: 20,
            });
        });
    });

    describe('division by zero', () => {
        it('rejects direct division by zero', () => {
            const expression = makeDivExp(
                makeNumExp(10),
                makeNumExp(0)
            );

            expect(evaluateExpression(expression)).toEqual({
                isValid: false,
                reason: 'Division by zero.',
            });
        });

        it('rejects division by an expression that evaluates to zero', () => {
            const expression = makeDivExp(
                makeNumExp(10),
                makeSubExp(
                    makeNumExp(3),
                    makeNumExp(3)
                )
            );

            expect(evaluateExpression(expression)).toEqual({
                isValid: false,
                reason: 'Division by zero.',
            });
        });

        it('propagates a failure from the left operand', () => {
            const expression = makeAddExp(
                makeDivExp(
                    makeNumExp(10),
                    makeNumExp(0)
                ),
                makeNumExp(5)
            );

            expect(evaluateExpression(expression)).toEqual({
                isValid: false,
                reason: 'Division by zero.',
            });
        });

        it('propagates a failure from the right operand', () => {
            const expression = makeMulExp(
                makeNumExp(5),
                makeDivExp(
                    makeNumExp(10),
                    makeNumExp(0)
                )
            );

            expect(evaluateExpression(expression)).toEqual({
                isValid: false,
                reason: 'Division by zero.',
            });
        });
    });
});