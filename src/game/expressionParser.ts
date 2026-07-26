import type { Token } from './types';
import { isDigit } from './types';
import { makeInvalidParseResult, makeValidParseResult} from './result';
import type { ParseResult } from './result';
import { makeNumExp, makeSquareExp, makeMulExp, makeDivExp, makeSubExp, makeAddExp, makeEquation } from './expressionAst';
import type { Exp , Equation } from './expressionAst';


/**
 * The successful result of parsing part of an expression.
 * `exp` is the AST node created from the consumed tokens.
 * `nextIndex` is the index of the first token that was not consumed.
 *
 * Example:
 * Parsing from index 0 in:  ['1', '2', '+', '3']
 * produces NumExp(12) with nextIndex 2, because the '+' token
 * is the first token that does not belong to the number.
 */
type ParsedExp = {
    exp: Exp;
    nextIndex: number;
};

/**
 * The result returned by functions that parse expressions.
 * A successful result contains the parsed AST node and the next unread index.
 * A failed result contains a description of the syntax error.
 */
type ExpParseResult = ParseResult<ParsedExp>;

/**
 * Finds the index immediately after a consecutive sequence of digit tokens.
 * Example:
 *      findNumberEndIndex(['1', '2', '+', '3'], 0) === 2
 */
function findNumberEndIndex(tokens: Token[], index: number): number {
    const token = tokens[index];
    return token !== undefined && isDigit(token)
        ? findNumberEndIndex(tokens, index + 1)
        : index;
}

/**
 * Parses a number beginning at `startIndex`.
 * A number consists of one or more consecutive digit tokens. The function
 * finds the end of the digit sequence, converts the consumed tokens into a
 * JavaScript number, and creates a NumExp AST node.
 * The returned `nextIndex` points to the first token that was not consumed.
 *
 * Example:
 *
 *     parseNumber(['1', '2', '+', '3'], 0)
 *
 * returns a successful result containing:
 *
 *     {
 *         exp: NumExp(12),
 *         nextIndex: 2,
 *     }
 *
 * The function fails if `startIndex` is outside the token array or if the
 * token at `startIndex` is not a digit.
 *
 * Game-specific restrictions, such as leading zeroes or standalone zeroes,
 * are validated separately by the basic validators.
 */
function parseNumber(tokens: Token[], startIndex: number): ExpParseResult {
    const token = tokens[startIndex];
    if (token === undefined || !isDigit(token)) 
        return makeInvalidParseResult('Expected a number.');
    
    const nextIndex = findNumberEndIndex(tokens, startIndex);
    const value = Number(tokens.slice(startIndex, nextIndex).join(''));

    return makeValidParseResult({
        exp: makeNumExp(value),
        nextIndex,
    });
}

/**
 * Parses a base expression beginning at `startIndex`.
 * A base expression is either a number or a parenthesized expression.
 *
 * Examples:
 *
 *     12
 *
 * is parsed as:
 *
 *     NumExp(12)
 *
 * while:
 *
 *     (3 + 5)
 *
 * is parsed as:
 *
 *     AddExp(
 *         NumExp(3),
 *         NumExp(5)
 *     )
 *
 * Parentheses do not create an AST node. They only determine
 * the order in which the expression is parsed.
 */
function parseBase(tokens: Token[], startIndex: number): ExpParseResult {
    const token = tokens[startIndex];
    if (token === undefined) 
        return makeInvalidParseResult('Unexpected end of input.');

    if (isDigit(token)) 
        return parseNumber(tokens, startIndex);

    if (token === '(') {
        const innerResult = parseExpression(tokens, startIndex + 1);
        if (!innerResult.isValid) 
            return innerResult;
        
        const closingParenIndex = innerResult.value.nextIndex;
        if (tokens[closingParenIndex] !== ')') 
            return makeInvalidParseResult('Expected closing parenthesis.');
        
        return makeValidParseResult({
            exp: innerResult.value.exp,
            nextIndex: closingParenIndex + 1,
        });
    }

    return makeInvalidParseResult(`Unexpected token: ${token}`);
    
}

/**
 * Parses a factor beginning at `startIndex`.
 * A factor is a base expression optionally followed by the '^2' operator.
 *
 * Example: '12^2' is parsed as: 'SquareExp(NumExp(12))'
 * If '^2' is present, it is consumed and `nextIndex` advances by one.
 */
function parseFactor(tokens: Token[], startIndex: number): ExpParseResult {
    const baseResult = parseBase(tokens, startIndex);
    if (!baseResult.isValid) 
        return baseResult;

    const { exp, nextIndex } = baseResult.value;

    return tokens[nextIndex] === '^2'
        ? makeValidParseResult({
            exp: makeSquareExp(exp),
            nextIndex: nextIndex + 1,
        })
        : baseResult;
}

/**
 * Parses multiplication and division expressions beginning at `startIndex`.
 * A term consists of a factor followed by zero or more multiplication or division operations.
 *
 * Example:
 *
 *     3 * 4 / 2
 *
 * is parsed from left to right as:
 *
 *     DivExp(
 *         MulExp(NumExp(3), NumExp(4)),
 *         NumExp(2)
 *     )
 */
function parseTerm(tokens: Token[], startIndex: number): ExpParseResult {
    const firstFactorResult = parseFactor(tokens, startIndex);
    if (!firstFactorResult.isValid) 
        return firstFactorResult;

    return parseTermTail(tokens, firstFactorResult.value.exp, firstFactorResult.value.nextIndex);
}

function parseTermTail(tokens: Token[], leftExp: Exp, nextIndex: number): ExpParseResult {
    const operator = tokens[nextIndex];
    if (operator !== '*' && operator !== '/') {
        return makeValidParseResult({
            exp: leftExp,
            nextIndex,
        });
    }

    const rightResult = parseFactor(tokens, nextIndex + 1);
    if (!rightResult.isValid) 
        return rightResult;

    const combinedExp = operator === '*'
        ? makeMulExp(leftExp, rightResult.value.exp)
        : makeDivExp(leftExp, rightResult.value.exp);

    return parseTermTail(tokens, combinedExp, rightResult.value.nextIndex);
}

/**
 * Parses addition and subtraction expressions beginning at `startIndex`.
 * An expression consists of a term followed by zero or more
 * addition or subtraction operations.
 *
 * Example:
 *
 *     12 + 3 - 4
 *
 * is parsed from left to right as:
 *
 *     SubExp(
 *         AddExp(NumExp(12), NumExp(3)),
 *         NumExp(4)
 *     )
 */
function parseExpression(tokens: Token[], startIndex: number): ExpParseResult {
    const firstTermResult = parseTerm(tokens, startIndex);
    if (!firstTermResult.isValid) 
        return firstTermResult;

    return parseExpressionTail(tokens, firstTermResult.value.exp, firstTermResult.value.nextIndex);
}

function parseExpressionTail(tokens: Token[], leftExp: Exp, nextIndex: number): ExpParseResult {
    const operator = tokens[nextIndex];
    if (operator !== '+' && operator !== '-') {
        return makeValidParseResult({
            exp: leftExp,
            nextIndex,
        });
    }

    const rightResult = parseTerm(tokens, nextIndex + 1);
    if (!rightResult.isValid) 
        return rightResult;

    const combinedExp = operator === '+'
        ? makeAddExp(leftExp, rightResult.value.exp)
        : makeSubExp(leftExp, rightResult.value.exp);

    return parseExpressionTail(tokens, combinedExp, rightResult.value.nextIndex);
}

/**
 * Parses a complete expression.
 * The parsing succeeds only if every token belongs to the expression.
 * If parsing stops before the end of the token array, the remaining token
 * represents invalid syntax.
 */
export function parseCompleteExpression(tokens: Token[]): ParseResult<Exp> {
    const result = parseExpression(tokens, 0);
    if (!result.isValid) 
        return result;

    if (result.value.nextIndex !== tokens.length) {
        const unexpectedToken = tokens[result.value.nextIndex];
        return makeInvalidParseResult(`Unexpected token: ${unexpectedToken}`);
    }

    return makeValidParseResult(result.value.exp);
}

/**
 * Parses a complete equation.
 * A complete equation consists of:  <expression> = <number>
 * The left side is parsed as an expression AST, while the right side
 * is converted into the expected numeric result.
 *
 * Example:
 *
 *     (3 + 5) * 4 = 32
 *
 * is parsed as:
 *
 *     Equation(
 *         MulExp(
 *             AddExp(NumExp(3), NumExp(5)),
 *             NumExp(4)
 *         ),
 *         32
 *     )
 *
 * Basic structural rules, such as having exactly one equals sign and
 * requiring only digits on the right side, are checked by the basic
 * validators before this function is called.
 */
function parseEquation(tokens: Token[]): ParseResult<Equation> {
    const equalsIndex = tokens.indexOf('=');
    if (equalsIndex === -1) 
        return makeInvalidParseResult('Equation must contain an equals sign.');

    const leftTokens = tokens.slice(0, equalsIndex);
    const rightTokens = tokens.slice(equalsIndex + 1);
    const leftResult = parseCompleteExpression(leftTokens);
    
    if (!leftResult.isValid) 
        return leftResult;

    if (rightTokens.length === 0 || !rightTokens.every(isDigit))
        return makeInvalidParseResult('Invalid right-hand side of equation.');

    const expectedValue = Number(rightTokens.join(''));

    return makeValidParseResult(makeEquation(leftResult.value, expectedValue));
}
