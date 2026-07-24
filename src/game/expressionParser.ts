import type { Token } from './types';
import { isDigit } from './types';
import { makeInvalidParseResult, makeValidParseResult} from './result';
import type { ParseResult } from './result';
import { makeNumExp, makeSquareExp, makeMulExp, makeDivExp } from './expressionAst';
import type { Exp } from './expressionAst';


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
 * Parses a number beginning at `startIndex` and creates a NumExp AST node.
 *
 * The function returns:
 * - the NumExp created from those digits;
 * - the index of the first token that was not consumed.
 *
 * Example:
 *      parseNumber(['1', '2', '+', '3'], 0)
 * 
 * returns a successful result containing:
 *      {
 *          exp: makeNumExp(12),
 *          nextIndex: 2,
 *      }
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

function parseBase(tokens: Token[], startIndex: number): ExpParseResult {
    const token = tokens[startIndex];
    if (token === undefined) 
        return makeInvalidParseResult('Unexpected end of input.');

    return isDigit(token)
        ? parseNumber(tokens, startIndex)
        : makeInvalidParseResult(`Unexpected token: ${token}. Expected a number or '('.`);
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

function parseExpression(tokens: Token[], startIndex: number): ExpParseResult {
    throw new Error('Not implemented.');
}
