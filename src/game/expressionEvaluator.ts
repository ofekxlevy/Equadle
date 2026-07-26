import type { Exp } from './expressionAst';
import { isNumExp, isSquareExp, isAddExp } from './expressionAst';
import type { EvaluationResult } from './result';
import {
    makeInvalidEvaluationResult,
    makeValidEvaluationResult,
} from './result';

type BinaryOperation = (left: number, right: number) => number;

/**
 * Evaluates an expression AST and returns its numeric value.
 * Evaluation errors, such as division by zero, are represented by an
 * invalid EvaluationResult instead of throwing an exception.
 */
export function evaluateExpression(exp: Exp): EvaluationResult {
    if (isNumExp(exp)) 
        return makeValidEvaluationResult(exp.value);

    if (isSquareExp(exp)) {
        const innerResult = evaluateExpression(exp.exp);
        return innerResult.isValid
            ? makeValidEvaluationResult(innerResult.value ** 2)
            : innerResult;
    }
    
    if (isAddExp(exp)) {
        return evaluateBinaryExpression(exp.left, exp.right, (l, r) => l + r);
    }

    return makeInvalidEvaluationResult(
        `Evaluation is not implemented yet for expression type: ${exp.tag}`
    );
}

function evaluateBinaryExpression(left: Exp, right: Exp, operation: BinaryOperation): EvaluationResult {
    const leftResult = evaluateExpression(left);
    if (!leftResult.isValid)
        return leftResult;

    const rightResult = evaluateExpression(right);
    if (!rightResult.isValid)
        return rightResult;

    return makeValidEvaluationResult(
        operation(leftResult.value, rightResult.value)
    );
}