import { ALLOWED_TOKENS, DIGIT_TOKENS, EQUATION_LENGTH } from './types';
import type { Token } from './types';

/**
 * Equation validation rules:
 *
 * 1. Each equation must contain exactly EQUATION_LENGTH tokens.
 * 2. Every token must be one of the allowed game tokens.
 * 3. Each equation must contain exactly one equals sign.
 * 4. The equation must have a non-empty left side and a non-empty right side.
 * 5. The left side may contain a mathematical expression.
 * 6. The right side must contain only a plain non-negative integer.
 * 7. The right side cannot contain operators or parentheses.
 * 8. The right side may be the number 0.
 * 9. Multi-digit numbers cannot start with 0.
 * 10. On the left side, the number 0 cannot appear as a standalone number.
 * 11. On the left side, 0 may appear only as part of a valid multi-digit number,
 *     such as 10, 20, 102, or 305.
 * 12. Division by 0 is not allowed.
 * 13. The left side must evaluate to the exact number written on the right side.
 * 14. The '^2' operator is treated as one token and means squaring the previous
 *     number or parenthesized expression.
 */

type ValidationResult =
    | { isValid: true }
    | { isValid: false; reason: string }
;

function makeValidResult(): ValidationResult {
    return { isValid: true };
}

function makeInvalidResult(reason: string): ValidationResult {
    return { isValid: false, reason };
}

type EquationValidator = (equation: Token[]) => ValidationResult;

function validateLength(equation: Token[]): ValidationResult {
    return equation.length === EQUATION_LENGTH
        ? makeValidResult()
        : makeInvalidResult(`Equation must be exactly ${EQUATION_LENGTH} tokens.`);
}

function validateTokens(equation: Token[]): ValidationResult {
    const hasOnlyAllowedTokens = equation.every((token) => ALLOWED_TOKENS.includes(token));
    return hasOnlyAllowedTokens
        ? makeValidResult()
        : makeInvalidResult('Equation contains invalid tokens.');
}

function validateEqualsSign(equation: Token[]): ValidationResult {
    const equalsCount = equation.filter((token) => token === '=').length;
    return equalsCount === 1
        ? makeValidResult()
        : makeInvalidResult('Equation must contain exactly one equals sign.');
}

function getEqualsSignIndex(equation: Token[]): number {
    return equation.indexOf('=');
}

function getLeftSide(equation: Token[]): Token[] {
    return equation.slice(0, getEqualsSignIndex(equation));
}

function getRightSide(equation: Token[]): Token[] {
    return equation.slice(getEqualsSignIndex(equation) + 1);
}   

function isDigit(token: Token): boolean {
    return DIGIT_TOKENS.some((digit) => digit === token);
}

function validateNonEmptySides(equation: Token[]): ValidationResult {
    const leftSide = getLeftSide(equation);
    const rightSide = getRightSide(equation);
    return leftSide.length > 0 && rightSide.length > 0
        ? makeValidResult()
        : makeInvalidResult('Equation must have non-empty left and right sides.');
}

function validateRightSideIsNumber(equation: Token[]): ValidationResult {
    const rightSide = getRightSide(equation);
    const isNumber = rightSide.every(isDigit);
    return isNumber
        ? makeValidResult()
        : makeInvalidResult('Right side must contain only digits.');
} 

function validateRightSideNoLeadingZero(equation: Token[]): ValidationResult {
    const rightSide = getRightSide(equation);
    const hasLeadingZero = rightSide.length > 1 && rightSide[0] === '0';
    return hasLeadingZero
        ? makeInvalidResult('Right side cannot have leading zeros.')
        : makeValidResult();
}

function getNumberTokens(tokens: Token[], startIndex: number): { numberTokens: Token[]; nextIndex: number } {
    const numberTokens: Token[] = [];
    let index = startIndex;
    while (index < tokens.length && isDigit(tokens[index])) {
        numberTokens.push(tokens[index]);
        index++;
    }
    return { numberTokens, nextIndex: index };
}

function validateLeftSideNumbers(equation: Token[]): ValidationResult {
    const leftSide = getLeftSide(equation);
    let index = 0;
    while (index < leftSide.length) {
        if (!isDigit(leftSide[index])) {
            index++;
            continue;
        }

        const { numberTokens, nextIndex } = getNumberTokens(leftSide, index);
        const isStandaloneZero = numberTokens.length === 1 && numberTokens[0] === '0';
        if (isStandaloneZero) {
            return makeInvalidResult('Left side cannot contain standalone 0.');
        }

        const hasLeadingZero = numberTokens.length > 1 && numberTokens[0] === '0';
        if (hasLeadingZero) {
            return makeInvalidResult('Left side numbers cannot have leading zeros.');
        }

        index = nextIndex;
    }
    return makeValidResult();
}

