import type { Token } from './types';
import { isDigit } from './types';
import { makeInvalidParseResult, makeValidParseResult} from './result';
import type { ParseResult } from './result';
import { makeNumExp, makeSquareExp } from './expressionAst';
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

function parseTerm(tokens: Token[], startIndex: number): ExpParseResult {
    throw new Error('Not implemented.');
}

function parseExpression(tokens: Token[], startIndex: number): ExpParseResult {
    throw new Error('Not implemented.');
}
