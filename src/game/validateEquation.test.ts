import { describe, expect, it } from 'vitest';
import { validateEquation } from './validateEquation';
import type { Token } from './types';

function expectValid(equation: Token[]): void {
    expect(validateEquation(equation)).toEqual({ isValid: true });
}

function expectInvalid(equation: Token[], reason: string): void {
    expect(validateEquation(equation)).toEqual({
        isValid: false,
        reason,
    });
}

describe('validateEquation', () => {

    // ===== Valid equations =====

    describe('valid equations', () => {
        it('accepts a valid equation with parentheses', () => {
            expectValid([
                '(', '3', '+', '5', ')', '*', '4', '=', '3', '2'
            ]);
        });

        it('accepts a valid equation with operator precedence', () => {
            expectValid([
                '9', '9', '+', '8', '*', '2', '=', '1', '1', '5'
            ]);
        });

        it('accepts a valid equation with division', () => {
            expectValid([
                '2', '4', '/', '3', '+', '1', '7', '=', '2', '5'
            ]);
        });

        it('accepts a valid equation with square', () => {
            expectValid([
                '(', '8', '+', '4', ')', '^2', '=', '1', '4', '4'
            ]);
        });
    });


    // ===== Basic structural validation =====

    describe('basic structural validation', () => {
        it('rejects an equation with the wrong number of tokens', () => {
            expectInvalid(
                ['3', '+', '5', '=', '8'],
                'Equation must be exactly 10 tokens.'
            );
        });

        it('rejects an equation without an equals sign', () => {
            expectInvalid(
                ['1', '2', '+', '3', '4', '-', '5', '+', '6', '7'],
                'Equation must contain exactly one equals sign.'
            );
        });

        it('rejects an equation with more than one equals sign', () => {
            expectInvalid(
                ['1', '+', '2', '=', '3', '=', '4', '+', '5', '6'],
                'Equation must contain exactly one equals sign.'
            );
        });

        it('rejects an empty left side', () => {
            expectInvalid(
                ['=', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
                'Equation must have non-empty left and right sides.'
            );
        });

        it('rejects a non-numeric right side', () => {
            expectInvalid(
                ['1', '2', '+', '3', '4', '=', '4', '+', '5', '6'],
                'Right side must contain only digits.'
            );
        });

        it('rejects a right-side number with a leading zero', () => {
            expectInvalid(
                ['1', '2', '+', '3', '4', '-', '4', '=', '0', '2'],
                'Right side cannot have leading zeros.'
            );
        });

        it('rejects a standalone zero on the left side', () => {
            expectInvalid(
                ['0', '+', '1', '2', '+', '3', '4', '=', '4', '6'],
                'Left side cannot contain standalone 0.'
            );
        });

        it('rejects a left-side number with a leading zero', () => {
            expectInvalid(
                ['0', '1', '+', '2', '3', '+', '4', '=', '2', '8'],
                'Left side numbers cannot have leading zeros.'
            );
        });
    });


    // ===== Parser validation =====

    describe('parser validation', () => {
        it('rejects invalid expression syntax', () => {
            expectInvalid(
                ['1', '2', '+', '*', '3', '+', '4', '=', '1', '9'],
                'Unexpected token: *'
            );
        });

        it('rejects a missing closing parenthesis', () => {
            expectInvalid(
                ['(', '3', '+', '5', '*', '4', '=', '3', '2', '1'],
                'Expected closing parenthesis.'
            );
        });
    });


    // ===== Evaluation validation =====

    describe('evaluation validation', () => {
        it('rejects division by zero after evaluating the denominator', () => {
            expectInvalid(
                ['1', '2', '/', '(', '3', '-', '3', ')', '=', '4'],
                'Division by zero.'
            );
        });

        it('rejects an equation whose two sides are not equal', () => {
            expectInvalid(
                ['1', '2', '+', '3', '4', '-', '5', '=', '4', '2'],
                'Left side does not equal right side.'
            );
        });
    });
});