import { describe, expect, it } from 'vitest';
import type { Token } from './types';
import {
    makeAddExp,
    makeDivExp,
    makeEquation,
    makeMulExp,
    makeNumExp,
    makeSquareExp,
    makeSubExp,
} from './expressionAst';
import { parseCompleteExpression, parseEquation } from './expressionParser';

const tokens = (...values: Token[]): Token[] => values;

describe('parseCompleteExpression', () => {
    describe('numbers', () => {
        it('parses a single-digit number', () => {
            expect(parseCompleteExpression(tokens('7'))).toEqual({
                isValid: true,
                value: makeNumExp(7),
            });
        });

        it('parses consecutive digits as one number', () => {
            expect(parseCompleteExpression(tokens('1', '2', '3'))).toEqual({
                isValid: true,
                value: makeNumExp(123),
            });
        });
    });

    describe('binary operators', () => {
        it('parses addition', () => {
            expect(parseCompleteExpression(tokens('3', '+', '5'))).toEqual({
                isValid: true,
                value: makeAddExp(makeNumExp(3), makeNumExp(5)),
            });
        });

        it('parses subtraction', () => {
            expect(parseCompleteExpression(tokens('8', '-', '2'))).toEqual({
                isValid: true,
                value: makeSubExp(makeNumExp(8), makeNumExp(2)),
            });
        });

        it('parses multiplication', () => {
            expect(parseCompleteExpression(tokens('4', '*', '7'))).toEqual({
                isValid: true,
                value: makeMulExp(makeNumExp(4), makeNumExp(7)),
            });
        });

        it('parses division', () => {
            expect(parseCompleteExpression(tokens('8', '/', '2'))).toEqual({
                isValid: true,
                value: makeDivExp(makeNumExp(8), makeNumExp(2)),
            });
        });
    });

    describe('precedence', () => {
        it('gives multiplication higher precedence than addition', () => {
            expect(
                parseCompleteExpression(tokens('3', '+', '5', '*', '2')),
            ).toEqual({
                isValid: true,
                value: makeAddExp(
                    makeNumExp(3),
                    makeMulExp(makeNumExp(5), makeNumExp(2)),
                ),
            });
        });

        it('gives division higher precedence than subtraction', () => {
            expect(
                parseCompleteExpression(tokens('9', '-', '8', '/', '2')),
            ).toEqual({
                isValid: true,
                value: makeSubExp(
                    makeNumExp(9),
                    makeDivExp(makeNumExp(8), makeNumExp(2)),
                ),
            });
        });

        it('uses parentheses to override normal precedence', () => {
            expect(
                parseCompleteExpression(
                    tokens('(', '3', '+', '5', ')', '*', '4'),
                ),
            ).toEqual({
                isValid: true,
                value: makeMulExp(
                    makeAddExp(makeNumExp(3), makeNumExp(5)),
                    makeNumExp(4),
                ),
            });
        });
    });

    describe('associativity', () => {
        it('parses subtraction as left-associative', () => {
            expect(
                parseCompleteExpression(
                    tokens('1', '2', '-', '3', '-', '4'),
                ),
            ).toEqual({
                isValid: true,
                value: makeSubExp(
                    makeSubExp(makeNumExp(12), makeNumExp(3)),
                    makeNumExp(4),
                ),
            });
        });

        it('parses division as left-associative', () => {
            expect(
                parseCompleteExpression(
                    tokens('2', '4', '/', '3', '/', '2'),
                ),
            ).toEqual({
                isValid: true,
                value: makeDivExp(
                    makeDivExp(makeNumExp(24), makeNumExp(3)),
                    makeNumExp(2),
                ),
            });
        });
    });

    describe('square operator', () => {
        it('parses a squared number', () => {
            expect(parseCompleteExpression(tokens('5', '^2'))).toEqual({
                isValid: true,
                value: makeSquareExp(makeNumExp(5)),
            });
        });

        it('parses a squared parenthesized expression', () => {
            expect(
                parseCompleteExpression(
                    tokens('(', '3', '+', '5', ')', '^2'),
                ),
            ).toEqual({
                isValid: true,
                value: makeSquareExp(
                    makeAddExp(makeNumExp(3), makeNumExp(5)),
                ),
            });
        });

        it('gives square higher precedence than multiplication and addition', () => {
            expect(
                parseCompleteExpression(
                    tokens('2', '+', '3', '^2', '*', '4'),
                ),
            ).toEqual({
                isValid: true,
                value: makeAddExp(
                    makeNumExp(2),
                    makeMulExp(
                        makeSquareExp(makeNumExp(3)),
                        makeNumExp(4),
                    ),
                ),
            });
        });
    });

    describe('invalid expressions', () => {
        it('rejects an empty expression', () => {
            expect(parseCompleteExpression([])).toEqual({
                isValid: false,
                reason: 'Unexpected end of input.',
            });
        });

        it('rejects an expression ending with an operator', () => {
            expect(parseCompleteExpression(tokens('3', '+'))).toEqual({
                isValid: false,
                reason: 'Unexpected end of input.',
            });
        });

        it('rejects an expression beginning with a binary operator', () => {
            expect(parseCompleteExpression(tokens('*', '3'))).toEqual({
                isValid: false,
                reason: 'Unexpected token: *',
            });
        });

        it('rejects a missing closing parenthesis', () => {
            expect(
                parseCompleteExpression(tokens('(', '3', '+', '5')),
            ).toEqual({
                isValid: false,
                reason: 'Expected closing parenthesis.',
            });
        });

        it('rejects an unexpected closing parenthesis', () => {
            expect(
                parseCompleteExpression(tokens('3', '+', '5', ')')),
            ).toEqual({
                isValid: false,
                reason: 'Unexpected token: )',
            });
        });

        it('rejects applying the square operator twice', () => {
            expect(
                parseCompleteExpression(tokens('3', '^2', '^2')),
            ).toEqual({
                isValid: false,
                reason: 'Unexpected token: ^2',
            });
        });
    });
});

describe('parseEquation', () => {
    it('parses a complete equation', () => {
        expect(
            parseEquation(
                tokens(
                    '(',
                    '3',
                    '+',
                    '5',
                    ')',
                    '*',
                    '4',
                    '=',
                    '3',
                    '2',
                ),
            ),
        ).toEqual({
            isValid: true,
            value: makeEquation(
                makeMulExp(
                    makeAddExp(makeNumExp(3), makeNumExp(5)),
                    makeNumExp(4),
                ),
                32,
            ),
        });
    });

    it('rejects an equation without an equals sign', () => {
        expect(parseEquation(tokens('3', '+', '5'))).toEqual({
            isValid: false,
            reason: 'Equation must contain an equals sign.',
        });
    });

    it('rejects an empty right-hand side', () => {
        expect(parseEquation(tokens('3', '+', '5', '='))).toEqual({
            isValid: false,
            reason: 'Invalid right-hand side of equation.',
        });
    });

    it('rejects a non-numeric right-hand side', () => {
        expect(
            parseEquation(tokens('3', '+', '5', '=', '2', '+', '6')),
        ).toEqual({
            isValid: false,
            reason: 'Invalid right-hand side of equation.',
        });
    });

    it('rejects an invalid left-hand expression', () => {
        expect(parseEquation(tokens('3', '+', '=', '3'))).toEqual({
            isValid: false,
            reason: 'Unexpected end of input.',
        });
    });
});