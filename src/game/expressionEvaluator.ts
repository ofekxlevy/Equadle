import type { Exp } from './expressionAst';
import { isNumExp, isSquareExp } from './expressionAst';
import type { EvaluationResult } from './result';
import {
    makeInvalidEvaluationResult,
    makeValidEvaluationResult,
} from './result';

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

    return makeInvalidEvaluationResult(
        `Evaluation is not implemented yet for expression type: ${exp.tag}`
    );
}

